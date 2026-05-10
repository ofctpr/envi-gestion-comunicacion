import { useState } from "react";
import { TIPOS } from "../data/datos";

const cardStyle = { background: "rgba(10, 22, 40, 0.9)", border: "1px solid rgba(34, 197, 94, 0.2)", marginBottom: "1.5rem" };
const titleStyle = { fontSize: 16, fontWeight: 700, color: "#f0fdf4" };

export default function TabHistorial({ ordenes, usuario }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("todos");
  const [expandido, setExpandido] = useState(null);

  const esMantenimiento = usuario.rol === "mantenimiento";

  const lista = ordenes.filter((o) => {
    if (esMantenimiento && !o.destino.includes("Mantenimiento")) return false;
    if (filtroEstado !== "todos" && o.estado !== filtroEstado) return false;
    if (filtroTipo !== "todos" && o.tipo !== filtroTipo) return false;
    if (filtroPrioridad !== "todos" && o.prioridad !== filtroPrioridad) return false;
    if (busqueda && !o.descripcion.toLowerCase().includes(busqueda.toLowerCase()) &&
        !o.usuario.toLowerCase().includes(busqueda.toLowerCase()) &&
        !o.sector.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const badgeColor = (estado) => {
    const m = {
      "Pendiente": { bg: "rgba(37,99,235,0.2)", color: "#60a5fa" },
      "En curso": { bg: "rgba(217,119,6,0.2)", color: "#fbbf24" },
      "Finalizado": { bg: "rgba(22,163,74,0.2)", color: "#4ade80" },
      "Enviado": { bg: "rgba(124,58,237,0.2)", color: "#a78bfa" },
    };
    return m[estado] || { bg: "rgba(255,255,255,0.1)", color: "#9ca3af" };
  };

  const prioColor = (p) => {
    const m = {
      "Urgente": { bg: "rgba(220,38,38,0.2)", color: "#f87171" },
      "Moderada": { bg: "rgba(217,119,6,0.2)", color: "#fbbf24" },
      "Baja": { bg: "rgba(22,163,74,0.2)", color: "#4ade80" },
    };
    return m[p] || { bg: "rgba(255,255,255,0.1)", color: "#9ca3af" };
  };

  const total = lista.length;
  const finalizados = lista.filter(o => o.estado === "Finalizado").length;
  const pendientes = lista.filter(o => o.estado === "Pendiente").length;
  const enCurso = lista.filter(o => o.estado === "En curso").length;

  return (
    <div style={{
      background: "linear-gradient(135deg, #0a1628 0%, #0d2a1a 40%, #0a1628 70%, #091420 100%)",
      minHeight: "calc(100vh - 52px)", margin: "-2rem -1.5rem", padding: "2rem 1.5rem",
    }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#f0fdf4" }}>Ver pedidos / Historial</div>
        <div style={{ fontSize: 14, color: "#6b7280" }}>Todas las órdenes y solicitudes registradas.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
        {[
          { label: "Total", val: total, color: "#4ade80" },
          { label: "Finalizados", val: finalizados, color: "#16a34a" },
          { label: "En curso", val: enCurso, color: "#d97706" },
          { label: "Pendientes", val: pendientes, color: "#2563eb" },
        ].map((k, i) => (
          <div key={i} style={{ ...cardStyle, padding: "1rem 1.25rem", borderRadius: 10, marginBottom: 0 }}>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 300, color: k.color, fontFamily: "monospace" }}>{k.val}</div>
          </div>
        ))}
      </div>

      <div className="card" style={cardStyle}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            placeholder="Buscar por descripción, usuario o sector..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ flex: 1, minWidth: 200, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "8px 14px", color: "#f0fdf4", fontSize: 13, outline: "none" }}
          />
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
            style={{ background: "#0a1628", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "8px 14px", color: "#f0fdf4", fontSize: 13 }}>
            <option value="todos">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En curso">En curso</option>
            <option value="Finalizado">Finalizado</option>
            <option value="Enviado">Enviado</option>
          </select>
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
            style={{ background: "#0a1628", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "8px 14px", color: "#f0fdf4", fontSize: 13 }}>
            <option value="todos">Todos los tipos</option>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filtroPrioridad} onChange={e => setFiltroPrioridad(e.target.value)}
            style={{ background: "#0a1628", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "8px 14px", color: "#f0fdf4", fontSize: 13 }}>
            <option value="todos">Todas las prioridades</option>
            <option value="Urgente">Urgente</option>
            <option value="Moderada">Moderada</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
      </div>

      {lista.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 14 }}>No se encontraron registros con los filtros aplicados.</div>
        </div>
      ) : lista.map((o) => (
        <div key={o.id} style={{
          ...cardStyle, borderRadius: 10, padding: "1.25rem", cursor: "pointer",
          transition: "all 0.15s",
          borderColor: expandido === o.id ? "rgba(34,197,94,0.5)" : "rgba(34,197,94,0.2)",
        }} onClick={() => setExpandido(expandido === o.id ? null : o.id)}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#4ade80", fontFamily: "monospace", marginBottom: 4 }}>
                #{String(o.id).padStart(4, "0")} · {o.tipo}
              </div>
              <div style={{ fontSize: 14, color: "#f0fdf4", marginBottom: 8, lineHeight: 1.5 }}>{o.descripcion}</div>
              <div style={{ fontSize: 12, color: "#6b7280", display: "flex", gap: 16, flexWrap: "wrap" }}>
                <span>📅 {o.fecha}</span>
                <span>👤 {o.usuario}</span>
                <span>📍 {o.sector}</span>
                <span>➜ {Array.isArray(o.destino) ? o.destino.join(", ") : o.destino}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {o.prioridad && (
                <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: prioColor(o.prioridad).bg, color: prioColor(o.prioridad).color }}>
                  {o.prioridad}
                </span>
              )}
              <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: badgeColor(o.estado).bg, color: badgeColor(o.estado).color }}>
                {o.estado}
              </span>
              <span style={{ fontSize: 12, color: "#6b7280" }}>{expandido === o.id ? "▲" : "▼"}</span>
            </div>
          </div>

          {expandido === o.id && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(34,197,94,0.1)" }}>
              {o.resolucion ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Técnico responsable</div>
                    <div style={{ fontSize: 13, color: "#f0fdf4" }}>{o.resolucion.tecnico}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Tiempo de resolución</div>
                    <div style={{ fontSize: 13, color: "#f0fdf4" }}>{o.resolucion.tiempo}</div>
                  </div>
                  {o.resolucion.repuesto && o.resolucion.repuesto !== "Ninguno" && (
                    <div>
                      <div style={{ fontSize: 11, color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Repuesto utilizado</div>
                      <div style={{ fontSize: 13, color: "#f0fdf4" }}>{o.resolucion.repuesto}</div>
                    </div>
                  )}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={{ fontSize: 11, color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Detalle de resolución</div>
                    <div style={{ fontSize: 13, color: "#f0fdf4", lineHeight: 1.5 }}>{o.resolucion.detalle}</div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "#6b7280" }}>Sin resolución registrada aún.</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}