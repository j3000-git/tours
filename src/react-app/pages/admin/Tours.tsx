import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '@/react-app/components/admin/AdminLayout';


interface Tour {
  id: number;
  title: string;
  location: string;
  duration_days: number;
  price: number;
  max_guests: number;
  is_featured: boolean;
  is_active: boolean;
}

export default function AdminTours() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  const fetchTours = async () => {
    try {
      const response = await fetch('/api/admin/tours', { credentials: 'include' });
      
      if (!response.ok) {
        navigate('/admin/login');
        return;
      }

      const data = await response.json();
      setTours(data.tours || []);
    } catch (error) {
      console.error('Failed to fetch tours:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [navigate]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tour?')) return;

    try {
      const response = await fetch(`/api/admin/tours/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchTours();
      } else {
        alert('Failed to delete tour');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete tour');
    }
  };

  const handleEdit = (tour: Tour) => {
    navigate(`/admin/tours/edit/${tour.id}`);
  };

  const handleAddNew = () => {
    navigate('/admin/tours/edit/new');
  };

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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tours Management</h1>
          <p className="text-gray-600">Manage your tour packages</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add New Tour</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
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
              {tours.map((tour) => (
                <tr key={tour.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tour.title}</div>
                        {tour.is_featured && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{tour.location}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{tour.duration_days} days</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{tour.price} SAR</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tour.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {tour.is_active ? (
                        <>
                          <Eye size={12} className="mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} className="mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(tour)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(tour.id)}
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

        {tours.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No tours found. Add your first tour to get started.</p>
          </div>
        )}
      </div>

      
    </AdminLayout>
  );
}
