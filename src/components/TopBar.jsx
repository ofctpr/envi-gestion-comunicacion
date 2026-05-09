const LogoManzana = () => (
  <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
    <path d="M50 18 C50 18 62 8 72 12" stroke="#4ade80" strokeWidth="3" strokeLinecap="round"/>
    <path d="M50 24 C36 24 22 34 20 50 C17 68 26 86 36 90 C41 92 46 90 50 90 C54 90 59 92 64 90 C74 86 83 68 80 50 C78 34 64 24 50 24Z" fill="#16a34a"/>
    <path d="M50 24 C50 24 44 32 44 40" stroke="#15803d" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default function TopBar({ usuario, tab, setTab, onLogout, canAccess }) {
  const initials = usuario.nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navItems = [
    { key: "solicitud", label: "Nueva solicitud" },
    { key: "mantenimiento", label: "Mantenimiento" },
    { key: "historial", label: "Ver pedidos" },
    { key: "reportes", label: "Reportes" },
    { key: "admin", label: "Administración" },
  ];

  return (
    <div className="topbar">
      <div className="top-logo">
        <div className="top-logo-mark">
          <LogoManzana />
        </div>
        <span className="top-app-name">Gestión de la Comunicación</span>
      </div>
      <div className="top-divider" />
      <div className="top-nav">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={
              "top-nav-btn" +
              (tab === item.key ? " active" : "") +
              (!canAccess(item.key) ? " disabled" : "")
            }
            onClick={() => canAccess(item.key) && setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="top-user">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{usuario.nombre}</div>
            <div className="user-rol">{usuario.rol}</div>
          </div>
        </div>
        <button className="exit-btn" onClick={onLogout}>Salir</button>
      </div>
    </div>
  );
}