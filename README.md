# Promotion Agency Platform

**Promotion Agency Platform** is a modern web application built with **Angular 20** on the frontend and **Node.js + Express** with **MongoDB** on the backend.  
The platform provides user authentication, a blog system, request management, and an admin-like interface for managing categories, articles, comments, and users.

---

## Features

- **Authentication & Authorization**
  - User registration and login with form validation
  - JWT-based authentication with refresh tokens
  - Error handling for invalid sessions

- **Blog System**
  - Read articles
  - Commenting system with rating functionality
  - REST API communication with the backend

- **Routing**
  - Lazy loading for modules
  - Route guards for protecting private areas
  - Optimized loading for performance

- **Testing**
  - Unit tests for critical components and services

- **UI & Design**
  - SCSS layout based on Figma design
  - Angular Material for UI components

---

## Technologies

- **Frontend:** Angular 20, SCSS, Angular Material, RxJS  
- **Backend:** Node.js + Express, MongoDB, Passport (JWT strategy)  
- **Testing:** Jasmine, Karma (Angular unit tests)  
- **Package Manager:** npm  

---

## Installation

### Backend

1. Navigate to the backend folder:
```bash
cd backend
```
2. Install dependencies:
```bash
npm install
```
3. Install migrate-mongo globally:
```bash
npm install -g migrate-mongo
```
4. Run database migrations:
```bash
migrate-mongo up
```
5. Start the backend server:
```bash
npm start
```

### Frontend

1. Navigate to the frontend folder:
```bash
cd frontend
```
2. Install dependencies:
```bash
npm install
```
3. Start the Angular application:
```bash
npm run start:network
```

---

### Usage

1. Start the backend server.
2. Run the Angular frontend.
3. Open http://localhost:4200 in your browser.
4. Use the platform.
