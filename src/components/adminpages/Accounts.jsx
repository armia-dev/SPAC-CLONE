import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  UserPlus,
} from 'lucide-react';
import AddStaffAccount from './AddStaffAccount';
import AccountsTblMenu from './AccountsTblMenu';
import AccountsViewModal from './AccountsViewModal';
import AccountsEditModal from './AccountsEditModal';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase_client';

const INITIAL_ACCOUNTS = [
  { id: 'ACC-1001', name: 'Alyssa Cruz', email: 'alyssa.cruz@saranay.ph', role: 'Manager', contact: '+63 917 842 1923', status: 'Active', dateAdded: 'Aug 10, 2026', dateCreated: 'Aug 10, 2026' },
  { id: 'ACC-1002', name: 'Crystal Florano', email: 'crystal.florano@saranay.ph', role: 'Admin', contact: '+63 918 221 4402', status: 'Active', dateAdded: 'Aug 11, 2026', dateCreated: 'Aug 11, 2026' },
  { id: 'ACC-1003', name: 'Rovic Rosales', email: 'rovic.rosales@saranay.ph', role: 'Staff', contact: '+63 920 193 5519', status: 'Active', dateAdded: 'Aug 12, 2026', dateCreated: 'Aug 12, 2026' },
  { id: 'ACC-1004', name: 'Mark Deniña', email: 'mark.denina@saranay.ph', role: 'Staff', contact: '+63 917 381 9021', status: 'Active', dateAdded: 'Aug 12, 2026', dateCreated: 'Aug 12, 2026' },
  { id: 'ACC-1005', name: 'Joseph Armia', email: 'joseph.armia@saranay.ph', role: 'Cashier', contact: '+63 927 492 8841', status: 'Active', dateAdded: 'Aug 14, 2026', dateCreated: 'Aug 14, 2026' },
  { id: 'ACC-1006', name: 'Shan Enriquez', email: 'shan.enriquez@saranay.ph', role: 'Court Attendant', contact: '+63 939 128 3014', status: 'Inactive', dateAdded: 'Aug 15, 2026', dateCreated: 'Aug 15, 2026' },
  { id: 'ACC-1007', name: 'Paolo Reyes', email: 'paolo.reyes@saranay.ph', role: 'Staff', contact: '+63 916 482 7120', status: 'Inactive', dateAdded: 'Aug 16, 2026', dateCreated: 'Aug 16, 2026' },
  { id: 'ACC-1008', name: 'David Chua', email: 'david.chua@saranay.ph', role: 'Manager', contact: '+63 915 882 1294', status: 'Active', dateAdded: 'Aug 18, 2026', dateCreated: 'Aug 18, 2026' },
  { id: 'ACC-1009', name: 'Kim Santos', email: 'kim.santos@saranay.ph', role: 'Cashier', contact: '+63 922 491 0039', status: 'Active', dateAdded: 'Aug 19, 2026', dateCreated: 'Aug 19, 2026' },
  { id: 'ACC-1010', name: 'Liza Fernandez', email: 'liza.fernandez@saranay.ph', role: 'Court Attendant', contact: '+63 917 554 9281', status: 'Active', dateAdded: 'Aug 20, 2026', dateCreated: 'Aug 20, 2026' },
  { id: 'ACC-1011', name: 'Brian Oconer', email: 'brian.oconer@saranay.ph', role: 'Staff', contact: '+63 928 319 4410', status: 'Active', dateAdded: 'Aug 21, 2026', dateCreated: 'Aug 21, 2026' },
  { id: 'ACC-1012', name: 'Andrea Del Rosario', email: 'andrea.delrosario@saranay.ph', role: 'Admin', contact: '+63 919 720 1192', status: 'Inactive', dateAdded: 'Aug 22, 2026', dateCreated: 'Aug 22, 2026' },
];

// Status badge colors - adjusted to bright vibrant colors as requested for defense presentation
const STATUS_OPTIONS = [
  { id: 'ALL', label: 'All Statuses' },
  { id: 'Active', label: 'Active', color: '#baff95', textColor: '#226307' },
  { id: 'Inactive', label: 'Inactive', color: '#ff9f92', textColor: '#be1a1a' },
];

const ROLE_OPTIONS = [
  { id: 'ALL', label: 'All Roles' },
  { id: 'Manager', label: 'Manager' },
  { id: 'Admin', label: 'Admin' },
  { id: 'Staff', label: 'Staff' },
  { id: 'Cashier', label: 'Cashier' },
  { id: 'Court Attendant', label: 'Court Attendant' },
];

export default function Accounts() {
  const [accounts, setAccounts] = useState(() =>
    isSupabaseConfigured ? [] : INITIAL_ACCOUNTS
  );
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Status & Role dropdown states
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Add Staff Account modal state
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

  // Row action menu: stores the ID of the account whose menu is open (or null)
  const [openMenuId, setOpenMenuId] = useState(null);
  // View modal: stores the account being viewed (or null when closed)
  const [viewAccount, setViewAccount] = useState(null);

  // Edit modal: stores the account being edited (or null when closed)
  const [editAccount, setEditAccount] = useState(null);
  // True when the Edit modal was opened from inside the View modal (shows "Back" instead of "Close")
  const [editOpenedFromView, setEditOpenedFromView] = useState(false);

  // Position of the trigger button for the open menu (used for fixed positioning)
  const [menuAnchorRect, setMenuAnchorRect] = useState(null);

  // Pagination state: 10 rows per page
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const statusDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close any open row menu when page or filters change
  useEffect(() => {
    setOpenMenuId(null);
  }, [currentPage, searchQuery, statusFilter, roleFilter]);

  // Fetch real staff accounts from Supabase when configured
  useEffect(() => {
    let isMounted = true;
    async function loadStaffProfiles() {
      if (!isSupabaseConfigured) return;
      try {
        const { data, error } = await supabase
          .from('staff_profiles')
          .select('*')
          .order('date_added', { ascending: false });

        if (error) {
          console.error('[SPaC Staff] Error loading staff profiles:', error);
          if (isMounted) {
            setAccounts(INITIAL_ACCOUNTS);
            setLoadError(`Supabase connection error: ${error.message}. Showing demo staff accounts.`);
          }
          return;
        }

        if (data && isMounted) {
          const mapped = data.map((item) => ({
            id: item.staff_id || `ACC-${item.id.slice(0, 4)}`,
            dbId: item.id,
            name: item.full_name,
            email: item.email,
            role: item.role,
            contact: item.contact_number || '+63 900 000 0000',
            status: item.status,
            dateAdded: item.date_added
              ? new Date(item.date_added).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Today',
            dateCreated: item.created_at
              ? new Date(item.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Today',
          }));
          setAccounts(mapped);
          setLoadError('');
        }
      } catch (err) {
        console.error('[SPaC Staff] Unexpected error fetching staff profiles:', err);
        if (isMounted) {
          setAccounts(INITIAL_ACCOUNTS);
          setLoadError(
            err instanceof Error ? `Supabase error (${err.message}). Showing demo accounts.` : 'Unexpected error loading staff profiles.'
          );
        }
      }
    }

    loadStaffProfiles();
    return () => {
      isMounted = false;
    };
  }, []);

  // Receive the new account from the modal and add it to the table
  const handleAddAccount = (newAccountData) => {
    setAccounts((prev) => {
      const maxNum = prev.reduce((max, acc) => {
        const num = parseInt(String(acc.id).replace(/\D/g, ''), 10);
        return Number.isNaN(num) ? max : Math.max(max, num);
      }, 1000);

      const today = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const newAccount = {
        id: `ACC-${maxNum + 1}`,
        ...newAccountData,
        dateAdded: today,
        dateCreated: today,
      };

      return [newAccount, ...prev];
    });

    // Show the new account right away (it's added at the top)
    setSearchQuery('');
    setStatusFilter('ALL');
    setRoleFilter('ALL');
    setCurrentPage(1);
  };

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      // Search matching (ID, name, email, role, contact, date)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          acc.id.toLowerCase().includes(query) ||
          acc.name.toLowerCase().includes(query) ||
          acc.email.toLowerCase().includes(query) ||
          acc.role.toLowerCase().includes(query) ||
          acc.contact.toLowerCase().includes(query) ||
          (acc.dateAdded && acc.dateAdded.toLowerCase().includes(query)) ||
          (acc.dateCreated && acc.dateCreated.toLowerCase().includes(query));

        if (!matchesQuery) return false;
      }

      // Status filter matching
      if (statusFilter !== 'ALL') {
        if (acc.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      // Role filter matching
      if (roleFilter !== 'ALL') {
        if (acc.role.toLowerCase() !== roleFilter.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [accounts, searchQuery, statusFilter, roleFilter]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / itemsPerPage));

  // Reset to page 1 if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Paginated rows
  const paginatedAccounts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAccounts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAccounts, currentPage, itemsPerPage]);

  const isFiltered = searchQuery !== '' || statusFilter !== 'ALL' || roleFilter !== 'ALL';

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setRoleFilter('ALL');
    setCurrentPage(1);
    setIsStatusDropdownOpen(false);
    setIsRoleDropdownOpen(false);
  };

  const handleSelectStatus = (id) => {
    setStatusFilter(id);
    setIsStatusDropdownOpen(false);
    setCurrentPage(1);
  };

  const handleSelectRole = (id) => {
    setRoleFilter(id);
    setIsRoleDropdownOpen(false);
    setCurrentPage(1);
  };

  const handleToggleMenu = (event, accountId) => {
    if (openMenuId === accountId) {
      setOpenMenuId(null);
      return;
    }
    setMenuAnchorRect(event.currentTarget.getBoundingClientRect());
    setOpenMenuId(accountId);
  };

  const handleViewAccount = (account) => {
    setViewAccount(account);
  };

  const handleSendResetPassword = async (account) => {
    if (isSupabaseConfigured && account?.email) {
      try {
        await supabase.auth.resetPasswordForEmail(account.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
      } catch (err) {
        console.warn('[SPaC Staff] Reset password error:', err);
      }
    }
  };

  // Edit clicked from the table's row menu
  const handleEditAccount = (account) => {
    setEditOpenedFromView(false);
    setEditAccount(account);
  };

  // Edit clicked from inside the View modal
  const handleEditFromView = (account) => {
    setEditOpenedFromView(true);
    setEditAccount(account);
  };

  // "Back" in the Edit modal: return to the View modal for the same account
  const handleBackToView = (account) => {
    setEditAccount(null);
    setEditOpenedFromView(false);
    setViewAccount(account);
  };

  const handleCloseEdit = () => {
    setEditAccount(null);
    setEditOpenedFromView(false);
  };

  // Receive the edited account from the Edit modal and update it in the table and backend
  const handleSaveAccount = async (updatedAccount) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === updatedAccount.id ? { ...acc, ...updatedAccount } : acc))
    );

    if (isSupabaseConfigured) {
      try {
        const query = updatedAccount.dbId
          ? supabase.from('staff_profiles').update({
              full_name: updatedAccount.name,
              role: updatedAccount.role,
              status: updatedAccount.status,
              contact_number: updatedAccount.contact,
            }).eq('id', updatedAccount.dbId)
          : supabase.from('staff_profiles').update({
              full_name: updatedAccount.name,
              role: updatedAccount.role,
              status: updatedAccount.status,
              contact_number: updatedAccount.contact,
            }).eq('staff_id', updatedAccount.id);

        const { error } = await query;
        if (error) {
          console.error('[SPaC Staff] Error updating staff profile in Supabase:', error);
        }
      } catch (err) {
        console.error('[SPaC Staff] Unexpected error updating profile:', err);
      }
    }
  };

  // Status Badge Renderer with brighter colors as requested
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#baff95] text-[#226307] select-none whitespace-nowrap shadow-2xs">
            <span className="text-[8px] leading-none">•</span>
            <span>Active</span>
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ff9f92] text-[#be1a1a] select-none whitespace-nowrap shadow-2xs">
            <span className="text-[8px] leading-none">•</span>
            <span>Inactive</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-200 text-neutral-800 select-none whitespace-nowrap">
            <span className="text-[8px] leading-none">•</span>
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      className="w-full flex flex-col space-y-3"
    >
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#121212] leading-tight">
          Accounts
        </h1>
        <p className="text-xs text-[#121212] font-normal mt-1 sm:mt-1.5 leading-relaxed">
          Manage staff credentials, access roles, and permissions — all in one place.
        </p>
      </div>

      {/* Main White Card Container */}
      <div className="w-full bg-[#ffffff] border border-[#121212] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
        {/* Search bar, Filters, & Add Staff Account Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:w-[38%] max-w-[340px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search here"
              className="w-full pl-3.5 pr-8 py-1.5 h-[34px] sm:h-[36px] bg-[#ffffff] border border-[#121212] rounded-xl text-xs text-[#121212] placeholder-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#121212] transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#6b7280]">
              <Search className="w-4 h-4 stroke-[1.8]" />
            </div>
          </div>

          {/* Right Controls: Role filter, Status Filter, Reset, and Add Staff Account */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Custom Role Dropdown */}
            <div className="relative" ref={roleDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsRoleDropdownOpen(!isRoleDropdownOpen);
                  setIsStatusDropdownOpen(false);
                }}
                className="w-[120px] sm:w-[130px] pl-3 pr-2.5 py-1.5 h-[34px] sm:h-[36px] bg-[#ffffff] border border-[#121212] rounded-xl text-xs text-[#121212] font-normal flex items-center justify-between text-left focus:outline-none focus:ring-1 focus:ring-[#121212] transition-all cursor-pointer"
                title="Filter by role"
              >
                <span className="truncate">
                  {roleFilter === 'ALL' ? 'All Roles' : roleFilter}
                </span>
                <ChevronDown className="w-3.5 h-3.5 stroke-[1.8] text-[#6b7280] shrink-0" />
              </button>

              {/* Role Dropdown Popover */}
              {isRoleDropdownOpen && (
                <div className="absolute top-full mt-1.5 right-0 z-50 w-44 bg-[#ffffff] border border-[#121212] rounded-xl p-1 shadow-xl select-none animate-in fade-in duration-100">
                  {ROLE_OPTIONS.map((opt) => {
                    const isSelected = roleFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectRole(opt.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                          isSelected
                            ? 'bg-neutral-100 text-[#121212] font-bold'
                            : 'text-[#121212] hover:bg-neutral-50'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#121212] stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Custom Status Dropdown */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsStatusDropdownOpen(!isStatusDropdownOpen);
                  setIsRoleDropdownOpen(false);
                }}
                className="w-[125px] sm:w-[135px] pl-3 pr-2.5 py-1.5 h-[34px] sm:h-[36px] bg-[#ffffff] border border-[#121212] rounded-xl text-xs text-[#121212] font-normal flex items-center justify-between text-left focus:outline-none focus:ring-1 focus:ring-[#121212] transition-all cursor-pointer"
                title="Filter by status"
              >
                <span className="truncate">
                  {statusFilter === 'ALL' ? 'All Statuses' : statusFilter}
                </span>
                <ChevronDown className="w-3.5 h-3.5 stroke-[1.8] text-[#6b7280] shrink-0" />
              </button>

              {/* Status Dropdown Popover */}
              {isStatusDropdownOpen && (
                <div className="absolute top-full mt-1.5 right-0 z-50 w-44 bg-[#ffffff] border border-[#121212] rounded-xl p-1 shadow-xl select-none animate-in fade-in duration-100">
                  {STATUS_OPTIONS.map((opt) => {
                    const isSelected = statusFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectStatus(opt.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                          isSelected
                            ? 'bg-neutral-100 text-[#121212] font-bold'
                            : 'text-[#121212] hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {opt.id !== 'ALL' ? (
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: opt.color, border: `1px solid ${opt.textColor}` }}
                            />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-neutral-300 shrink-0" />
                          )}
                          <span>{opt.label}</span>
                        </div>
                        {isSelected && <Check className="w-3 h-3 text-[#121212] stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reset Filter Button */}
            <button
              type="button"
              onClick={handleResetAllFilters}
              disabled={!isFiltered}
              className={`px-3 py-1.5 h-[34px] sm:h-[36px] bg-[#ffffff] border border-[#121212] rounded-xl text-xs transition-all flex items-center gap-1.5 shrink-0 select-none ${
                isFiltered
                  ? 'text-[#121212] font-semibold hover:bg-neutral-100 cursor-pointer shadow-2xs'
                  : 'text-[#6b7280]/50 border-neutral-300 opacity-60 cursor-not-allowed'
              }`}
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>

            {/* Add Staff Account Button: opens the Add Staff Account modal */}
            <button
              type="button"
              onClick={() => setIsAddStaffOpen(true)}
              className="px-3 sm:px-3.5 py-1.5 h-[34px] sm:h-[36px] bg-[#ffffff] hover:bg-neutral-100 active:scale-[0.98] border border-[#121212] rounded-xl text-xs font-semibold text-[#121212] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
              title="Add Staff Account"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#121212] stroke-[2]" />
              <span className="text-[#121212] whitespace-nowrap">Add Staff Account</span>
            </button>
          </div>
        </div>

        {/* Accounts Table: Comfortable breathing room with clean typography */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="border-b border-[#121212]">
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e]">
                  ACCOUNT ID
                </th>
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e]">
                  NAME
                </th>
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e]">
                  EMAIL
                </th>
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e]">
                  ROLE
                </th>
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e]">
                  CONTACT NUMBER
                </th>
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e]">
                  DATE ADDED
                </th>
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e] text-center">
                  STATUS
                </th>
                <th className="py-2.5 px-3 sm:px-4 text-[10px] sm:text-[10.5px] font-bold tracking-wider uppercase text-[#5f5e5e] text-center">
                  ACTION
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedAccounts.length > 0 ? (
                paginatedAccounts.map((acc) => (
                  <tr
                    key={acc.id}
                    className="border-b border-[#c4c9ac] hover:bg-neutral-50/70 transition-colors"
                  >
                    <td className="py-2 px-3 sm:px-4 text-xs font-semibold text-[#121212] whitespace-nowrap">
                      {acc.id}
                    </td>

                    <td className="py-2 px-3 sm:px-4 text-xs font-medium text-[#121212] whitespace-nowrap">
                      {acc.name}
                    </td>

                    <td className="py-2 px-3 sm:px-4 text-xs font-normal text-[#6b7280] whitespace-nowrap">
                      {acc.email}
                    </td>

                    <td className="py-2 px-3 sm:px-4 text-xs font-normal text-[#121212] whitespace-nowrap">
                      {acc.role}
                    </td>

                    <td className="py-2 px-3 sm:px-4 text-xs font-normal text-[#6b7280] whitespace-nowrap">
                      {acc.contact}
                    </td>

                    <td className="py-2 px-3 sm:px-4 text-xs font-normal text-[#6b7280] whitespace-nowrap">
                      {acc.dateAdded || acc.dateCreated || 'Aug 10, 2026'}
                    </td>

                    <td className="py-2 px-3 sm:px-4 text-center whitespace-nowrap">
                      {renderStatusBadge(acc.status)}
                    </td>

                    <td className="py-2 px-3 sm:px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        data-menu-trigger
                        onClick={(e) => handleToggleMenu(e, acc.id)}
                        className="inline-flex items-center justify-center w-7 h-[18px] border border-[#121212]/35 rounded-[4px] text-[#121212] hover:border-[#121212] hover:bg-neutral-100 transition-colors cursor-pointer"
                        title="Actions"
                        aria-haspopup="menu"
                        aria-expanded={openMenuId === acc.id}
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>

                      <AccountsTblMenu
                        isOpen={openMenuId === acc.id}
                        onClose={() => setOpenMenuId(null)}
                        account={acc}
                        anchorRect={menuAnchorRect}
                        onView={handleViewAccount}
                        onEdit={handleEditAccount}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-xs text-[#5f5e5e]">
                    {loadError
                      ? `Unable to load staff accounts: ${loadError}`
                      : 'No accounts found matching your search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar: Single clean separator line from last table row above */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-[#5f5e5e]">
          <div>
            Showing{' '}
            <span className="font-bold text-[#121212]">
              {filteredAccounts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-[#121212]">
              {Math.min(currentPage * itemsPerPage, filteredAccounts.length)}
            </span>{' '}
            of <span className="font-bold text-[#121212]">{filteredAccounts.length}</span> staff accounts
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={`p-1 rounded-md border border-[#121212] transition-colors flex items-center justify-center ${
                currentPage <= 1
                  ? 'opacity-30 cursor-not-allowed bg-neutral-100 text-[#5f5e5e]'
                  : 'hover:bg-neutral-100 text-[#121212] cursor-pointer'
              }`}
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-[24px] h-6 px-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#121212] text-[#ccff00] border border-[#121212]'
                      : 'bg-white text-[#121212] border border-[#121212]/40 hover:border-[#121212] hover:bg-neutral-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className={`p-1 rounded-md border border-[#121212] transition-colors flex items-center justify-center ${
                currentPage >= totalPages
                  ? 'opacity-30 cursor-not-allowed bg-neutral-100 text-[#5f5e5e]'
                  : 'hover:bg-neutral-100 text-[#121212] cursor-pointer'
              }`}
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* View Account modal */}
      <AccountsViewModal
        isOpen={viewAccount !== null}
        account={viewAccount}
        onClose={() => setViewAccount(null)}
        onEdit={handleEditFromView}
        onSendResetPassword={handleSendResetPassword}
      />

      {/* Edit Account modal (opened from the row menu or from inside the View modal) */}
      <AccountsEditModal
        isOpen={editAccount !== null}
        account={editAccount}
        fromView={editOpenedFromView}
        onBack={handleBackToView}
        onClose={handleCloseEdit}
        onSaveAccount={handleSaveAccount}
      />

      {/* Add Staff Account modal: mounted only while open so the form resets each time */}
      {isAddStaffOpen && (
        <AddStaffAccount
          isOpen
          onClose={() => setIsAddStaffOpen(false)}
          onAddAccount={handleAddAccount}
        />
      )}
    </div>
  );
}