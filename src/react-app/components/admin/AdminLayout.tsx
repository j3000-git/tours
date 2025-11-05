import { useNavigate, useLocation } from 'react-router';
import { LayoutDashboard, Package, Users, LogOut } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/tours', icon: Package, label: 'Tours' },
    { path: '/admin/bookings', icon: Users, label: 'Bookings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-10">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <img 
              src="https://mocha-cdn.com/019a4457-539f-7576-85ec-ec24ca54a6ca/image.png_7192.png" 
              alt="SaudiScape Logo" 
              className="h-10 w-auto mr-3"
            />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                SaudiScape
              </h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
