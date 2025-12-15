# KellyOS ERP System - Development Instructions

## Project Overview
KellyOS is a modular, customizable ERP system with integrated payment processing capabilities.

## Technology Stack
- **Backend**: Node.js, TypeScript, Express.js
- **Frontend**: React, TypeScript, Vite
- **Database**: PostgreSQL
- **Payment Gateways**: Stripe, PayPal, Square
- **Authentication**: JWT-based auth with role-based access control

## Architecture Principles
- Modular plugin-based system for extensibility
- RESTful API design
- Type-safe development with TypeScript
- Microservices-ready architecture
- Webhook-based event system

## Core Modules
1. **Inventory Management** - Stock tracking, warehousing
2. **Sales & Orders** - Order processing, invoicing
3. **CRM** - Customer management, interactions
4. **Accounting** - Ledger, payments, reports
5. **Human Resources** - Employee management, payroll
6. **Analytics** - Reporting and dashboards

## Development Guidelines
- All modules should be independently deployable
- Follow TypeScript strict mode
- Implement proper error handling and validation
- Use dependency injection for services
- Write unit tests for business logic
- Document all API endpoints

## Customization
- Plugins can extend core functionality
- Configuration-driven feature flags
- Theme and UI customization support
