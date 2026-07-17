# PrintFlow 🖨️

PrintFlow is a comprehensive, modern print shop ordering and customization management system. It features a responsive React-based frontend powered by Vite and Tailwind CSS, and a robust Express/MongoDB backend providing secure JWT-based user authentication, price calculation, and order tracking.

---

## 🚀 Features

- **Pricing Engines**: Automatic interactive cost calculations for various print products:
  - **Flex Banners** (custom size, normal/star/blackback materials, grommet options)
  - **High-Res Posters** (sizes A4 to A1, matte/glossy/cardstock finishes, orientation)
  - **Visiting Cards** (quantity tier discounts, finishes, round/square corners)
- **Visual Previews**: Live visual feedback of products dynamically rendered on canvas element.
- **Authentication System**: Secure JWT-based register/login system with hashed passwords using `bcryptjs`.
- **Role-Based Views / Dashboards**:
  - **Customer View**: Browse products, customize specifications, calculate pricing, upload designs, and place orders.
  - **Owner / Administrator View**: Manage and track order status, review client print files, and monitor incoming jobs.
- **File Uploads**: Supports sending print design files via `multer`.

---

## 📂 Project Structure

```text
PrintFlow/
├── backend/                  # Express API Server
│   ├── models/               # Mongoose schemas (User, Order, etc.)
│   ├── routes/               # API endpoint routing (auth, orders)
│   ├── uploads/              # Directory for stored customer design files
│   ├── server.js             # Main server entrypoint & DB connection
│   ├── package.json          # Node dependencies & run scripts
│   └── vercel.json           # Vercel deployment config for API
│
├── frontend/                 # React Application (Vite & Tailwind CSS)
│   ├── src/
│   │   ├── components/       # UI Components (Login, Order Lists, Customizer)
│   │   ├── pages/            # View Pages (CustomerPages, etc.)
│   │   └── App.jsx           # Main application state and routing
│   ├── package.json          # Frontend dependencies & run scripts
│   └── vercel.json           # Vercel deployment config for SPA
│
└── README.md                 # Main Project Documentation
```

---

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas URI

### 1. Backend Setup

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory and configure the variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/printflow
   JWT_SECRET=your_jwt_secret_key_here
   ```
4. Start the server:
   - For production:
     ```bash
     npm start
     ```
   - For development (with hot-reload via `nodemon`):
     ```bash
     npm run dev
     ```

### 2. Frontend Setup

1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the displayed local URL (usually `http://localhost:5173`) in your web browser.

---

## 🔐 API Routes

- **Authentication (`/api/auth`)**:
  - `POST /api/auth/register` - Create a new user account.
  - `POST /api/auth/login` - Authenticate user and receive token.
- **Orders (`/api/orders`)**:
  - `GET /api/orders` - Retrieve list of orders.
  - `POST /api/orders` - Place a new print order.
  - `PUT /api/orders/:id` - Update status of an order.

---

## 📄 License

This project is licensed under the ISC License.
