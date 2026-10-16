import { useState } from "react";

const REASONS = ["Schedule conflict", "Weather", "Personal emergency", "Other"];

// Court is open 6:00 AM - 2:00 AM, so the last 1-hour slot starts at 1:00 AM.
const START_HOURS = [...Array(18).keys()].map((i) => i + 6).concat([0, 1]); // 6..23, 0, 1

const hourValue = (h) => `${String(h).padStart(2, "0")}:00`;
const hourLabel = (h) => `${h % 12 === 0 ? 12 : h % 12}:00 ${h >= 12 ? "PM" : "AM"}`;

/**
 * Reschedule popup.
 * booking: needs ref, dateLabel, timeLabel, details.customer
 * onConfirm({ reason, date, time, notes, notify })  // time is "HH:00"
 */
export default function ModalReschedule({ booking, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [notify, setNotify] = useState(true);

  const canConfirm = reason && date && time;

  return (
    <div className="bk-modal bk-modal--md" role="dialog" aria-modal="true" aria-label="Reschedule Booking">
      <header className="bk-modal-header">
        <h2>Reschedule Booking</h2>
        <button type="button" className="bk-close" onClick={onClose} aria-label="Close">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="5" y1="5" x2="19" y2="19" />
            <line x1="19" y1="5" x2="5" y2="19" />
          </svg>
        </button>
      </header>

      <div className="bk-modal-body">
        <span className="bk-ref-pill">Ref #: {booking.ref}</span>
        <div className="bk-summary">
          <div>
            <h4>Customer</h4>
            <p>{booking.details.customer}</p>
          </div>
          <div>
            <h4>Date &amp; Time</h4>
            <p>{booking.dateLabel} • {booking.timeLabel}</p>
          </div>
        </div>

        <div className="bk-panel">
          <label className="bk-field bk-field--half">
            <span>Reason</span>
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="" disabled>Select a reason</option>
              {REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>

          <div className="bk-row">
            <label className="bk-field">
              <span>New Date</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className="bk-field">
              <span>New Start Time</span>
              <select value={time} onChange={(e) => setTime(e.target.value)}>
                <option value="" disabled>Select a time</option>
                {START_HOURS.map((h) => (
                  <option key={h} value={hourValue(h)}>{hourLabel(h)}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="bk-field">
            <span>Notes</span>
            <textarea
              rows={3}
              placeholder="Add any relevant details here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>

        <div className="bk-policy-row">
          <a href="#cancellation-policy">View Cancellation Policy</a>
          <label className="bk-check">
            Notify me via SMS/Email
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
          </label>
        </div>
      </div>

      <footer className="bk-modal-footer">
        <button type="button" className="bk-btn bk-btn--gray bk-btn--lg" onClick={onClose}>Back</button>
        <button
          type="button"
          className="bk-btn bk-btn--lime bk-btn--lg"
          disabled={!canConfirm}
          onClick={() => onConfirm({ reason, date, time, notes, notify })}
        >
          Confirm
        </button>
      </footer>
    </div>
  );
}