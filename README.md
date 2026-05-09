Step 1: DEFINING THE SCHEMAA AND CREATING THE DATABASE
The schema needs to support trips, participants, and expenses cleanly. (Recommended to use Supabase here, very easy to setup, simply login and create database and tables. Slightly unintuitive UI but can be figured out)
There will be 4 tables: 
1. Trips table:
   id: UUID (Primary Key)

   name: VARCHAR (e.g., "Goa 2026")

   created_at: TIMESTAMP (Default: now())

2. Participants Table:
   id: UUID (Primary Key)

  trip_id: UUID (Foreign Key -> trips.id, Cascade Delete)
  
  name: VARCHAR (e.g., "Abhilash")
  
  created_at: TIMESTAMP (Default: now())

3. Expenses Table:
   id: UUID (Primary Key)

  trip_id: UUID (Foreign Key -> trips.id, Cascade Delete)
  
  payer_id: UUID (Foreign Key -> participants.id) - The person who fronted the cash.
  
  description: VARCHAR (e.g., "Dinner at Fisherman's Wharf")
  
  amount: NUMERIC/DECIMAL - Always use numeric types for currency to avoid floating-point inaccuracies.
  
  mode_of_payment: VARCHAR (Optional - e.g., "Cash", "UPI", "Credit Card")

  created_at: TIMESTAMP (Default: now())
  
4. expense_splits table:
    id: UUID (Primary Key)

  expense_id: UUID (Foreign Key -> expenses.id, Cascade Delete)
  
  participant_id: UUID (Foreign Key -> participants.id) - The person who owes a share.
  
  amount_owed: NUMERIC/DECIMAL - (e.g., If a 1000 expense is split 4 ways, this column stores 250.00 for each participant involved).
