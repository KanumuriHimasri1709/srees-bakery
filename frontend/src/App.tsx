import React from "react";
import { Route, Switch } from "wouter";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";

// Public Pages
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import CustomCakes from "./pages/CustomCakes";
import Gallery from "./pages/Gallery";
import SpecialTreats from "./pages/SpecialTreats";
import Order from "./pages/Order";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Auth & Protected Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import UserBoard from "./pages/UserBoard";
import AdminDashboard from "./pages/AdminDashboard";

function Router() {
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/" component={Home} />
      <Route path="/menu" component={Menu} />
      <Route path="/custom-cakes" component={CustomCakes} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/special-treats" component={SpecialTreats} />
      <Route path="/order" component={Order} />
      <Route path="/contact" component={Contact} />

      {/* Authentication */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/admin/login" component={AdminLogin} />

      {/* Customer Portal */}
      <Route path="/user" component={UserBoard} />
      <Route path="/user/enquiries" component={UserBoard} />
      <Route path="/user/custom-cakes" component={UserBoard} />
      <Route path="/user/profile" component={UserBoard} />

      {/* Admin Portal */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/enquiries" component={AdminDashboard} />
      <Route path="/admin/menu" component={AdminDashboard} />
      <Route path="/admin/gallery" component={AdminDashboard} />
      <Route path="/admin/offers" component={AdminDashboard} />
      <Route path="/admin/customers" component={AdminDashboard} />
      <Route path="/admin/rag" component={AdminDashboard} />

      {/* 404 fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col justify-between bg-[#FDFBF7] text-[#2B1810]">
        <Navbar />
        <main className="flex-1">
          <Router />
        </main>
        <Footer />
        <Chatbot />
        <Toaster position="top-right" richColors />
      </div>
    </AuthProvider>
  );
}
