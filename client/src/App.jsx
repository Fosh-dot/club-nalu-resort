import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Blog from "./pages/Blog";
import Booking from "./pages/Booking";
import Reservation from "./pages/Reservation";
import ReservationPayment from "./pages/ReservationPayment";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminSettings from "./pages/admin/AdminSettings";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      {" "}
      <Routes>
        {/* Customer-facing website */}
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/reservation" element={<Reservation />} />
        <Route path="/reservation/payment" element={<ReservationPayment />} />
        ```
        {/* Admin pages */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route
          path="/admin/accommodations"
          element={<Navigate to="/admin" replace />}
        />
        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
