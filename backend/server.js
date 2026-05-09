const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const { Trip, Participant, Expense } = require('./models');
const { calculateSettlement } = require('./settlement');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.post('/api/trips', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Trip name is required' });
    
    const shareToken = crypto.randomBytes(8).toString('hex');
    const trip = new Trip({ name, shareToken });
    await trip.save();
    
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/trips', async (req, res) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/trips/:tripId', async (req, res) => {
  try {
    // support lookup by id or shareToken
    const isObjectId = req.params.tripId.match(/^[0-9a-fA-F]{24}$/);
    let trip;
    if (isObjectId) {
      trip = await Trip.findById(req.params.tripId).populate('participants').populate('expenses');
    } else {
      trip = await Trip.findOne({ shareToken: req.params.tripId }).populate('participants').populate('expenses');
    }
    
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/trips/:tripId/participants', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Participant name is required' });
    
    const participant = new Participant({ name, tripId });
    await participant.save();
    
    await Trip.findByIdAndUpdate(tripId, { $push: { participants: participant._id } });
    
    res.status(201).json(participant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/trips/:tripId/participants', async (req, res) => {
  try {
    const participants = await Participant.find({ tripId: req.params.tripId });
    res.json(participants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/trips/:tripId/expenses', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { description, amount, payer_id, mode_of_payment, involvedParticipants } = req.body;
    
    if (!description || !amount || !payer_id || !involvedParticipants || involvedParticipants.length === 0) {
      return res.status(400).json({ error: 'Missing required fields or involved participants' });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const expense = new Expense({
      description,
      amount,
      payer: payer_id,
      involvedParticipants,
      modeOfPayment: mode_of_payment || 'Cash',
      tripId
    });
    
    await expense.save();
    await Trip.findByIdAndUpdate(tripId, { $push: { expenses: expense._id } });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/trips/:tripId/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find({ tripId: req.params.tripId }).populate('payer').sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/expenses/:expenseId', async (req, res) => {
  try {
    const { expenseId } = req.params;
    const updates = req.body;
    const expense = await Expense.findByIdAndUpdate(expenseId, updates, { new: true });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/expenses/:expenseId', async (req, res) => {
  try {
    const { expenseId } = req.params;
    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    await Expense.findByIdAndDelete(expenseId);
    await Trip.findByIdAndUpdate(expense.tripId, { $pull: { expenses: expenseId } });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/trips/:tripId/settle', async (req, res) => {
  try {
    const { tripId } = req.params;
    
    const participants = await Participant.find({ tripId });
    const expenses = await Expense.find({ tripId });

    const settlement = calculateSettlement(participants, expenses);
    res.json(settlement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
