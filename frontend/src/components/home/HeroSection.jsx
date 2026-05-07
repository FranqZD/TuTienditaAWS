import { Link } from 'react-router-dom';
import './HeroSection.css';

function HeroSection() {
  return (
    <section className="hero">
      <div className="hero__content">
        <h1 className="hero__title">Bienvenido a Tu Tiendita</h1>
        <p className="hero__description">
          Descubre nuestra selección de productos de calidad al mejor precio.
          Compra fácil, rápido y seguro desde la comodidad de tu hogar.
        </p>
        <Link to="/catalogo" className="hero__cta">
          Ver Catálogo
        </Link>
      </div>
    </section>
  );
}

export default HeroSection;
