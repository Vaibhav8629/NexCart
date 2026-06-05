# NexCart

A modern full-stack e-commerce platform built with the MERN stack, featuring a premium shopping experience, secure authentication, wishlist management, cart functionality, online payments, and a luxury-inspired user interface.

---

## Overview

NexCart is a production-ready e-commerce application designed to provide a seamless shopping experience for users and powerful management tools for administrators.

The platform includes:

* User & Admin Authentication
* Product Catalog Management
* Shopping Cart
* Wishlist System
* Secure Checkout
* Stripe Payment Integration
* Order Management
* Responsive Premium UI
* Advanced Animations with Framer Motion & GSAP
* Protected Routes
* RESTful API Architecture

---

## Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Framer Motion
* GSAP
* Lucide React

### Backend

* Node.js
* Express.js
* JWT (JSON Web Tokens)

### Payments

* Stripe

### Database

* MongoDB Atlas

---

## Features

### User Features

* User Registration & Login
* Secure JWT Authentication
* Browse Products
* Product Search & Filtering
* Category-Based Navigation
* Wishlist Management
* Shopping Cart
* Quantity Management
* Secure Checkout
* Stripe Payments
* Order History
* Invoice Generation
* Order Tracking
* Product Reviews & Ratings
* Coupon & Discount System
* Inventory Tracking


### Admin Features

* Admin Login
* Product Management
* Add Products
* Update Products
* Delete Products
* Order Monitoring
* User Management

---

## Project Structure

```bash
NexCart/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── components2/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── seed.js
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/Vaibhav8629/NexCart.git
cd NexCart
```

### Install Backend Dependencies

```bash
cd backend
npm install
```

### Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## Environment Variables

Create a `.env` file inside the server directory.

```env
PORT=
MONGO_URI=
JWT_SECRET=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET= 

GOOGLE_CALLBACK_URL=
CLIENT_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=


```

Create a `.env` file inside the client directory

```env
VITE_API_URL=
VITE_STRIPE_PUBLISHABLE_KEY=

```

---

## Running The Project

### Start Backend

```bash
cd backend
npm run dev
```

### Start Frontend

```bash
cd frontend
npm run dev
```

---

## Future Enhancements

* AI Product Recommendations
* Real-Time Notifications
* Multi-Vendor Marketplace
* Analytics Dashboard

---