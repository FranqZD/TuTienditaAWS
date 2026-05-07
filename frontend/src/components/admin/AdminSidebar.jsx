import { NavLink } from 'react-router-dom';
import './AdminSidebar.css';

function AdminSidebar() {
  return (
    <aside className="admin-sidebar" aria-label="Navegación de administración">
      <div className="admin-sidebar-header">
        <h2 className="admin-sidebar-title">Tu Tiendita Admin</h2>
      </div>

      <nav className="admin-sidebar-nav">
        <ul className="admin-sidebar-links">
          <li>
            <NavLink to="/admin" end className="admin-sidebar-link">
              <svg className="admin-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/productos" className="admin-sidebar-link">
              <svg className="admin-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Productos
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/nuevo" className="admin-sidebar-link">
              <svg className="admin-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Nuevo Producto
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/ordenes" className="admin-sidebar-link">
              <svg className="admin-sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Órdenes
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default AdminSidebar;
