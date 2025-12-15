# API Documentation - KellyOS ERP

## Authentication

All API requests (except auth endpoints) require authentication using JWT tokens.

Include the token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Response Format

All API responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "role": "user"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### Inventory Management

#### Get All Products
```http
GET /api/inventory/products
Authorization: Bearer <token>
```

#### Create Product
```http
POST /api/inventory/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Name",
  "sku": "SKU-001",
  "description": "Product description",
  "price": 99.99,
  "cost": 50.00,
  "quantity": 100,
  "min_stock_level": 10,
  "category": "Electronics"
}
```

#### Update Stock
```http
POST /api/inventory/products/:id/stock
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 50,
  "operation": "add" // or "subtract" or "set"
}
```

### Sales & Orders

#### Create Order
```http
POST /api/sales/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "customer_id": "customer_uuid",
  "items": [
    {
      "product_id": "product_uuid",
      "quantity": 2
    }
  ],
  "shipping_address": "123 Main St",
  "notes": "Urgent delivery"
}
```

#### Get Orders
```http
GET /api/sales/orders
Authorization: Bearer <token>
```

### Payments

Payments are gateway-agnostic. Stripe, PayPal, and Square are first-class, and additional gateways can be added by plugging in new service methods and routes without changing core flows.

#### Create Stripe Payment Intent
```http
POST /api/payments/stripe/create-payment-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 99.99,
  "currency": "usd",
  "orderId": "order_uuid"
}
```

#### Stripe Webhook
```http
POST /api/payments/webhooks/stripe
Stripe-Signature: <signature>
Content-Type: application/json

{ ... stripe event data ... }
```

### Plugins

#### List Plugins
```http
GET /api/plugins
Authorization: Bearer <token>
```

#### Enable Plugin
```http
POST /api/plugins/:id/enable
Authorization: Bearer <token>
```

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to 100 requests per minute per IP address.

## Webhooks

### Stripe Webhooks
Configure in Stripe Dashboard:
- URL: `https://yourdomain.com/api/payments/webhooks/stripe`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### PayPal Webhooks
Configure in PayPal Dashboard:
- URL: `https://yourdomain.com/api/payments/webhooks/paypal`
- Events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`

### Square Webhooks
Configure in Square Dashboard:
- URL: `https://yourdomain.com/api/payments/webhooks/square`
- Events: `payment.updated`
