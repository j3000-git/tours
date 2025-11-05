import { X, Calendar, Users, Phone, Mail, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import type { Tour, BookingRequest } from '@/shared/types';

interface BookingModalProps {
  tour: Tour | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ tour, isOpen, onClose }: BookingModalProps) {
  const [formData, setFormData] = useState<Omit<BookingRequest, 'tour_id'>>({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    guest_count: 1,
    preferred_date: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  if (!isOpen || !tour) return null;

  const totalPrice = tour.price * formData.guest_count;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setWhatsappUrl(result.whatsapp_url);
        setShowSuccess(true);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'guest_count' ? parseInt(value) || 1 : value
    }));
  };

  const resetForm = () => {
    setFormData({
      guest_name: '',
      guest_email: '',
      guest_phone: '',
      guest_count: 1,
      preferred_date: '',
      message: ''
    });
    setShowSuccess(false);
    setWhatsappUrl('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Request Sent!</h3>
            <p className="text-gray-600 mb-6">
              Your booking request has been submitted. Click below to continue the conversation on WhatsApp.
            </p>
            <div className="space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Continue on WhatsApp
              </a>
              <button
                onClick={handleClose}
                className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Book Your Tour</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Tour Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{tour.title}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>📍 {tour.location}</p>
              <p>⏰ {tour.duration_days} days</p>
              <p>💰 {tour.price} SAR per person</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
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
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    name="guest_email"
                    value={formData.guest_email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="tel"
                    name="guest_phone"
                    value={formData.guest_phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+966 5X XXX XXXX"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Guests *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="number"
                    name="guest_count"
                    value={formData.guest_count}
                    onChange={handleInputChange}
                    min="1"
                    max={tour.max_guests}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="date"
                    name="preferred_date"
                    value={formData.preferred_date || ''}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests or Message
                </label>
                <textarea
                  name="message"
                  value={formData.message || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any special requirements or questions..."
                />
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Total Price:</span>
                <span className="text-2xl font-bold text-blue-700">{totalPrice} SAR</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Sending Request...' : 'Send Booking Request'}
            </button>

            <p className="text-sm text-gray-500 text-center">
              After submitting, you'll be redirected to WhatsApp to complete your booking with our team.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
