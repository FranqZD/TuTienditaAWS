import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <span className="footer-store-name">Tu Tiendita</span>
        </div>
        <nav className="footer-nav" aria-label="Enlaces secundarios">
          <Link to="/" className="footer-link">Inicio</Link>
          <Link to="/catalogo" className="footer-link">Catálogo</Link>
        </nav>
        <p className="footer-copyright">
          © 2025 Tu Tiendita. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
