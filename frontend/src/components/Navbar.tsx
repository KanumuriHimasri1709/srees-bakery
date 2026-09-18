import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { Sparkles, Menu as MenuIcon, X, User as UserIcon, Shield, LogOut } from "lucide-react";

export const Navbar: React.FC = () => {
  const [location] = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Menu", path: "/menu" },
    { label: "Custom Cakes", path: "/custom-cakes" },
    { label: "Gallery", path: "/gallery" },
    { label: "Special Treats", path: "/special-treats" },
    { label: "Order", path: "/order" },
    { label: "Contact", path: "/contact" },
  ];

  const handleOpenAi = () => {
    window.dispatchEvent(new CustomEvent("open-bakery-ai"));
  };

  return (
    <header className="site-nav">
      <div className={`site-nav-inner transition-all duration-300 ${isScrolled ? "shadow-md bg-stone-50/95" : ""}`}>
        {/* Brand */}
        <Link href="/" className="brand">
          <span className="brand-mark">S</span>
          <span className="brand-name">Sree's Home Bakery</span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`text-xs font-semibold tracking-wide uppercase transition-colors ${
                location === link.path ? "text-[#8B263E] font-bold" : "text-stone-700 hover:text-[#8B263E]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            onClick={handleOpenAi}
            className="btn btn-sm btn-secondary flex items-center gap-1.5 text-xs text-[#8B263E] border-[#F3D2CC] bg-[#FCECE9]/60 hover:bg-[#FCECE9]"
            title="Ask Sree's Bakery AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C58A32]" />
            Ask AI
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="btn btn-sm btn-primary flex items-center gap-1.5 text-xs"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin Dashboard
                </Link>
              ) : (
                <Link
                  href="/user"
                  className="btn btn-sm btn-primary flex items-center gap-1.5 text-xs"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  My Board
                </Link>
              )}

              <button
                onClick={logout}
                className="btn btn-sm btn-ghost p-1.5 text-stone-500 hover:text-rose-700"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="btn btn-sm btn-ghost text-xs font-semibold text-stone-700 hover:text-[#8B263E]"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="btn btn-sm btn-primary text-xs"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-full text-stone-700 hover:bg-stone-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-2 p-4 rounded-2xl bg-[#FDFBF7] border border-[#EADED3] shadow-xl backdrop-blur-md">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  location === link.path
                    ? "bg-[#FCECE9] text-[#8B263E] font-semibold"
                    : "text-stone-700 hover:bg-stone-100"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 mt-2 border-t border-stone-200 flex flex-col gap-2">
              <button
                onClick={() => {
                  handleOpenAi();
                  setIsMobileMenuOpen(false);
                }}
                className="btn btn-sm btn-secondary justify-start text-[#8B263E] border-[#F3D2CC] bg-[#FCECE9]"
              >
                <Sparkles className="w-4 h-4 text-[#C58A32]" />
                Ask Bakery AI
              </button>

              {isAuthenticated ? (
                <>
                  {isAdmin ? (
                    <Link href="/admin" className="btn btn-sm btn-primary justify-start">
                      <Shield className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                  ) : (
                    <Link href="/user" className="btn btn-sm btn-primary justify-start">
                      <UserIcon className="w-4 h-4" />
                      My Board
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="btn btn-sm btn-ghost justify-start text-rose-700 hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout ({user?.name})
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" className="btn btn-sm btn-secondary">
                    Login
                  </Link>
                  <Link href="/register" className="btn btn-sm btn-primary">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
export default Navbar;
