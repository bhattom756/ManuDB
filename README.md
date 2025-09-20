# React App with Prisma PostgreSQL Backend

This is a full-stack React application with a Node.js/Express backend using Prisma ORM and PostgreSQL database.

## Features

- **Frontend**: React with Vite, Tailwind CSS, and modern UI components
- **Backend**: Node.js/Express with Prisma ORM
- **Database**: PostgreSQL with Prisma Accelerate
- **Authentication**: JWT-based authentication
- **API**: RESTful API with CRUD operations for users and posts

## Project Structure

```
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context (Auth)
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   └── lib/          # Utility functions
│   └── package.json
├── backend/           # Node.js backend application
│   ├── lib/           # Prisma client configuration
│   ├── prisma/        # Prisma schema and migrations
│   ├── server.js      # Main server file
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database (or use Prisma Accelerate)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - The `.env` file is already configured with your Prisma Accelerate connection
   - Make sure the `DATABASE_URL` is set correctly

4. Generate Prisma client:
   ```bash
   npm run db:generate
   ```

5. Push database schema:
   ```bash
   npm run db:push
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### Users
- `GET /users` - Get all users (requires authentication)
- `GET /users/me` - Get current user (requires authentication)

### Posts
- `GET /posts` - Get all posts
- `GET /posts/:id` - Get a specific post
- `POST /posts` - Create a new post (requires authentication)
- `PUT /posts/:id` - Update a post (requires authentication)
- `DELETE /posts/:id` - Delete a post (requires authentication)

## Database Schema

### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Post Model
```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Usage

1. Start both the backend and frontend servers
2. Navigate to `http://localhost:5173`
3. Create an account or login
4. Access the dashboard to see your posts and user information

## Development Scripts

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Technologies Used

- **Frontend**: React, Vite, Tailwind CSS, React Router, Axios, React Hot Toast
- **Backend**: Node.js, Express, Prisma, JWT, bcryptjs
- **Database**: PostgreSQL with Prisma Accelerate
- **Authentication**: JWT tokens
- **UI Components**: Custom components with Radix UI primitives

## Environment Variables

### Backend (.env)
```
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
