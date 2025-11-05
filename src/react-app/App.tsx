import { BrowserRouter as Router, Routes, Route } from "react-router";
import HomePage from "@/react-app/pages/Home";
import TourDetails from "@/react-app/pages/TourDetails";
import AdminLogin from "@/react-app/pages/admin/Login";
import AdminDashboard from "@/react-app/pages/admin/Dashboard";
import AdminTours from "@/react-app/pages/admin/Tours";
import AdminBookings from "@/react-app/pages/admin/Bookings";
import EditTour from "@/react-app/pages/admin/EditTour";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tour/:id" element={<TourDetails />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/tours" element={<AdminTours />} />
        <Route path="/admin/tours/edit/:id" element={<EditTour />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
      </Routes>
    </Router>
  );
}
