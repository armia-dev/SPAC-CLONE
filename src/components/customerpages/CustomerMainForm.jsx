import React, { useState, useEffect } from 'react';
import { History, Bell, Menu, X, MapPin, Phone } from 'lucide-react';
import Home from './Home';
import Gallery from './Gallery';
import AboutUs from './AboutUs';
import FAQs from './FAQs';
import BookingHistory from './BookingHistory';
import ProfileMenu from './ProfileMenu';
import Settings from './Settings';
import GuestBookingHistory from './GuestBookingHistory'; // TEMP: preview only
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { id: 'HOME', label: 'HOME' },
  { id: 'RATES', label: 'RATES' },
  { id: 'GALLERY', label: 'GALLERY' },
  { id: 'ABOUT', label: 'ABOUT US' },
  { id: 'FAQS', label: 'FAQs' },
];

const USER = {
  name: 'Crystal Florano',
  phone: '+63920125498',
  avatarUrl: '', // put the profile photo URL here
};

const PAGES = {
  HOME: Home,
  GALLERY: Gallery,
  ABOUT: AboutUs,
  FAQS: FAQs,
  HISTORY: BookingHistory,
  SETTINGS: Settings,
  GUEST: () => <GuestBookingHistory backgroundImage="/bgpic.jpg" />, // TEMP: preview onl
};

const SECTION_TABS = { RATES: 'rates-section' };

// Footer quick links (labels as shown in the footer, mapped to tab ids)
const FOOTER_LINKS = [
  { id: 'HOME', label: 'Home' },
  { id: 'RATES', label: 'Rates' },
  { id: 'GALLERY', label: 'Gallery' },
  { id: 'ABOUT', label: 'About Us' },
  { id: 'FAQS', label: 'FAQs' },
];

// Legal links – replace the hrefs with your real pages when they exist
const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '#privacy-policy' },
  { label: 'Terms of Service', href: '#terms-of-service' },
  { label: 'Cancellation and Reschedule Policy', href: '#cancellation-policy' },
];

const handleLogout = () => {
  // TODO: clear the session/token, then send the user to the login page
  console.log('logout');
};


// Facebook icon: lime rounded square with an "f" (matches the mockup)
function FacebookSquareIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="4" />
      <path d="M16 22v-7.5h2.4l.4-2.9H16V9.7c0-.8.3-1.4 1.5-1.4h1.4V5.7c-.3 0-1.1-.1-2.1-.1-2.2 0-3.7 1.3-3.7 3.8v2.2H10.5v2.9h2.6V22" />
    </svg>
  );
}

export default function CustomerMainForm() {
  const [activeTab, setActiveTab] = useState('HOME');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [pendingSection, setPendingSection] = useState(null);
  const { user, profile, signOut } = useAuth();

  const currentUser = {
    name: profile?.full_name || user?.email?.split('@')[0] || USER.name,
    phone: profile?.contact_number || USER.phone,
    avatarUrl: profile?.avatar_url || '',
  };

  const ActivePage = PAGES[activeTab];

  const goToTab = (id) => {
    const sectionId = SECTION_TABS[id];
    if (sectionId) {
      setActiveTab('HOME');
      setPendingSection(sectionId);
      return;
    }
    setActiveTab(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll once Home has rendered (works whether you were on Home already or not)
  useEffect(() => {
    if (!pendingSection || activeTab !== 'HOME') return;

    const timer = setTimeout(() => {
      document.getElementById(pendingSection)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPendingSection(null);
    }, 150);

    return () => clearTimeout(timer);
  }, [pendingSection, activeTab]);

  return (
    <div
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      className="min-h-screen flex flex-col bg-[#f3f5e0] text-neutral-900 antialiased selection:bg-[#ccff00] selection:text-black"
    >
      {/* Load Be Vietnam Pro (you can also put this <link> in index.html instead) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&display=swap');
        button, input, select, textarea { font-family: inherit; }
      `}</style>

      {/* Header */}
      {!focusMode && (
      <header className="bg-[#121212] text-white sticky top-0 z-50 h-[105px] flex flex-col justify-between shrink-0 shadow-sm">
        {/* Top row: logo + icons */}
        <div className="h-[64px] w-full flex items-center">
          <div className="max-w-[1520px] w-full mx-auto px-5 sm:px-10 flex items-center justify-between">
            <div
              onClick={() => setActiveTab('HOME')}
              className="flex items-center cursor-pointer select-none py-0.5"
              title="Saranay Pickleball Court"
            >
              <img
                src="/saranay-logo.png"
                alt="Saranay Pickleball Court"
                className="h-[52px] sm:h-[58px] max-h-[60px] w-auto object-contain transition-transform hover:scale-105"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.endsWith('/saranay-logo.png')) {
                    target.src = '/SARANAY LOGO.png';
                  }
                }}
              />
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <button
                type="button"
                title="History"
                onClick={() => goToTab('HISTORY')}
                className={`transition-colors p-1 cursor-pointer hover:text-[#ccff00] ${
                  activeTab === 'HISTORY' ? 'text-[#ccff00]' : 'text-white'
                }`}
              >
                <History className="w-5 h-5 stroke-[1.8]" />
              </button>
              <button type="button" title="Notifications" className="text-white hover:text-[#ccff00] transition-colors p-1 cursor-pointer">
                <Bell className="w-5 h-5 stroke-[1.8]" />
              </button>

              {/* Settings opens from the profile section inside this menu */}
              <ProfileMenu
                user={currentUser}
                onLogout={signOut}
                onOpenProfile={() => goToTab('SETTINGS')}
              />

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white p-1 cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] w-full bg-[#d1d5db]" />

        {/* Tabs bar */}
        <div className="h-[40px] w-full flex items-center">
          <div className="max-w-[1520px] w-full mx-auto px-5 sm:px-10 h-full flex items-center">
            <nav className="hidden md:flex items-center gap-10 h-full overflow-x-auto">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => goToTab(tab.id)}
                    className={`h-full flex items-center text-sm tracking-wide transition-colors whitespace-nowrap cursor-pointer relative ${
                      isActive ? 'text-[#ccff00] font-bold' : 'text-white font-normal hover:text-[#ccff00]/90'
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#ccff00]" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[105px] left-0 right-0 bg-[#121212] border-t border-neutral-800 px-6 py-4 space-y-2 shadow-xl z-50">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    goToTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left py-2 px-3 rounded text-sm tracking-wide transition-colors ${
                    isActive
                      ? 'bg-neutral-900 text-[#ccff00] font-bold'
                      : 'text-white font-normal hover:bg-neutral-900 hover:text-[#ccff00]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </header>
      )}

      {/* Content panel: the active tab's page is rendered here */}
      <main className="flex-1 w-full max-w-[1520px] mx-auto px-5 sm:px-10 py-5 sm:py-6 flex flex-col">
        <div id={`tab-${activeTab.toLowerCase()}`} className="w-full flex-1">
          <ActivePage setFocusMode={setFocusMode} onNavigateToTab={goToTab} />
        </div>
      </main>

      {/* Footer */}
      {!focusMode && (
      <footer className="w-full mt-auto bg-[#121212] text-white shrink-0">
        {/* Main columns */}
        <div className="max-w-[1520px] mx-auto px-5 sm:px-10 pt-10 pb-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.9fr_1fr_1.5fr_0.95fr] lg:gap-x-6">
          {/* Brand + description */}
          <div>
            <div className="flex items-start gap-4">
              <img
                src="/saranay-logo.png"
                alt="Saranay Pickleball Court"
                className="h-[56px] w-auto object-contain shrink-0"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.endsWith('/saranay-logo.png')) {
                    target.src = '/SARANAY LOGO.png';
                  }
                }}
              />
              <h3 className="text-[#ccff00] font-bold uppercase leading-[1.25] text-s sm:text-s max-w-[280px]">
                Saranay Pickleball Court
              </h3>
            </div>
            <p className="mt-8 max-w-[360px] text-base leading-[1.6] font-normal text-white">
              Saranay Road, North Caloocan, home court for pickleball — book a court, join open play, or throw your next
              event with us.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-[#ccff00] font-bold uppercase text-s sm:text-s leading-tight">Quick Links</h3>
            <ul className="mt-6 space-y-[10px]">
              {FOOTER_LINKS.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => goToTab(link.id)}
                    className="text-base font-normal text-white hover:text-[#ccff00] transition-colors cursor-pointer text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Get in touch */}
          <div>
            <h3 className="text-[#ccff00] font-bold uppercase text-s sm:text-s leading-tight">Get in Touch</h3>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start gap-4">
                <MapPin className="w-7 h-7 shrink-0 text-[#ccff00] stroke-[1.4]" aria-hidden="true" />
                <span className="text-base leading-[1.5] text-white max-w-[700px]">
                  Saranay Homes, Block 5 Lot 13 Saranay Road, Bagumbong, North, Caloocan
                </span>
              </li>
              <li className="flex items-start gap-4">
                <Phone className="w-7 h-7 shrink-0 text-[#ccff00] stroke-[1.4]" aria-hidden="true" />
                <span className="text-base leading-[1.5] text-white">
                  <a href="tel:+639270458745" className="hover:text-[#ccff00] transition-colors">0927-045-8745</a>
                  <br />
                  <a href="tel:+639065458384" className="hover:text-[#ccff00] transition-colors">0906-545-8384</a>
                </span>
              </li>
              <li className="flex items-start gap-4">
                <FacebookSquareIcon className="w-7 h-7 shrink-0 text-[#ccff00]" />
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base leading-[1.5] text-white hover:text-[#ccff00] transition-colors"
                >
                  Saranay Pickleball and Cafe
                </a>
              </li>
            </ul>
          </div>

          {/* Operating hours */}
          <div>
            <h3 className="text-[#ccff00] font-bold uppercase text-s sm:text-s leading-tight">Operating Hours</h3>
            <p className="mt-6 text-base text-white">Daily: 6:00 AM - 2:00 AM</p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-1 sm:mx-1 h-px bg-neutral-300/80" />

        {/* Bottom bar */}
        <div className="max-w-[1520px] mx-auto px-5 sm:px-10 py-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm sm:text-base font-normal text-[#b4b4b4]">
            © 2026 Saranay Pickleball Court. All rights reserved.
          </p>
          <nav className="flex flex-wrap gap-x-10 gap-y-2" aria-label="Legal">
            {LEGAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm sm:text-base font-normal text-[#b4b4b4] hover:text-[#ccff00] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
      )}
            {/* TEMP: preview button, delete me */}
      <button
        type="button"
        onClick={() => goToTab('GUEST')}
        className="fixed bottom-5 right-5 z-[100] bg-[#ccff00] text-black font-bold text-sm px-4 py-2 rounded-full shadow-lg cursor-pointer hover:brightness-95"
      >
        Preview Guest Booking
      </button>
    </div>
  );
}
    