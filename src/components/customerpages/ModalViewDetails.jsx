function Item({ label, children }) {
  return (
    <div className="bk-detail">
      <h4>{label}</h4>
      <p>{children}</p>
    </div>
  );
}

/**
 * Booking details popup.
 * Reschedule / Cancel Booking buttons only show for Reserved bookings.
 */
export default function ModalViewDetails({ booking, onClose, onReschedule, onCancel }) {
  const d = booking.details;
  const total = d.lines.reduce((sum, l) => sum + l.amount, 0);
  const reserved = booking.status === "Reserved";

  return (
    <div className="bk-modal bk-modal--md" role="dialog" aria-modal="true" aria-label={`${booking.type} Details`}>
      <header className="bk-modal-header">
        <h2>{booking.type} Details</h2>
        <button type="button" className="bk-close" onClick={onClose} aria-label="Close">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="5" y1="5" x2="19" y2="19" />
            <line x1="19" y1="5" x2="5" y2="19" />
          </svg>
        </button>
      </header>

      <div className="bk-modal-body">
        <div className="bk-pill-row">
          <span className="bk-ref-pill">Ref #: {booking.ref}</span>
          <span className={`bk-status bk-status--${booking.status.toLowerCase()}`}>
            <i aria-hidden="true" />
            {booking.status}
          </span>
        </div>
        <p className="bk-meta">Booked {d.bookedOn} · Last updated {d.updatedOn}</p>

        <div className="bk-detail-grid">
          <Item label="Customer">{d.customer}</Item>
          <Item label="Contact Information">{d.contact}</Item>
          <Item label="Booking Source">{d.source}</Item>
          <Item label="Payment Method">{d.payment}</Item>
          <Item label="Date">{booking.dateLabel}</Item>
          <Item label="Time">{booking.timeLabel}</Item>
          <Item label="Pax">{d.pax}</Item>
          <Item label="Add-ons">{d.addons}</Item>
        </div>

        <div className="bk-detail bk-note">
          <h4>Note:</h4>
          <p>{d.note}</p>
        </div>

        <div className="bk-breakdown">
          {d.lines.map((l) => (
            <div key={l.label} className="bk-breakdown-line">
              <span>{l.label}</span>
              <span>₱ {l.amount}</span>
            </div>
          ))}
          <div className="bk-breakdown-total">
            <span>TOTAL</span>
            <span>₱ {total}</span>
          </div>
        </div>
      </div>

      <footer className="bk-modal-footer">
        <button type="button" className="bk-btn bk-btn--gray bk-btn--lg" onClick={onClose}>Close</button>
        {reserved && (
          <div className="bk-footer-group">
            <button type="button" className="bk-btn bk-btn--outline bk-btn--lg" onClick={() => onReschedule(booking)}>
              Reschedule
            </button>
            <button type="button" className="bk-btn bk-btn--danger bk-btn--lg" onClick={() => onCancel(booking)}>
              Cancel Booking
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}