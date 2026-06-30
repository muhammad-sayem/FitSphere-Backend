# 🏋️ Fit Sphere

## Project Description

Fit Sphere is a full-stack fitness solution platform where users can find trainers, book training sessions, purchase fitness products, and manage their fitness journey from a single platform.

The platform has three different roles: **User**, **Trainer**, and **Admin**. Trainers can create professional profiles and manage their available training slots after admin approval. Users can book trainer sessions and buy fitness products using secure Stripe payment. The platform also includes a BMI Calculator to help users check their BMI and health status.

---

## Live URLs

- **Frontend:** 
- **Backend:** 

---

## Features

### Authentication
- User registration and login
- Register as User or Trainer
- Secure authentication using Better Auth and JWT
- Role-based access control

### User Features
- View all trainers and trainer details
- Book trainer slots
- Secure payment using Stripe
- Purchase fitness products
- BMI Calculator
- View booked sessions
- View payment history
- View product order history
- View submitted reviews
- Manage personal profile

### Trainer Features
- Create trainer profile
- Admin approval required before becoming an active trainer
- Create available training slots
- View and delete created slots
- Update booked slot status
- View reviews from users
- Manage personal profile

### Admin Features
- Dashboard with system statistics
- Manage users
- Manage trainers
- Approve trainer applications
- Activate, ban, or delete users and trainers
- Manage fitness products
- Create, update, and delete products

---

## Technologies Used

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Shadcn UI
- TanStack Query
- Axios

### Backend
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Better Auth
- JWT Authentication
- Stripe Payment Gateway

---

## User Roles

| Role | Permissions |
|------|-------------|
| User | Book trainer slots, purchase products, calculate BMI, manage profile |
| Trainer | Create profile, manage slots, update booking status, view reviews |
| Admin | Manage users, trainers, products, approve trainers, view dashboard statistics |