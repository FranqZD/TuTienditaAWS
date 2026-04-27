# Implementation Plan: Tu Tiendita

## Overview

This plan implements a full-stack academic e-commerce application demonstrating AWS architecture. The implementation follows an incremental approach: project structure and configuration first, then backend services, Lambda checkout, frontend components, and finally documentation. Each task builds on previous ones, ensuring no orphaned code.

## Tasks

- [x] 1. Set up project structure and configuration
  - [x] 1.1 Create root project structure with frontend/, backend/, lambda/checkout/, and docs/ directories
    - Initialize `frontend/` with Vite + React (`npm create vite@latest frontend -- --template react`)
    - Initialize `backend/` with `package.json`, Express, and AWS SDK v3 dependencies
    - Initialize `lambda/checkout/` with `package.json` and AWS SDK v3 dependencies
    - Create `docs/` directory with empty `architecture.md` and `deployment-guide.md`
    - Create root `README.md` placeholder
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 1.2 Configure backend project with environment variables and entry point
    - Create `backend/.env.example` with AWS_REGION, PRODUCTS_TABLE_NAME, ORDERS_TABLE_NAME, LAMBDA_FUNCTION_NAME, PORT
    - Create `backend/src/config/env.js` to read and export environment variables
    - Create `backend/server.js` as the entry point that starts the Express app
    - Create `backend/src/app.js` with Express setup, CORS middleware (GET, POST, PUT, DELETE), JSON body parser, and centralized error handling middleware
    - Create `backend/src/routes/healthRoutes.js` and `backend/src/controllers/healthController.js` returning `{ status: "ok" }` on GET /health
    - _Requirements: 6.1, 7.1, 7.2, 8.1, 8.2, 8.3, 8.5_

  - [x] 1.3 Configure frontend project with environment variables and routing
    - Create `frontend/.env.example` with VITE_API_BASE_URL
    - Create `frontend/src/services/api.js` with base URL from `import.meta.env.VITE_API_BASE_URL` and exported functions: `getProducts()`, `getProductById(id)`, `createProduct(data)`, `updateProduct(id, data)`, `deleteProduct(id)`, `checkout(cartItems)` — all with centralized error handling
    - Set up React Router in `frontend/src/App.jsx` with routes for Home (/), Product Detail (/products/:id), Cart (/cart), and Admin (/admin)
    - Create `frontend/src/components/Navbar.jsx` with navigation links including cart link
    - _Requirements: 8.4, 8.6, 9.2_

  - [x] 1.4 Configure DynamoDB client for backend and Lambda
    - Create `backend/src/config/dynamodb.js` using `DynamoDBClient` and `DynamoDBDocumentClient` from AWS SDK v3, reading region and table names from env config
    - _Requirements: 8.1, 8.2_

- [x] 2. Checkpoint - Verify project structure
  - Ensure all project directories and configuration files are in place, `npm install` succeeds in frontend/, backend/, and lambda/checkout/. Ask the user if questions arise.

- [x] 3. Implement backend product services and routes
  - [x] 3.1 Implement product service layer
    - Create `backend/src/services/productService.js` with functions:
      - `getAllActive()` — Scan Tabla_Productos filtering `active = true`
      - `getById(productId)` — GetItem from Tabla_Productos
      - `create(data)` — PutItem with generated UUID, `active: true`, `createdAt`, `updatedAt`
      - `update(productId, data)` — UpdateItem with new data and updated `updatedAt`
      - `softDelete(productId)` — UpdateItem setting `active = false`
    - Implement input validation: name (non-empty string), description (non-empty string), price (number > 0), stock (integer >= 0), imageUrl (non-empty string)
    - _Requirements: 1.2, 2.2, 5.3, 5.6, 5.8, 5.9, 5.10_

  - [x] 3.2 Implement product controller and routes
    - Create `backend/src/controllers/productController.js` with handlers: `getAll`, `getById`, `create`, `update`, `delete`
    - Each handler uses try/catch, delegates to productService, and returns appropriate HTTP codes (200, 201, 400, 404, 500)
    - Create `backend/src/routes/productRoutes.js` mapping endpoints to controller methods
    - Wire product routes into `backend/src/app.js` under `/api/products`
    - _Requirements: 1.1, 1.2, 1.5, 2.1, 2.2, 2.3, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10_

  - [ ]* 3.3 Write property tests for product service (backend)
    - **Property 1: Active product filtering** — For any set of products with mixed active states, getAllActive returns only active products
    - **Property 3: Round-trip create and query** — For any valid product data, create then getById returns matching data with active=true and timestamps set
    - **Property 10: Update reflects new data** — For any existing product and valid update data, update then getById returns new data with updatedAt > previous
    - **Property 11: Soft delete sets active to false** — For any active product, softDelete sets active=false
    - **Property 12: Invalid data rejection** — For any invalid product data, create/update returns validation error without modifying data
    - Use fast-check with Vitest, minimum 100 iterations per property
    - Mock DynamoDB with in-memory objects
    - **Validates: Requirements 1.2, 2.2, 5.3, 5.6, 5.8, 5.9**

  - [ ]* 3.4 Write unit tests for product endpoints
    - Test GET /health returns 200 with `{ status: "ok" }`
    - Test GET /api/products/:id with non-existent ID returns 404
    - Test DynamoDB error scenarios return 500
    - Test CORS headers are present with correct methods
    - Use Vitest with mocked DynamoDB
    - _Requirements: 6.1, 2.3, 1.5, 7.1, 7.2_

- [x] 4. Implement Lambda checkout function
  - [x] 4.1 Implement Lambda checkout handler
    - Create `lambda/checkout/index.js` with the handler function:
      1. Validate payload: items array must exist and not be empty
      2. For each item, GetItem from Tabla_Productos to validate existence
      3. Validate stock >= requested quantity for each item
      4. If all validations pass: UpdateItem to reduce stock for each product
      5. PutItem to create order in Tabla_Ordenes with generated orderId, items (with name and price from DB), calculated total, status "completed", createdAt
      6. Return success response with order data
    - Handle errors: product not found (400), insufficient stock (400), empty cart (400), DynamoDB errors (500)
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7, 4.9, 4.10_

  - [ ]* 4.2 Write property tests for Lambda checkout
    - **Property 8: Validates existence and stock** — For any order with non-existent products or insufficient stock, Lambda rejects with descriptive error
    - **Property 9: Successful checkout updates stock and creates correct order** — For any valid order, stock is reduced by exact quantities and order has correct total, items, status, and timestamps
    - Use fast-check with Vitest, minimum 100 iterations per property
    - Mock DynamoDB with in-memory objects
    - **Validates: Requirements 4.3, 4.4, 4.5, 4.6**

  - [ ]* 4.3 Write unit tests for Lambda checkout edge cases
    - Test empty payload returns error
    - Test product not found returns descriptive error
    - Test insufficient stock returns descriptive error with product name
    - _Requirements: 4.9, 4.10_

- [x] 5. Implement backend order routes and Lambda invocation
  - [x] 5.1 Implement Lambda invocation service
    - Create `backend/src/services/lambdaService.js` using `LambdaClient` and `InvokeCommand` from AWS SDK v3
    - Read Lambda function name from environment variable
    - Invoke Lambda synchronously and parse response
    - _Requirements: 4.2, 8.3, 14.5_

  - [x] 5.2 Implement order controller and routes
    - Create `backend/src/services/orderService.js` that calls lambdaService to process checkout
    - Create `backend/src/controllers/orderController.js` with `checkout` handler
    - Handle Lambda invocation errors and return appropriate HTTP codes (200 for success, 400 for validation errors, 500 for Lambda failures)
    - Create `backend/src/routes/orderRoutes.js` and wire into `backend/src/app.js` under `/api/orders`
    - _Requirements: 4.1, 4.2, 4.7, 4.11_

  - [ ]* 5.3 Write unit tests for order controller
    - Test successful checkout returns 200 with order data
    - Test Lambda invocation failure returns 500
    - Mock Lambda invocation
    - _Requirements: 4.7, 4.11_

- [x] 6. Checkpoint - Verify backend and Lambda
  - Ensure all backend and Lambda tests pass. Verify product CRUD endpoints and checkout flow work with mocked DynamoDB. Ask the user if questions arise.

- [x] 7. Implement frontend cart context and state management
  - [x] 7.1 Implement CartContext with full cart logic
    - Create `frontend/src/context/CartContext.jsx` with React Context and Provider
    - Implement actions: addToCart (quantity=1), incrementQuantity (+1), decrementQuantity (-1, remove if reaches 0), removeFromCart, clearCart
    - Implement computed total as sum of (price × quantity) for all items
    - Store items as `[{ productId, name, price, quantity, imageUrl }]`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 7.2 Write property tests for CartContext logic
    - **Property 4: Add product sets quantity to 1** — For any product not in cart, adding it results in quantity=1 and other items unchanged
    - **Property 5: Increment/decrement adjusts by exactly 1** — For any product with quantity q, increment gives q+1, decrement (q>1) gives q-1, other items unchanged
    - **Property 6: Remove preserves other items** — For any cart with multiple products, removing one leaves others with original quantities
    - **Property 7: Total equals sum of price × quantity** — For any cart combination, total equals Σ(price × quantity)
    - Use fast-check with Vitest and React Testing Library, minimum 100 iterations per property
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.5, 3.6**

  - [ ]* 7.3 Write unit tests for CartContext edge cases
    - Test decrement to 0 removes product from cart
    - Test checkout button disabled when cart is empty
    - Test successful checkout clears cart and shows success message
    - _Requirements: 3.4, 3.8, 4.8_

- [x] 8. Implement frontend pages and components
  - [x] 8.1 Implement HomePage with product listing
    - Create `frontend/src/pages/HomePage.jsx` that fetches products via `getProducts()` and renders a grid of ProductCard components
    - Create `frontend/src/components/ProductCard.jsx` showing name, description, price, stock, image, and "Agregar al carrito" button
    - Handle loading and error states
    - Use semantic HTML and responsive CSS (min 320px width)
    - _Requirements: 1.1, 1.3, 1.4, 9.1, 9.2_

  - [x] 8.2 Implement ProductDetailPage
    - Create `frontend/src/pages/ProductDetailPage.jsx` that fetches a single product via `getProductById(id)` and displays full details
    - Include "Agregar al carrito" button
    - Handle 404 (product not found) and error states
    - _Requirements: 2.1, 2.3_

  - [x] 8.3 Implement CartPage with checkout flow
    - Create `frontend/src/components/CartItem.jsx` with quantity controls (+/-) and remove button
    - Create `frontend/src/components/CartSummary.jsx` showing cart total
    - Create `frontend/src/pages/CartPage.jsx` displaying cart items, summary, and "Finalizar compra" button
    - Disable "Finalizar compra" when cart is empty
    - On successful checkout: call `checkout(cartItems)`, show success message, clear cart
    - On checkout error: show error message, keep cart intact for retry
    - _Requirements: 3.2, 3.3, 3.5, 3.6, 3.7, 3.8, 4.1, 4.8_

  - [x] 8.4 Implement AdminPage with product CRUD
    - Create `frontend/src/components/ProductForm.jsx` for creating and editing products (name, description, price, stock, imageUrl fields)
    - Create `frontend/src/pages/AdminPage.jsx` showing all products (including inactive) with create, edit, and delete actions
    - Wire form submissions to `createProduct()`, `updateProduct()`, `deleteProduct()` API calls
    - Show validation errors from backend (400 responses)
    - _Requirements: 5.1, 5.2, 5.5, 5.7, 5.9_

  - [ ]* 8.5 Write property test for product rendering completeness
    - **Property 2: Product rendering completeness** — For any valid product with all fields, the rendered output contains name, description, price, stock, and imageUrl
    - Use fast-check with Vitest and React Testing Library, minimum 100 iterations
    - **Validates: Requirements 1.3**

- [x] 9. Checkpoint - Verify frontend components
  - Ensure all frontend tests pass. Verify pages render correctly with mocked API responses. Ask the user if questions arise.

- [x] 10. Implement seed data script
  - [x] 10.1 Create product seed script
    - Create `backend/seed/seedProducts.js` that inserts at least 5 sample products into Tabla_Productos via DynamoDB PutItem
    - Each product must have all fields: productId (UUID), name, description, price, stock, imageUrl, active (true), createdAt, updatedAt
    - Script should read table name and region from environment variables
    - Include a variety of products with realistic data
    - _Requirements: 10.1, 10.2_

- [x] 11. Create project documentation
  - [x] 11.1 Write README.md
    - Project description and AWS architecture overview with text-based architecture diagram
    - Instructions for running frontend locally (npm install, npm run dev)
    - Instructions for running backend locally (npm install, npm start, environment variables)
    - Instructions for deploying frontend to S3 and configuring CloudFront
    - Instructions for deploying backend to Elastic Beanstalk
    - Instructions for creating DynamoDB tables (Tabla_Productos, Tabla_Ordenes) with key schemas
    - Instructions for deploying Lambda_Checkout
    - Complete list of required environment variables
    - Description of the simulated purchase flow
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10, 13.1, 13.2, 13.3_

  - [x] 11.2 Write docs/architecture.md
    - Describe separation of responsibilities: Frontend (React SPA on S3/CloudFront), Backend (Express on EC2/Elastic Beanstalk), Lambda_Checkout (serverless processing), DynamoDB (data persistence)
    - Include complete flow: User → CloudFront → S3 → Frontend → Backend (Elastic Beanstalk/EC2) → Lambda_Checkout → DynamoDB
    - _Requirements: 11.4, 14.7_

  - [x] 11.3 Write docs/deployment-guide.md
    - Detailed step-by-step deployment instructions for each component: S3 bucket creation and frontend upload, CloudFront distribution setup, Elastic Beanstalk environment creation, DynamoDB table creation, Lambda function deployment and configuration
    - _Requirements: 11.4, 12.4, 12.5, 12.6, 12.7, 12.8_

- [ ] 12. Final integration and wiring
  - [x] 12.1 Wire frontend to backend with proper environment configuration
    - Ensure `frontend/vite.config.js` has proxy configuration for local development
    - Verify all API service functions connect to correct backend endpoints
    - Ensure frontend builds as static files ready for S3 deployment (`npm run build`)
    - _Requirements: 9.3, 13.1, 14.1_

  - [ ]* 12.2 Write integration tests for end-to-end flows
    - Test product listing flow: API call → render products
    - Test checkout flow: add to cart → checkout → success message → cart cleared
    - Test admin CRUD flow: create → list → edit → delete
    - Mock backend API responses
    - _Requirements: 1.1, 4.1, 4.8, 5.1_

- [x] 13. Final checkpoint - Ensure all tests pass
  - Run all test suites (backend, lambda, frontend). Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check
- Unit tests validate specific examples and edge cases
- DynamoDB is mocked with in-memory objects for all tests to avoid AWS costs and latency
- The backend runs on EC2 via Elastic Beanstalk — all backend code is standard Express, not serverless
