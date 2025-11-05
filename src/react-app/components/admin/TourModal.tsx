import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface TourModalProps {
  tour: any | null;
  onClose: () => void;
}

export default function TourModal({ tour, onClose }: TourModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    duration_days: 1,
    price: 0,
    max_guests: 10,
    image_url: '',
    highlights: '',
    included: '',
    gallery_images: '',
    gallery_videos: '',
    is_featured: false,
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tour) {
      setFormData({
        title: tour.title || '',
        description: tour.description || '',
        location: tour.location || '',
        duration_days: tour.duration_days || 1,
        price: tour.price || 0,
        max_guests: tour.max_guests || 10,
        image_url: tour.image_url || '',
        highlights: tour.highlights ? JSON.stringify(tour.highlights) : '',
        included: tour.included ? JSON.stringify(tour.included) : '',
        gallery_images: tour.gallery_images || '',
        gallery_videos: tour.gallery_videos || '',
        is_featured: tour.is_featured || false,
        is_active: tour.is_active !== undefined ? tour.is_active : true,
      });
    }
  }, [tour]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        highlights: formData.highlights ? JSON.parse(formData.highlights) : [],
        included: formData.included ? JSON.parse(formData.included) : [],
        gallery_images: formData.gallery_images ? JSON.parse(formData.gallery_images) : [],
        gallery_videos: formData.gallery_videos ? JSON.parse(formData.gallery_videos) : [],
      };

      const url = tour ? `/api/admin/tours/${tour.id}` : '/api/admin/tours';
      const method = tour ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save tour');
      }
    } catch (error) {
      console.error('Save error:', error);
      setError('Failed to save tour. Please check JSON fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full my-8">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-900">
            {tour ? 'Edit Tour' : 'Add New Tour'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (days) *
              </label>
              <input
                type="number"
                name="duration_days"
                value={formData.duration_days}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (SAR) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Guests *
              </label>
              <input
                type="number"
                name="max_guests"
                value={formData.max_guests}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Highlights (JSON array)
              </label>
              <textarea
                name="highlights"
                value={formData.highlights}
                onChange={handleChange}
                rows={3}
                placeholder='["Highlight 1", "Highlight 2"]'
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Included (JSON array)
              </label>
              <textarea
                name="included"
                value={formData.included}
                onChange={handleChange}
                rows={3}
                placeholder='["Item 1", "Item 2"]'
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gallery Images (JSON array of URLs)
              </label>
              <textarea
                name="gallery_images"
                value={formData.gallery_images}
                onChange={handleChange}
                rows={2}
                placeholder='["https://...", "https://..."]'
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gallery Videos (JSON array of URLs)
              </label>
              <textarea
                name="gallery_videos"
                value={formData.gallery_videos}
                onChange={handleChange}
                rows={2}
                placeholder='["https://...", "https://..."]'
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Featured Tour
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Active
              </label>
            </div>
          </div>

          <div className="flex space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : tour ? 'Update Tour' : 'Create Tour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
