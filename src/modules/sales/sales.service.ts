import { Database } from '../../database/connection';
import { AppError } from '../../core/middleware/errorHandler';

export class SalesService {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async getAllOrders() {
    const result = await this.db.query(`
      SELECT o.*, c.name as customer_name, c.email as customer_email
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
    `);
    return result.rows;
  }

  async getOrderById(id: string) {
    const orderResult = await this.db.query(`
      SELECT o.*, c.name as customer_name, c.email as customer_email
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.id = $1
    `, [id]);

    if (orderResult.rows.length === 0) {
      throw new AppError('Order not found', 404);
    }

    const itemsResult = await this.db.query(`
      SELECT oi.*, p.name as product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [id]);

    return {
      ...orderResult.rows[0],
      items: itemsResult.rows
    };
  }

  async createOrder(data: any, userId: string) {
    const { customer_id, items, shipping_address, notes } = data;
    const client = await this.db.getClient();

    try {
      await client.query('BEGIN');

      // Calculate total
      let total = 0;
      for (const item of items) {
        const productResult = await client.query(
          'SELECT price FROM products WHERE id = $1',
          [item.product_id]
        );
        if (productResult.rows.length === 0) {
          throw new AppError(`Product ${item.product_id} not found`, 404);
        }
        total += productResult.rows[0].price * item.quantity;
      }

      // Create order
      const orderResult = await client.query(`
        INSERT INTO orders (customer_id, total, status, shipping_address, notes, created_by, created_at, updated_at)
        VALUES ($1, $2, 'pending', $3, $4, $5, NOW(), NOW())
        RETURNING *
      `, [customer_id, total, shipping_address, notes, userId]);

      const order = orderResult.rows[0];

      // Create order items
      for (const item of items) {
        await client.query(`
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES ($1, $2, $3, (SELECT price FROM products WHERE id = $2))
        `, [order.id, item.product_id, item.quantity]);

        // Update inventory
        await client.query(
          'UPDATE products SET quantity = quantity - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      await client.query('COMMIT');
      return await this.getOrderById(order.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateOrderStatus(id: string, status: string) {
    const result = await this.db.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Order not found', 404);
    }

    return result.rows[0];
  }

  async getAllInvoices() {
    const result = await this.db.query(`
      SELECT i.*, o.total, c.name as customer_name
      FROM invoices i
      JOIN orders o ON i.order_id = o.id
      JOIN customers c ON o.customer_id = c.id
      ORDER BY i.created_at DESC
    `);
    return result.rows;
  }

  async getInvoiceById(id: string) {
    const result = await this.db.query(`
      SELECT i.*, o.*, c.name as customer_name, c.email as customer_email
      FROM invoices i
      JOIN orders o ON i.order_id = o.id
      JOIN customers c ON o.customer_id = c.id
      WHERE i.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      throw new AppError('Invoice not found', 404);
    }

    return result.rows[0];
  }
}
