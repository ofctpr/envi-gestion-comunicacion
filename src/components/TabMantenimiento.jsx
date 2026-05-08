import { MAQUINAS } from "../data/datos";

export default function TabMantenimiento({ ordenes, setModal }) {
  const activas = ordenes.filter(
    (o) => o.destino.includes("Mantenimiento") && (o.estado === "Pendiente" || o.estado === "En curso")
  );
  const finalizadas = ordenes.filter(
    (o) => o.destino.includes("Mantenimiento") && o.estado === "Finalizado"
  );

  return (
    <div>
      <div className="page-header">
        <h1>Panel de Mantenimiento</h1>
        <p>Solicitudes asignadas al área.</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">Pendientes</div><div className="stat-val">{activas.filter((o) => o.estado === "Pendiente").length}</div></div>
        <div className="stat-card"><div className="stat-label">En curso</div><div className="stat-val" style={{ color: "#ea580c" }}>{activas.filter((o) => o.estado === "En curso").length}</div></div>
        <div className="stat-card"><div className="stat-label">Finalizados</div><div className="stat-val" style={{ color: "#16a34a" }}>{finalizadas.length}</div></div>
        <div className="stat-card"><div className="stat-label">Alta prioridad</div><div className="stat-val" style={{ color: "#dc2626" }}>{activas.filter((o) => o.prioridad === "Alta").length}</div></div>
      </div>
      <div className="card">
        <div className="card-title">Solicitudes activas</div>
        {activas.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🔧</div><div className="empty-text">Sin solicitudes activas en este momento.</div></div>
        ) : activas.sort((a, b) => a.prioridad === "Alta" ? -1 : 1).map((o) => (
          <div key={o.id} className="order-card">
            <div className="order-header">
              <div style={{ flex: 1 }}>
                <div className="order-id">#{String(o.id).padStart(4, "0")} · {o.tipo}</div>
                <div className="order-desc" style={{ marginTop: 4 }}>{o.descripcion}</div>
              </div>
              <div className="order-badges">
                {o.prioridad && <span className={"badge badge-" + o.prioridad.toLowerCase()}>{o.prioridad}</span>}
                <span className={"badge badge-" + (o.estado === "En curso" ? "curso" : "pendiente")}>{o.estado}</span>
              </div>
            </div>
            <div className="order-meta">
              <span>📅 {o.fecha}</span><span>👤 {o.usuario}</span><span>📍 {o.sector}</span>
            </div>
            <div style={{ marginTop: 12 }}>
              <button className="btn-primary" style={{ padding: "7px 18px", fontSize: 13 }} onClick={() => setModal(o)}>
                {o.estado === "Pendiente" ? "Aceptar y ver detalle" : "Cargar resolución"}
              </button>
            </div>
          </div>
        ))}
      </div>
      {finalizadas.length > 0 && (
        <div className="card">
          <div className="card-title">Órdenes finalizadas</div>
          {finalizadas.map((o) => (
            <div key={o.id} className="order-card">
              <div className="order-header">
                <div style={{ flex: 1 }}>
                  <div className="order-id">#{String(o.id).padStart(4, "0")}</div>
                  <div className="order-desc" style={{ marginTop: 4, color: "#6b7280" }}>{o.descripcion}</div>
                </div>
                <span className="badge badge-finalizado">Finalizado</span>
              </div>
              <div className="order-meta">
                <span>📅 {o.fecha}</span>
                {o.resolucion && <><span>🔧 {o.resolucion.tecnico}</span><span>⏱ {o.resolucion.tiempo}</span></>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}