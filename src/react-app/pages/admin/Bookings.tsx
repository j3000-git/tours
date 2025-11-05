import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Trash2 } from 'lucide-react';
import AdminLayout from '@/react-app/components/admin/AdminLayout';

interface Booking {
  id: number;
  tour_id: number;
  tour_title: string;
  tour_location: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  guest_count: number;
  preferred_date: string | null;
  message: string | null;
  status: string;
  total_price: number;
  created_at: string;
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/admin/bookings', { credentials: 'include' });
      
      if (!response.ok) {
        navigate('/admin/login');
        return;
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [navigate]);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchBookings();
      } else {
        alert('Failed to update booking status');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update booking status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchBookings();
      } else {
        alert('Failed to delete booking');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete booking');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookings Management</h1>
        <p className="text-gray-600">Manage customer bookings and requests</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {['all', 'pending', 'confirmed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-2 text-xs">
              ({status === 'all' ? bookings.length : bookings.filter(b => b.status === status).length})
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tour
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{booking.guest_name}</div>
                      <div className="text-gray-500">{booking.guest_email}</div>
                      <div className="text-gray-500">{booking.guest_phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{booking.tour_title}</div>
                      <div className="text-gray-500">{booking.tour_location}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div>Guests: {booking.guest_count}</div>
                    <div>Price: {booking.total_price} SAR</div>
                    {booking.preferred_date && (
                      <div>Date: {new Date(booking.preferred_date).toLocaleDateString()}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(booking.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'No bookings found.' 
                : `No ${filter} bookings found.`}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
