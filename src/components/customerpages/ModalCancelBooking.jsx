import { useState } from "react";

const REASONS = ["Change of plans", "Schedule conflict", "Weather", "Personal emergency", "Other"];

/**
 * Cancel booking popup.
 * onConfirm({ reason, notes, notify })
 */
export default function ModalCancelBooking({ booking, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [notify, setNotify] = useState(true);

  return (
    <div className="bk-modal bk-modal--md" role="dialog" aria-modal="true" aria-label="Cancel Booking">
      <header className="bk-modal-header">
        <h2>Cancel Booking</h2>
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

        <div className="bk-plain-fields">
          <label className="bk-field bk-field--half">
            <span>Reason</span>
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="" disabled>Select a reason</option>
              {REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>

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
          className="bk-btn bk-btn--danger bk-btn--lg"
          disabled={!reason}
          onClick={() => onConfirm({ reason, notes, notify })}
        >
          Confirm Cancellation
        </button>
      </footer>
    </div>
  );
}