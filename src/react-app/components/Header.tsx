import { Menu, X, Phone, MessageCircle } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <img 
              src="https://mocha-cdn.com/019a4457-539f-7576-85ec-ec24ca54a6ca/image.png_7192.png" 
              alt="SaudiScape Logo" 
              className="h-10 w-auto mr-3"
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              SaudiScape
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-blue-600 transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('tours')} className="text-gray-700 hover:text-blue-600 transition-colors">
              Tours
            </button>
            <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-blue-600 transition-colors">
              About
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-blue-600 transition-colors">
              Contact
            </button>
          </nav>

          {/* Contact Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="tel:+966500000000"
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Phone size={16} />
              <span>Call</span>
            </a>
            <a
              href="https://wa.me/966500000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MessageCircle size={16} />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              <button onClick={() => scrollToSection('home')} className="block px-3 py-2 text-gray-700 hover:text-blue-600 w-full text-left">
                Home
              </button>
              <button onClick={() => scrollToSection('tours')} className="block px-3 py-2 text-gray-700 hover:text-blue-600 w-full text-left">
                Tours
              </button>
              <button onClick={() => scrollToSection('about')} className="block px-3 py-2 text-gray-700 hover:text-blue-600 w-full text-left">
                About
              </button>
              <button onClick={() => scrollToSection('contact')} className="block px-3 py-2 text-gray-700 hover:text-blue-600 w-full text-left">
                Contact
              </button>
              <div className="flex space-x-4 px-3 py-2">
                <a
                  href="tel:+966500000000"
                  className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Phone size={16} />
                  <span>Call</span>
                </a>
                <a
                  href="https://wa.me/966500000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
