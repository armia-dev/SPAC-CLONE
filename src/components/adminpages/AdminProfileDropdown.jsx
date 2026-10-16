import React, { useEffect, useRef } from 'react';
import { LogOut, Shield } from 'lucide-react';

export default function AdminProfileDropdown({
  isOpen,
  onClose,
  user = {
    name: 'Crystal Florano',
    phone: '+63 918 221 4402',
    role: 'Admin',
    avatar: '',
    initials: 'CF',
  },
  onLogout,
  onViewProfile,
  triggerRef,
}) {
  const dropdownRef = useRef(null);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (triggerRef?.current?.contains(event.target)) return;
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose?.();
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  const initials = user.initials || (user.name
    ? user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : 'SP');

  return (
    <div
      ref={dropdownRef}
      role="menu"
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      className="absolute right-0 top-full mt-2 w-60 bg-white border border-neutral-200 rounded-xl shadow-lg p-4 z-[60] animate-in fade-in zoom-in-95 duration-150 origin-top-right flex flex-col items-center text-center"
    >
      <div
        onClick={() => {
          onViewProfile?.();
          onClose?.();
        }}
        className="w-full flex flex-col items-center cursor-pointer group"
      >
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-900 border-2 border-[#ccff00] flex items-center justify-center relative mb-2.5 shadow-xs">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover relative z-10"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <span className="text-sm font-bold text-[#ccff00]">
              {initials}
            </span>
          )}
        </div>

        {/* Full Name */}
        <h3 className="text-sm font-bold text-neutral-900 leading-tight group-hover:text-neutral-700 transition-colors">
          {user.name}
        </h3>

        {/* Role Badge */}
        <div className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-200">
          <Shield className="w-2.5 h-2.5 text-neutral-600" />
          <span>{user.role || 'Staff'}</span>
        </div>

        {/* Contact info / Email */}
        <p className="text-xs text-neutral-500 font-normal mt-1 truncate max-w-full">
          {user.phone || user.email}
        </p>
      </div>

      {/* Line separator before logout */}
      <div className="w-full h-px bg-neutral-200/70 my-3" />

      {/* Logout button */}
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onClose?.();
          onLogout?.();
        }}
        className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-[#121212] hover:text-red-600 hover:bg-red-50/60 transition-colors cursor-pointer group"
      >
        <LogOut className="w-3.5 h-3.5 text-[#121212] group-hover:text-red-600 transition-colors stroke-[2]" />
        <span>Sign Out</span>
      </button>
    </div>
  );
}