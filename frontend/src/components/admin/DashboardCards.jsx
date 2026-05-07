import './DashboardCards.css';

function DashboardCards({ metrics }) {
  const { totalProducts, activeProducts, lowStockProducts, totalOrders } = metrics;

  const cards = [
    {
      label: 'Total Productos',
      value: totalProducts,
      icon: (
        <svg className="dashboard-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: 'Productos Activos',
      value: activeProducts,
      icon: (
        <svg className="dashboard-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12l2 2 4-4" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      ),
    },
    {
      label: 'Stock Bajo',
      value: lowStockProducts,
      icon: (
        <svg className="dashboard-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    {
      label: 'Total Órdenes',
      value: totalOrders,
      icon: (
        <svg className="dashboard-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
  ];

  return (
    <div className="dashboard-cards">
      {cards.map((card) => (
        <div key={card.label} className="dashboard-card">
          <div className="dashboard-card-header">
            {card.icon}
            <span className="dashboard-card-label">{card.label}</span>
          </div>
          <p className="dashboard-card-value">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export default DashboardCards;
