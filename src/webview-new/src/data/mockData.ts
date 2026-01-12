import { Project } from '../types';

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-Commerce Platform',
    description: 'A full-featured e-commerce platform with cart, checkout, and payment processing',
    createdAt: '2024-01-01T00:00:00Z',
    specs: [
      {
        id: '1-1',
        name: 'User Authentication',
        description: 'Implement secure user authentication and authorization',
        createdAt: '2024-01-02T00:00:00Z',
        requirements: {
          id: 'req-1-1',
          type: 'requirements',
          content: `# User Authentication Requirements

## Overview
Implement a secure authentication system that allows users to register, login, and manage their accounts.

## Functional Requirements

### 1. User Registration
- Users can register with email and password
- Email verification required
- Password must meet security requirements (min 8 characters, uppercase, lowercase, number)
- Duplicate email detection

### 2. User Login
- Login with email and password
- Session management with JWT tokens
- Remember me functionality
- Password reset flow via email

### 3. User Profile
- View and edit profile information
- Change password functionality
- Account deletion option
- Profile picture upload

## Security Requirements
- Passwords must be hashed using bcrypt
- JWT tokens with expiration
- HTTPS only for authentication endpoints
- Rate limiting on login attempts
- XSS and CSRF protection`,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
        design: {
          id: 'design-1-1',
          type: 'design',
          content: `# User Authentication Design

## Architecture

### Components
1. **AuthService**: Handles authentication logic
2. **UserController**: API endpoints for auth operations
3. **AuthMiddleware**: Protects routes requiring authentication
4. **TokenManager**: JWT token generation and validation

### Database Schema

\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100),
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token_hash VARCHAR(255),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### API Endpoints

1. **POST /api/auth/register**
   - Body: { email, password, username }
   - Returns: { user, token }

2. **POST /api/auth/login**
   - Body: { email, password }
   - Returns: { user, token }

3. **POST /api/auth/logout**
   - Headers: Authorization: Bearer <token>
   - Returns: { success: true }

4. **GET /api/auth/me**
   - Headers: Authorization: Bearer <token>
   - Returns: { user }

### Security Measures
- bcrypt for password hashing (10 rounds)
- JWT tokens with 7-day expiration
- Refresh token rotation
- Rate limiting: 5 attempts per 15 minutes per IP`,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z',
        },
        tasks: [
          {
            id: 'task-1-1-1',
            title: 'Create user database schema',
            description: 'Design and implement user and session tables',
            status: 'completed',
            progress: 100,
            agent: 'Claude',
            createdAt: '2024-01-02T00:00:00Z',
            updatedAt: '2024-01-02T10:00:00Z',
          },
          {
            id: 'task-1-1-2',
            title: 'Implement password hashing',
            description: 'Set up bcrypt for secure password storage',
            status: 'completed',
            progress: 100,
            agent: 'Claude',
            createdAt: '2024-01-02T00:00:00Z',
            updatedAt: '2024-01-02T11:00:00Z',
          },
          {
            id: 'task-1-1-3',
            title: 'Build registration endpoint',
            description: 'Create API endpoint for user registration',
            status: 'running',
            progress: 65,
            agent: 'GPT-4',
            files: [
              'src/controllers/auth.controller.ts',
              'src/services/auth.service.ts',
              'src/validators/register.validator.ts',
            ],
            implementation: [
              'Create registration endpoint in auth.controller.ts',
              'Implement email validation logic',
              'Add password strength validation',
              'Hash password using bcrypt',
              'Store user in database',
              'Send verification email',
              'Return JWT token and user data',
            ],
            purpose: 'Enable new users to create accounts on the platform with proper validation and security measures',
            createdAt: '2024-01-02T00:00:00Z',
            updatedAt: '2024-01-02T12:00:00Z',
          },
          {
            id: 'task-1-1-4',
            title: 'Implement JWT authentication',
            description: 'Set up JWT token generation and validation',
            status: 'pending',
            progress: 0,
            files: [
              'src/middleware/auth.middleware.ts',
              'src/utils/jwt.utils.ts',
              'src/config/jwt.config.ts',
            ],
            implementation: [
              'Install jsonwebtoken package',
              'Create JWT configuration with secret and expiry',
              'Implement token generation utility function',
              'Implement token verification utility function',
              'Create authentication middleware',
              'Add middleware to protected routes',
              'Handle token expiration and refresh logic',
            ],
            purpose: 'Secure API endpoints by implementing JWT-based authentication and authorization',
            createdAt: '2024-01-02T00:00:00Z',
            updatedAt: '2024-01-02T12:00:00Z',
          },
          {
            id: 'task-1-1-5',
            title: 'Add rate limiting',
            description: 'Implement rate limiting for login attempts',
            status: 'pending',
            progress: 0,
            createdAt: '2024-01-02T00:00:00Z',
            updatedAt: '2024-01-02T12:00:00Z',
          },
        ],
      },
      {
        id: '1-2',
        name: 'Product Catalog',
        description: 'Product browsing, search, and filtering functionality',
        createdAt: '2024-01-03T00:00:00Z',
        requirements: {
          id: 'req-1-2',
          type: 'requirements',
          content: `# Product Catalog Requirements

## Overview
Build a comprehensive product catalog with search, filtering, and categorization capabilities.

## Functional Requirements

### 1. Product Display
- Grid and list view options
- Product images with zoom capability
- Product details (name, price, description, ratings)
- Stock availability indicator

### 2. Search Functionality
- Full-text search across product names and descriptions
- Auto-complete suggestions
- Search history
- Typo tolerance

### 3. Filtering & Sorting
- Filter by category, price range, brand, rating
- Sort by price, popularity, newest, rating
- Multi-select filters
- Clear all filters option

### 4. Categories
- Hierarchical category structure
- Category navigation breadcrumbs
- Category-specific filters`,
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z',
        },
        design: {
          id: 'design-1-2',
          type: 'design',
          content: `# Product Catalog Design

## Database Schema

\`\`\`sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  parent_id UUID REFERENCES categories(id),
  slug VARCHAR(255) UNIQUE
);

CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2),
  stock_quantity INTEGER,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE product_images (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  url VARCHAR(500),
  order_index INTEGER
);
\`\`\`

## API Endpoints

1. **GET /api/products**
   - Query params: search, category, minPrice, maxPrice, sort
   - Returns: { products: [], total, page }

2. **GET /api/products/:id**
   - Returns: { product }

3. **GET /api/categories**
   - Returns: { categories: [] }`,
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z',
        },
        tasks: [
          {
            id: 'task-1-2-1',
            title: 'Design product database schema',
            description: 'Create tables for products, categories, and images',
            status: 'completed',
            progress: 100,
            agent: 'Claude',
            createdAt: '2024-01-03T00:00:00Z',
            updatedAt: '2024-01-03T10:00:00Z',
          },
          {
            id: 'task-1-2-2',
            title: 'Implement search functionality',
            description: 'Build full-text search with Elasticsearch',
            status: 'running',
            progress: 45,
            agent: 'Claude',
            files: [
              'src/services/search.service.ts',
              'src/config/elasticsearch.config.ts',
              'src/indexers/product.indexer.ts',
            ],
            implementation: [
              'Set up Elasticsearch connection',
              'Create product search index mapping',
              'Implement product indexing service',
              'Build search query with filters and sorting',
              'Add auto-complete suggestions',
              'Implement fuzzy matching for typo tolerance',
              'Create search result pagination',
            ],
            purpose: 'Provide users with fast and accurate product search capabilities with advanced filtering',
            createdAt: '2024-01-03T00:00:00Z',
            updatedAt: '2024-01-03T11:00:00Z',
          },
          {
            id: 'task-1-2-3',
            title: 'Build product listing API',
            description: 'Create endpoint with filtering and pagination',
            status: 'failed',
            progress: 30,
            agent: 'GPT-4',
            createdAt: '2024-01-03T00:00:00Z',
            updatedAt: '2024-01-03T12:00:00Z',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Mobile Banking App',
    description: 'Secure mobile banking application with account management and transactions',
    createdAt: '2024-01-05T00:00:00Z',
    specs: [
      {
        id: '2-1',
        name: 'Account Dashboard',
        description: 'Overview of accounts, balances, and recent transactions',
        createdAt: '2024-01-06T00:00:00Z',
        requirements: {
          id: 'req-2-1',
          type: 'requirements',
          content: `# Account Dashboard Requirements

## Overview
Display user's banking information in an intuitive dashboard interface.

## Functional Requirements

### 1. Account Overview
- Display all user accounts (checking, savings, credit cards)
- Show current balance for each account
- Display available credit for credit cards
- Account icons and colors for quick identification

### 2. Recent Transactions
- List last 10 transactions across all accounts
- Show date, description, amount, account
- Filter by account
- Search transactions

### 3. Quick Actions
- Transfer between accounts
- Pay bills
- Deposit check
- Card management`,
          createdAt: '2024-01-06T00:00:00Z',
          updatedAt: '2024-01-06T00:00:00Z',
        },
        design: {
          id: 'design-2-1',
          type: 'design',
          content: `# Account Dashboard Design

## UI Layout

### Top Section
- Welcome message with user name
- Total balance across all accounts
- Quick access buttons

### Middle Section
- Account cards in horizontal scroll
  - Account type icon
  - Account name
  - Current balance
  - Last 4 digits of account number

### Bottom Section
- Recent transactions list
  - Transaction icon
  - Merchant/description
  - Date
  - Amount (color coded: red for debits, green for credits)

## API Endpoints

1. **GET /api/dashboard**
   - Returns: { accounts: [], recentTransactions: [], totalBalance }`,
          createdAt: '2024-01-06T00:00:00Z',
          updatedAt: '2024-01-06T00:00:00Z',
        },
        tasks: [
          {
            id: 'task-2-1-1',
            title: 'Create dashboard API endpoint',
            description: 'Build aggregated dashboard data endpoint',
            status: 'running',
            progress: 80,
            agent: 'Claude',
            createdAt: '2024-01-06T00:00:00Z',
            updatedAt: '2024-01-06T10:00:00Z',
          },
          {
            id: 'task-2-1-2',
            title: 'Design account card component',
            description: 'Build reusable account card UI component',
            status: 'pending',
            progress: 0,
            createdAt: '2024-01-06T00:00:00Z',
            updatedAt: '2024-01-06T10:00:00Z',
          },
          {
            id: 'task-2-1-3',
            title: 'Implement transaction list',
            description: 'Create scrollable transaction list with filtering',
            status: 'blocked',
            progress: 0,
            createdAt: '2024-01-06T00:00:00Z',
            updatedAt: '2024-01-06T10:00:00Z',
          },
        ],
      },
    ],
  },
];
