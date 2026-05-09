import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import TripDetail from './components/TripDetail';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="header">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1>Trip Expense Splitter</h1>
          </Link>
          <p className="text-muted mt-4">Fairly split expenses and settle debts seamlessly.</p>
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
