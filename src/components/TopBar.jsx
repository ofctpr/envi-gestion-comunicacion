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
        <div className="top-logo-mark">EV</div>
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
        <button
          className="exit-btn"
          onClick={onLogout}
        >
          Salir
        </button>
      </div>
    </div>
  );
}