import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Calendar, Bell, Settings, Menu, X, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import Dashboard from './Dashboard';
import Bookings from './Bookings';
import CalendarPage from './Calendar';
import Reports from './Reports';
import Accounts from './Accounts';
import Logs from './Logs';
import SettingsPage from './SettingsPage';
import AddBookingModal from './AddBookingModal';
import AdminProfileDropdown from './AdminProfileDropdown';
import Profile from './Profile';
import LogoutConfirmation from './LogoutConfirmation';

const ALL_TABS = [
  { id: 'DASHBOARD', label: 'DASHBOARD' },
  { id: 'BOOKINGS', label: 'BOOKINGS' },
  { id: 'REPORTS', label: 'REPORTS' },
  { id: 'ACCOUNTS', label: 'ACCOUNTS' },
  { id: 'LOGS', label: 'LOGS' },
];

const PAGES = {
  DASHBOARD: Dashboard,
  BOOKINGS: Bookings,
  CALENDAR: CalendarPage,
  REPORTS: Reports,
  ACCOUNTS: Accounts,
  LOGS: Logs,
  SETTINGS: SettingsPage,
  PROFILE: Profile,
};

export default function AdminMainForm() {
  const { user, profile, role, signOut } = useAuth();
  const userRole = role || 'Staff';

  // Filter primary navigation tabs by role
  const permittedTabs = useMemo(() => {
    if (['Owner', 'Admin', 'Manager'].includes(userRole)) {
      return ALL_TABS;
    }
    if (userRole === 'Staff') {
      return ALL_TABS.filter((t) => ['BOOKINGS', 'DASHBOARD'].includes(t.id));
    }
    if (userRole === 'Cashier') {
      return ALL_TABS.filter((t) => ['BOOKINGS'].includes(t.id));
    }
    if (userRole === 'Court Attendant') {
      return ALL_TABS.filter((t) => ['DASHBOARD'].includes(t.id));
    }
    return ALL_TABS.filter((t) => ['BOOKINGS'].includes(t.id));
  }, [userRole]);

  // Determine initial active tab based on role
  const defaultTab = useMemo(() => {
    if (userRole === 'Court Attendant') return 'CALENDAR';
    return permittedTabs[0]?.id || 'BOOKINGS';
  }, [permittedTabs, userRole]);

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const profileBtnRef = useRef(null);

  // Guard active tab: if user has an unauthorized tab selected, fall back to safe default
  useEffect(() => {
    const isPermittedTab = permittedTabs.some((t) => t.id === activeTab);
    const isUtilityPage =
      activeTab === 'CALENDAR' ||
      activeTab === 'PROFILE' ||
      (activeTab === 'SETTINGS' && ['Owner', 'Admin', 'Manager'].includes(userRole));

    if (!isPermittedTab && !isUtilityPage) {
      setActiveTab(defaultTab);
    }
  }, [permittedTabs, activeTab, userRole, defaultTab]);

  const ActivePage = PAGES[activeTab];

  // Specific role permissions for header actions
  const canAddBooking = ['Owner', 'Admin', 'Manager', 'Staff', 'Cashier'].includes(userRole);
  const canAccessSettings = ['Owner', 'Admin', 'Manager'].includes(userRole);

  const handleBookingAdded = (booking) => {
    console.log('New booking:', booking);
  };

  const handleLogout = async () => {
    setIsLogoutConfirmOpen(false);
    await signOut();
  };

  const currentUserData = {
    name: profile?.full_name || user?.email || 'Staff Member',
    email: user?.email || '',
    phone: profile?.contact_number || profile?.staff_id || '',
    role: userRole,
    avatar: profile?.avatar_url || '',
  };

  return (
    <div
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      className="min-h-screen flex flex-col bg-[#f3f5e0] text-neutral-900 antialiased selection:bg-[#ccff00] selection:text-black"
    >
      {/* Header */}
      <header className="bg-[#121212] text-white sticky top-0 z-50 h-[105px] flex flex-col justify-between shrink-0 shadow-sm">
        {/* Top bar */}
        <div className="h-[64px] w-full flex items-center">
          <div className="max-w-[1520px] w-full mx-auto px-5 sm:px-10 flex items-center justify-between">
            {/* Logo */}
            <div
              onClick={() => setActiveTab(userRole === 'Court Attendant' ? 'CALENDAR' : 'DASHBOARD')}
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

            {/* Utility buttons and profile */}
            <div className="flex items-center gap-3 sm:gap-5">
              {canAddBooking && (
                <button
                  type="button"
                  onClick={() => setIsAddBookingOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full font-bold text-xs sm:text-sm bg-[#ccff00] text-[#121212] hover:bg-[#b8e600] active:scale-[0.98] transition-all cursor-pointer shadow-xs shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Booking</span>
                </button>
              )}

              <div className="h-6 w-[1px] bg-[#d1d5db]/50 shrink-0" />

              {/* Calendar */}
              <button
                type="button"
                title="Calendar"
                aria-label="Open calendar"
                onClick={() => setActiveTab('CALENDAR')}
                className={`transition-colors p-1 cursor-pointer ${
                  activeTab === 'CALENDAR' ? 'text-[#ccff00]' : 'text-white hover:text-[#ccff00]'
                }`}
              >
                <Calendar className="w-5 h-5 stroke-[1.8]" />
              </button>

              <button
                type="button"
                title="Notifications"
                className="text-white hover:text-[#ccff00] transition-colors p-1 cursor-pointer"
              >
                <Bell className="w-5 h-5 stroke-[1.8]" />
              </button>

              {/* Settings (Admin/Manager only) */}
              {canAccessSettings && (
                <button
                  type="button"
                  title="Settings"
                  className={`transition-colors p-1 cursor-pointer ${
                    activeTab === 'SETTINGS' ? 'text-[#ccff00]' : 'text-white hover:text-[#ccff00]'
                  }`}
                  onClick={() => setActiveTab('SETTINGS')}
                >
                  <Settings className="w-5 h-5 stroke-[1.8]" />
                </button>
              )}

              {/* Profile avatar and dropdown */}
              <div className="relative ml-1">
                <button
                  ref={profileBtnRef}
                  type="button"
                  title="Profile"
                  aria-haspopup="menu"
                  aria-expanded={isProfileOpen}
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="block w-8 h-8 rounded-full bg-neutral-700 ring-2 ring-[#ccff00] overflow-hidden cursor-pointer hover:ring-[#b8e600] transition-shadow text-[11px] font-bold text-[#ccff00] flex items-center justify-center"
                >
                  {currentUserData.avatar ? (
                    <img
                      src={currentUserData.avatar}
                      alt={currentUserData.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span>
                      {currentUserData.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                    </span>
                  )}
                </button>

                <AdminProfileDropdown
                  isOpen={isProfileOpen}
                  onClose={() => setIsProfileOpen(false)}
                  onLogout={() => setIsLogoutConfirmOpen(true)}
                  onViewProfile={() => setActiveTab('PROFILE')}
                  triggerRef={profileBtnRef}
                  user={currentUserData}
                />
              </div>

              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white ml-2 p-1 cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        <div className="h-[1px] w-full bg-[#d1d5db]" />

        {/* Desktop tabs */}
        <div className="h-[40px] w-full flex items-center">
          <div className="max-w-[1520px] w-full mx-auto px-5 sm:px-10 h-full flex items-center">
            <nav className="hidden md:flex items-center gap-10 h-full overflow-x-auto">
              {permittedTabs.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`h-full flex items-center text-xs tracking-wider transition-colors uppercase whitespace-nowrap cursor-pointer relative ${
                      isActive
                        ? 'text-[#ccff00] font-bold'
                        : 'text-white font-normal hover:text-[#ccff00]/90'
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#ccff00]"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile navigation drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[105px] left-0 right-0 bg-[#121212] border-t border-neutral-800 px-6 py-4 space-y-2 shadow-xl z-50">
            {permittedTabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left py-2 px-3 rounded text-xs tracking-wider uppercase transition-colors ${
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

      {/* Main content */}
      <main className="flex-1 w-full max-w-[1520px] mx-auto px-5 sm:px-10 py-5 sm:py-6 flex flex-col">
        <div id={`tab-${activeTab.toLowerCase()}`} className="w-full flex-1">
          {ActivePage ? (
            <ActivePage onLogout={() => setIsLogoutConfirmOpen(true)} />
          ) : (
            <div className="py-24 text-center text-sm text-neutral-500">
              The {activeTab.toLowerCase()} page isn't accessible for your current role.
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full h-[62px] mt-auto border-t border-[#c4c9ac] bg-[#eef0da] flex items-center shrink-0">
        <div className="max-w-[1520px] w-full mx-auto px-5 sm:px-10 flex items-center justify-between h-full">
          <span className="text-xs text-[#444933] font-medium">
            Signed in as: <strong className="text-neutral-900">{currentUserData.name}</strong> ({userRole})
          </span>
          <p className="text-xs sm:text-sm font-semibold text-[#444933] tracking-tight">
            © 2026 Saranay Pickleball. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Add Booking modal */}
      {isAddBookingOpen && (
        <AddBookingModal
          onClose={() => setIsAddBookingOpen(false)}
          onBookingAdded={handleBookingAdded}
        />
      )}

      {/* Logout confirmation */}
      {isLogoutConfirmOpen && (
        <LogoutConfirmation
          onClose={() => setIsLogoutConfirmOpen(false)}
          onConfirm={handleLogout}
        />
      )}
    </div>
  );
}
