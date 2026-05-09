import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Plane } from 'lucide-react';
import api from '../api';

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [newTripName, setNewTripName] = useState('');

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await api.get('/trips');
      setTrips(res.data);
    } catch (error) {
      console.error('Failed to fetch trips', error);
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!newTripName) return;
    try {
      await api.post('/trips', { name: newTripName });
      setNewTripName('');
      fetchTrips();
    } catch (error) {
      console.error('Failed to create trip', error);
    }
  };

  return (
    <div>
      <div className="card mb-4">
        <h2 className="text-lg mb-4 flex items-center gap-2">
          <PlusCircle size={20} /> Create New Trip
        </h2>
        <form onSubmit={handleCreateTrip} className="flex gap-2">
          <input
            type="text"
            className="input"
            placeholder="E.g., Summer in Paris"
            value={newTripName}
            onChange={(e) => setNewTripName(e.target.value)}
          />
          <button type="submit" className="btn">Create</button>
        </form>
      </div>

      <div className="grid grid-cols-2">
        {trips.map(trip => (
          <Link to={`/trip/${trip.id}`} key={trip.id} className="card">
            <h3 className="text-lg flex items-center gap-2 mb-2">
              <Plane size={20} style={{ color: 'var(--primary-color)' }} />
              {trip.name}
            </h3>
            <p className="text-muted text-sm">
              Created: {new Date(trip.created_at).toLocaleDateString()}
            </p>
          </Link>
        ))}
        {trips.length === 0 && (
          <div className="card text-center text-muted" style={{ gridColumn: 'span 2' }}>
            No trips yet. Create one above!
          </div>
        )}
      </div>
    </div>
  );
}
