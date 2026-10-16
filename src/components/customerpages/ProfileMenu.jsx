import React, { useEffect, useRef, useState } from 'react';
import { LogOut } from 'lucide-react';

/**
 * Header avatar + dropdown (name, phone, Logout).
 *
 * Props:
 *  - user: { name, phone, avatarUrl? }   (avatarUrl optional; initials are shown without it)
 *  - onLogout: called when "Logout" is clicked
 *  - onOpenProfile: called when the profile section (avatar/name/phone) is clicked
 */
function Avatar({ user, size, ring = false }) {
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 bg-neutral-700 text-white font-semibold ${
        ring ? 'ring-2 ring-[#ccff00]' : ''
      }`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}

export default function ProfileMenu({ user, onLogout, onOpenProfile }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => e.key === 'Escape' && setOpen(false);

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        title="Profile"
        aria-label="Open profile menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`rounded-full cursor-pointer transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00] ${
          open ? 'ring-2 ring-[#ccff00]' : 'hover:ring-2 hover:ring-[#ccff00]/70'
        }`}
      >
        <Avatar user={user} size={32} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-3 z-[60] w-[min(280px,calc(100vw-2.5rem))] bg-white text-black px-5 pt-5 pb-4 shadow-[0_18px_50px_rgba(0,0,0,0.28)]"
        >
          {/* User info (opens Settings) */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onOpenProfile?.();
            }}
            className="w-full flex items-center gap-4 mb-4 -mx-2 px-2 py-1.5 text-left rounded cursor-pointer hover:bg-[#f3f5e0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]"
            style={{ width: 'calc(100% + 1rem)' }}
          >
            <Avatar user={user} size={44} ring />
            <div className="min-w-0">
              <p className="font-bold text-base leading-tight truncate">{user.name}</p>
              <p className="text-[15px] leading-tight mt-0.5 truncate">{user.phone}</p>
            </div>
          </button>

          <div className="h-px w-full bg-[#a3a37a]" />

          {/* Logout */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout?.();
            }}
            className="mt-3 w-full flex items-center gap-4 py-1.5 text-left text-base cursor-pointer rounded hover:text-[#5f7a00] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]"
          >
            <LogOut className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}