import './LoadingSpinner.css';

function LoadingSpinner({ message = 'Cargando...' }) {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <div className="loading-spinner__circle" aria-hidden="true"></div>
      <p className="loading-spinner__message">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
