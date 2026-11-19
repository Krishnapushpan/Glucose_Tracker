import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, LayoutDashboard, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenLogin }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuContainerRef = useRef(null);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 12);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(event) {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  function handleLoginClick() {
    setIsMenuOpen(false);
    onOpenLogin();
  }

  function handleLogoutClick() {
    setIsMenuOpen(false);
    logout();
  }

  function handleDashboardClick() {
    setIsMenuOpen(false);
    navigate('/dashboard');
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#f1f6f3]/95 shadow-sm shadow-[#267464]/10 backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <nav
        aria-label="Primary"
        className={`mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 transition-all duration-200 sm:px-6 lg:px-8 ${
          isScrolled ? 'py-3.5' : 'py-5'
        }`}
      >
        {/* Brand */}
        <a
          href="#"
          className="group flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#48a992] focus-visible:ring-offset-2"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#48a992] text-white shadow-sm shadow-[#267464]/20 transition-transform duration-200 group-hover:scale-105">
            <Droplet
              className="h-5 w-5 fill-[#ec4d43] text-[#faf7f4]"
              aria-hidden="true"
            />
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-[#267464] sm:text-3xl">
            Sweetly
          </span>
        </a>

        {/* Top-right section: changes based on auth state */}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-[#267464] md:inline-block">
              {user.name}
            </span>

            <button
              type="button"
              onClick={handleDashboardClick}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#48a992]/40 bg-[#fafcf9] px-3.5 py-1.5 text-xs font-semibold text-[#267464] shadow-sm transition-all hover:bg-[#e3f1eb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#48a992]"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-[#48a992]" aria-hidden="true" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={handleLogoutClick}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#48a992]/30 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#267464] shadow-sm transition-all hover:bg-[#e3f1eb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#48a992]"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Logout</span>
            </button>

            {/* Profile menu icon */}
            <div className="relative" ref={menuContainerRef}>
              <button
                type="button"
                id="auth-menu-button"
                aria-label="Account menu"
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
                aria-controls="auth-dropdown-menu"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#267464] ${
                  isMenuOpen
                    ? 'border-[#faf7f4]/60 bg-[#1e6355] text-[#faf7f4] shadow-md'
                    : 'border-[#faf7f4]/50 bg-[#267464] text-[#faf7f4] shadow-sm shadow-[#1e6355]/20 hover:bg-[#1e6355]'
                }`}
              >
                <User className="h-4.5 w-4.5" aria-hidden="true" />
              </button>

              {isMenuOpen && (
                <div
                  id="auth-dropdown-menu"
                  role="menu"
                  aria-labelledby="auth-menu-button"
                  className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl border border-[#48a992]/25 bg-[#fafcf9] p-2 shadow-lg shadow-[#1e6355]/15 ring-1 ring-[#267464]/5"
                >
                  <div className="border-b border-[#48a992]/15 px-3 py-2">
                    <p className="truncate text-xs font-bold text-[#267464]">{user.name}</p>
                    <p className="truncate text-[11px] text-[#5b7670]">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleDashboardClick}
                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#2d4742] transition-colors hover:bg-[#e3f1eb] hover:text-[#1e6355]"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 text-[#48a992]" aria-hidden="true" />
                    <span>Go to Dashboard</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogoutClick}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#c9382f] transition-colors hover:bg-[#ec4d43]/10"
                  >
                    <LogOut className="h-3.5 w-3.5 text-[#ec4d43]" aria-hidden="true" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Profile icon button & dropdown when not logged in */
          <div className="relative" ref={menuContainerRef}>
            <button
              type="button"
              id="auth-menu-button"
              aria-label="Account menu"
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              aria-controls="auth-dropdown-menu"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#267464] focus-visible:ring-offset-2 ${
                isMenuOpen
                  ? 'border-[#faf7f4]/60 bg-[#1e6355] text-[#faf7f4] shadow-md'
                  : 'border-[#faf7f4]/50 bg-[#267464] text-[#faf7f4] shadow-sm shadow-[#1e6355]/20 hover:bg-[#1e6355] hover:shadow-md'
              }`}
            >
              <User className="h-5 w-5" aria-hidden="true" />
            </button>

            {isMenuOpen && (
              <div
                id="auth-dropdown-menu"
                role="menu"
                aria-labelledby="auth-menu-button"
                className="absolute right-0 mt-2 w-44 origin-top-right rounded-2xl border border-[#48a992]/25 bg-[#fafcf9] p-1.5 shadow-lg shadow-[#1e6355]/15 ring-1 ring-[#267464]/5"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLoginClick}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-[#2d4742] transition-colors hover:bg-[#e3f1eb] hover:text-[#1e6355] focus:bg-[#e3f1eb] focus:text-[#1e6355] focus:outline-none"
                >
                  <LogIn className="h-4 w-4 text-[#48a992]" aria-hidden="true" />
                  <span>Login</span>
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
