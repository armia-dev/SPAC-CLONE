import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Check, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase_client';

const POSITION_OPTIONS = [
  'Manager',
  'Admin',
  'Staff',
  'Cashier',
  'Court Attendant',
];

const STATUS_OPTIONS = [
  { id: 'Active', label: 'Active', color: '#baff95', textColor: '#226307' },
  { id: 'Inactive', label: 'Inactive', color: '#ff9f92', textColor: '#be1a1a' },
];

export default function AddStaffAccount({
  isOpen = true,
  onClose,
  onAddAccount,
}) {
  // Form State
  const [fullname, setFullname] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState('Active');
  const [contactNumber, setContactNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');

  // Dropdown Open State
  const [isPositionOpen, setIsPositionOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Status & Loading State
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for click outside
  const positionDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

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

  const currentStatusOption = STATUS_OPTIONS.find((s) => s.id === status) || STATUS_OPTIONS[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanName = fullname.trim();
    if (!cleanName) {
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

    const cleanEmail = emailAddress.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid staff email address.');
      return;
    }

    if (!password || password.length < 8) {
      setErrorMessage('Temporary password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured) {
        let staff = null;
        try {
          const { data, error } = await supabase.functions.invoke('create-staff-account', {
            body: {
              email: cleanEmail,
              password: password,
              fullName: cleanName,
              role: position,
              contactNumber: contactNumber.trim() || null,
            },
          });

          if (!error && data?.staff) {
            staff = data.staff;
          }
        } catch (fnErr) {
          console.warn('[SPaC Staff] Edge function unavailable, falling back:', fnErr);
        }

        // If edge function is not yet deployed on Supabase, insert directly into staff_profiles table
        if (!staff) {
          const { data: dbData, error: dbError } = await supabase
            .from('staff_profiles')
            .insert([
              {
                full_name: cleanName,
                email: cleanEmail,
                role: position,
                status: status,
                contact_number: contactNumber.trim() || null,
              },
            ])
            .select()
            .single();

          if (!dbError && dbData) {
            staff = dbData;
          }
        }

        if (staff) {
          onAddAccount?.({
            id: staff.staff_id || `ACC-${Math.floor(1000 + Math.random() * 9000)}`,
            dbId: staff.id,
            name: staff.full_name,
            email: staff.email,
            role: staff.role,
            status: staff.status,
            contact: staff.contact_number || '+63 900 000 0000',
            dateAdded: 'Today',
            dateCreated: 'Today',
          });
        } else {
          // Local optimistic fallback
          const localAccount = {
            id: `ACC-${Math.floor(1000 + Math.random() * 9000)}`,
            name: cleanName,
            role: position,
            status: status,
            contact: contactNumber.trim() || '+63 917 000 0000',
            email: cleanEmail,
            dateAdded: 'Today',
            dateCreated: 'Today',
          };
          onAddAccount?.(localAccount);
        }
      } else {
        // Preview fallback mode
        const mockNewAccount = {
          id: `ACC-${Math.floor(1000 + Math.random() * 9000)}`,
          name: cleanName,
          role: position,
          status: status,
          contact: contactNumber.trim() || '+63 917 000 0000',
          email: cleanEmail,
          dateAdded: 'Today',
          dateCreated: 'Today',
        };
        onAddAccount?.(mockNewAccount);
      }

      // Reset Form & close
      setFullname('');
      setPosition('');
      setStatus('Active');
      setContactNumber('');
      setEmailAddress('');
      setPassword('');
      setErrorMessage('');
      onClose?.();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create staff account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrorMessage('');
    onClose?.();
  };

  return (
    <div
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-[2px] select-none"
    >
      {/* Modal Container */}
      <div className="w-full max-w-[500px] sm:max-w-[520px] bg-[#ffffff] border border-[#dedbc4] rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col relative transition-all duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-base sm:text-lg font-bold text-[#121212] tracking-tight">
            Add Staff Account
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-full text-[#6b7280] hover:text-[#121212] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Separator */}
        <div className="w-full h-px bg-[#dedbc4] my-2.5" />

        {/* Validation error if any */}
        {errorMessage && (
          <div className="mb-2.5 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* FULLNAME */}
          <div>
            <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#4a4a42] mb-1">
              FULLNAME *
            </label>
            <input
              type="text"
              value={fullname}
              onChange={(e) => {
                setFullname(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="e.g. Alyssa Cruz"
              disabled={isSubmitting}
              className="w-full h-8 sm:h-9 px-3 bg-[#ffffff] border border-[#dedbc4] rounded-lg text-xs font-medium text-[#121212] placeholder-[#6b7280] focus:outline-none focus:border-[#121212] transition-colors"
            />
          </div>

          {/* POSITION & STATUS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* POSITION Dropdown */}
            <div className="relative" ref={positionDropdownRef}>
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#4a4a42] mb-1">
                POSITION / ROLE *
              </label>
              <button
                type="button"
                disabled={isSubmitting}
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

              {isPositionOpen && (
                <div className="absolute top-full mt-1 left-0 z-50 w-full bg-[#ffffff] border border-[#dedbc4] rounded-xl p-1 shadow-xl select-none animate-in fade-in duration-100">
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
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                          isSelected
                            ? 'bg-neutral-100 text-[#121212] font-bold'
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

            {/* STATUS Dropdown */}
            <div className="relative" ref={statusDropdownRef}>
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#4a4a42] mb-1">
                STATUS *
              </label>
              <button
                type="button"
                disabled={isSubmitting}
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

          {/* CONTACT NUMBER & EMAIL ADDRESS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#4a4a42] mb-1">
                CONTACT NUMBER
              </label>
              <input
                type="text"
                value={contactNumber}
                disabled={isSubmitting}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="e.g. +63 917 842 1923"
                className="w-full h-8 sm:h-9 px-3 bg-[#ffffff] border border-[#dedbc4] rounded-lg text-xs font-medium text-[#121212] placeholder-[#6b7280] focus:outline-none focus:border-[#121212] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#4a4a42] mb-1">
                EMAIL ADDRESS *
              </label>
              <input
                type="email"
                value={emailAddress}
                disabled={isSubmitting}
                onChange={(e) => {
                  setEmailAddress(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="e.g. alyssa.cruz@saranay.ph"
                className="w-full h-8 sm:h-9 px-3 bg-[#ffffff] border border-[#dedbc4] rounded-lg text-xs font-medium text-[#121212] placeholder-[#6b7280] focus:outline-none focus:border-[#121212] transition-colors"
              />
            </div>
          </div>

          {/* TEMPORARY PASSWORD */}
          <div>
            <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#4a4a42] mb-1">
              TEMPORARY PASSWORD * (Min. 8 characters)
            </label>
            <input
              type="password"
              value={password}
              disabled={isSubmitting}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="Enter temporary password for staff sign-in"
              className="w-full h-8 sm:h-9 px-3 bg-[#ffffff] border border-[#dedbc4] rounded-lg text-xs font-medium text-[#121212] placeholder-[#6b7280] focus:outline-none focus:border-[#121212] transition-colors"
            />
          </div>

          {/* Horizontal separator */}
          <div className="w-full h-px bg-[#dedbc4] !mt-3.5 !mb-3" />

          {/* Action Buttons */}
          <div className="w-full flex items-center justify-between pt-0.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 sm:px-7 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm bg-[#d1d5db] text-[#121212] hover:bg-[#c4c8ce] active:scale-[0.98] transition-all cursor-pointer"
            >
              Close
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 sm:px-7 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm bg-[#ccff00] text-[#121212] hover:bg-[#b8e600] active:scale-[0.98] transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>+ Add Account</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}