import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Pencil, Bell } from 'lucide-react';
import SMSVerification from './SMSVerification';
import EmailVerification from './EmailVerification';
import ResetPassword from './ResetPassword';

/* ------------------------------------------------------------------ */
/* Hardcoded sample data (replace with API data later)                 */
/* ------------------------------------------------------------------ */
const INITIAL_PROFILE = {
  name: 'Crystal Florano',
  phone: '9247878758', // 10 digits after +63
  email: 'florano.crystal@gmail.com',
};

const INPUT_BASE =
  'w-full h-12 rounded-xl border border-neutral-300 bg-white px-4 text-xs sm:text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-[#ccff00] focus:border-black';
const LABEL = 'block mb-1.5 text-xs font-bold text-neutral-800';
const LIME_BTN =
  'h-11 sm:h-12 px-6 sm:px-7 rounded-xl bg-[#ccff00] hover:bg-[#b8e600] text-xs sm:text-sm font-extrabold text-black cursor-pointer transition shadow-2xs border border-black/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black';

const maskPhone = (tenDigits) => {
  const local = `0${tenDigits}`;
  return `${local.slice(0, 4)}${'*'.repeat(6)}${local.slice(-1)}`;
};
const maskEmail = (email) => {
  const [user, domain] = email.split('@');
  return `${user.slice(0, 2)}***@${domain}`;
};
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */
function Overlay({ onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs"
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      {children}
    </div>,
    document.body
  );
}

function Card({ className = '', children }) {
  return (
    <section className={`rounded-3xl border border-neutral-200/90 bg-white p-6 sm:p-8 shadow-2xs text-left ${className}`}>
      {children}
    </section>
  );
}

function CardTitle({ icon, children }) {
  return (
    <h2 className="flex items-center gap-2.5 text-base sm:text-lg font-extrabold text-[#171717]">
      {icon}
      {children}
    </h2>
  );
}

function AccountIcon() {
  return (
    <div className="w-6 h-6 flex items-center justify-center text-neutral-900">
      <svg width="24" height="24" viewBox="0 0 38 38" aria-hidden="true">
        <circle cx="16" cy="11" r="7" fill="#111" />
        <path d="M3 33c0-7 5-12 13-12s13 5 13 12z" fill="#111" />
        <circle cx="29" cy="29" r="6" fill="#111" stroke="#fff" strokeWidth="2" />
        <path d="M26.8 31.2l4.4-4.4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function ShieldIcon() {
  return (
    <div className="w-6 h-6 flex items-center justify-center text-neutral-900">
      <svg width="22" height="24" viewBox="0 0 34 38" aria-hidden="true">
        <path d="M17 1l14 5v11c0 9-6 16-14 20C9 33 3 26 3 17V6z" fill="#111" />
        <path d="M10.5 18.5l5 5 8-9" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-black' : 'bg-neutral-300'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function VerifyStatus({ verified, disabled, onVerify, title }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600">
        <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" /> Verified
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onVerify}
      disabled={disabled}
      title={title}
      className="cursor-pointer text-xs sm:text-sm font-bold text-[#C5221F] hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
    >
      Verify
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function Settings() {
  // Account info
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [draft, setDraft] = useState(INITIAL_PROFILE);
  const [editing, setEditing] = useState(false);
  const [formError, setFormError] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // Photo: initialize with the cat in the cap from the design
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80'
  );
  const fileRef = useRef(null);

  // Notifications
  const [notif, setNotif] = useState({ sms: true, email: true, promos: true });

  // Security
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  // Popups + toast
  const [modal, setModal] = useState(null); // 'sms' | 'email' | 'reset' | null
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(t);
  }, [notice]);

  useEffect(() => () => {
    if (photoUrl && photoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(photoUrl);
    }
  }, [photoUrl]);

  const shown = editing ? draft : profile;
  const initials = profile.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  /* ----- account info handlers ----- */
  const startEdit = () => {
    setDraft(profile);
    setFormError('');
    setEditing(true);
  };
  const cancelEdit = () => {
    setEditing(false);
    setFormError('');
  };
  const saveChanges = () => {
    if (!editing) return;
    if (!draft.name.trim()) return setFormError('Please enter your full name.');
    if (draft.phone.length !== 10) return setFormError('Enter a 10-digit contact number.');
    if (!isEmail(draft.email)) return setFormError('Enter a valid email address.');

    if (draft.phone !== profile.phone) setPhoneVerified(false);
    if (draft.email !== profile.email) setEmailVerified(false);
    setProfile({ ...draft, name: draft.name.trim() });
    setEditing(false);
    setFormError('');
    setNotice('Changes saved.');
  };

  /* ----- photo handlers ----- */
  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUrl(URL.createObjectURL(file));
    e.target.value = '';
  };

  /* ----- security handlers ----- */
  const pwTooShort = newPw.length > 0 && newPw.length < 8;
  const pwMismatch = confirmPw.length > 0 && newPw !== confirmPw;
  const canUpdatePw = currentPw && newPw.length >= 8 && newPw === confirmPw;

  const updatePassword = () => {
    if (!canUpdatePw) return;
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setNotice('Password updated.');
  };

  const closeModal = () => setModal(null);

  return (
    <div
      className="w-full max-w-[1240px] mx-auto flex flex-col pb-16 text-neutral-900 antialiased selection:bg-[#ccff00] selection:text-black"
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
    >
      {/* 1. Header Title */}
      <div className="pt-2 sm:pt-4 pb-6 sm:pb-8 text-left">
        <h1 className="text-3xl sm:text-4xl md:text-[44px] font-extrabold text-[#121212] tracking-tight leading-none">
          Settings
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 font-normal mt-2 sm:mt-3 leading-snug">
          Update your personal info and notification preferences.
        </p>
      </div>

      {/* 2. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Photo Card + Notification Preferences */}
        <div className="lg:col-span-4 space-y-6 sm:space-y-8">
          {/* Photo */}
          <Card className="flex flex-col items-center justify-center text-center">
            <div className="h-36 w-36 sm:h-40 sm:w-40 overflow-hidden rounded-full bg-[#e7e5cf] border-4 border-neutral-100 shadow-inner mb-6 grid place-items-center text-4xl sm:text-5xl font-bold text-neutral-700">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full max-w-[210px] h-11 px-6 rounded-xl bg-[#ccff00] hover:bg-[#b8e600] text-xs sm:text-sm font-extrabold text-black cursor-pointer transition shadow-2xs border border-black/10 active:scale-95"
            >
              Upload New Photo
            </button>
            <button
              type="button"
              onClick={() => setPhotoUrl('')}
              disabled={!photoUrl}
              className="mt-3.5 cursor-pointer text-xs sm:text-sm font-semibold text-neutral-600 hover:text-black underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              Remove Photo
            </button>
          </Card>

          {/* Notification preferences */}
          <Card>
            <div className="mb-5 pb-1">
              <CardTitle icon={<Bell className="h-5 w-5 fill-black stroke-black" aria-hidden="true" />}>
                Notification Preferences
              </CardTitle>
            </div>

            <ul className="space-y-5">
              {[
                { key: 'sms', title: 'SMS Notifications', desc: 'Reminders & booking updates' },
                { key: 'email', title: 'Email Notifications', desc: 'Reminders & booking updates' },
                { key: 'promos', title: 'Promos & Announcements', desc: 'Learn to play schedules & promos' },
              ].map((item) => (
                <li key={item.key} className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="font-bold text-xs sm:text-sm text-neutral-900 leading-tight">{item.title}</p>
                    <p className="text-[11px] sm:text-xs text-neutral-500 font-normal">{item.desc}</p>
                  </div>
                  <Toggle
                    checked={notif[item.key]}
                    label={item.title}
                    onChange={(v) => setNotif({ ...notif, [item.key]: v })}
                  />
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Right Column: Account Information + Security */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          {/* Account information */}
          <Card>
            <div className="flex items-center justify-between mb-5 pb-1">
              <CardTitle icon={<AccountIcon />}>Account Information</CardTitle>
              <button
                type="button"
                onClick={editing ? cancelEdit : startEdit}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3.5 text-xs font-bold text-neutral-800 hover:border-black hover:text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ccff00]"
              >
                <Pencil className="h-3.5 w-3.5 stroke-[2]" aria-hidden="true" />
                <span>{editing ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className={LABEL}>Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    value={shown.name}
                    readOnly={!editing}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className={`${INPUT_BASE} ${editing ? 'text-black focus:ring-2 focus:ring-[#ccff00] focus:border-black' : 'text-neutral-500 disabled:bg-neutral-50/60'}`}
                  />
                </div>

                <div>
                  <label htmlFor="contactNumber" className={LABEL}>Contact Number</label>
                  <div
                    className={`flex h-12 items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 text-xs sm:text-sm font-medium transition-all ${
                      editing ? 'focus-within:ring-2 focus-within:ring-[#ccff00] focus-within:border-black' : ''
                    }`}
                  >
                    <span className={`font-semibold ${editing ? 'text-black' : 'text-neutral-600'}`}>+63</span>
                    <input
                      id="contactNumber"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={shown.phone}
                      readOnly={!editing}
                      onChange={(e) => setDraft({ ...draft, phone: e.target.value.replace(/\D/g, '') })}
                      className={`min-w-0 flex-1 bg-transparent outline-none ${editing ? 'text-black' : 'text-neutral-500'}`}
                    />
                    <VerifyStatus
                      verified={phoneVerified}
                      disabled={editing || profile.phone.length !== 10}
                      title={editing ? 'Save your changes first' : undefined}
                      onVerify={() => setModal('sms')}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="email" className={LABEL}>Email Address</label>
                <div
                  className={`flex h-12 items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 text-xs sm:text-sm font-medium transition-all ${
                    editing ? 'focus-within:ring-2 focus-within:ring-[#ccff00] focus-within:border-black' : ''
                  }`}
                >
                  <input
                    id="email"
                    type="email"
                    value={shown.email}
                    readOnly={!editing}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    className={`min-w-0 flex-1 bg-transparent outline-none ${editing ? 'text-black' : 'text-neutral-500'}`}
                  />
                  <VerifyStatus
                    verified={emailVerified}
                    disabled={editing || !isEmail(profile.email)}
                    title={editing ? 'Save your changes first' : undefined}
                    onVerify={() => setModal('email')}
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={saveChanges}
                  disabled={!editing}
                  className={LIME_BTN}
                >
                  Save Changes
                </button>
                {formError && (
                  <p role="alert" className="text-xs text-red-600 font-semibold">{formError}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Security */}
          <Card>
            <div className="mb-5 pb-1">
              <CardTitle icon={<ShieldIcon />}>Security</CardTitle>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="currentPw" className={LABEL}>Current Password</label>
                <input
                  id="currentPw"
                  type="password"
                  autoComplete="current-password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className={`${INPUT_BASE} text-black`}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="newPw" className={LABEL}>New Password</label>
                  <input
                    id="newPw"
                    type="password"
                    autoComplete="new-password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className={`${INPUT_BASE} text-black`}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPw" className={LABEL}>Confirm New Password</label>
                  <input
                    id="confirmPw"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className={`${INPUT_BASE} text-black`}
                  />
                </div>
              </div>

              {((pwTooShort) || (!pwTooShort && pwMismatch)) && (
                <p role="alert" className="text-xs font-semibold text-red-600">
                  {pwTooShort && 'Use at least 8 characters.'}
                  {!pwTooShort && pwMismatch && 'Passwords do not match.'}
                </p>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={updatePassword}
                  disabled={!canUpdatePw}
                  className={LIME_BTN}
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => setModal('reset')}
                  className="text-xs sm:text-sm font-semibold text-neutral-800 underline hover:text-black cursor-pointer"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Popups */}
      {modal && (
        <Overlay onClose={closeModal}>
          {modal === 'sms' && (
            <SMSVerification
              maskedPhone={maskPhone(profile.phone)}
              onClose={closeModal}
              onVerified={() => {
                setPhoneVerified(true);
                closeModal();
                setNotice('Contact number verified.');
              }}
              onResend={() => setNotice('A new code was sent to your phone.')}
            />
          )}
          {modal === 'email' && (
            <EmailVerification
              maskedEmail={maskEmail(profile.email)}
              onClose={closeModal}
              onVerified={() => {
                setEmailVerified(true);
                closeModal();
                setNotice('Email verified.');
              }}
              onResend={() => setNotice('A new code was sent to your email.')}
            />
          )}
          {modal === 'reset' && (
            <ResetPassword
              onClose={closeModal}
              onReset={() => {
                closeModal();
                setNotice('Password reset. Use it the next time you log in.');
              }}
            />
          )}
        </Overlay>
      )}

      {/* Toast */}
      {notice && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[1100] -translate-x-1/2 rounded-full bg-black px-6 py-3 text-sm font-bold text-[#ccff00] shadow-lg animate-fadeIn"
        >
          {notice}
        </div>
      )}
    </div>
  );
}
