import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

export default function TripDetail() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settlement, setSettlement] = useState(null);
  
  const [newParticipant, setNewParticipant] = useState('');
  const [newExpense, setNewExpense] = useState({ 
    description: '', amount: '', payer_id: '', mode_of_payment: 'Cash', involvedParticipants: []
  });

  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  const fetchTripData = async () => {
    try {
      const tripRes = await api.get(`/trips/${tripId}`);
      setTrip(tripRes.data);
      const actualTripId = tripRes.data._id;
      
      const pRes = await api.get(`/trips/${actualTripId}/participants`);
      setParticipants(pRes.data);
      
      const eRes = await api.get(`/trips/${actualTripId}/expenses`);
      setExpenses(eRes.data);
      
      if (pRes.data.length > 0 && eRes.data.length > 0) {
        const sRes = await api.get(`/trips/${actualTripId}/settle`);
        setSettlement(sRes.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!newParticipant) return;
    await api.post(`/trips/${trip._id}/participants`, { name: newParticipant });
    setNewParticipant('');
    fetchTripData();
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount || !newExpense.payer_id || newExpense.involvedParticipants.length === 0) return;
    await api.post(`/trips/${trip._id}/expenses`, newExpense);
    setNewExpense({ description: '', amount: '', payer_id: '', mode_of_payment: 'Cash', involvedParticipants: [] });
    fetchTripData();
  };

  const handleParticipantToggle = (pId) => {
    setNewExpense(prev => {
      const isSelected = prev.involvedParticipants.includes(pId);
      return {
        ...prev,
        involvedParticipants: isSelected ? prev.involvedParticipants.filter(id => id !== pId) : [...prev.involvedParticipants, pId]
      };
    });
  };

  if (!trip) return <div>Loading...</div>;

  return (
    <div>
      <Link to="/">Back</Link>
      <h2>{trip.name}</h2>
      
      <section>
        <h3>Participants</h3>
        <form onSubmit={handleAddParticipant}>
          <input type="text" value={newParticipant} onChange={e => setNewParticipant(e.target.value)} placeholder="Name" />
          <button type="submit">Add</button>
        </form>
        <ul>{participants.map(p => <li key={p._id}>{p.name}</li>)}</ul>
      </section>

      <section>
        <h3>Add Expense</h3>
        <form onSubmit={handleAddExpense}>
          <input type="text" placeholder="Description" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} />
          <input type="number" placeholder="Amount" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
          <select value={newExpense.payer_id} onChange={e => setNewExpense({...newExpense, payer_id: e.target.value})}>
            <option value="">Paid By...</option>
            {participants.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <div>
            Split among:
            {participants.map(p => (
              <label key={p._id}>
                <input type="checkbox" checked={newExpense.involvedParticipants.includes(p._id)} onChange={() => handleParticipantToggle(p._id)} />
                {p.name}
              </label>
            ))}
          </div>
          <button type="submit">Save</button>
        </form>
      </section>

      <section>
        <h3>Expenses</h3>
        <ul>
          {expenses.map(e => (
             <li key={e._id}>{e.description} - ${e.amount} paid by {e.payer?.name}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Settlement</h3>
        {settlement && settlement.transactions.map((tx, i) => (
          <div key={i}>{tx.from} pays {tx.to} ${tx.amount}</div>
        ))}
      </section>
    </div>
  );
}
