import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';

const POSITION_OPTIONS = [
  'Manager',
  'Admin',
  'Staff',
  'Cashier',
  'Court Attendant',
];

// Status options matching AddStaffAccount.jsx and Accounts.jsx
const STATUS_OPTIONS = [
  { id: 'Active', label: 'Active', color: '#baff95', textColor: '#226307' },
  { id: 'Inactive', label: 'Inactive', color: '#ff9f92', textColor: '#be1a1a' },
];

/**
 * AccountsEditModal
 * Modal component for editing existing staff account details.
 * Replicates the exact design, typography, inputs, dropdowns, and buttons of AddStaffAccount.
 *
 * Props:
 * - fromView: true when opened from the View modal. The bottom-left button then
 *   reads "Back" and calls onBack to return to the View modal.
 * - onBack: called when "Back" is clicked.
 */
export default function AccountsEditModal({
  isOpen = false,
  onClose,
  account = null,
  onSaveAccount,
  onUpdateAccount,
  fromView = false,
  onBack,
}) {
  // Form State
  const [fullname, setFullname] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState('Active');
  const [contactNumber, setContactNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  // Dropdown Open State
  const [isPositionOpen, setIsPositionOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Validation Error State
  const [errorMessage, setErrorMessage] = useState('');

  // Refs for click outside
  const positionDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  // Sync form state when account prop changes or modal opens
  useEffect(() => {
    if (account && isOpen) {
      setFullname(account.name || '');
      setPosition(account.role || '');
      setStatus(account.status || 'Active');
      setContactNumber(account.contact || '');
      setEmailAddress(account.email || '');
      setErrorMessage('');
    }
  }, [account, isOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        positionDropdownRef.current &&
        !positionDropdownRef.current.contains(event.target)
      ) {
        setIsPositionOpen(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setIsStatusOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && isOpen) {
        onClose?.();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentStatusOption =
    STATUS_OPTIONS.find((s) => s.id === status) || STATUS_OPTIONS[0];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!fullname.trim()) {
      setErrorMessage("Please enter the staff member's full name.");
      return;
    }

    if (!position) {
      setErrorMessage('Please select a position/role.');
      return;
    }

    if (!status) {
      setErrorMessage('Please select a status.');
      return;
    }

    const updatedAccountData = {
      ...(account || {}),
      name: fullname.trim(),
      role: position,
      status: status,
      contact: contactNumber.trim() || account?.contact || '+63 900 000 0000',
      email:
        emailAddress.trim() ||
        account?.email ||
        `${fullname.toLowerCase().replace(/\s+/g, '.')}@saranay.ph`,
    };

    if (onSaveAccount) {
      onSaveAccount(updatedAccountData);
    } else if (onUpdateAccount) {
      onUpdateAccount(updatedAccountData);
    }

    setErrorMessage('');
    onClose?.();
  };

  const handleClose = () => {
    setErrorMessage('');
    onClose?.();
  };

  // Bottom-left button: "Back" (returns to View modal) when opened from there, otherwise "Close"
  const handleBottomLeftClick = () => {
    setErrorMessage('');
    if (fromView && onBack) {
      onBack(account);
    } else {
      onClose?.();
    }
  };

  return (
    <div
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-[2px] select-none"
    >
      {/* Modal Container */}
      <div className="w-full max-w-[500px] sm:max-w-[520px] bg-[#ffffff] border border-[#dedbc4] rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col relative transition-all duration-150">

        {/* Header: “Edit Staff Account” (text color: #121212) */}
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-base sm:text-lg font-bold text-[#121212] tracking-tight">
            Edit Staff Account
          </h2>
          {/* X button (color: #6b7280) */}
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-full text-[#6b7280] hover:text-[#121212] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Horizontal separator after the header line color: #dedbc4 */}
        <div className="w-full h-px bg-[#dedbc4] my-2.5" />

        {/* Validation error if any */}
        {errorMessage && (
          <div className="mb-2.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[11px] font-medium">
            {errorMessage}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* FULLNAME (text field) */}
          <div>
            <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#4a4a42] mb-1">
              FULLNAME
            </label>
            <input
              type="text"
              value={fullname}
              onChange={(e) => {
                setFullname(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="e.g. Alyssa Cruz"
              className="w-full h-8 sm:h-9 px-3 bg-[#ffffff] border border-[#dedbc4] rounded-lg text-xs font-medium text-[#121212] placeholder-[#6b7280] focus:outline-none focus:border-[#121212] transition-colors"
            />
          </div>

          {/* POSITION (Dropdown) & STATUS (Dropdown) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* POSITION Dropdown */}
            <div className="relative" ref={positionDropdownRef}>
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#4a4a42] mb-1">
                POSITION
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsPositionOpen((prev) => !prev);
                  setIsStatusOpen(false);
                }}
                className="w-full h-8 sm:h-9 px-3 bg-[#ffffff] border border-[#dedbc4] rounded-lg text-xs font-medium transition-colors flex items-center justify-between text-left focus:outline-none focus:border-[#121212] cursor-pointer"
              >
                <span className={position ? 'text-[#121212] font-semibold truncate' : 'text-[#6b7280] truncate'}>
                  {position || 'Select position'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#6b7280] shrink-0 ml-1.5 transition-transform duration-150 ${
                    isPositionOpen ? 'rotate-180 text-[#121212]' : ''
                  }`}
                />
              </button>

              {/* Position Menu Options */}
              {isPositionOpen && (
                <div className="absolute top-full mt-1 left-0 z-50 w-full bg-[#ffffff] border border-[#dedbc4] rounded-xl py-1 shadow-xl max-h-48 overflow-y-auto animate-in fade-in duration-100">
                  {POSITION_OPTIONS.map((pos) => {
                    const isSelected = position === pos;
                    return (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => {
                          setPosition(pos);
                          setIsPositionOpen(false);
                          if (errorMessage) setErrorMessage('');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-neutral-100 font-bold text-[#121212]'
                            : 'text-[#121212] hover:bg-neutral-50'
                        }`}
                      >
                        <span>{pos}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#121212] stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* STATUS Dropdown - Using same design from AddStaffAccount */}
            <div className="relative" ref={statusDropdownRef}>
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#4a4a42] mb-1">
                STATUS
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsStatusOpen((prev) => !prev);
                  setIsPositionOpen(false);
                }}
                className="w-full h-8 sm:h-9 px-3 bg-[#ffffff] border border-[#dedbc4] rounded-lg text-xs font-medium transition-colors flex items-center justify-between text-left focus:outline-none focus:border-[#121212] cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  {currentStatusOption && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: currentStatusOption.color,
                        border: `1px solid ${currentStatusOption.textColor}`,
                      }}
                    />
                  )}
                  <span className={status ? 'text-[#121212] font-semibold truncate' : 'text-[#6b7280] truncate'}>
                    {currentStatusOption ? currentStatusOption.label : 'Select status'}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#6b7280] shrink-0 ml-1.5 transition-transform duration-150 ${
                    isStatusOpen ? 'rotate-180 text-[#121212]' : ''
                  }`}
                />
              </button>

              {/* Status Popover Dropdown matching AddStaffAccount */}
              {isStatusOpen && (
                <div className="absolute top-full mt-1 left-0 z-50 w-full bg-[#ffffff] border border-[#dedbc4] rounded-xl p-1 shadow-xl select-none animate-in fade-in duration-100">
                  {STATUS_OPTIONS.map((opt) => {
                    const isSelected = status === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setStatus(opt.id);
                          setIsStatusOpen(false);
                          if (errorMessage) setErrorMessage('');
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                          isSelected
                            ? 'bg-neutral-100 text-[#121212] font-bold'
                            : 'text-[#121212] hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{
                              backgroundColor: opt.color,
                              border: `1px solid ${opt.textColor}`,
                            }}
                          />
                          <span>{opt.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#121212] stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* CONTACT NUMBER & EMAIL ADDRESS (side by side) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* CONTACT NUMBER (text field) */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#4a4a42] mb-1">
                CONTACT NUMBER
              </label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="e.g. +63 917 842 1923"
                className="w-full h-8 sm:h-9 px-3 bg-[#ffffff] border border-[#dedbc4] rounded-lg text-xs font-medium text-[#121212] placeholder-[#6b7280] focus:outline-none focus:border-[#121212] transition-colors"
              />
            </div>

            {/* EMAIL ADDRESS (text field) */}
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#4a4a42] mb-1">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="e.g. alyssa.cruz@saranay.ph"
                className="w-full h-8 sm:h-9 px-3 bg-[#ffffff] border border-[#dedbc4] rounded-lg text-xs font-medium text-[#121212] placeholder-[#6b7280] focus:outline-none focus:border-[#121212] transition-colors"
              />
            </div>
          </div>

          {/* Horizontal separator before the button line color: #dedbc4 */}
          <div className="w-full h-px bg-[#dedbc4] !mt-3.5 !mb-3" />

          {/* Action Buttons: left (Close or Back), right (Save Changes) circular/full rounded matching AddStaffAccount */}
          <div className="w-full flex items-center justify-between pt-0.5">
            {/* Left button: "Back" when opened from the View modal, otherwise "Close" */}
            <button
              type="button"
              onClick={handleBottomLeftClick}
              className="px-6 sm:px-7 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm bg-[#d1d5db] text-[#121212] hover:bg-[#c4c8ce] active:scale-[0.98] transition-all cursor-pointer"
            >
              {fromView ? 'Back' : 'Close'}
            </button>

            {/* Button for “Save Changes” (right, bg: #ccff00, text: #121212, rounded-full) */}
            <button
              type="submit"
              className="px-6 sm:px-7 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm bg-[#ccff00] text-[#121212] hover:bg-[#b8e600] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}