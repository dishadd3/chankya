# Trip Expense Splitter

Trip Expense Splitter is a polished web application designed to help groups of friends easily record shared expenses during a trip, handle complex selective splitting, and calculate the minimum number of transactions needed to settle all debts. 

## 🏗 Project Architecture & Tech Stack

The application is structured into a monolithic repository with separate frontend and backend directories:

- **Frontend:**
  - **Framework:** React 18 built with Vite.
  - **Routing:** React Router v6 for navigation (Dashboard & Trip Detail).
  - **Styling:** Tailwind CSS v3 with a modern, glassmorphic dark theme and responsive grid system.
  - **HTTP Client:** Axios for API requests.
  - **UX/UI Polish:** Lucide React for icons, React Hot Toast for instant feedback notifications.
  
- **Backend:**
  - **Runtime:** Node.js.
  - **Framework:** Express.js for REST API endpoints.
  - **Database Integration:** Mongoose ODM to connect to MongoDB.
  - **CORS & Environment:** `cors` middleware and `dotenv` for configuration.

- **Database (MongoDB):**
  - **TripSchema:** Stores trip name, a unique `shareToken` for shareable links, and references to participants and expenses.
  - **ParticipantSchema:** Stores names and references the parent trip.
  - **ExpenseSchema:** Stores description, amount, the payer (ref: Participant), an array of `involvedParticipants` (for selective splitting), and payment mode.

## 🚀 Steps Taken to Create the Application

1. **Scaffolding:**
   - Initialized the Node.js backend and installed necessary packages (`express`, `mongoose`, `cors`, `dotenv`).
   - Scaffolded the React frontend using Vite.
   
2. **Database Design (MongoDB Refactor):**
   - Built Mongoose schemas to represent trips, participants, and expenses, ensuring proper references using `ObjectId`.
   
3. **Backend API Development:**
   - Configured `db.js` to establish a connection to MongoDB via `DATABASE_URL`.
   - Built Express routes in `server.js` to handle CRUD operations. Added selective splitting logic and cascade deletion for expenses.
   - Built the `settlement.js` module to parse selective expense splits, aggregate balances, and calculate optimal transfers.

4. **Frontend UI Development:**
   - Integrated Tailwind CSS for rapid UI development and replaced default styles with a custom modern UI system.
   - Configured `axios` instance pointing to the backend API (`http://localhost:5000/api`).
   - Implemented `Dashboard.jsx` to create and list trips. Added a skeleton loading state.
   - Implemented `TripDetail.jsx` containing tabular views for Participants, Expense Ledger (with delete functionality), and Settlement Plans.
   - Added a CSV Export feature to download the ledger.

## ⚙️ Setup Instructions

### 1. Environment Variables
1. Navigate to the `backend` directory.
2. Create a `.env` file (you can copy `.env.example` if available).
3. Set your MongoDB connection string:
   ```env
   DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/tripexpensesplitter?retryWrites=true&w=majority
   PORT=5000
   ```

### 2. Running the Backend
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

### 3. Running the Frontend
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

The settlement feature ensures that everyone gets paid back using the fewest number of transactions. 

1. **Calculate Net Balances (with Selective Splitting):**
   - The algorithm calculates every participant's net position.
   - `Net Balance = (Total amount they paid) - (Total amount they owe across all expenses)`.
   - **Selective Splitting:** Unlike equal splitting where an expense is divided by the total number of trip participants, selective splitting divides the expense *only* by the `involvedParticipants` selected for that specific expense.
   - `Individual Share = Total Expense Amount / Number of Involved Participants`.
   - To avoid JavaScript floating point errors, all calculations temporarily convert currency to cents (`amount * 100`) and round them to integers.

2. **Categorize Participants:**
   - **Creditors:** People with a positive balance (they paid more than they owe).
   - **Debtors:** People with a negative balance (they owe more than they paid).

3. **Iterative Matching (Min Cash Flow):**
   - The algorithm loops simultaneously over the Debtors and Creditors lists (sorted by magnitude descending).
   - It takes the largest Debtor and the largest Creditor.
   - It creates a transaction from the Debtor to the Creditor for the *minimum* of their two balances.
   - This repeats until all balances reach 0.
