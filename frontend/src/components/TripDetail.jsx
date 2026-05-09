import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Receipt, ArrowLeftRight, ArrowLeft, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

export default function TripDetail() {
  const { tripId } = useParams(); // Using shareToken
  const [activeTab, setActiveTab] = useState('expenses');
  const [trip, setTrip] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settlement, setSettlement] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [newParticipant, setNewParticipant] = useState('');
  const [newExpense, setNewExpense] = useState({ 
    description: '', 
    amount: '', 
    payer_id: '', 
    mode_of_payment: 'Cash',
    involvedParticipants: []
  });

  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  const fetchTripData = async () => {
    try {
      setLoading(true);
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
      } else {
        setSettlement(null);
      }
    } catch (error) {
      toast.error('Failed to fetch trip details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!newParticipant.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      await api.post(`/trips/${trip._id}/participants`, { name: newParticipant.trim() });
      setNewParticipant('');
      toast.success('Participant added!');
      fetchTripData();
    } catch (error) {
      toast.error('Failed to add participant');
      console.error(error);
    }
  };

  const handleParticipantToggle = (pId) => {
    setNewExpense(prev => {
      const isSelected = prev.involvedParticipants.includes(pId);
      if (isSelected) {
        return { ...prev, involvedParticipants: prev.involvedParticipants.filter(id => id !== pId) };
      } else {
        return { ...prev, involvedParticipants: [...prev.involvedParticipants, pId] };
      }
    });
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount || !newExpense.payer_id) {
      toast.error('Missing required fields');
      return;
    }
    if (newExpense.involvedParticipants.length === 0) {
      toast.error('Must involve at least one participant');
      return;
    }
    try {
      await api.post(`/trips/${trip._id}/expenses`, newExpense);
      setNewExpense({ 
        description: '', 
        amount: '', 
        payer_id: '', 
        mode_of_payment: 'Cash',
        involvedParticipants: []
      });
      toast.success('Expense logged successfully!');
      fetchTripData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add expense');
      console.error(error);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/expenses/${expenseId}`);
      toast.success('Expense deleted');
      fetchTripData();
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const exportCSV = () => {
    if (expenses.length === 0) {
      toast.error('No expenses to export');
      return;
    }
    
    const headers = ['Date', 'Description', 'Amount', 'Payer', 'Mode of Payment'];
    const csvRows = [headers.join(',')];
    
    expenses.forEach(e => {
      const date = new Date(e.createdAt).toLocaleDateString();
      const payerName = e.payer?.name || 'Unknown';
      csvRows.push(`${date},"${e.description}",${e.amount},"${payerName}","${e.modeOfPayment}"`);
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${trip.name}_ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export started!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!trip) return <div className="text-center text-textMuted mt-8">Trip not found</div>;

  return (
    <div>
      <Link to="/" className="btn bg-transparent border border-borderMain text-textMuted hover:text-textMain hover:bg-surface mb-4">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      
      <div className="card mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{trip.name}</h2>
          <p className="text-textMuted text-sm mt-1">Share this link: {window.location.href}</p>
        </div>
        <button onClick={exportCSV} className="btn bg-surface border border-borderMain text-textMain hover:bg-borderMain">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-borderMain pb-2">
        <button 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'participants' ? 'bg-primary/10 text-primary' : 'text-textMuted hover:bg-surface hover:text-textMain'}`}
          onClick={() => setActiveTab('participants')}
        >
          <Users size={16} /> Participants
        </button>
        <button 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'expenses' ? 'bg-primary/10 text-primary' : 'text-textMuted hover:bg-surface hover:text-textMain'}`}
          onClick={() => setActiveTab('expenses')}
        >
          <Receipt size={16} /> Expenses
        </button>
        <button 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'settlement' ? 'bg-primary/10 text-primary' : 'text-textMuted hover:bg-surface hover:text-textMain'}`}
          onClick={() => setActiveTab('settlement')}
        >
          <ArrowLeftRight size={16} /> Settlement
        </button>
      </div>

      {activeTab === 'participants' && (
        <div className="card">
          <form onSubmit={handleAddParticipant} className="flex gap-4 mb-6">
            <input 
              type="text" 
              className="input flex-1" 
              placeholder="Enter participant name" 
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
            />
            <button type="submit" className="btn whitespace-nowrap">Add Person</button>
          </form>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {participants.map(p => (
              <div key={p._id} className="bg-background rounded-lg text-center py-3 border border-borderMain font-semibold">
                {p.name}
              </div>
            ))}
          </div>
          {participants.length === 0 && <p className="text-textMuted text-center py-8">No participants added yet.</p>}
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card h-fit">
            <h3 className="text-lg font-semibold mb-6">Add Expense</h3>
            <form onSubmit={handleAddExpense} className="flex flex-col gap-4">
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
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Split Among (Select multiple)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {participants.map(p => {
                    const isSelected = newExpense.involvedParticipants.includes(p._id);
                    return (
                      <button
                        type="button"
                        key={p._id}
                        onClick={() => handleParticipantToggle(p._id)}
                        className={`badge cursor-pointer border ${
                          isSelected 
                            ? 'bg-primary/20 border-primary text-primary' 
                            : 'bg-background border-borderMain text-textMuted hover:border-textMuted'
                        }`}
                      >
                        {p.name}
                      </button>
                    )
                  })}
                  {participants.length === 0 && <span className="text-sm text-textMuted">Add participants first</span>}
                </div>
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
              <button type="submit" className="btn w-full mt-2">Save Expense</button>
            </form>
          </div>
          
          <div className="card h-fit">
            <h3 className="text-lg font-semibold mb-6">Expense Ledger</h3>
            <div className="flex flex-col gap-3">
              {expenses.map(exp => (
                <div key={exp._id} className="bg-background rounded-lg p-4 border border-borderMain flex justify-between items-center group">
                  <div>
                    <div className="font-semibold text-lg">{exp.description}</div>
                    <div className="text-sm text-textMuted mt-1">Paid by <span className="text-textMain font-medium">{exp.payer?.name}</span> via {exp.modeOfPayment}</div>
                    <div className="text-xs text-textMuted mt-1">
                      Split among {exp.involvedParticipants.length} people
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="font-bold text-xl">${parseFloat(exp.amount).toFixed(2)}</div>
                    <button 
                      onClick={() => handleDeleteExpense(exp._id)}
                      className="text-textMuted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Expense"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && <p className="text-textMuted text-center py-8">No expenses logged yet.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settlement' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card h-fit">
            <h3 className="text-lg font-semibold mb-6">Net Balances</h3>
            {settlement ? (
              <div className="flex flex-col gap-3">
                {settlement.balances.map(b => (
                  <div key={b.name} className="bg-background rounded-lg p-4 border border-borderMain flex justify-between items-center">
                    <span className="font-medium text-lg">{b.name}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      parseFloat(b.balance) > 0 
                        ? 'bg-emerald-500/20 text-emerald-500' 
                        : parseFloat(b.balance) < 0 
                          ? 'bg-red-500/20 text-red-500' 
                          : 'bg-borderMain text-textMuted'
                    }`}>
                      {parseFloat(b.balance) > 0 ? '+' : ''}{b.balance}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-textMuted text-center py-8">Add expenses to generate balances.</p>
            )}
          </div>
          
          <div className="card h-fit">
            <h3 className="text-lg font-semibold mb-6">Settlement Plan</h3>
            {settlement && settlement.transactions.length > 0 ? (
              <div className="flex flex-col gap-3">
                {settlement.transactions.map((tx, idx) => (
                  <div key={idx} className="bg-background rounded-lg p-4 border border-borderMain">
                    <div className="flex items-center justify-between w-full gap-4">
                      <span className="font-semibold text-red-400 w-1/3 text-right truncate">{tx.from}</span>
                      <div className="flex flex-col items-center flex-1">
                        <span className="text-xs text-textMuted mb-1 font-medium uppercase tracking-wider">Pays</span>
                        <div className="h-px w-full bg-borderMain relative flex items-center justify-center">
                          <div className="bg-background px-2 text-textMuted">
                            <ArrowLeftRight size={14} />
                          </div>
                        </div>
                        <span className="font-bold mt-2 text-lg">${tx.amount}</span>
                      </div>
                      <span className="font-semibold text-emerald-400 w-1/3 truncate">{tx.to}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-textMuted text-center py-8">
                {settlement ? 'All debts are settled! 🎉' : 'Add expenses to generate a plan.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
