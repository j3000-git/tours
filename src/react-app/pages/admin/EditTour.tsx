import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Upload, X, Plus, Video } from 'lucide-react';
import AdminLayout from '@/react-app/components/admin/AdminLayout';

export default function EditTour() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = id !== 'new';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    duration_days: 1,
    price: 0,
    max_guests: 10,
    image_url: '',
    highlights: '', // comma-separated string
    included: '', // comma-separated string
    gallery_images: [] as string[], // array of URLs
    gallery_videos: [] as string[], // array of URLs
    is_featured: false,
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (isEditing && id) {
      fetchTour();
    }
  }, [id, isEditing]);

  const fetchTour = async () => {
    try {
      const response = await fetch(`/api/admin/tours`, { credentials: 'include' });
      
      if (!response.ok) {
        navigate('/admin/login');
        return;
      }

      const data = await response.json();
      const tour = data.tours?.find((t: any) => t.id === parseInt(id!));
      
      if (tour) {
        setFormData({
          title: tour.title || '',
          description: tour.description || '',
          location: tour.location || '',
          duration_days: tour.duration_days || 1,
          price: tour.price || 0,
          max_guests: tour.max_guests || 10,
          image_url: tour.image_url || '',
          highlights: tour.highlights ? JSON.parse(tour.highlights).join(', ') : '',
          included: tour.included ? JSON.parse(tour.included).join(', ') : '',
          gallery_images: tour.gallery_images ? JSON.parse(tour.gallery_images) : [],
          gallery_videos: tour.gallery_videos ? JSON.parse(tour.gallery_videos) : [],
          is_featured: tour.is_featured || false,
          is_active: tour.is_active !== undefined ? tour.is_active : true,
        });
      } else {
        navigate('/admin/tours');
      }
    } catch (error) {
      console.error('Failed to fetch tour:', error);
      navigate('/admin/tours');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'image' | 'video', field?: 'main' | 'gallery') => {
    const uploadKey = `${type}_${field || 'gallery'}_${Date.now()}`;
    setUploading(prev => ({ ...prev, [uploadKey]: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        if (field === 'main' && type === 'image') {
          setFormData(prev => ({ ...prev, image_url: data.url }));
        } else if (field === 'gallery') {
          if (type === 'image') {
            setFormData(prev => ({ 
              ...prev, 
              gallery_images: [...prev.gallery_images, data.url] 
            }));
          } else {
            setFormData(prev => ({ 
              ...prev, 
              gallery_videos: [...prev.gallery_videos, data.url] 
            }));
          }
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed');
    } finally {
      setUploading(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const handleDeleteFile = async (url: string, type: 'main' | 'gallery_image' | 'gallery_video') => {
    try {
      // Extract filename from URL
      const filename = url.split('/api/files/')[1];
      
      if (filename) {
        await fetch(`/api/admin/files/${filename}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      }

      // Update local state
      if (type === 'main') {
        setFormData(prev => ({ ...prev, image_url: '' }));
      } else if (type === 'gallery_image') {
        setFormData(prev => ({ 
          ...prev, 
          gallery_images: prev.gallery_images.filter(img => img !== url) 
        }));
      } else if (type === 'gallery_video') {
        setFormData(prev => ({ 
          ...prev, 
          gallery_videos: prev.gallery_videos.filter(video => video !== url) 
        }));
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Convert comma-separated strings to arrays, filtering out empty strings
      const highlightsArray = formData.highlights
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      const includedArray = formData.included
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      const payload = {
        ...formData,
        highlights: highlightsArray,
        included: includedArray,
        gallery_images: formData.gallery_images,
        gallery_videos: formData.gallery_videos,
      };

      const url = isEditing ? `/api/admin/tours/${id}` : '/api/admin/tours';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        navigate('/admin/tours');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save tour');
      }
    } catch (error) {
      console.error('Save error:', error);
      setError('Failed to save tour. Please check your inputs.');
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

  const FileUploadButton = ({ 
    onUpload, 
    accept, 
    uploadKey, 
    children 
  }: { 
    onUpload: (file: File) => void;
    accept: string;
    uploadKey: string;
    children: React.ReactNode;
  }) => (
    <label className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
      <input
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
        }}
        className="hidden"
      />
      {uploading[uploadKey] ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
      ) : (
        children
      )}
    </label>
  );

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
        <button
          onClick={() => navigate('/admin/tours')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Tours
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Edit Tour' : 'Add New Tour'}
        </h1>
        <p className="text-gray-600">
          {isEditing ? 'Update tour details and settings' : 'Create a new tour package'}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tour Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tour title"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the tour experience..."
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Riyadh, Saudi Arabia"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Guests *
                </label>
                <input
                  type="number"
                  name="max_guests"
                  value={formData.max_guests}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Images & Media */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Images & Media</h2>
            <div className="space-y-8">
              {/* Main Tour Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Main Tour Image
                </label>
                
                {formData.image_url ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.image_url}
                      alt="Main tour image"
                      className="w-48 h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteFile(formData.image_url, 'main')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <FileUploadButton
                    onUpload={(file) => handleFileUpload(file, 'image', 'main')}
                    accept="image/*"
                    uploadKey="main_image"
                  >
                    <Upload size={20} />
                    <span>Upload Main Image</span>
                  </FileUploadButton>
                )}
                
                <div className="mt-3">
                  <label className="block text-xs text-gray-500 mb-1">Or enter image URL manually:</label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* Gallery Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Gallery Images
                </label>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {formData.gallery_images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(image, 'gallery_image')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  
                  <FileUploadButton
                    onUpload={(file) => handleFileUpload(file, 'image', 'gallery')}
                    accept="image/*"
                    uploadKey="gallery_image"
                  >
                    <Plus size={20} />
                    <span className="text-sm">Add Image</span>
                  </FileUploadButton>
                </div>
              </div>

              {/* Gallery Videos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Gallery Videos
                </label>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {formData.gallery_videos.map((video, index) => (
                    <div key={index} className="relative group">
                      <div className="w-full h-24 bg-gray-900 rounded-lg border flex items-center justify-center">
                        <Video size={24} className="text-white" />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(video, 'gallery_video')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  
                  <FileUploadButton
                    onUpload={(file) => handleFileUpload(file, 'video', 'gallery')}
                    accept="video/*"
                    uploadKey="gallery_video"
                  >
                    <Plus size={20} />
                    <span className="text-sm">Add Video</span>
                  </FileUploadButton>
                </div>
              </div>
            </div>
          </div>

          {/* Tour Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tour Details</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Highlights (comma-separated)
                </label>
                <textarea
                  name="highlights"
                  value={formData.highlights}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Visit historic Al-Masmak Fortress, Explore vibrant Souq Al-Zal, Experience traditional Saudi cuisine"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter tour highlights separated by commas. Each highlight will be displayed as a bullet point.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's Included (comma-separated)
                </label>
                <textarea
                  name="included"
                  value={formData.included}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Hotel accommodation, Daily breakfast, Professional guide, Transportation, Entrance fees"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter what's included in the tour package separated by commas.
                </p>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-3 text-sm font-medium text-gray-700">
                  Featured Tour
                </label>
                <span className="ml-2 text-xs text-gray-500">
                  (Featured tours appear first on the homepage)
                </span>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-3 text-sm font-medium text-gray-700">
                  Active
                </label>
                <span className="ml-2 text-xs text-gray-500">
                  (Only active tours are visible to customers)
                </span>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin/tours')}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Tour' : 'Create Tour'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
