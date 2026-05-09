const mongoose = require('mongoose');

const ParticipantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true }
});

const ExpenseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  payer: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', required: true },
  involvedParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Participant' }],
  modeOfPayment: { type: String, default: 'Cash' },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true }
}, { timestamps: true });

const TripSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shareToken: { type: String, unique: true, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Participant' }],
  expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }]
}, { timestamps: true });

const Trip = mongoose.model('Trip', TripSchema);
const Participant = mongoose.model('Participant', ParticipantSchema);
const Expense = mongoose.model('Expense', ExpenseSchema);

module.exports = { Trip, Participant, Expense };
