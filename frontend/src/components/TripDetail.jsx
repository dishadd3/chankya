import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Receipt, ArrowLeftRight, ArrowLeft } from 'lucide-react';
import api from '../api';

export default function TripDetail() {
  const { tripId } = useParams();
  const [activeTab, setActiveTab] = useState('expenses');
  const [trip, setTrip] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settlement, setSettlement] = useState(null);
  
  const [newParticipant, setNewParticipant] = useState('');
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', payer_id: '', mode_of_payment: 'Cash' });

  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  const fetchTripData = async () => {
    try {
      const tripRes = await api.get(`/trips/${tripId}`);
      setTrip(tripRes.data);
      const pRes = await api.get(`/trips/${tripId}/participants`);
      setParticipants(pRes.data);
      const eRes = await api.get(`/trips/${tripId}/expenses`);
      setExpenses(eRes.data);
      if (pRes.data.length > 0 && eRes.data.length > 0) {
        const sRes = await api.get(`/trips/${tripId}/settle`);
        setSettlement(sRes.data);
      } else {
        setSettlement(null);
      }
    } catch (error) {
      console.error('Failed to fetch trip data', error);
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!newParticipant) return;
    try {
      await api.post(`/trips/${tripId}/participants`, { name: newParticipant });
      setNewParticipant('');
      fetchTripData();
    } catch (error) {
      console.error('Error adding participant', error);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount || !newExpense.payer_id) return;
    try {
      await api.post(`/trips/${tripId}/expenses`, newExpense);
      setNewExpense({ description: '', amount: '', payer_id: '', mode_of_payment: 'Cash' });
      fetchTripData();
    } catch (error) {
      console.error('Error adding expense', error);
      alert(error.response?.data?.error || 'Failed to add expense');
    }
  };

  if (!trip) return <div className="text-center text-muted" style={{marginTop: '2rem'}}>Loading...</div>;

  return (
    <div>
      <Link to="/" className="btn mb-4" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      
      <div className="card mb-4">
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{trip.name}</h2>
        <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Trip ID: {trip.id}</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab flex items-center gap-2 ${activeTab === 'participants' ? 'active' : ''}`}
          onClick={() => setActiveTab('participants')}
        >
          <Users size={16} /> Participants
        </button>
        <button 
          className={`tab flex items-center gap-2 ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          <Receipt size={16} /> Expenses
        </button>
        <button 
          className={`tab flex items-center gap-2 ${activeTab === 'settlement' ? 'active' : ''}`}
          onClick={() => setActiveTab('settlement')}
        >
          <ArrowLeftRight size={16} /> Settlement
        </button>
      </div>

      {activeTab === 'participants' && (
        <div className="card">
          <form onSubmit={handleAddParticipant} className="flex gap-2 mb-4">
            <input 
              type="text" 
              className="input" 
              placeholder="Participant Name" 
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
            />
            <button type="submit" className="btn">Add Person</button>
          </form>
          <div className="grid grid-cols-3">
            {participants.map(p => (
              <div key={p.id} className="card" style={{ backgroundColor: 'var(--bg-color)', textAlign: 'center', padding: '0.75rem' }}>
                <span style={{ fontWeight: '600' }}>{p.name}</span>
              </div>
            ))}
          </div>
          {participants.length === 0 && <p className="text-muted text-center" style={{ padding: '1rem 0' }}>No participants added yet.</p>}
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div className="card">
            <h3 className="text-lg mb-4" style={{ fontWeight: '600' }}>Add Expense</h3>
            <form onSubmit={handleAddExpense}>
              <div className="input-group">
                <label>Description</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Dinner, Taxi, etc."
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Amount</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="input" 
                  placeholder="0.00"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>Paid By</label>
                <select 
                  className="select"
                  value={newExpense.payer_id}
                  onChange={(e) => setNewExpense({...newExpense, payer_id: e.target.value})}
                >
                  <option value="">Select Person</option>
                  {participants.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Payment Mode</label>
                <select 
                  className="select"
                  value={newExpense.mode_of_payment}
                  onChange={(e) => setNewExpense({...newExpense, mode_of_payment: e.target.value})}
                >
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <button type="submit" className="btn" style={{ width: '100%', marginTop: '0.5rem' }}>Save Expense</button>
            </form>
          </div>
          
          <div className="card">
            <h3 className="text-lg mb-4" style={{ fontWeight: '600' }}>Expense Ledger</h3>
            <div className="flex" style={{ flexDirection: 'column', gap: '0.5rem' }}>
              {expenses.map(exp => (
                <div key={exp.id} className="list-item" style={{ backgroundColor: 'var(--bg-color)', borderRadius: '4px' }}>
                  <div>
                    <div style={{ fontWeight: '600' }}>{exp.description}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Paid by {exp.payer_name} via {exp.mode_of_payment}</div>
                  </div>
                  <div style={{ fontWeight: 'bold' }}>${parseFloat(exp.amount).toFixed(2)}</div>
                </div>
              ))}
              {expenses.length === 0 && <p className="text-muted text-center" style={{ padding: '1rem 0' }}>No expenses logged yet.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settlement' && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div className="card">
            <h3 className="text-lg mb-4" style={{ fontWeight: '600' }}>Net Balances</h3>
            {settlement ? (
              <div className="flex" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                {settlement.balances.map(b => (
                  <div key={b.name} className="list-item" style={{ backgroundColor: 'var(--bg-color)', borderRadius: '4px' }}>
                    <span style={{ fontWeight: '500' }}>{b.name}</span>
                    <span className={`badge ${parseFloat(b.balance) > 0 ? 'badge-success' : parseFloat(b.balance) < 0 ? 'badge-danger' : ''}`}>
                      {parseFloat(b.balance) > 0 ? '+' : ''}{b.balance}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center" style={{ padding: '1rem 0' }}>Add expenses to generate balances.</p>
            )}
          </div>
          
          <div className="card">
            <h3 className="text-lg mb-4" style={{ fontWeight: '600' }}>Settlement Plan</h3>
            {settlement && settlement.transactions.length > 0 ? (
              <div className="flex" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                {settlement.transactions.map((tx, idx) => (
                  <div key={idx} className="list-item" style={{ backgroundColor: 'var(--bg-color)', borderRadius: '4px' }}>
                    <div className="flex items-center justify-between" style={{ width: '100%', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '500', color: 'var(--danger-color)' }}>{tx.from}</span>
                      <div className="flex items-center" style={{ flexDirection: 'column', flex: 1, margin: '0 1rem' }}>
                        <span className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Pays</span>
                        <div style={{ height: '1px', width: '100%', backgroundColor: 'var(--border-color)', position: 'relative' }}>
                          <ArrowLeftRight size={12} className="text-muted" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'var(--bg-color)', padding: '0 2px' }} />
                        </div>
                        <span style={{ fontWeight: 'bold', marginTop: '0.25rem' }}>${tx.amount}</span>
                      </div>
                      <span style={{ fontWeight: '500', color: 'var(--success-color)' }}>{tx.to}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center" style={{ padding: '1rem 0' }}>
                {settlement ? 'All debts are settled!' : 'Add expenses to generate a plan.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
