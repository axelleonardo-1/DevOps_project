# Team 3 - E-Commerce Frontend

This repository contains the frontend application for the E-Commerce Microservices project. It is built with Vue.js and consumes the Products and Orders APIs through direct service URLs or the Vite proxy during local development.

## Project Structure and Features

- Catalog: product listing, search, filters, and product details
- Cart and Checkout: local state management for added products, cart review, and order placement
- My Orders: order history, details, and status tracking

## Tech Stack

- Framework: Vue.js
- Routing: Vue Router
- State Management: Pinia
- Build Tool: Vite

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file from `.env.example`.

Supported variables:

- `VITE_PRODUCTS_API_URL`
- `VITE_ORDERS_API_URL`
- `VITE_API_GATEWAY_URL`
- `VITE_API_MODE`
- `VITE_APP_ENV`
- `VITE_APP_VERSION`

## Environment Examples

Recommended local proxy mode:

```env
VITE_API_MODE=proxy
VITE_APP_ENV=dev
VITE_APP_VERSION=0.0.0-local
VITE_PRODUCTS_API_URL=http://localhost:3001
VITE_ORDERS_API_URL=http://localhost:3002
VITE_API_GATEWAY_URL=http://localhost:3001
```

In proxy mode the frontend calls `/products` and `/orders` on the Vite origin, and Vite forwards them to:

- `http://localhost:3001` for products
- `http://localhost:3002` for orders

Direct local mode:

```env
VITE_API_MODE=direct
VITE_APP_ENV=dev
VITE_APP_VERSION=0.0.0-local
VITE_PRODUCTS_API_URL=http://localhost:3001
VITE_ORDERS_API_URL=http://localhost:3002
```

Cloudflare dev or prod style direct mode:

```env
VITE_API_MODE=direct
VITE_APP_ENV=prod
VITE_APP_VERSION=1.2.3
VITE_PRODUCTS_API_URL=https://products.example.workers.dev
VITE_ORDERS_API_URL=https://orders.example.workers.dev
```

If `VITE_PRODUCTS_API_URL` or `VITE_ORDERS_API_URL` is not provided, the app falls back to `VITE_API_GATEWAY_URL`. Safe local defaults are still kept for development.

## Running the App

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## UI Environment Indicators

- A small banner is shown when `VITE_APP_ENV=dev`
- The footer shows `VITE_APP_VERSION`, which can be a semantic version or a commit SHA
