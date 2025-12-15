import { Database } from '../../database/connection';

export class AnalyticsService {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  private parseRange(range?: string): number {
    const value = parseInt(range || '30', 10);
    if (Number.isNaN(value) || value <= 0) return 30;
    return Math.min(value, 365);
  }

  async getDashboardStats() {
    const [products, orders, customers, revenue] = await Promise.all([
      this.db.query('SELECT COUNT(*) AS count FROM products'),
      this.db.query('SELECT COUNT(*) AS count FROM orders'),
      this.db.query('SELECT COUNT(*) AS count FROM customers'),
      this.db.query("SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'completed'")
    ]);

    return {
      totalProducts: parseInt(products.rows[0].count, 10) || 0,
      totalOrders: parseInt(orders.rows[0].count, 10) || 0,
      totalCustomers: parseInt(customers.rows[0].count, 10) || 0,
      totalRevenue: parseFloat(revenue.rows[0].total) || 0,
    };
  }

  async getSalesAnalytics(range?: string, channel?: string) {
    const days = this.parseRange(range);
    const channelFilter = channel && channel !== 'all' ? 'AND p.gateway = $2' : '';
    const params: any[] = [days];
    if (channelFilter) params.push(channel);

    type OrdersRow = { bucket: Date; orders: number; revenue: number };
    const ordersTimeseries = await this.db.query(
      `SELECT date_trunc('day', created_at) AS bucket,
              COUNT(*) AS orders,
              COALESCE(SUM(total), 0) AS revenue
       FROM orders
       WHERE created_at >= NOW() - ($1 || ' days')::interval
       GROUP BY 1
       ORDER BY 1`,
      [days]
    );

    type PaymentsRow = { bucket: Date; revenue: number };
    const paymentsTimeseries = await this.db.query(
      `SELECT date_trunc('day', created_at) AS bucket,
              COALESCE(SUM(amount), 0) AS revenue
       FROM payments p
       WHERE p.status = 'completed'
         AND p.created_at >= NOW() - ($1 || ' days')::interval
         ${channelFilter}
       GROUP BY 1
       ORDER BY 1`,
      params
    );

    type TopProductRow = { name: string; revenue: number };
    const topProducts = await this.db.query(
      `SELECT p.name, COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       JOIN orders o ON o.id = oi.order_id
       WHERE o.created_at >= NOW() - ($1 || ' days')::interval
       GROUP BY p.name
       ORDER BY revenue DESC
       LIMIT 5`,
      [days]
    );

    const totalOrders = ordersTimeseries.rows.reduce((acc: number, row: OrdersRow) => acc + parseInt(String(row.orders), 10), 0);
    const totalRevenue = paymentsTimeseries.rows.reduce((acc: number, row: PaymentsRow) => acc + parseFloat(String(row.revenue)), 0);
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

    return {
      timeseries: ordersTimeseries.rows.map((row: OrdersRow) => ({
        date: row.bucket.toISOString().slice(0, 10),
        orders: parseInt(String(row.orders), 10),
        revenue: parseFloat(String(row.revenue)),
      })),
      paymentTimeseries: paymentsTimeseries.rows.map((row: PaymentsRow) => ({
        date: row.bucket.toISOString().slice(0, 10),
        revenue: parseFloat(String(row.revenue)),
      })),
      topProducts: topProducts.rows.map((row: TopProductRow) => ({ name: row.name, revenue: parseFloat(String(row.revenue)) })),
      totals: {
        orders: totalOrders,
        revenue: totalRevenue,
        avgOrderValue,
      },
    };
  }

  async getInventoryAnalytics(range?: string) {
    const days = this.parseRange(range);
    const [lowStock, stockStats, categoryBreakdown] = await Promise.all([
      this.db.query('SELECT COUNT(*) AS count FROM products WHERE quantity <= min_stock_level'),
      this.db.query('SELECT COALESCE(SUM(quantity),0) AS total_stock, COALESCE(SUM(quantity * cost),0) AS stock_value FROM products'),
      this.db.query(
        `SELECT COALESCE(category, 'Uncategorized') AS category, COALESCE(SUM(quantity),0) AS quantity
         FROM products
         GROUP BY 1
         ORDER BY quantity DESC`
      )
    ]);

    type MovementRow = { bucket: Date; net: number };
    const recentMovements = await this.db.query(
      `SELECT date_trunc('day', created_at) AS bucket,
              SUM(CASE WHEN operation = 'add' THEN quantity ELSE -quantity END) AS net
       FROM stock_movements
       WHERE created_at >= NOW() - ($1 || ' days')::interval
       GROUP BY 1
       ORDER BY 1`,
      [days]
    );

    return {
      lowStockCount: parseInt(lowStock.rows[0].count, 10) || 0,
      totalStock: parseInt(stockStats.rows[0].total_stock, 10) || 0,
      stockValue: parseFloat(stockStats.rows[0].stock_value) || 0,
      categoryBreakdown: categoryBreakdown.rows.map((row: { category: string; quantity: number }) => ({
        category: row.category,
        quantity: parseInt(String(row.quantity), 10),
      })),
      movements: recentMovements.rows.map((row: MovementRow) => ({
        date: row.bucket.toISOString().slice(0, 10),
        net: parseInt(String(row.net), 10),
      })),
    };
  }

  async getCustomerAnalytics(range?: string) {
    const days = this.parseRange(range);
    type NewCustomerRow = { bucket: Date; count: number };
    const newCustomers = await this.db.query(
      `SELECT date_trunc('day', created_at) AS bucket,
              COUNT(*) AS count
       FROM customers
       WHERE created_at >= NOW() - ($1 || ' days')::interval
       GROUP BY 1
       ORDER BY 1`,
      [days]
    );

    type TopCustomerRow = { name: string; lifetime_value: number; orders: number };
    const topCustomers = await this.db.query(
      `SELECT c.name, COALESCE(SUM(o.total), 0) AS lifetime_value, COUNT(o.id) AS orders
       FROM customers c
       LEFT JOIN orders o ON o.customer_id = c.id
       GROUP BY c.name
       HAVING SUM(o.total) IS NOT NULL
       ORDER BY lifetime_value DESC
       LIMIT 5`
    );

    return {
      newCustomers: newCustomers.rows.map((row: NewCustomerRow) => ({
        date: row.bucket.toISOString().slice(0, 10),
        count: parseInt(String(row.count), 10),
      })),
      topCustomers: topCustomers.rows.map((row: TopCustomerRow) => ({
        name: row.name,
        lifetimeValue: parseFloat(String(row.lifetime_value)),
        orders: parseInt(String(row.orders), 10),
      })),
    };
  }

  async getRevenueAnalytics(range?: string, channel?: string) {
    const days = this.parseRange(range);
    const channelFilter = channel && channel !== 'all' ? 'AND gateway = $2' : '';
    const params: any[] = [days];
    if (channelFilter) params.push(channel);

    type GatewayRow = { gateway: string; revenue: number };
    const byGateway = await this.db.query(
      `SELECT gateway, COALESCE(SUM(amount), 0) AS revenue
       FROM payments
       WHERE status = 'completed'
         AND created_at >= NOW() - ($1 || ' days')::interval
         ${channelFilter}
       GROUP BY gateway
       ORDER BY revenue DESC`,
      params
    );

    type RevenueRow = { bucket: Date; revenue: number };
    const timeseries = await this.db.query(
      `SELECT date_trunc('day', created_at) AS bucket,
              COALESCE(SUM(amount), 0) AS revenue
       FROM payments
       WHERE status = 'completed'
         AND created_at >= NOW() - ($1 || ' days')::interval
         ${channelFilter}
       GROUP BY 1
       ORDER BY 1`,
      params
    );

    const totalRevenue = byGateway.rows.reduce((acc: number, row: GatewayRow) => acc + parseFloat(String(row.revenue)), 0);

    return {
      byGateway: byGateway.rows.map((row: GatewayRow) => ({
        gateway: row.gateway,
        revenue: parseFloat(String(row.revenue)),
      })),
      timeseries: timeseries.rows.map((row: RevenueRow) => ({
        date: row.bucket.toISOString().slice(0, 10),
        revenue: parseFloat(String(row.revenue)),
      })),
      totalRevenue,
    };
  }
}
