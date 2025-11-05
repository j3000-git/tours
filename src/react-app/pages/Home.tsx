import { useEffect, useState } from 'react';
import { Phone, MessageCircle, Star, Check } from 'lucide-react';
import Header from '@/react-app/components/Header';
import TourCard from '@/react-app/components/TourCard';
import type { Tour } from '@/shared/types';

export default function Home() {
  const [tours, setTours] = useState<Tour[]>([]);
  
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await fetch('/api/tours');
        const data = await response.json();
        setTours(data.tours || []);
      } catch (error) {
        console.error('Failed to fetch tours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  

  const featuredTours = tours.filter(tour => tour.is_featured);
  const regularTours = tours.filter(tour => !tour.is_featured);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop"
          alt="Saudi Arabia landscape"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            SaudiScape
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Experience the beauty, culture, and heritage of Saudi Arabia with our premium domestic tours
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById('tours')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105"
            >
              Explore Tours
            </button>
            <a
              href="https://wa.me/966500000000"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-lg font-semibold hover:bg-white/20 transition-all duration-200 flex items-center justify-center"
            >
              <MessageCircle className="mr-2" size={20} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Featured Tours Section */}
      <section id="tours" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Tours</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our handpicked selection of the most extraordinary experiences Saudi Arabia has to offer
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* All Tours Section */}
      {regularTours.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">More Adventures</h2>
              <p className="text-xl text-gray-600">
                Explore additional tours and experiences across Saudi Arabia
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularTours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose Discover Saudi?</h2>
              <p className="text-lg text-gray-600 mb-8">
                We are passionate about showcasing the incredible diversity and beauty of Saudi Arabia. 
                From ancient heritage sites to modern marvels, from desert adventures to coastal escapes, 
                we create unforgettable experiences that connect you with the heart of the Kingdom.
              </p>
              
              <div className="space-y-4">
                {[
                  'Expert local guides with deep cultural knowledge',
                  'Carefully curated experiences and hidden gems',
                  'Small group sizes for personalized attention',
                  'Premium accommodations and transportation',
                  '24/7 support via WhatsApp',
                  'Flexible booking and customization options'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Check className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1539650116574-75c0c6d73dd5?w=800&h=600&fit=crop"
                alt="Saudi Arabia heritage"
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">500+</div>
                    <div className="text-sm text-gray-600">Happy Travelers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">4.9</div>
                    <div className="flex text-yellow-400 justify-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Adventure?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Contact us today to plan your perfect Saudi Arabian experience. 
            We're here to help you discover the magic of the Kingdom.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+966500000000"
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-white text-blue-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <Phone size={20} />
              <span>+966 50 000 0000</span>
            </a>
            <a
              href="https://wa.me/966500000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-blue-800 text-white rounded-lg font-semibold hover:bg-blue-900 transition-colors"
            >
              <MessageCircle size={20} />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
          
          <div className="mt-8 pt-8 border-t border-blue-500">
            <p className="text-blue-100">
              📧 info@discoversaudi.com | 📍 Riyadh, Saudi Arabia
            </p>
          </div>
        </div>
      </section>

      
    </div>
  );
}
