import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [newTripName, setNewTripName] = useState('');

  useEffect(() => {
    api.get('/trips').then(res => setTrips(res.data));
  }, []);

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!newTripName) return;
    const res = await api.post('/trips', { name: newTripName });
    setNewTripName('');
    setTrips([res.data, ...trips]);
  };

  return (
    <div>
      <h2>Create New Trip</h2>
      <form onSubmit={handleCreateTrip}>
        <input
          type="text"
          placeholder="Trip Name"
          value={newTripName}
          onChange={(e) => setNewTripName(e.target.value)}
        />
        <button type="submit">Create</button>
      </form>

      <h2>Trips</h2>
      <ul>
        {trips.map(trip => (
          <li key={trip._id}>
            <Link to={`/trip/${trip.shareToken}`}>{trip.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
