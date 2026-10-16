import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LogOut, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase_client';

const ACTIVITY_LOGS = [
  {
    id: 'ACT-1',
    date: 'Aug 24, 2026',
    time: '03:30 AM',
    category: 'Settings',
    activity: 'Daytime court rate updated (₱200/hr → ₱250/hr)',
    performedBy: 'Rafael Rafael (Owner)',
  },
  {
    id: 'ACT-2',
    date: 'Aug 24, 2026',
    time: '03:00 AM',
    category: 'Settings',
    activity: 'Nighttime court rate updated (₱300/hr → ₱350/hr)',
    performedBy: 'Rafael Rafael (Owner)',
  },
  { id: 'ACT-3', date: 'Aug 25, 2026', time: '09:15 AM', category: 'Account', activity: 'Updated contact number', performedBy: 'Rafael Rafael (Owner)' },
  { id: 'ACT-4', date: 'Aug 25, 2026', time: '10:40 AM', category: 'Booking', activity: 'Cancelled reservation CR-1004', performedBy: 'Rafael Rafael (Owner)' },
  { id: 'ACT-5', date: 'Aug 25, 2026', time: '10:45 AM', category: 'Payment', activity: 'Approved refund for CR-1004', performedBy: 'Rafael Rafael (Owner)' },
  { id: 'ACT-6', date: 'Aug 26, 2026', time: '08:05 AM', category: 'Settings', activity: 'Updated operating schedule', performedBy: 'Rafael Rafael (Owner)' },
  { id: 'ACT-7', date: 'Aug 26, 2026', time: '01:20 PM', category: 'Account', activity: 'Added new staff account', performedBy: 'Rafael Rafael (Owner)' },
  { id: 'ACT-8', date: 'Aug 27, 2026', time: '11:00 AM', category: 'Booking', activity: 'Rescheduled reservation CR-1005', performedBy: 'Rafael Rafael (Owner)' },
  { id: 'ACT-9', date: 'Aug 27, 2026', time: '03:30 PM', category: 'Payment', activity: 'Confirmed payment for CR-1006', performedBy: 'Rafael Rafael (Owner)' },
  { id: 'ACT-10', date: 'Aug 28, 2026', time: '09:00 AM', category: 'Settings', activity: 'Enabled 2FA', performedBy: 'Rafael Rafael (Owner)' },
  { id: 'ACT-11', date: 'Aug 28, 2026', time: '02:10 PM', category: 'Account', activity: 'Changed account password', performedBy: 'Rafael Rafael (Owner)' },
  { id: 'ACT-12', date: 'Aug 29, 2026', time: '10:25 AM', category: 'Booking', activity: 'Created reservation CR-1008', performedBy: 'Rafael Rafael (Owner)' },
  { id: 'ACT-13', date: 'Aug 29, 2026', time: '04:50 PM', category: 'Settings', activity: 'Updated court pricing policy', performedBy: 'Rafael Rafael (Owner)' },
  { id: 'ACT-14', date: 'Aug 30, 2026', time: '08:45 AM', category: 'Payment', activity: 'Verified online Maya transfer', performedBy: 'Rafael Rafael (Owner)' },
  { id: 'ACT-15', date: 'Aug 31, 2026', time: '05:00 PM', category: 'Booking', activity: 'Completed reservation CR-1001', performedBy: 'Rafael Rafael (Owner)' },
];

const ACTIVITY_PER_PAGE = 7;

const PREFERENCES = [
  { id: 'sms', title: 'SMS Notifications', desc: 'Get notified via sms' },
  { id: 'email', title: 'Email Notifications', desc: 'Get notified via email' },
  {
    id: 'booking',
    title: 'Booking Updates',
    desc: 'Get notified about new, cancelled, or rescheduled bookings',
  },
  {
    id: 'payment',
    title: 'Payment Updates',
    desc: 'Get notified about payments received, failed payments, or refunds',
  },
  {
    id: '2fa',
    title: 'Enable 2FA',
    desc: 'Add an extra layer of security by requiring a verification code when signing in.',
  },
];

const BADGE_STYLES = {
  Booking: 'bg-[#fce7f3] text-[#ec4899]',
  Payment: 'bg-[#e0f2fe] text-[#0ea5e9]',
  Account: 'bg-[#f3e8ff] text-[#a855f7]',
  Settings: 'bg-[#f1f5f9] text-[#64748b]',
};

function CategoryBadge({ category }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold select-none whitespace-nowrap shadow-2xs ${
        BADGE_STYLES[category] || 'bg-neutral-200 text-neutral-800'
      }`}
    >
      <span className="text-[8px] leading-none">•</span>
      <span>{category}</span>
    </span>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full border border-[#121212] shrink-0 cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-[#121212] ${
        checked ? 'bg-[#ccff00]' : 'bg-[#ffffff]'
      }`}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#121212] transition-all ${
          checked ? 'left-[22px]' : 'left-[3px]'
        }`}
      />
    </button>
  );
}

function Field({ label, value, editing, onChange, type = 'text', className = '' }) {
  return (
    <div className={className}>
      <label className="block text-[10px] text-[#6b7280] font-normal mb-1">{label}</label>
      <input
        type={type}
        value={value}
        readOnly={!editing}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-1.5 h-[34px] sm:h-[36px] rounded-xl text-xs text-[#121212] transition-all focus:outline-none ${
          editing
            ? 'bg-[#ffffff] border border-[#121212] focus:ring-1 focus:ring-[#121212]'
            : 'bg-[#eef0e4] border border-transparent cursor-default'
        }`}
      />
    </div>
  );
}

export default function Profile({ onLogout }) {
  const fileInputRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const { user, profile: authProfile, role, signOut, updatePassword, refreshProfile } = useAuth();

  const [profile, setProfile] = useState({
    fullName: authProfile?.full_name || user?.email?.split('@')[0] || 'Staff Member',
    contact: authProfile?.contact_number || '+63 900 000 0000',
    email: authProfile?.email || user?.email || '',
    role: role || 'Staff',
    status: authProfile?.status || 'Active',
    staffId: authProfile?.staff_id || 'ACC-1001',
  });
  const [draft, setDraft] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (authProfile || user) {
      const updated = {
        fullName: authProfile?.full_name || user?.email?.split('@')[0] || 'Staff Member',
        contact: authProfile?.contact_number || '+63 900 000 0000',
        email: authProfile?.email || user?.email || '',
        role: role || 'Staff',
        status: authProfile?.status || 'Active',
        staffId: authProfile?.staff_id || 'ACC-1001',
      };
      setProfile(updated);
      setDraft(updated);
    }
  }, [authProfile, user, role]);

  // Account Activity pagination
  const [activityPage, setActivityPage] = useState(1);
  const activityTotalPages = Math.max(1, Math.ceil(ACTIVITY_LOGS.length / ACTIVITY_PER_PAGE));
  const activityStart = (activityPage - 1) * ACTIVITY_PER_PAGE;
  const paginatedActivity = ACTIVITY_LOGS.slice(activityStart, activityStart + ACTIVITY_PER_PAGE);

  const [prefs, setPrefs] = useState({
    sms: true,
    email: true,
    booking: true,
    payment: true,
    '2fa': true,
  });

  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');

  const initials = (profile.fullName || 'SP')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUrl(URL.createObjectURL(file));
  };

  const startEditing = () => {
    setDraft(profile);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const saveEditing = async () => {
    setProfile(draft);
    setIsEditing(false);

    if (isSupabaseConfigured && authProfile?.id) {
      try {
        await supabase
          .from('staff_profiles')
          .update({
            full_name: draft.fullName,
            contact_number: draft.contact,
          })
          .eq('id', authProfile.id);

        await refreshProfile?.();
      } catch (err) {
        console.error('[SPaC Profile] Failed to update profile in database:', err);
      }
    }
  };

  const closePasswordModal = () => {
    setIsPasswordOpen(false);
    setPasswords({ current: '', next: '', confirm: '' });
    setPasswordError('');
  };

  const submitPassword = async () => {
    if (!passwords.next || !passwords.confirm) {
      setPasswordError('Please fill in new password and confirmation.');
      return;
    }
    if (passwords.next.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    try {
      const res = await updatePassword(passwords.next);
      if (res.success) {
        closePasswordModal();
      } else {
        setPasswordError(res.error || 'Failed to update password.');
      }
    } catch (err) {
      setPasswordError(err.message || 'Error updating password.');
    }
  };

  const cardClass =
    'w-full bg-[#ffffff] border border-[#121212] rounded-2xl p-4 sm:p-5 shadow-xs';
  const sectionTitleClass =
    'text-sm font-bold tracking-tight text-[#121212] leading-tight';
  const thClass =
    'py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e]';

  return (
    <div
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      className="w-full flex flex-col space-y-3"
    >
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#121212] leading-tight">
          My Profile
        </h1>
        <p className="text-xs text-[#121212] font-normal mt-1 sm:mt-1.5 leading-relaxed">
          View and manage your account, system preferences, and security.
        </p>
      </div>

      {/* Profile Summary Card */}
      <div className={cardClass}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-full overflow-hidden bg-[#1e90ff] flex items-center justify-center shrink-0 border border-[#121212]">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-[#ffffff] select-none">{initials}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#121212] leading-tight">
                {profile.fullName}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-[#ccff00] text-[#121212] select-none whitespace-nowrap">
                  {profile.role || 'Staff'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-[#ccff00] text-[#121212] select-none whitespace-nowrap">
                  {profile.status || 'Active'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-[#121212] underline underline-offset-2 text-left cursor-pointer hover:font-semibold w-fit"
              >
                Change Profile Picture
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsPasswordOpen(true)}
              className="px-3.5 py-1.5 h-[34px] sm:h-[36px] bg-[#ffffff] border border-[#121212] rounded-xl text-xs font-semibold text-[#121212] hover:bg-neutral-100 transition-all cursor-pointer select-none shadow-2xs"
            >
              Change Password
            </button>
            <button
              type="button"
              onClick={onLogout || signOut}
              className="px-3.5 py-1.5 h-[34px] sm:h-[36px] bg-[#ffffff] border border-[#ef4444] rounded-xl text-xs font-semibold text-[#ef4444] hover:bg-red-50 transition-all cursor-pointer select-none flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[2]" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className={`${cardClass} space-y-3.5`}>
        <div className="flex items-center justify-between pb-2 border-b border-[#121212]">
          <h3 className={sectionTitleClass}>Account Information</h3>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelEditing}
                className="text-xs text-[#6b7280] hover:text-[#121212] font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditing}
                className="px-3 py-1 rounded-lg bg-[#121212] text-[#ccff00] text-xs font-bold cursor-pointer"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={startEditing}
              className="text-xs text-[#121212] font-medium hover:underline cursor-pointer"
            >
              Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <Field
            label="Full Name"
            value={isEditing ? draft.fullName : profile.fullName}
            editing={isEditing}
            onChange={(v) => setDraft((d) => ({ ...d, fullName: v }))}
          />
          <Field
            label="Contact Number"
            value={isEditing ? draft.contact : profile.contact}
            editing={isEditing}
            onChange={(v) => setDraft((d) => ({ ...d, contact: v }))}
          />
          <Field
            label="Email Address"
            type="email"
            value={isEditing ? draft.email : profile.email}
            editing={isEditing}
            onChange={(v) => setDraft((d) => ({ ...d, email: v }))}
            className="sm:max-w-[calc(50%-12px)]"
          />
        </div>
      </div>

      {/* Account Activity */}
      <div className={`${cardClass} space-y-3`}>
        <h3 className={sectionTitleClass}>Account Activity</h3>

        <div className="overflow-x-auto min-h-[340px]">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-[#121212]">
                <th className={thClass}>DATE</th>
                <th className={thClass}>TIME</th>
                <th className={`${thClass} text-center`}>CATEGORY</th>
                <th className={thClass}>ACTIVITY</th>
                <th className={thClass}>PERFORMED BY</th>
              </tr>
            </thead>
            <tbody>
              {paginatedActivity.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-[#c4c9ac] hover:bg-neutral-50/70 transition-colors"
                >
                  <td className="py-2 px-3 sm:px-4 text-xs font-normal text-[#121212] whitespace-nowrap">
                    {log.date}
                  </td>
                  <td className="py-2 px-3 sm:px-4 text-xs font-normal text-[#6b7280] whitespace-nowrap">
                    {log.time}
                  </td>
                  <td className="py-2 px-3 sm:px-4 text-center whitespace-nowrap">
                    <CategoryBadge category={log.category} />
                  </td>
                  <td className="py-2 px-3 sm:px-4 text-xs font-normal text-[#121212]">
                    {log.activity}
                  </td>
                  <td className="py-2 px-3 sm:px-4 text-xs font-medium text-[#121212] whitespace-nowrap">
                    {log.performedBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-[#5f5e5e]">
          <div>
            Showing{' '}
            <span className="font-bold text-[#121212]">{activityStart + 1}</span> to{' '}
            <span className="font-bold text-[#121212]">
              {Math.min(activityStart + ACTIVITY_PER_PAGE, ACTIVITY_LOGS.length)}
            </span>{' '}
            of <span className="font-bold text-[#121212]">{ACTIVITY_LOGS.length}</span> activity logs
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={activityPage <= 1}
              onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
              className={`p-1 rounded-md border border-[#121212] transition-colors ${
                activityPage <= 1
                  ? 'opacity-30 cursor-not-allowed text-neutral-400 border-neutral-300'
                  : 'hover:bg-neutral-100 text-[#121212] cursor-pointer'
              }`}
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[2]" />
            </button>

            {Array.from({ length: activityTotalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = activityPage === pageNum;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setActivityPage(pageNum)}
                  className={`min-w-[28px] h-7 px-1 rounded-md text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#121212] text-[#ccff00] font-bold shadow-2xs'
                      : 'border border-[#121212]/30 text-[#121212] hover:bg-neutral-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={activityPage >= activityTotalPages}
              onClick={() => setActivityPage((p) => Math.min(activityTotalPages, p + 1))}
              className={`p-1 rounded-md border border-[#121212] transition-colors ${
                activityPage >= activityTotalPages
                  ? 'opacity-30 cursor-not-allowed text-neutral-400 border-neutral-300'
                  : 'hover:bg-neutral-100 text-[#121212] cursor-pointer'
              }`}
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </div>
        </div>
      </div>

      {/* System Preferences */}
      <div className={`${cardClass} space-y-1`}>
        <h3 className={`${sectionTitleClass} pb-2 border-b border-[#121212]`}>
          System Preferences
        </h3>

        <div className="divide-y divide-[#c4c9ac]">
          {PREFERENCES.map((pref) => (
            <div key={pref.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-xs font-bold text-[#121212] leading-tight">{pref.title}</p>
                <p className="text-[10.5px] text-[#6b7280] font-normal mt-0.5 leading-relaxed">
                  {pref.desc}
                </p>
              </div>
              <Toggle
                checked={prefs[pref.id]}
                label={pref.title}
                onChange={() => setPrefs((p) => ({ ...p, [pref.id]: !p[pref.id] }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Change Password Modal */}
      {isPasswordOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closePasswordModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-password-title"
            className="w-full max-w-[600px] bg-[#ffffff] rounded-3xl p-6 sm:p-7 shadow-xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-[#121212] fill-[#121212] stroke-[#ffffff]" />
                <h3
                  id="change-password-title"
                  className="text-sm font-bold tracking-tight text-[#121212] leading-tight"
                >
                  Change your password
                </h3>
              </div>
              <button
                type="button"
                onClick={closePasswordModal}
                className="text-[#6b7280] hover:text-[#121212] transition-colors cursor-pointer -mt-1"
                aria-label="Close"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Fields */}
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-[#444933] mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                  autoComplete="current-password"
                  className="w-full h-10 px-3.5 bg-[#ffffff] border border-[#c4c9ac] rounded-xl text-xs text-[#121212] focus:outline-none focus:border-[#121212] focus:ring-1 focus:ring-[#121212] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-[#444933] mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwords.next}
                    onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                    autoComplete="new-password"
                    className="w-full h-10 px-3.5 bg-[#ffffff] border border-[#c4c9ac] rounded-xl text-xs text-[#121212] focus:outline-none focus:border-[#121212] focus:ring-1 focus:ring-[#121212] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#444933] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                    autoComplete="new-password"
                    className="w-full h-10 px-3.5 bg-[#ffffff] border border-[#c4c9ac] rounded-xl text-xs text-[#121212] focus:outline-none focus:border-[#121212] focus:ring-1 focus:ring-[#121212] transition-all"
                  />
                </div>
              </div>

              {passwordError && (
                <p className="text-[11px] text-[#ef4444] font-medium">{passwordError}</p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={closePasswordModal}
                className="px-5 py-2 rounded-full bg-[#d1d5db] text-xs font-bold text-[#121212] hover:bg-[#c3c7cd] active:scale-[0.98] transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={submitPassword}
                className="px-5 py-2 rounded-full bg-[#ccff00] text-xs font-bold text-[#121212] hover:bg-[#b8e600] active:scale-[0.98] transition-all cursor-pointer"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}