# KellyOS - Modular ERP System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**KellyOS** is a comprehensive, modular ERP (Enterprise Resource Planning) system built with modern web technologies. It features integrated payment processing, customizable modules, and a plugin architecture for maximum flexibility.

## 🚀 Features

### Core Modules
- **📦 Inventory Management** - Track products, manage stock levels, and warehouse operations
- **💰 Sales & Orders** - Process orders, generate invoices, and manage sales pipeline
- **👥 Customer Relationship Management (CRM)** - Manage customer data and interactions
- **📊 Accounting & Finance** - Financial transactions, ledger, and reporting
- **👔 Human Resources** - Employee management and payroll processing
- **📈 Analytics & Reporting** - Comprehensive dashboards and business intelligence

### Payment Integrations
- ✅ **Stripe** - Credit card processing
- ✅ **PayPal** - PayPal checkout and payments
- ✅ **Square** - Point of sale and online payments
- 🔔 **Webhook Support** - Real-time payment notifications

### Customization Features
- 🔌 **Plugin System** - Extend functionality with custom plugins
- ⚙️ **Configuration-Driven** - Customize behavior through environment variables
- 🎨 **Themeable UI** - Modern, responsive interface built with React and Tailwind CSS
- 🔐 **Role-Based Access Control** - Secure access management

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **TypeScript** - Type-safe development
- **Express.js** - Web framework
- **PostgreSQL** - Primary database
- **JWT** - Authentication & authorization

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe components
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Query** - Data fetching
- **Zustand** - State management

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/kellyos-erp.git
cd kellyos-erp
```

### 2. Setup Environment Variables

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` and configure:
- Database connection
- JWT secret
- Payment gateway credentials (Stripe, PayPal, Square)
- Other service configurations

### 3. Install Dependencies

**Backend:**
```bash
npm install
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

### 4. Setup Database

Create a PostgreSQL database and run migrations:

```bash
# Create database
createdb kellyos

# Run schema
psql kellyos < src/database/schema.sql
```

### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run frontend:dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 📦 Build for Production

### Backend
```bash
npm run build
npm start
```

### Frontend
```bash
npm run frontend:build
```

## 🔌 Plugin Development

KellyOS supports custom plugins to extend functionality. See the example in `plugins/sample-plugin/`.

### Creating a Plugin

1. Create a new directory in `plugins/` folder
2. Implement the `BasePlugin` interface
3. Export your plugin class as default
4. Register the plugin through the admin interface

```typescript
import { BasePlugin, PluginMetadata } from '@/core/plugins/Plugin';

export default class MyPlugin extends BasePlugin {
  metadata: PluginMetadata = {
    id: 'my-plugin',
    name: 'My Custom Plugin',
    version: '1.0.0',
    description: 'Custom functionality',
    author: 'Your Name',
  };

  async initialize(app: Application): Promise<void> {
    // Your initialization code
  }
}
```

## 🔐 Payment Gateway Setup

### Stripe
1. Create a Stripe account at https://stripe.com
2. Get your API keys from the dashboard
3. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### PayPal
1. Create a PayPal developer account
2. Create a REST API app
3. Add credentials to `.env`:
   ```
   PAYPAL_CLIENT_ID=your_client_id
   PAYPAL_CLIENT_SECRET=your_client_secret
   PAYPAL_MODE=sandbox
   ```

### Square
1. Create a Square developer account
2. Create an application
3. Add credentials to `.env`:
   ```
   SQUARE_ACCESS_TOKEN=your_access_token
   SQUARE_LOCATION_ID=your_location_id
   SQUARE_ENVIRONMENT=sandbox
   ```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Module Endpoints
- `/api/inventory` - Inventory management
- `/api/sales` - Sales and orders
- `/api/crm` - Customer management
- `/api/accounting` - Financial transactions
- `/api/hr` - Human resources
- `/api/analytics` - Reports and analytics

### Payment Endpoints
- `POST /api/payments/stripe/create-payment-intent`
- `POST /api/payments/paypal/create-order`
- `POST /api/payments/square/create-payment`
- `POST /api/payments/webhooks/stripe`
- `POST /api/payments/webhooks/paypal`
- `POST /api/payments/webhooks/square`

### Plugin Endpoints
- `GET /api/plugins` - List all plugins
- `POST /api/plugins/install` - Install plugin
- `POST /api/plugins/:id/enable` - Enable plugin
- `POST /api/plugins/:id/disable` - Disable plugin

## 🏗️ Project Structure

```
kellyos-erp/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities
│   │   └── store/         # State management
│   └── package.json
├── src/                   # Backend source
│   ├── core/              # Core functionality
│   │   ├── middleware/    # Express middleware
│   │   └── plugins/       # Plugin system
│   ├── database/          # Database connection
│   ├── modules/           # ERP modules
│   │   ├── auth/
│   │   ├── inventory/
│   │   ├── sales/
│   │   ├── crm/
│   │   ├── accounting/
│   │   ├── hr/
│   │   ├── analytics/
│   │   └── payments/
│   ├── routes/            # API routes
│   └── server.ts          # Application entry
├── plugins/               # Custom plugins
├── .env.example           # Environment template
├── package.json
└── README.md
```

## 🔒 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Helmet.js for security headers
- CORS configuration
- SQL injection protection
- XSS protection

## 🧪 Testing

```bash
npm test
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@kellyos.com or open an issue on GitHub.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by leading ERP solutions
- Community-driven development

---

Made with ❤️ by the KellyOS Team
