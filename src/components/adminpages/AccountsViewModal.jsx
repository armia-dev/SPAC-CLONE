import React, { useEffect, useState } from 'react';
import { Pencil, Check, Key } from 'lucide-react';

export default function AccountsViewModal({
  isOpen = false,
  onClose,
  account,
  onEdit,
  onSendResetPassword,
}) {
  const [resetSent, setResetSent] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset toast state when opened or account changes
  useEffect(() => {
    setResetSent(false);
  }, [account, isOpen]);

  if (!isOpen || !account) return null;

  // Extract initials from account name
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Activity logs formatted for the table
  const activityLogs = account.activities || [
    {
      ref: 'ACT-9421',
      action: 'Staff Portal Sign-in',
      date: 'Aug 23, 2026',
      time: '08:45 AM',
      status: 'Success',
    },
    {
      ref: 'ACT-9108',
      action: 'Updated Court #2 Schedule',
      date: 'Aug 22, 2026',
      time: '03:15 PM',
      status: 'Success',
    },
    {
      ref: 'ACT-8874',
      action: 'Processed Walk-in Booking',
      date: 'Aug 21, 2026',
      time: '11:20 AM',
      status: 'Success',
    },
  ];

  const handleSendReset = () => {
    setResetSent(true);
    onSendResetPassword?.(account);
    setTimeout(() => {
      setResetSent(false);
    }, 3500);
  };

  const handleEditClick = () => {
    onClose?.();
    onEdit?.(account);
  };

  return (
    <div
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-[2px] select-none animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      {/* Modal Container: wider (max-w-[740px]), no scroll function, spacious and cohesive */}
      <div className="w-full max-w-[720px] sm:max-w-[740px] bg-[#ffffff] border border-[#dedbc4] rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col relative transition-all duration-150">

        {/* Reset Password Notification Toast */}
        {resetSent && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-[#121212] text-white px-3.5 py-1.5 rounded-full shadow-lg border border-[#333] flex items-center gap-2 text-xs font-semibold animate-in fade-in zoom-in-95 duration-150">
            <Check className="w-3.5 h-3.5 text-[#ccff00]" />
            <span>Reset password link sent to {account.email || 'account email'}</span>
          </div>
        )}

        {/* ================= UPPER SECTION ================= */}
        {/* Upper Left & Upper Right heights match cleanly with no awkward gap */}
        <div className="flex items-center justify-between gap-4">

          {/* UPPER LEFT SIDE: Profile Pic + Name + Plain Text Role & Status */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Bigger circular profile picture */}
            <div className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-full border border-[#dedbc4] bg-[#fbfaf1] flex items-center justify-center text-xl sm:text-2xl font-bold text-[#121212] overflow-hidden shrink-0 shadow-2xs">
              {account.avatar ? (
                <img
                  src={account.avatar}
                  alt={account.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{getInitials(account.name)}</span>
              )}
            </div>

            {/* Name + Account ID + Role & Status beside picture */}
            <div className="flex flex-col justify-center min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-[#121212] tracking-tight leading-tight truncate">
                {account.name}
              </h2>
              <span className="text-xs text-[#6b7280] font-normal leading-tight mt-0.5">
                {account.id}
              </span>

              {/* Role (plain text) + Status (pill badge matching main table) */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs sm:text-[13px] font-semibold text-[#121212]">
                  {account.role || 'Staff'}
                </span>
                <span className="text-[#dedbc4] font-bold">•</span>
                {account.status === 'Active' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#baff95] text-[#226307]">
                    <span className="text-[8px] leading-none">•</span>
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ff9f92] text-[#be1a1a]">
                    <span className="text-[8px] leading-none">•</span>
                    <span>Inactive</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* UPPER RIGHT SIDE: Contact details with matching height (X removed for clean balance) */}
          <div className="flex flex-col justify-center items-end self-stretch shrink-0 pl-4 py-0.5">
            <div className="space-y-1 sm:space-y-1.5 text-right">
              <div className="flex items-center justify-end gap-2 text-xs sm:text-[13px]">
                <span className="text-[#6b7280] text-[11px] sm:text-xs font-normal">Contact Number:</span>
                <span className="text-[#121212] font-semibold">{account.contact || '—'}</span>
              </div>
              <div className="flex items-center justify-end gap-2 text-xs sm:text-[13px]">
                <span className="text-[#6b7280] text-[11px] sm:text-xs font-normal">Email Address:</span>
                <span className="text-[#121212] font-semibold truncate max-w-[200px] sm:max-w-[260px]">{account.email || '—'}</span>
              </div>
              <div className="flex items-center justify-end gap-2 text-xs sm:text-[13px]">
                <span className="text-[#6b7280] text-[11px] sm:text-xs font-normal">Date Added:</span>
                <span className="text-[#121212] font-semibold">{account.dateAdded || account.dateCreated || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Separator after Upper Section: #dedbc4 */}
        <div className="w-full h-px bg-[#dedbc4] my-3.5 sm:my-4" />

        {/* ================= ACCOUNT ACTIVITY TABLE ================= */}
        {/* Table styled like main table with clean horizontal borders */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4a4a42]">
              Account Activity
            </h3>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[540px]">
              <thead>
                <tr className="border-b border-[#dedbc4] bg-[#fbfaf1]">
                  <th className="py-2.5 px-3 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-[#5f5e5e]">
                    Ref #
                  </th>
                  <th className="py-2.5 px-3 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-[#5f5e5e]">
                    Action
                  </th>
                  <th className="py-2.5 px-3 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-[#5f5e5e]">
                    Date
                  </th>
                  <th className="py-2.5 px-3 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-[#5f5e5e]">
                    Time
                  </th>
                  <th className="py-2.5 px-3 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-[#5f5e5e] text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {activityLogs.map((log, index) => (
                  <tr
                    key={log.ref || index}
                    className="border-b border-[#dedbc4]/60 hover:bg-[#fbfaf1]/60 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-semibold text-[#121212] whitespace-nowrap">
                      {log.ref}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#121212]">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 text-[#121212] whitespace-nowrap">
                      {log.date}
                    </td>
                    <td className="py-2.5 px-3 text-[#6b7280] whitespace-nowrap">
                      {log.time}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {/* Plain text status inside Account Activity */}
                      <span
                        className={`font-semibold text-xs ${
                          log.status === 'Success' || log.status === 'Completed'
                            ? 'text-[#226307]'
                            : log.status === 'Pending'
                            ? 'text-amber-700'
                            : 'text-[#be1a1a]'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Horizontal Separator before Buttons: #dedbc4 */}
        <div className="w-full h-px bg-[#dedbc4] my-4 sm:my-[18px]" />

        {/* ================= BUTTONS ROW ================= */}
        {/* Buttons: left (Close), right (Send reset password link, Edit) */}
        <div className="w-full flex items-center justify-between gap-3">
          {/* Close button (Left, bg: #d1d5db, text: #121212, rounded-full) */}
          <button
            type="button"
            onClick={onClose}
            className="px-6 sm:px-7 py-2 rounded-full font-bold text-xs sm:text-sm bg-[#d1d5db] text-[#121212] hover:bg-[#c4c8ce] active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            Close
          </button>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Send reset password link */}
            <button
              type="button"
              onClick={handleSendReset}
              className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-full font-bold text-xs sm:text-sm bg-[#ffffff] border border-[#121212] text-[#121212] hover:bg-[#fbfaf1] active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
            >
              <Key className="w-3.5 h-3.5 stroke-[2]" />
              <span>Send reset password link</span>
            </button>

            {/* Edit button */}
            <button
              type="button"
              onClick={handleEditClick}
              className="inline-flex items-center justify-center gap-1.5 px-6 sm:px-7 py-2 rounded-full font-bold text-xs sm:text-sm bg-[#ccff00] text-[#121212] hover:bg-[#b8e600] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              <Pencil className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}