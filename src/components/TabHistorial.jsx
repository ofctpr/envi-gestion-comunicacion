import { useState } from "react";
import { TIPOS } from "../data/datos";

export default function TabHistorial({ ordenes, usuario }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");

  const esMantenimiento = usuario.rol === "mantenimiento";

  const estadoKey = (e) => e.toLowerCase().replace(" ", "-");

  const lista = ordenes.filter((o) => {
    if (esMantenimiento && !o.destino.includes("Mantenimiento")) return false;
    if (filtroEstado !== "todos" && estadoKey(o.estado) !== filtroEstado) return false;
    if (filtroTipo !== "todos" && o.tipo !== filtroTipo) return false;
    if (busqueda && !o.descripcion.toLowerCase().includes(busqueda.toLowerCase()) && !o.usuario.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const badgeEstado = (e) => {
    const m = { Pendiente: "pendiente", "En curso": "curso", Finalizado: "finalizado", Enviado: "enviado" };
    return m[e] || "pendiente";
  };

  return (
    <div>
      <div className="page-header">
        <h1>Ver pedidos / Historial</h1>
        <p>Todas las órdenes y solicitudes registradas en el sistema.</p>
      </div>
      <div className="search-row">
        <input className="search-input" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por descripción o usuario..." />
        <select className="filter-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en-curso">En curso</option>
          <option value="finalizado">Finalizado</option>
          <option value="enviado">Enviado</option>
        </select>
        <select className="filter-select" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="todos">Todos los tipos</option>
          {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      {lista.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-text">No se encontraron registros.</div></div>
      ) : lista.map((o) => (
        <div key={o.id} className="order-card">
          <div className="order-header">
            <div style={{ flex: 1 }}>
              <div className="order-id">#{String(o.id).padStart(4, "0")} · {o.tipo}</div>
              <div className="order-desc">{o.descripcion}</div>
            </div>
            <div className="order-badges">
              {o.prioridad && <span className={"badge badge-" + o.prioridad.toLowerCase()}>{o.prioridad}</span>}
              <span className={"badge badge-" + badgeEstado(o.estado)}>{o.estado}</span>
            </div>
          </div>
          <div className="order-meta">
            <span>📅 {o.fecha}</span><span>👤 {o.usuario}</span><span>📍 {o.sector}</span><span>➜ {o.destino.join(", ")}</span>
          </div>
          {o.resolucion && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#f0fdf4", borderRadius: 8, fontSize: 13, color: "#166534", lineHeight: 1.5 }}>
              ✓ Resuelto por <strong>{o.resolucion.tecnico}</strong> · Tiempo: {o.resolucion.tiempo}<br />
              {o.resolucion.detalle}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}