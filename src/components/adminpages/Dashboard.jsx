import React, { useState, useMemo } from 'react';
import { Megaphone, MoreVertical, Pin } from 'lucide-react';
import AddAnnouncement from './AddAnnouncement';
import AnnouncementMenu from './AnnouncementMenu';
import ViewAnnouncementModal from './ViewAnnouncementsModal';
import DeleteAnnouncementModal from './DeleteAnnouncementsModal';

// Operating hours: 6:00 AM to 2:00 AM (20 hours continuous)
const TIMELINE_TICKS = [
  { hour: 6, label: '6AM' },
  { hour: 8, label: '8AM' },
  { hour: 10, label: '10 AM' },
  { hour: 12, label: '12PM' },
  { hour: 14, label: '2PM' },
  { hour: 16, label: '4PM' },
  { hour: 18, label: '6PM' },
  { hour: 20, label: '8PM' },
  { hour: 22, label: '10PM' },
  { hour: 24, label: '12AM' },
  { hour: 26, label: '2AM' },
];

// Single Court Today's Schedule (6:00 AM to 2:00 AM = 20 operating hours)
// Only Court Rental events accommodated; shows primary booker customer name
const TODAY_TIMELINE_BOOKINGS = [
  {
    id: 'CR-1007',
    customer: 'Crystal Florano',
    startHour: 7,
    durationHours: 3, // 7:00 AM - 10:00 AM
    pax: '8 pax',
    status: 'Completed',
  },
  {
    id: 'CR-1008',
    customer: 'Mark Deniña',
    startHour: 11.5,
    durationHours: 3, // 11:30 AM - 2:30 PM
    pax: '6 pax',
    status: 'In Progress',
  },
  {
    id: 'CR-1009',
    customer: 'Alyssa Cruz',
    startHour: 15.5,
    durationHours: 2.5, // 3:30 PM - 6:00 PM
    pax: '8 pax',
    status: 'Reserved',
  },
  {
    id: 'CR-1010',
    customer: 'Joseph Armia',
    startHour: 19,
    durationHours: 3, // 7:00 PM - 10:00 PM
    pax: '8 pax',
    status: 'Reserved',
  },
  {
    id: 'CR-1011',
    customer: 'Brian Oconer',
    startHour: 23,
    durationHours: 2, // 11:00 PM - 1:00 AM
    pax: '6 pax',
    status: 'Reserved',
  },
];

// Week Ahead Occupancy (Mon to Sun)
// Only shows: Mon to Sun, number of bookings, total court rental hours booked
const WEEK_AHEAD_DAYS = [
  {
    day: 'MON',
    fullDay: 'Monday',
    dateStr: 'Oct 12',
    bookingsCount: 6,
    totalRentalHours: 12,
    isToday: false,
  },
  {
    day: 'TUE',
    fullDay: 'Tuesday',
    dateStr: 'Oct 13',
    bookingsCount: 7,
    totalRentalHours: 13,
    isToday: false,
  },
  {
    day: 'WED',
    fullDay: 'Wednesday',
    dateStr: 'Oct 14',
    bookingsCount: 8,
    totalRentalHours: 14.5,
    isToday: true,
  },
  {
    day: 'THU',
    fullDay: 'Thursday',
    dateStr: 'Oct 15',
    bookingsCount: 7,
    totalRentalHours: 14,
    isToday: false,
  },
  {
    day: 'FRI',
    fullDay: 'Friday',
    dateStr: 'Oct 16',
    bookingsCount: 9,
    totalRentalHours: 17,
    isToday: false,
  },
  {
    day: 'SAT',
    fullDay: 'Saturday',
    dateStr: 'Oct 17',
    bookingsCount: 11,
    totalRentalHours: 19,
    isToday: false,
  },
  {
    day: 'SUN',
    fullDay: 'Sunday',
    dateStr: 'Oct 18',
    bookingsCount: 10,
    totalRentalHours: 18,
    isToday: false,
  },
];

// Initial Announcements: exactly 2 examples as requested
const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'ANN-1',
    postedText: 'Posted Sep 3, 4:00 PM',
    title: 'Court Rate Adjustment',
    description:
      'Daytime rate is now ₱250/hr (was ₱200/hr) and Nighttime rate is now ₱350/hr (was ₱300/hr).',
    pinned: false,
  },
  {
    id: 'ANN-2',
    postedText: 'Posted Sep 2, 2:00 PM',
    title: 'Equipment Rental Rate Increase',
    description:
      'Paddle rental is updated to ₱150/session (was ₱100) and Ball rental to ₱75/session (was ₱50).',
    pinned: false,
  },
];

// Format an ISO date into "Posted Sep 3, 4:00 PM"
const formatPostedText = (iso) => {
  const d = iso ? new Date(iso) : new Date();
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `Posted ${date}, ${time}`;
};

export default function Dashboard({ onAddBookingClick, onNavigateTab } = {}) {
  // ---------------------------------------------------------------------------
  // ANNOUNCEMENT STATE
  // ---------------------------------------------------------------------------
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [menuOpenId, setMenuOpenId] = useState(null); // which kebab menu is open
  const [menuAnchor, setMenuAnchor] = useState(null); // position of the clicked three-dots button
  const [isAddOpen, setIsAddOpen] = useState(false); // "+ New" modal
  const [viewingAnnouncement, setViewingAnnouncement] = useState(null); // View modal
  const [editingAnnouncement, setEditingAnnouncement] = useState(null); // Edit modal
  const [editFromView, setEditFromView] = useState(false); // true when Edit was opened from the View modal
  const [deletingAnnouncement, setDeletingAnnouncement] = useState(null); // Delete confirm

  // Pinned announcements always show first (original order kept otherwise)
  const sortedAnnouncements = useMemo(() => {
    const pinned = announcements.filter((a) => a.pinned);
    const rest = announcements.filter((a) => !a.pinned);
    return [...pinned, ...rest];
  }, [announcements]);

  // Add new announcement (from AddAnnouncement modal)
  const handleAddAnnouncement = (data) => {
    const newItem = {
      id: `ANN-${Date.now()}`,
      postedText: formatPostedText(data.createdAt),
      title: data.title,
      description: data.message,
      pinned: data.isPinned,
    };
    setAnnouncements((prev) => [newItem, ...prev]);
  };

  // Pin / Unpin from kebab menu
  const handlePin = (ann) => {
    if (!ann) return;
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === ann.id ? { ...a, pinned: !a.pinned } : a))
    );
  };

  // Save edits (from AddAnnouncement modal in edit mode)
  const handleSaveEdit = (data) => {
    if (!editingAnnouncement) return;
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === editingAnnouncement.id
          ? { ...a, title: data.title, description: data.message, pinned: data.isPinned }
          : a
      )
    );
  };

  // Delete (called by DeleteAnnouncementModal, which also closes itself)
  const handleDelete = (ann) => {
    if (!ann) return;
    setAnnouncements((prev) => prev.filter((a) => a.id !== ann.id));
  };

  // Open / close a kebab menu, remembering where the button is on screen
  const handleKebabClick = (e, annId) => {
    e.stopPropagation();
    if (menuOpenId === annId) {
      setMenuOpenId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuAnchor({
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
    });
    setMenuOpenId(annId);
  };

  // Open the Edit modal from the kebab menu (button label stays "Close")
  const openEditFromMenu = (ann) => {
    setEditFromView(false);
    setEditingAnnouncement(ann);
  };

  // Open the Edit modal from the View modal (button label becomes "Back")
  const openEditFromView = (ann) => {
    setEditFromView(true);
    setEditingAnnouncement(ann);
  };

  // Plain close of the Edit modal (X, Escape, backdrop, after Save)
  const closeEditModal = () => {
    setEditingAnnouncement(null);
    setEditFromView(false);
  };

  // "Back" from the Edit modal -> return to the View modal for the same announcement
  const handleEditBack = () => {
    if (editingAnnouncement) {
      const latest =
        announcements.find((a) => a.id === editingAnnouncement.id) ||
        editingAnnouncement;
      setViewingAnnouncement(latest);
    }
    setEditingAnnouncement(null);
    setEditFromView(false);
  };

  // 1. TODAY'S REVENUE BREAKDOWN
  // Total: ₱8,000
  // Breakdown of the 3: Court Fees (₱4,750), Extra Players (₱2,000), Equipment (₱1,250)
  const revenueData = {
    courtFees: 4750,
    extraPlayers: 2000,
    equipment: 1250,
    total: 8000,
    courtPct: (4750 / 8000) * 100, // 59.375%
    extraPct: (2000 / 8000) * 100, // 25%
    equipPct: (1250 / 8000) * 100, // 15.625%
  };

  // Convert hour number to readable time
  const formatHourLabel = (hourVal) => {
    const whole = Math.floor(hourVal);
    const mins = Math.round((hourVal - whole) * 60);
    const displayMins = mins === 0 ? '00' : mins < 10 ? `0${mins}` : mins;

    let period = 'AM';
    let h12 = whole;
    if (whole >= 12 && whole < 24) {
      period = 'PM';
      if (whole > 12) h12 = whole - 12;
    } else if (whole >= 24) {
      period = 'AM';
      h12 = whole === 24 ? 12 : whole - 24;
    } else if (whole === 0) {
      h12 = 12;
    }
    return `${h12}:${displayMins} ${period}`;
  };

  return (
    <div
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      className="w-full flex flex-col space-y-3 text-[#121212]"
    >
      {/* Page Header: EXACT positioning with other pages (Bookings & Logs) */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#121212] leading-tight">
          Dashboard Overview
        </h1>
        <p className="text-[11px] sm:text-xs text-[#121212] font-normal mt-0.5 leading-relaxed">
          Real-time facility performance and operations
        </p>
      </div>

      {/* ========================================================================= */}
      {/* ROW 1: TWO BALANCED COLUMNS (6 cols / 6 cols split)                       */}
      {/* Left (6 cols): TODAY'S REVENUE                                            */}
      {/* Right (6 cols): ANNOUNCEMENTS                                             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 items-stretch">
        {/* ===================================================================== */}
        {/* 1. TODAY'S REVENUE                                                    */}
        {/* ===================================================================== */}
        <section className="lg:col-span-6 bg-[#ffffff] border border-[#121212] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-center space-y-3 sm:space-y-3.5">
          {/* Top row: Title + Live Update pill */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-[#121212] tracking-tight">
              Today’s Revenue
            </h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ccff00] text-[#121212] select-none shadow-2xs">
              Live Update
            </span>
          </div>

          {/* Large Total Numeral (₱8,000) */}
          <div className="text-4xl sm:text-5xl font-black text-[#121212] tracking-tight leading-none my-0.5">
            ₱{revenueData.total.toLocaleString()}
          </div>

          {/* 3 Progress Bars (Court Fees, Extra Players, Equipment) */}
          <div className="space-y-2.5 sm:space-y-3 pt-0.5">
            {/* 1. Court Fees */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs sm:text-[13px] font-bold text-[#121212]">
                <span>Court Fees</span>
                <span>₱{revenueData.courtFees.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#121212] overflow-hidden">
                <div
                  style={{ width: `${revenueData.courtPct}%` }}
                  className="h-full bg-[#ccff00] rounded-l-full transition-all duration-500"
                />
              </div>
            </div>

            {/* 2. Extra Players */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs sm:text-[13px] font-bold text-[#121212]">
                <span>Extra Players</span>
                <span>₱{revenueData.extraPlayers.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#121212] overflow-hidden">
                <div
                  style={{ width: `${revenueData.extraPct}%` }}
                  className="h-full bg-[#00e676] rounded-l-full transition-all duration-500"
                />
              </div>
            </div>

            {/* 3. Equipment */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs sm:text-[13px] font-bold text-[#121212]">
                <span>Equipment</span>
                <span>₱{revenueData.equipment.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#121212] overflow-hidden">
                <div
                  style={{ width: `${revenueData.equipPct}%` }}
                  className="h-full bg-[#a855f7] rounded-l-full transition-all duration-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 4. ANNOUNCEMENTS SECTION                                              */}
        {/* ===================================================================== */}
        <section className="lg:col-span-6 bg-[#ffffff] border border-[#121212] rounded-2xl shadow-xs overflow-hidden flex flex-col">
          {/* Black Header Bar */}
          <div className="bg-[#121212] px-4 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-[#ccff00] fill-[#ccff00]/20 stroke-[2.2]" />
              <h2 className="text-sm sm:text-base font-bold text-[#ccff00] tracking-tight">
                Announcements
              </h2>
              {/* Active count badge */}
              <span className="px-2.5 py-0.5 rounded-full border border-[#ccff00] text-[#ccff00] text-[10px] font-semibold select-none">
                {announcements.length} Active
              </span>
            </div>

            {/* "+ New" Button -> opens AddAnnouncement modal */}
            <button
              type="button"
              onClick={() => {
                setMenuOpenId(null);
                setIsAddOpen(true);
              }}
              className="inline-flex items-center justify-center px-2.5 sm:px-3 py-0.5 rounded-[5px] font-bold text-[11px] sm:text-xs bg-[#ccff00] text-[#121212] hover:bg-[#b8e600] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              + New
            </button>
          </div>

          {/* Announcements Card Body (the kebab menu floats above via a portal, so no extra padding needed) */}
          <div className="p-3.5 sm:p-4 space-y-3 bg-[#ffffff] overflow-y-auto max-h-[220px]">
            {sortedAnnouncements.length === 0 && (
              <div className="text-[11px] text-[#6b7280] text-center py-6">
                No announcements yet. Click “+ New” to add one.
              </div>
            )}

            {sortedAnnouncements.map((ann) => (
              <div
                key={ann.id}
                className="bg-[#ffffff] border border-[#121212] rounded-xl p-3 space-y-1 relative"
              >
                {/* Top Line: Timestamp + Kebab menu */}
                <div className="flex items-center justify-between text-[11px] text-[#6b7280]">
                  <span className="flex items-center gap-1.5">
                    {ann.pinned && (
                      <Pin className="w-3 h-3 fill-[#121212] text-[#121212]" />
                    )}
                    {ann.postedText}
                  </span>

                  <div className="relative">
                    <button
                      type="button"
                      aria-label="Announcement options"
                      onClick={(e) => handleKebabClick(e, ann.id)}
                      className="p-0.5 text-[#121212] rounded hover:bg-[#fbfaf1] transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-3.5 h-3.5 stroke-[2]" />
                    </button>

                    <AnnouncementMenu
                      isOpen={menuOpenId === ann.id}
                      anchorRect={menuAnchor}
                      onClose={() => setMenuOpenId(null)}
                      announcement={ann}
                      isPinned={ann.pinned}
                      onPin={handlePin}
                      onView={(a) => setViewingAnnouncement(a)}
                      onEdit={openEditFromMenu}
                      onDelete={(a) => setDeletingAnnouncement(a)}
                    />
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-xs sm:text-[13px] text-[#121212] leading-tight">
                  {ann.title}
                </h3>

                {/* Description */}
                <p className="text-[11px] text-[#6b7280] leading-snug">
                  {ann.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* ROW 2: TODAY’S COURT TIMELINE (6AM to 2AM - SINGLE COURT)                 */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#ffffff] border border-[#121212] rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-[#dedbc4]">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#121212] tracking-tight">
              Today’s Court Timeline
            </h2>
            <p className="text-[10px] sm:text-[11px] text-[#6b7280]">
              Operating hours: 6:00 AM to 2:00 AM (Single Main Court)
            </p>
          </div>

          {/* Quick Legend: Court Rental only */}
          <div className="flex items-center gap-2.5 text-[10px] sm:text-[11px] text-[#4a4a42]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#ccff00] border border-[#121212]" />
              Court Rental
            </span>
          </div>
        </div>

        {/* Scrollable Timeline Grid Container */}
        <div className="w-full overflow-x-auto select-none pt-0.5">
          <div className="min-w-[920px] space-y-1.5">
            {/* Header row: COURT on left, then time markers 6AM to 2AM */}
            <div className="grid grid-cols-[100px_1fr] text-[10px] font-bold text-[#6b7280] uppercase tracking-wider px-1">
              <div>COURT</div>
              <div className="grid grid-cols-10 text-center">
                {TIMELINE_TICKS.slice(0, 10).map((tick) => (
                  <div key={tick.hour} className="truncate">
                    {tick.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Court Row */}
            <div className="grid grid-cols-[100px_1fr] items-center py-1 px-1">
              <div className="text-xs font-bold text-[#121212]">
                Main Court
              </div>

              {/* The Timeline Track */}
              <div className="relative w-full h-[40px] bg-[#fbfaf1] border border-[#dedbc4] rounded-lg overflow-hidden shadow-inner">
                {/* Vertical subtle divider lines */}
                <div className="absolute inset-0 grid grid-cols-10 pointer-events-none">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="border-r border-[#dedbc4]/60 h-full" />
                  ))}
                </div>

                {/* Plotted Bookings */}
                {TODAY_TIMELINE_BOOKINGS.map((b) => {
                  const totalOperatingHours = 20;
                  const leftPct = ((b.startHour - 6) / totalOperatingHours) * 100;
                  const widthPct = (b.durationHours / totalOperatingHours) * 100;

                  return (
                    <div
                      key={b.id}
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                      }}
                      className="absolute top-0.5 bottom-0.5 rounded-md border border-[#121212] bg-[#ccff00] text-[#121212] px-2 py-0.5 flex flex-col justify-center shadow-xs overflow-hidden"
                      title={`${b.customer} (${formatHourLabel(b.startHour)} – ${formatHourLabel(
                        b.startHour + b.durationHours
                      )}) · ${b.pax}`}
                    >
                      <div className="text-[10px] font-bold truncate leading-tight">
                        {b.customer}
                      </div>
                      <div className="text-[9px] font-semibold opacity-90 truncate leading-none mt-0.5">
                        {b.pax}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ROW 3: WEEK AHEAD OCCUPANCY                                               */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#ffffff] border border-[#121212] rounded-xl sm:rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-2.5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-[#121212] tracking-tight">
            Week Ahead Occupancy
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-2.5">
          {WEEK_AHEAD_DAYS.map((d) => (
            <div
              key={d.day}
              className={`rounded-lg border p-2 sm:p-2.5 flex flex-col justify-between space-y-1.5 transition-all ${
                d.isToday
                  ? 'bg-[#fbfaf1] border-[#121212] ring-1 ring-[#121212] shadow-xs'
                  : 'bg-[#fbfaf1] border-[#dedbc4] hover:border-[#121212]/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black tracking-wide text-[#121212] uppercase">
                  {d.day}
                </span>
                {d.isToday && (
                  <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-[#ccff00] text-[#121212]">
                    TODAY
                  </span>
                )}
              </div>

              <div className="space-y-1 pt-0.5 text-xs">
                <div className="flex items-baseline justify-between text-[#4a4a42]">
                  <span className="text-[10px] font-medium">Bookings</span>
                  <strong className="text-[11px] font-black text-[#121212]">
                    {d.bookingsCount}
                  </strong>
                </div>

                <div className="flex items-baseline justify-between text-[#4a4a42]">
                  <span className="text-[10px] font-medium">Court Rental</span>
                  <strong className="text-[11px] font-black text-[#121212]">
                    {d.totalRentalHours}hr
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ANNOUNCEMENT MODALS                                                       */}
      {/* ========================================================================= */}

      {/* Add Announcement (from "+ New") */}
      {isAddOpen && (
        <AddAnnouncement
          isOpen
          headerTitle="Add Announcement"
          submitLabel="Post"
          onClose={() => setIsAddOpen(false)}
          onPost={handleAddAnnouncement}
        />
      )}

      {/* Edit Announcement (prefilled). Reuses AddAnnouncement.
          - Opened from kebab menu  -> bottom-left button says "Close"
          - Opened from View modal  -> bottom-left button says "Back" and returns to View */}
      {editingAnnouncement && (
        <AddAnnouncement
          key={editingAnnouncement.id}
          isOpen
          headerTitle="Edit Announcement"
          submitLabel="Save"
          closeLabel={editFromView ? 'Back' : 'Close'}
          onBack={editFromView ? handleEditBack : null}
          initialData={{
            title: editingAnnouncement.title,
            message: editingAnnouncement.description,
            isPinned: editingAnnouncement.pinned,
          }}
          onClose={closeEditModal}
          onPost={handleSaveEdit}
        />
      )}

      {/* View Announcement (from kebab -> View). Its Edit button opens the edit modal in "Back" mode. */}
      {viewingAnnouncement && (
        <ViewAnnouncementModal
          isOpen
          announcement={viewingAnnouncement}
          onClose={() => setViewingAnnouncement(null)}
          onEdit={openEditFromView}
        />
      )}

      {/* Delete confirmation (from kebab -> Delete) */}
      {deletingAnnouncement && (
        <DeleteAnnouncementModal
          isOpen
          announcement={deletingAnnouncement}
          onClose={() => setDeletingAnnouncement(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}