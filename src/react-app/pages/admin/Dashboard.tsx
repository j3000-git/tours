import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Package, Users, Plus } from 'lucide-react';
import AdminLayout from '@/react-app/components/admin/AdminLayout';

interface Stats {
  totalTours: number;
  activeTours: number;
  totalBookings: number;
  pendingBookings: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalTours: 0,
    activeTours: 0,
    totalBookings: 0,
    pendingBookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [toursResponse, bookingsResponse] = await Promise.all([
          fetch('/api/admin/tours', { credentials: 'include' }),
          fetch('/api/admin/bookings', { credentials: 'include' }),
        ]);

        if (!toursResponse.ok || !bookingsResponse.ok) {
          navigate('/admin/login');
          return;
        }

        const toursData = await toursResponse.json();
        const bookingsData = await bookingsResponse.json();

        const tours = toursData.tours || [];
        const bookings = bookingsData.bookings || [];

        setStats({
          totalTours: tours.length,
          activeTours: tours.filter((t: any) => t.is_active).length,
          totalBookings: bookings.length,
          pendingBookings: bookings.filter((b: any) => b.status === 'pending').length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to the SaudiScape admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalTours}</h3>
          <p className="text-sm text-gray-600">Total Tours</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.activeTours}</h3>
          <p className="text-sm text-gray-600">Active Tours</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalBookings}</h3>
          <p className="text-sm text-gray-600">Total Bookings</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.pendingBookings}</h3>
          <p className="text-sm text-gray-600">Pending Bookings</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/admin/tours')}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add New Tour</span>
          </button>
          <button
            onClick={() => navigate('/admin/bookings')}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Users size={20} />
            <span>View All Bookings</span>
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
