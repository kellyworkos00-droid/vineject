import { Database } from '../../database/connection';
import { AppError } from '../../core/middleware/errorHandler';

export class InventoryService {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async getAllProducts() {
    const result = await this.db.query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );
    return result.rows;
  }

  async getProductById(id: string) {
    const result = await this.db.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Product not found', 404);
    }

    return result.rows[0];
  }

  async createProduct(data: any) {
    const { name, sku, description, price, cost, quantity, min_stock_level, category } = data;

    const result = await this.db.query(
      `INSERT INTO products (name, sku, description, price, cost, quantity, min_stock_level, category, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [name, sku, description, price, cost, quantity || 0, min_stock_level || 10, category]
    );

    return result.rows[0];
  }

  async updateProduct(id: string, data: any) {
    const { name, sku, description, price, cost, min_stock_level, category } = data;

    const result = await this.db.query(
      `UPDATE products
       SET name = COALESCE($1, name),
           sku = COALESCE($2, sku),
           description = COALESCE($3, description),
           price = COALESCE($4, price),
           cost = COALESCE($5, cost),
           min_stock_level = COALESCE($6, min_stock_level),
           category = COALESCE($7, category),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [name, sku, description, price, cost, min_stock_level, category, id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Product not found', 404);
    }

    return result.rows[0];
  }

  async deleteProduct(id: string) {
    const result = await this.db.query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('Product not found', 404);
    }
  }

  async updateStock(id: string, quantity: number, operation: 'add' | 'subtract' | 'set') {
    const client = await this.db.getClient();

    try {
      await client.query('BEGIN');

      let query: string;
      if (operation === 'add') {
        query = 'UPDATE products SET quantity = quantity + $1, updated_at = NOW() WHERE id = $2 RETURNING *';
      } else if (operation === 'subtract') {
        query = 'UPDATE products SET quantity = GREATEST(quantity - $1, 0), updated_at = NOW() WHERE id = $2 RETURNING *';
      } else {
        query = 'UPDATE products SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
      }

      const result = await client.query(query, [quantity, id]);

      if (result.rows.length === 0) {
        throw new AppError('Product not found', 404);
      }

      await client.query(
        'INSERT INTO stock_movements (product_id, quantity, operation, created_at) VALUES ($1, $2, $3, NOW())',
        [id, quantity, operation]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getLowStockProducts() {
    const result = await this.db.query(
      'SELECT * FROM products WHERE quantity <= min_stock_level ORDER BY quantity ASC'
    );
    return result.rows;
  }
}
