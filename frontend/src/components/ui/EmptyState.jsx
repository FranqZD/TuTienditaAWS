import { Link } from 'react-router-dom';
import './EmptyState.css';

function EmptyState({ title, message, actionLabel, actionTo }) {
  return (
    <div className="empty-state">
      <svg
        className="empty-state__icon"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="12" y="22" width="40" height="30" rx="3" />
        <polyline points="12,22 32,12 52,22" />
        <line x1="32" y1="34" x2="32" y2="42" />
        <line x1="28" y1="38" x2="36" y2="38" />
      </svg>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__message">{message}</p>
      {actionLabel && actionTo && (
        <Link className="empty-state__action" to={actionTo}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
