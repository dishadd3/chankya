import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import TripDetail from './components/TripDetail';

function App() {
  return (
    <Router>
      <div>
        <header>
          <Link to="/">
            <h1>Trip Expense Splitter</h1>
          </Link>
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
