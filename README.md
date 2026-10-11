# Shop UI

A modern storefront frontend built with React, Vite, Material UI, and React Router. This app lets users browse products, manage a cart, place orders, and complete Stripe-based checkout flows.

## Features

- Product catalog with pagination
- Product detail views
- Add, edit, and delete product listings
- User authentication and account flows
- Cart management and checkout
- Stripe checkout success/failure handling
- Order history and account access control

## Tech Stack

- React 19
- Vite 8
- Material UI
- React Router
- Stripe.js
- GraphQL API integration

## Project Structure

- `src/pages` — Login, signup, product listing, cart, checkout, and order pages
- `src/components` — Reusable UI and route guards
- `src/utils` — Session and auth helpers
- `src/constants.js` — GraphQL endpoint and app constants
- `src/router.jsx` — Application routing

## Prerequisites

Before running the app, make sure you have:

- Node.js 18+
- npm
- A running backend GraphQL service available at `http://localhost:3000/graphql`

## Installation

```bash
npm install
```

## Running the app

```bash
npm run dev
```

The app will be available in your browser at the local Vite URL, usually:

```text
http://localhost:5173
```

## Production Build

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Linting

```bash
npm run lint
```

## Notes

This frontend expects the backend to expose GraphQL endpoints for authentication, products, cart/checkout, and order management. The default API endpoint is configured in `src/constants.js`:

```js
export const GRAPHQL_ENDPOINT = "http://localhost:3000/graphql";
```

If your backend runs on a different URL or port, update this constant before starting the app.
