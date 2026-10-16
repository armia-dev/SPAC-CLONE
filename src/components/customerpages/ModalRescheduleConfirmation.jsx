/**
 * "Booking Rescheduled!" popup.
 * Props: newDate ("August 31, 2026"), newTime ("1:00 PM - 2:00 PM"), refNo, onClose
 */
export default function ModalRescheduleConfirmation({ newDate, newTime, refNo, onClose }) {
  return (
    <div className="bk-modal bk-modal--sm" role="dialog" aria-modal="true" aria-label="Booking Rescheduled">
      <div className="bk-modal-body">
        <div className="bk-success">
          <svg className="bk-success-icon" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#4a7c32" strokeWidth="7" />
            <polyline points="30,52 45,66 72,36" fill="none" stroke="#4a7c32" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2>Booking Rescheduled!</h2>
          <p className="bk-success-msg">Your court reservation has been moved.</p>

          <dl className="bk-success-rows">
            <div><dt>New Date</dt><dd>{newDate}</dd></div>
            <div><dt>New Time</dt><dd>{newTime}</dd></div>
            <div><dt>Reference No.</dt><dd>{refNo}</dd></div>
          </dl>

          <button type="button" className="bk-btn bk-btn--outline bk-btn--block" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}