const express = require('express');
const cors = require('cors');
const db = require('./db');
const { calculateSettlement } = require('./settlement');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/trips', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Trip name is required' });
    const result = await db.query('INSERT INTO trips (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/trips', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM trips ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/trips/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    const result = await db.query('SELECT * FROM trips WHERE id = $1', [tripId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Trip not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/trips/:tripId/participants', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Participant name is required' });
    const result = await db.query(
      'INSERT INTO participants (trip_id, name) VALUES ($1, $2) RETURNING *',
      [tripId, name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/trips/:tripId/participants', async (req, res) => {
  try {
    const { tripId } = req.params;
    const result = await db.query('SELECT * FROM participants WHERE trip_id = $1 ORDER BY created_at ASC', [tripId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/trips/:tripId/expenses', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { description, amount, payer_id, mode_of_payment } = req.body;
    
    if (!description || !amount || !payer_id || !mode_of_payment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const participantsResult = await db.query('SELECT id FROM participants WHERE trip_id = $1', [tripId]);
    const participants = participantsResult.rows;

    if (participants.length === 0) {
      return res.status(400).json({ error: 'No participants in this trip to split the expense' });
    }

    const splitAmount = (amount / participants.length).toFixed(2);

    const expenseResult = await db.query(
      'INSERT INTO expenses (trip_id, payer_id, description, amount, mode_of_payment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [tripId, payer_id, description, amount, mode_of_payment]
    );
    const expense = expenseResult.rows[0];

    const splitPromises = participants.map(p => {
      return db.query(
        'INSERT INTO expense_splits (expense_id, participant_id, amount_owed) VALUES ($1, $2, $3)',
        [expense.id, p.id, splitAmount]
      );
    });

    await Promise.all(splitPromises);

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/trips/:tripId/expenses', async (req, res) => {
  try {
    const { tripId } = req.params;
    const result = await db.query(
      `SELECT e.*, p.name as payer_name 
       FROM expenses e 
       JOIN participants p ON e.payer_id = p.id 
       WHERE e.trip_id = $1 
       ORDER BY e.created_at DESC`,
      [tripId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/trips/:tripId/settle', async (req, res) => {
  try {
    const { tripId } = req.params;
    
    const pResult = await db.query('SELECT id, name FROM participants WHERE trip_id = $1', [tripId]);
    const eResult = await db.query('SELECT id, payer_id, amount FROM expenses WHERE trip_id = $1', [tripId]);
    const sResult = await db.query(
      `SELECT es.participant_id, es.amount_owed 
       FROM expense_splits es 
       JOIN expenses e ON es.expense_id = e.id 
       WHERE e.trip_id = $1`, 
       [tripId]
    );

    const settlement = calculateSettlement(pResult.rows, eResult.rows, sResult.rows);
    res.json(settlement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
