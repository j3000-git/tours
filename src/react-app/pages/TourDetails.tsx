import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Clock, Users, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import type { Tour, BookingRequest } from '@/shared/types';
import Gallery from '@/react-app/components/Gallery';

export default function TourDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [expandedInclusion, setExpandedInclusion] = useState<string | null>('flights');
  const [formData, setFormData] = useState<Omit<BookingRequest, 'tour_id'>>({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    guest_count: 1,
    preferred_date: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTour = async () => {
      if (!id) return;
      
      try {
        const response = await fetch(`/api/tours/${id}`);
        if (response.ok) {
          const data = await response.json();
          setTour(data.tour);
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Failed to fetch tour:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tour) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tour_id: tour.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        window.open(result.whatsapp_url, '_blank');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'guest_count' ? parseInt(value) || 1 : value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tour not found</h1>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  

  const totalPrice = tour.price * formData.guest_count;

  const sampleItinerary = [
    {
      day: 1,
      title: 'Arrival',
      description: `Arrive in ${tour.location} and head to the hotel.`,
      details: 'Check-in to your accommodation and enjoy a welcome dinner featuring local cuisine.'
    },
    {
      day: 2,
      title: 'Exploration Day',
      description: 'Discover the main attractions and cultural sites.',
      details: 'Full day guided tour of historical landmarks, traditional markets, and cultural centers.'
    },
    {
      day: 3,
      title: 'Adventure & Activities',
      description: 'Experience outdoor activities and local adventures.',
      details: 'Outdoor excursions, adventure activities, and visits to natural landmarks.'
    }
  ];

  if (tour.duration_days > 3) {
    sampleItinerary.push({
      day: tour.duration_days,
      title: 'Departure',
      description: 'Final day and departure.',
      details: 'Last-minute shopping, final sightseeing, and departure arrangements.'
    });
  }

  const packageInclusions = {
    flights: {
      title: 'Flights & transfers',
      items: [
        'Return flight on Saudi Airlines (Economy Class)',
        'Private return airport transfer - Intercity Transfer'
      ]
    },
    accommodation: {
      title: 'Accommodation',
      items: [
        `${tour.duration_days - 1} nights in premium hotels`,
        'Daily breakfast included',
        'Room with modern amenities'
      ]
    },
    tours: {
      title: 'Tours & activities',
      items: [
        'Professional local guide',
        'All entrance fees included',
        'Cultural experiences and activities'
      ]
    },
    others: {
      title: 'Others',
      items: [
        '24/7 customer support',
        'Travel insurance coverage',
        'Welcome package and local gifts'
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-black/70 to-black/50">
        <img
          src={tour.image_url || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=600&fit=crop'}
          alt={tour.title}
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-between py-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-white hover:text-gray-200 transition-colors w-fit"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Tours
          </button>
          
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{tour.title}</h1>
            <div className="flex items-center text-lg mb-6">
              <MapPin size={20} className="mr-2" />
              <span>{tour.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-gray-600">
            <button onClick={() => navigate('/')} className="hover:text-blue-600">Home</button>
            <span className="mx-2">›</span>
            <button onClick={() => navigate('/')} className="hover:text-blue-600">Packages</button>
            <span className="mx-2">›</span>
            <span className="text-gray-900">{tour.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tour Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-gray-700 leading-relaxed mb-6">{tour.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <Clock size={20} className="text-blue-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900">{tour.duration_days} Days</p>
                    <p className="text-sm text-gray-600">Duration</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users size={20} className="text-blue-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900">Max {tour.max_guests}</p>
                    <p className="text-sm text-gray-600">Guests</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin size={20} className="text-blue-600 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-900">{tour.location}</p>
                    <p className="text-sm text-gray-600">Destination</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Itinerary */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Sample Itinerary</h2>
              
              <div className="space-y-4">
                {sampleItinerary.map((item) => (
                  <div key={item.day} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setExpandedDay(expandedDay === item.day ? null : item.day)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold mr-4">
                          {item.day}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">DAY {item.day}</h3>
                          <p className="text-sm text-gray-600">{item.title}</p>
                        </div>
                      </div>
                      {expandedDay === item.day ? (
                        <ChevronUp className="text-gray-400" size={20} />
                      ) : (
                        <ChevronDown className="text-gray-400" size={20} />
                      )}
                    </button>
                    
                    {expandedDay === item.day && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-700 mb-2">{item.description}</p>
                        <p className="text-sm text-gray-600">{item.details}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery */}
            {tour.gallery_images && tour.gallery_videos && (
              <Gallery 
                images={JSON.parse(tour.gallery_images || '[]')} 
                videos={JSON.parse(tour.gallery_videos || '[]')} 
              />
            )}

            {/* Package Inclusions */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Package inclusions</h2>
              
              <div className="space-y-4">
                {Object.entries(packageInclusions).map(([key, inclusion]) => (
                  <div key={key} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setExpandedInclusion(expandedInclusion === key ? null : key)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                    >
                      <h3 className="font-semibold text-gray-900">{inclusion.title}</h3>
                      {expandedInclusion === key ? (
                        <ChevronUp className="text-gray-400" size={20} />
                      ) : (
                        <ChevronDown className="text-gray-400" size={20} />
                      )}
                    </button>
                    
                    {expandedInclusion === key && (
                      <div className="px-4 pb-4">
                        <ul className="space-y-2">
                          {inclusion.items.map((item, index) => (
                            <li key={index} className="text-gray-700 text-sm">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Terms & condition</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Cancellations can be requested by contacting Almosafer Customer's Support Team at +920000997.</li>
                <li>• Cancellations are typically accepted up to 7 days before departure, but it may depend on the package.</li>
                <li>• All flights are subject to the airline's conditions of carriage.</li>
              </ul>
            </div>
          </div>

          {/* Sidebar - Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Plan your package!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  For a truly unique experience, contact one of our travel advisors via WhatsApp or enter your details and we will contact you to help customize your package!
                </p>
                
                <a
                  href={`https://wa.me/966500000000?text=${encodeURIComponent(`Hi! I'm interested in the ${tour.title} tour.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center mb-4"
                >
                  <MessageCircle size={20} className="mr-2" />
                  Contact us via WhatsApp
                </a>
                
                <div className="text-center text-gray-500 text-sm mb-4">OR</div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <h4 className="font-semibold text-gray-900 mb-4">CONTACT DETAILS</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First name
                  </label>
                  <input
                    type="text"
                    name="guest_name"
                    value={formData.guest_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="guest_email"
                    value={formData.guest_email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile number
                  </label>
                  <div className="flex">
                    <select className="px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50">
                      <option>+966</option>
                    </select>
                    <input
                      type="tel"
                      name="guest_phone"
                      value={formData.guest_phone}
                      onChange={handleInputChange}
                      required
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of people
                  </label>
                  <select
                    name="guest_count"
                    value={formData.guest_count}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[...Array(tour.max_guests)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} Adult{i > 0 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Travel Date
                  </label>
                  <input
                    type="date"
                    name="preferred_date"
                    value={formData.preferred_date || ''}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <span className="text-lg font-bold text-blue-700">
                    Price From {totalPrice} SAR
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Sending...' : 'Request a call back'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
