# Trip Expense Splitter

Trip Expense Splitter is a web application designed to help groups of friends easily record shared expenses during a trip and calculate the minimum number of transactions needed to settle all debts. 

## 🏗 Project Architecture & Tech Stack

The application is structured into a monolithic repository with separate frontend and backend directories:

- **Frontend:**
  - **Framework:** React 18 built with Vite.
  - **Routing:** React Router v6 for navigation (Dashboard & Trip Detail).
  - **Styling:** Vanilla CSS with a modern, glassmorphic dark theme and a fully responsive grid system.
  - **HTTP Client:** Axios for API requests.
  - **Icons:** Lucide React.
  
- **Backend:**
  - **Runtime:** Node.js.
  - **Framework:** Express.js for REST API endpoints.
  - **Database Integration:** `pg` (PostgreSQL client) to connect to Supabase.
  - **CORS & Environment:** `cors` middleware and `dotenv` for configuration.

- **Database:**
  - **Platform:** Supabase (PostgreSQL).
  - **Schema:** Relational design with `trips`, `participants`, `expenses`, and `expense_splits` tables. Foreign keys use `ON DELETE CASCADE` to keep data consistent.

## 🚀 Steps Taken to Create the Application

1. **Scaffolding:**
   - Initialized the Node.js backend (`npm init -y`) and installed necessary packages (`express`, `pg`, `cors`, `dotenv`).
   - Scaffolded the React frontend using Vite (`npx create-vite frontend --template react`).
   
2. **Database Design:**
   - Created the relational schema using PostgreSQL syntax to accurately represent trips, participants, and expense splits.
   
3. **Backend API Development:**
   - Configured `db.js` to establish a persistent pool connection to Supabase via `DATABASE_URL`.
   - Built Express routes in `server.js` to handle CRUD operations for trips, participants, and expenses.
   - Implemented logic in the `POST /expenses` endpoint to automatically divide the cost equally among all participants.
   - Built the `settlement.js` module to parse expenses and splits, aggregate balances, and calculate optimal transfers.

4. **Frontend UI Development:**
   - Replaced default Vite styles in `index.css` with a custom-designed modern UI system (dark mode, cards, gradients, input styling).
   - Configured `axios` instance pointing to the backend API (`http://localhost:5000/api`).
   - Implemented `Dashboard.jsx` to create and list trips.
   - Implemented `TripDetail.jsx` containing tabular views for Participants, Expense Ledger, and Settlement Plans.

## ⚙️ Setup Instructions

### 1. Database Setup (Supabase)
1. Log in to [Supabase](https://supabase.com) and create a new project.
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open the `backend/setup.sql` file provided in this project.
4. Copy the contents of `setup.sql` and execute the query to create the necessary tables.
5. Navigate to your Supabase Project Settings -> Database -> Connection String (URI). Copy the connection URI.

### 2. Environment Variables
1. Navigate to the `backend` directory.
2. Create a `.env` file (you can copy `.env.example` if available).
3. Set your connection string:
   ```env
   DATABASE_URL=your-supabase-connection-string
   PORT=5000
   ```
   *(Note: For Supabase, make sure to replace `[YOUR-PASSWORD]` in the URI with your actual database password).*

### 3. Running the Backend
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   node server.js
   ```
   *The server will run on `http://localhost:5000`.*

### 4. Running the Frontend
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the displayed local URL (typically `http://localhost:5173`) in your browser.

## 🧮 How the Greedy Settlement Algorithm Works

The settlement feature ensures that everyone gets paid back using the fewest number of transactions. Here is a breakdown of the algorithm implemented in `backend/settlement.js`:

1. **Calculate Net Balances:**
   - First, the algorithm calculates every participant's net position.
   - `Net Balance = (Total amount they paid for others) - (Total amount they owe for their share of expenses)`.
   - To avoid JavaScript floating point errors, all calculations temporarily convert currency to cents (`amount * 100`) and round them to integers.

2. **Categorize Participants:**
   - **Creditors:** People with a positive balance (they paid more than they owe; they need to get money back).
   - **Debtors:** People with a negative balance (they owe more than they paid; they need to pay others).

3. **Sort by Magnitude:**
   - Both the Creditors and Debtors lists are sorted in descending order by the absolute value of their balances. 
   - This ensures the algorithm always tries to settle the largest debts first, naturally reducing the total number of transactions.

4. **Iterative Matching (Min Cash Flow):**
   - The algorithm loops simultaneously over the Debtors and Creditors lists.
   - It takes the largest Debtor and the largest Creditor.
   - It creates a transaction from the Debtor to the Creditor for the *minimum* of their two balances.
   - Example: If Alice owes $50 and Bob is owed $80, a transaction is created: `Alice pays Bob $50`.
   - Alice's debt is now $0 (she is removed from the current Debtors pointer), and Bob is still owed $30. 
   - This process repeats until all balances reach 0.
