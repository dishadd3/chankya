import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import TripDetail from './components/TripDetail';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155'
          }
        }} />
        <header className="header">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1>Trip Expense Splitter</h1>
          </Link>
          <p className="text-textMuted mt-4">Fairly split expenses and settle debts seamlessly.</p>
        </header>
        
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trip/:tripId" element={<TripDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
