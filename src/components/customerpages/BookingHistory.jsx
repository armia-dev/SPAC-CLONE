import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ModalViewDetails from "./ModalViewDetails";
import ModalReschedule from "./ModalReschedule";
import ModalCancelBooking from "./ModalCancelBooking";
import ModalRescheduleConfirmation from "./ModalRescheduleConfirmation";
import ModalCancellationConfirmation from "./ModalCancellationConfirmation";

/* ------------------------------------------------------------------ */
/* Hardcoded sample data (replace with API data later)                 */
/* ------------------------------------------------------------------ */
const CUSTOMER = {
  customer: "Crystal Florano",
  contact: "0993 897 8574 • crystal.flora@email.com",
  source: "Website",
  payment: "GCash",
};

const ATTENTION = {
  id: "att-1",
  ref: "CR-1008",
  type: "Court Rental",
  date: "2026-08-20",
  start: "08:00",
  end: "09:00",
  price: 450,
  status: "Cancelled",
  notice: "This slot was cancelled by the admin. Rebook a new time, no charge.",
  details: {
    ...CUSTOMER,
    bookedOn: "Aug 15, 2026",
    updatedOn: "Aug 18, 2026",
    pax: 4,
    addons: "None",
    note: "-",
    lines: [
      { label: "Court Rate (1 hr(s) x ₱ 200)", amount: 200 },
      { label: "Additional Players (2 x ₱ 100)", amount: 200 },
      { label: "Paddle Rental (0 x ₱ 100)", amount: 0 },
      { label: "Ball Rental (1 x ₱ 50)", amount: 50 },
    ],
  },
};

const INITIAL_BOOKINGS = [
  {
    id: "b-1",
    ref: "CR-1009",
    type: "Court Rental",
    date: "2026-08-25",
    start: "13:00",
    end: "14:00",
    price: 350,
    status: "Reserved",
    details: {
      ...CUSTOMER,
      bookedOn: "Aug 20, 2026",
      updatedOn: "Aug 20, 2026",
      pax: 7,
      addons: "None",
      note: "-",
      lines: [
        { label: "Court Rate (1 hr(s) x ₱ 200)", amount: 200 },
        { label: "Additional Players (1 x ₱ 100)", amount: 100 },
        { label: "Paddle Rental (0 x ₱ 100)", amount: 0 },
        { label: "Ball Rental (1 x ₱ 50)", amount: 50 },
      ],
    },
  },
  {
    id: "b-2",
    ref: "BK-1010",
    type: "Open Play",
    date: "2026-08-15",
    start: "18:00",
    end: "22:00",
    price: 150,
    status: "Completed",
    details: {
      ...CUSTOMER,
      bookedOn: "Aug 10, 2026",
      updatedOn: "Aug 10, 2026",
      pax: 1,
      addons: "None",
      note: "-",
      lines: [{ label: "Open Play Entry (1 x ₱ 150)", amount: 150 }],
    },
  },
  {
    id: "b-3",
    ref: "CT-1099",
    type: "Open Play",
    date: "2026-08-14",
    start: "18:00",
    end: "22:00",
    price: 300,
    status: "Completed",
    details: {
      ...CUSTOMER,
      bookedOn: "Aug 9, 2026",
      updatedOn: "Aug 9, 2026",
      pax: 2,
      addons: "None",
      note: "-",
      lines: [{ label: "Open Play Entry (2 x ₱ 150)", amount: 300 }],
    },
  },
  {
    id: "b-4",
    ref: "FM-1455",
    type: "Private Event",
    date: "2026-08-08",
    start: "18:00",
    end: "22:00",
    price: 300,
    status: "Completed",
    details: {
      ...CUSTOMER,
      bookedOn: "Aug 1, 2026",
      updatedOn: "Aug 2, 2026",
      pax: 12,
      addons: "None",
      note: "-",
      lines: [{ label: "Event Package", amount: 300 }],
    },
  },
];

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_LONG = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const parseDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m: m - 1, d };
};
const fmtDate = (iso) => {
  const { y, m, d } = parseDate(iso);
  return `${MONTHS[m]} ${d}, ${y}`;
};
const fmtDateLong = (iso) => {
  const { y, m, d } = parseDate(iso);
  return `${MONTHS_LONG[m]} ${d}, ${y}`;
};
const fmtTime = (t) => {
  const [h, min] = t.split(":").map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(min).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};
const fmtRange = (s, e) => `${fmtTime(s)} - ${fmtTime(e)}`;
const addHour = (t) => {
  const [h, min] = t.split(":").map(Number);
  return `${String((h + 1) % 24).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
};
const peso = (n) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

/** Adds display labels the modals read (dateLabel, timeLabel). */
const withLabels = (b) => ({ ...b, dateLabel: fmtDate(b.date), timeLabel: fmtRange(b.start, b.end) });

const TYPE_CLASS = { "Court Rental": "rental", "Open Play": "play", "Private Event": "event" };
const FILTERS = ["All", "Reserved", "Completed", "Cancelled"];

/* ------------------------------------------------------------------ */
/* Overlay: shared backdrop for every popup (Esc / outside click close)*/
/* ------------------------------------------------------------------ */
function Overlay({ onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div className="bk bk-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      {children}
    </div>,
    document.body
  );
}

/* ------------------------------------------------------------------ */
/* Booking row                                                         */
/* ------------------------------------------------------------------ */
function BookingRow({ booking, onView, onReschedule, onCancel }) {
  const { y, m, d } = parseDate(booking.date);
  const reserved = booking.status === "Reserved";

  return (
    <article className={`bk-card bk-card--${TYPE_CLASS[booking.type]}`}>
      <div className="bk-card-date">
        <span className="bk-card-month">{MONTHS[m].toUpperCase()}</span>
        <span className="bk-card-day">{d}</span>
        <span className="bk-card-year">{y}</span>
      </div>

      <div className="bk-card-main">
        <span className={`bk-type bk-type--${TYPE_CLASS[booking.type]}`}>{booking.type}</span>
        <p className="bk-card-time">{fmtRange(booking.start, booking.end)}</p>
        <p className="bk-card-ref">Ref: {booking.ref}</p>
      </div>

      <p className="bk-card-price">{peso(booking.price)}</p>
      <span className={`bk-status bk-status--${booking.status.toLowerCase()}`}>
        <i aria-hidden="true" />
        {booking.status}
      </span>

      <div className="bk-card-actions">
        <button type="button" className="bk-btn bk-btn--outline" onClick={() => onView(booking)}>View Details</button>
        {reserved && (
          <>
            <button type="button" className="bk-btn bk-btn--outline" onClick={() => onReschedule(booking)}>Reschedule</button>
            <button type="button" className="bk-btn bk-btn--danger" onClick={() => onCancel(booking)}>Cancel</button>
          </>
        )}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function BookingHistory() {
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [attention, setAttention] = useState(ATTENTION);
  const [filter, setFilter] = useState("All");

  // modal: { kind: "details" | "reschedule" | "cancel", booking }
  const [modal, setModal] = useState(null);
  // confirmation: { kind: "reschedule" | "cancel", ...props }
  const [confirmation, setConfirmation] = useState(null);

  const open = (kind) => (booking) => setModal({ kind, booking: withLabels(booking) });
  const closeModal = () => setModal(null);
  const closeConfirmation = () => setConfirmation(null);

  const visible = bookings.filter((b) => filter === "All" || b.status === filter);

  const patchBooking = (id, patch) => {
    setBookings((list) => list.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    if (attention?.id === id) setAttention(null);
  };

  const handleReschedule = (booking, { date, time }) => {
    const end = addHour(time);
    patchBooking(booking.id, { date, start: time, end, status: "Reserved" });
    setModal(null);
    setConfirmation({
      kind: "reschedule",
      newDate: fmtDateLong(date),
      newTime: fmtRange(time, end),
      refNo: booking.ref,
    });
  };

  const handleCancel = (booking) => {
    patchBooking(booking.id, { status: "Cancelled" });
    setModal(null);
    setConfirmation({
      kind: "cancel",
      date: fmtDateLong(booking.date),
      time: fmtRange(booking.start, booking.end),
      refNo: booking.ref,
    });
  };

  return (
    <main className="bk bk-page">
      <style>{css}</style>

      <h1 className="bk-page-title">My Bookings</h1>
      <p className="bk-page-sub">View and manage your past and upcoming bookings.</p>

      {attention && (
        <section aria-labelledby="bk-attn">
          <h3 id="bk-attn" className="bk-section-title">Needs Your Attention</h3>
          <div className="bk-attention">
            <div className="bk-attention-icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 48 48">
                <path d="M24 6 L44 40 H4 Z" fill="#fff" stroke="#fff" strokeWidth="4" strokeLinejoin="round" />
                <rect x="22" y="17" width="4" height="12" rx="1" fill="#e8a21e" />
                <rect x="22" y="32" width="4" height="4" rx="1" fill="#e8a21e" />
              </svg>
            </div>
            <div className="bk-attention-main">
              <span className={`bk-type bk-type--${TYPE_CLASS[attention.type]}`}>{attention.type}</span>
              <p className="bk-attention-when">
                {fmtDate(attention.date)} · {fmtRange(attention.start, attention.end)}
              </p>
              <p className="bk-attention-note">{attention.notice}</p>
            </div>
            <div className="bk-attention-actions">
              <button type="button" className="bk-btn bk-btn--dark" onClick={() => open("reschedule")(attention)}>Reschedule</button>
              <button type="button" className="bk-btn bk-btn--outline" onClick={() => open("details")(attention)}>View Details</button>
            </div>
          </div>
        </section>
      )}

      <div className="bk-filters" role="tablist" aria-label="Filter bookings">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            className={`bk-filter ${filter === f ? "is-active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <h3 className="bk-section-title">Booking Log</h3>
      <div className="bk-list">
        {visible.length === 0 && <p className="bk-empty">No {filter.toLowerCase()} bookings.</p>}
        {visible.map((b) => (
          <BookingRow
            key={b.id}
            booking={b}
            onView={open("details")}
            onReschedule={open("reschedule")}
            onCancel={open("cancel")}
          />
        ))}
      </div>

      {modal && (
        <Overlay onClose={closeModal}>
          {modal.kind === "details" && (
            <ModalViewDetails
              booking={modal.booking}
              onClose={closeModal}
              onReschedule={open("reschedule")}
              onCancel={open("cancel")}
            />
          )}
          {modal.kind === "reschedule" && (
            <ModalReschedule
              booking={modal.booking}
              onClose={closeModal}
              onConfirm={(data) => handleReschedule(modal.booking, data)}
            />
          )}
          {modal.kind === "cancel" && (
            <ModalCancelBooking
              booking={modal.booking}
              onClose={closeModal}
              onConfirm={() => handleCancel(modal.booking)}
            />
          )}
        </Overlay>
      )}

      {confirmation && (
        <Overlay onClose={closeConfirmation}>
          {confirmation.kind === "reschedule" ? (
            <ModalRescheduleConfirmation {...confirmation} onClose={closeConfirmation} />
          ) : (
            <ModalCancellationConfirmation {...confirmation} onClose={closeConfirmation} />
          )}
        </Overlay>
      )}
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Styles (shared by the page and all five modals)                     */
/* ------------------------------------------------------------------ */
const css = `
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap");

.bk {
  --lime: #ccff00; --ink: #111111; --muted: #6b6b45; --line: #d9d8c3;
  --cream: #f9f8ee; --cream-deep: #efede0; --red: #c62828; --yellow: #fff176;
  font-family: "Be Vietnam Pro", system-ui, -apple-system, sans-serif;
  color: var(--ink);
}
.bk *, .bk *::before, .bk *::after { box-sizing: border-box; font-family: inherit; }
.bk h1, .bk h2, .bk h3, .bk h4, .bk p { margin: 0; }

.bk-btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 7px 14px; border-radius: 999px; border: 1.5px solid var(--ink);
  background: #fff; color: var(--ink);
  font-size: 13px; font-weight: 600; line-height: 1.2; white-space: nowrap; cursor: pointer;
  transition: filter .15s;
}
.bk-btn:hover:not(:disabled) { filter: brightness(.95); }
.bk-btn:focus-visible { outline: 3px solid var(--lime); outline-offset: 2px; box-shadow: 0 0 0 2px var(--ink); }
.bk-btn:disabled { opacity: .45; cursor: not-allowed; }
.bk-btn--dark { background: var(--ink); color: var(--lime); }
.bk-btn--danger { background: var(--red); border-color: var(--red); color: #fff; }
.bk-btn--lime { background: var(--lime); border-color: var(--lime); color: var(--ink); }
.bk-btn--gray { background: #d1d3db; border-color: #d1d3db; }
.bk-btn--lg { padding: 11px 22px; font-size: 15px; font-weight: 700; }
.bk-btn--block { width: 100%; border-radius: 12px; }

.bk-type { display: inline-block; padding: 3px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; }
.bk-type--rental { background: var(--lime); color: var(--ink); }
.bk-type--play { background: #00e676; color: #fff; }
.bk-type--event { background: #a855f7; color: #fff; }

.bk-status { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 999px; font-size: 14px; font-weight: 600; white-space: nowrap; }
.bk-status i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.bk-status--reserved { background: var(--yellow); color: #9a8500; }
.bk-status--completed { background: #b9f6a0; color: #2e8b2e; }
.bk-status--cancelled { background: #ffd6d6; color: var(--red); }

.bk-page { padding: 0 0 24px; background: transparent; }
.bk-page-title { font-size: 30px; font-weight: 700; line-height: 1.2; }
.bk-page-sub { font-size: 15px; margin-top: 4px; }
.bk-section-title { font-size: 16px; font-weight: 600; color: #666; margin: 28px 0 10px; }

.bk-attention { display: flex; align-items: center; gap: 20px; padding: 14px 22px; border-radius: 16px; background: #fff1f1; border: 1px solid #e8b84a; }
.bk-attention-icon { flex: none; width: 56px; height: 56px; border-radius: 50%; background: #e8a21e; display: grid; place-items: center; }
.bk-attention-icon svg { width: 36px; height: 36px; }
.bk-attention-main { flex: 1; min-width: 0; }
.bk-attention-when { font-size: 17px; font-weight: 600; margin-top: 6px; }
.bk-attention-note { font-size: 13px; color: var(--red); margin-top: 3px; }
.bk-attention-actions { display: flex; gap: 8px; }

.bk-filters { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
.bk-filter { padding: 8px 22px; border-radius: 999px; cursor: pointer; border: 1.5px solid #bdbdb0; background: #fff; color: var(--muted); font-size: 15px; font-weight: 600; }
.bk-filter.is-active { background: var(--ink); border-color: var(--ink); color: var(--lime); }
.bk-filter:focus-visible { outline: 3px solid var(--lime); box-shadow: 0 0 0 2px var(--ink); }

.bk-list { display: flex; flex-direction: column; gap: 16px; }
.bk-empty { padding: 24px; text-align: center; color: var(--muted); font-size: 15px; }

.bk-card { --accent: #f6e03d; position: relative; overflow: hidden; display: flex; align-items: center; gap: 20px; padding: 16px 24px 16px 16px; background: #fff; border: 1px solid var(--line); border-radius: 18px; }
.bk-card::before { content: ""; position: absolute; inset: 0 auto 0 0; width: 6px; background: var(--accent); }
.bk-card--rental { --accent: #f6e03d; }
.bk-card--play { --accent: #00e676; }
.bk-card--event { --accent: #a855f7; }
.bk-card-date { flex: none; width: 64px; display: flex; flex-direction: column; align-items: center; margin-left: 6px; }
.bk-card-month { font-size: 13px; font-weight: 600; color: #444; }
.bk-card-day { font-size: 38px; font-weight: 700; line-height: 1; }
.bk-card-year { font-size: 13px; color: #555; margin-top: 3px; }
.bk-card-main { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; }
.bk-card-time { font-size: 17px; font-weight: 600; margin-top: 10px; padding-left: 10px; }
.bk-card-ref { font-size: 13px; padding-left: 10px; margin-top: 2px; }
.bk-card-price { font-size: 19px; font-weight: 700; white-space: nowrap; }
.bk-card-actions { display: flex; gap: 8px; }

.bk-overlay { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 16px; background: rgba(0,0,0,.55); overflow-y: auto; }
.bk-modal { width: 100%; max-height: calc(100vh - 32px); display: flex; flex-direction: column; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,.35); }
.bk-modal--md { max-width: 540px; }
.bk-modal--sm { max-width: 360px; background: #fdfdfb; }
.bk-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid var(--line); }
.bk-modal-header h2 { font-size: 18px; font-weight: 700; }
.bk-close { border: 0; background: transparent; color: #5b6475; cursor: pointer; padding: 4px; border-radius: 8px; display: grid; }
.bk-close:hover { color: #000; }
.bk-close:focus-visible { outline: 3px solid var(--lime); box-shadow: 0 0 0 2px var(--ink); }
.bk-modal-body { padding: 16px; overflow-y: auto; }
.bk-modal-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; border-top: 1px solid var(--line); }
.bk-footer-group { display: flex; gap: 8px; }

.bk-ref-pill { display: inline-block; padding: 5px 14px; border-radius: 999px; background: var(--cream-deep); font-size: 15px; font-weight: 700; }
.bk-pill-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.bk-pill-row .bk-status { font-size: 14px; padding: 4px 12px; }
.bk-meta { font-size: 12px; color: #6b7280; margin-top: 6px; }
.bk-summary { display: grid; grid-template-columns: 1fr 1.3fr; gap: 12px; margin: 18px 0 18px 4px; }
.bk-summary h4, .bk-detail h4 { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #4a4a3a; }
.bk-summary p, .bk-detail p { font-size: 15px; margin-top: 2px; }

.bk-panel { padding: 14px; border: 1px solid var(--line); border-radius: 14px; background: var(--cream); display: flex; flex-direction: column; gap: 12px; }
.bk-plain-fields { padding: 0 4px; display: flex; flex-direction: column; gap: 12px; }
.bk-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.bk-field { display: flex; flex-direction: column; gap: 6px; }
.bk-field > span { font-size: 14px; font-weight: 600; color: #3f3f30; }
.bk-field--half { width: calc(50% - 6px); }
.bk-field select, .bk-field input, .bk-field textarea { width: 100%; padding: 9px 12px; border-radius: 10px; border: 1.5px solid var(--line); background: #fff; color: var(--ink); font-size: 14px; }
.bk-field textarea { resize: vertical; min-height: 70px; }
.bk-field ::placeholder { color: #7b7f8a; }
.bk-field select:has(option[value=""]:checked) { color: #6b7280; }
.bk-field select:focus-visible, .bk-field input:focus-visible, .bk-field textarea:focus-visible { outline: 3px solid var(--lime); border-color: var(--ink); }
.bk-policy-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-top: 16px; padding: 0 4px; }
.bk-policy-row a { color: #1d4ea0; font-size: 14px; }
.bk-check { display: inline-flex; align-items: center; gap: 10px; font-size: 14px; color: #444; cursor: pointer; }
.bk-check input { width: 17px; height: 17px; accent-color: #3b6ff0; }

.bk-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 20px; margin-top: 18px; }
.bk-note { margin-top: 16px; }
.bk-note h4 { text-transform: none; }
.bk-breakdown { margin-top: 20px; padding: 14px 18px; border: 1px solid var(--line); border-radius: 14px; background: var(--cream); }
.bk-breakdown-line, .bk-breakdown-total { display: flex; justify-content: space-between; gap: 12px; }
.bk-breakdown-line { font-size: 14px; color: #444; padding: 2px 0; }
.bk-breakdown-total { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--line); font-size: 16px; font-weight: 700; }

.bk-success { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 14px 8px 4px; }
.bk-success-icon { width: 80px; height: 80px; }
.bk-success h2 { font-size: 22px; font-weight: 700; margin-top: 18px; }
.bk-success-msg { font-size: 14px; margin-top: 6px; }
.bk-success-rows { width: 100%; margin: 18px 0; padding: 14px 16px; border: 1.5px solid var(--ink); border-radius: 14px; display: flex; flex-direction: column; gap: 10px; }
.bk-success-rows div { display: flex; justify-content: space-between; gap: 12px; font-size: 14px; }
.bk-success-rows dt, .bk-success-rows dd { margin: 0; }
.bk-success-rows dd { text-align: right; }

@media (max-width: 960px) {
  .bk-card { flex-wrap: wrap; gap: 12px 16px; }
  .bk-card-main { flex-basis: calc(100% - 100px); }
  .bk-card-actions { flex-basis: 100%; flex-wrap: wrap; }
  .bk-attention { flex-wrap: wrap; }
  .bk-attention-actions { flex-basis: 100%; }
}
@media (max-width: 600px) {
  .bk-page { padding: 0 0 24px; }
  .bk-page-title { font-size: 26px; }
  .bk-page-sub { font-size: 14px; }
  .bk-filter { padding: 7px 16px; font-size: 14px; }
  .bk-summary, .bk-detail-grid, .bk-row { grid-template-columns: 1fr; }
  .bk-field--half { width: 100%; }
  .bk-modal-footer { flex-wrap: wrap; }
  .bk-footer-group { width: 100%; }
  .bk-footer-group .bk-btn { flex: 1; padding-inline: 12px; }
  .bk-btn--lg { padding: 10px 18px; font-size: 14px; }
}
`;