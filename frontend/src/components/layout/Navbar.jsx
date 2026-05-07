import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { items } = useCart();

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar" aria-label="Navegación principal">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          Tu Tiendita
        </Link>

        <button
          className={`navbar-hamburger ${menuOpen ? 'navbar-hamburger--open' : ''}`}
          onClick={toggleMenu}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          <span className="navbar-hamburger-line" />
          <span className="navbar-hamburger-line" />
          <span className="navbar-hamburger-line" />
        </button>

        <ul className={`navbar-links ${menuOpen ? 'navbar-links--open' : ''}`}>
          <li>
            <Link to="/" className="navbar-link" onClick={closeMenu}>
              Inicio
            </Link>
          </li>
          <li>
            <Link to="/catalogo" className="navbar-link" onClick={closeMenu}>
              Catálogo
            </Link>
          </li>
          <li>
            <Link to="/cart" className="navbar-link navbar-link--cart" onClick={closeMenu}>
              Carrito
              {cartCount > 0 && (
                <span className="navbar-badge" aria-label={`${cartCount} productos en el carrito`}>
                  {cartCount}
                </span>
              )}
            </Link>
          </li>
        </ul>
      </div>

      {menuOpen && (
        <div className="navbar-overlay" onClick={closeMenu} aria-hidden="true" />
      )}
    </nav>
  );
}

export default Navbar;
