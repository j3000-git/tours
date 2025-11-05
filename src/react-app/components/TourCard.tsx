import { Clock, Users, MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { Tour } from '@/shared/types';

interface TourCardProps {
  tour: Tour;
}

export default function TourCard({ tour }: TourCardProps) {
  const navigate = useNavigate();

  const handleDetailsClick = () => {
    navigate(`/tour/${tour.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {tour.is_featured && (
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-4 py-2 text-sm font-semibold flex items-center">
          <Star size={16} className="mr-2" />
          Featured Tour
        </div>
      )}
      
      <div className="relative">
        <img
          src={tour.image_url || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'}
          alt={tour.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-blue-700 font-bold text-lg">{tour.price} SAR</span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center mb-2">
          <MapPin size={16} className="text-blue-600 mr-1" />
          <span className="text-sm text-gray-600">{tour.location}</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">{tour.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{tour.description}</p>
        
        <div className="flex items-center space-x-4 mb-6 text-sm text-gray-500">
          <div className="flex items-center">
            <Clock size={16} className="mr-1" />
            <span>{tour.duration_days} days</span>
          </div>
          <div className="flex items-center">
            <Users size={16} className="mr-1" />
            <span>Max {tour.max_guests} guests</span>
          </div>
        </div>
        
        <button
          onClick={handleDetailsClick}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-colors duration-200"
        >
          Details
        </button>
      </div>
    </div>
  );
}
