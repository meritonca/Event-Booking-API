# Event Booking API

A RESTful API for managing events, ticket reservations, orders, and customer reviews. Built with Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL.

## Technologies

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT authentication
- Joi validation

## Features

### Authentication and Users
- User authentication with JWT
- Protected routes and role-based authorization
- User management

### Event Management
- Create, retrieve, update, and delete events
- Event status and date management
- Event capacity management
- Category management

### Ticket Reservations
- Create and manage ticket reservations
- Temporary reservations with expiration
- Ticket quantity management
- Ticket cancellation
- Capacity checks to help prevent overselling

### Orders
- Order management
- Ticket purchase and cancellation handling
- Partial ticket cancellations

### Reviews
- Create and manage event reviews
- Review validation
- Prevent duplicate reviews by the same user for the same event

### API and Validation
- Request validation with Joi
- Pagination, filtering, searching, and sorting
- Centralized error handling
- Reusable asynchronous error handling

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- PostgreSQL

### Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/event-booking-api.git
cd event-booking-api
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root and configure your environment variables:

```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_secret_key"
```

Replace the example values with your own configuration. Never commit your `.env` file or expose real credentials.

### Database Setup

Make sure PostgreSQL is running and your database exists.

Apply the existing Prisma migrations:

```bash
npx prisma migrate dev
```

### Run the Application

Start the development server:

```bash
npm run dev
```

Use the port configured by your application.

## Project Structure

```text
.
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── validations/
├── prisma.config.ts
├── prisma.ts
├── server.ts
├── package.json
└── tsconfig.json
```

## Learning Objectives

This project demonstrates practical experience with REST API development, relational database modeling, authentication, authorization, request validation, transaction handling, and business logic using Node.js and TypeScript.

## Status

Under development.
