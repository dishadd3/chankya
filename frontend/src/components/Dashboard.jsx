import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Plane } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [newTripName, setNewTripName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trips');
      setTrips(res.data);
    } catch (error) {
      toast.error('Failed to fetch trips');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!newTripName.trim()) {
      toast.error('Trip name cannot be empty');
      return;
    }
    try {
      const res = await api.post('/trips', { name: newTripName.trim() });
      setNewTripName('');
      toast.success('Trip created successfully!');
      setTrips([res.data, ...trips]);
    } catch (error) {
      toast.error('Failed to create trip');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <PlusCircle size={20} className="text-primary" /> Create New Trip
        </h2>
        <form onSubmit={handleCreateTrip} className="flex gap-4">
          <input
            type="text"
            className="input flex-1"
            placeholder="E.g., Summer in Paris"
            value={newTripName}
            onChange={(e) => setNewTripName(e.target.value)}
          />
          <button type="submit" className="btn whitespace-nowrap">Create Trip</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map(trip => (
          <Link to={`/trip/${trip.shareToken}`} key={trip._id} className="card group">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 group-hover:text-primary transition-colors">
              <Plane size={20} className="text-primary" />
              {trip.name}
            </h3>
            <p className="text-textMuted text-sm">
              Created: {new Date(trip.createdAt).toLocaleDateString()}
            </p>
          </Link>
        ))}
        {trips.length === 0 && (
          <div className="card text-center text-textMuted md:col-span-2 lg:col-span-3 py-12">
            No trips yet. Create one above to get started!
          </div>
        )}
      </div>
    </div>
  );
}
