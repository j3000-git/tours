
CREATE TABLE tours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  price REAL NOT NULL,
  max_guests INTEGER NOT NULL,
  image_url TEXT,
  highlights TEXT, -- JSON array of highlights
  included TEXT, -- JSON array of what's included
  is_featured BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tour_id INTEGER NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  guest_count INTEGER NOT NULL,
  preferred_date DATE,
  message TEXT,
  status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled
  total_price REAL NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tours_location ON tours(location);
CREATE INDEX idx_tours_featured ON tours(is_featured);
CREATE INDEX idx_tours_active ON tours(is_active);
CREATE INDEX idx_bookings_tour_id ON bookings(tour_id);
CREATE INDEX idx_bookings_status ON bookings(status);
