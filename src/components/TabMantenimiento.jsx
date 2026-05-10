import { useState } from "react";
import { actualizarOrden } from "../data/datos";
import { supabase } from "../supabase";

export default function TabMantenimiento({ ordenes, setModal, setOrdenes, usuario, showAlert }) {
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState({});
  const esAdmin = usuario?.rol === "admin";

  const activas = ordenes.filter(
    (o) => o.destino.includes("Mantenimiento") && (o.estado === "Pendiente" || o.estado === "En curso")
  );
  const finalizadas = ordenes.filter(
    (o) => o.destino.includes("Mantenimiento") && o.estado === "Finalizado"
  );

  const eliminarOrden = async (id) => {
    if (!window.confirm("¿Estás seguro que querés eliminar esta orden?")) return;
    const { error } = await supabase.from("ordenesv").delete().eq("id", id);
    if (!error) {
      setOrdenes(os => os.filter(o => o.id !== id));
      showAlert("Orden eliminada correctamente.");
    } else {
      showAlert("Error al eliminar la orden.", "info");
    }
  };

  const iniciarEdicion = (o) => {
    setEditando(o.id);
    setEditForm({ descripcion: o.descripcion, prioridad: o.prioridad, estado: o.estado });
  };

  const guardarEdicion = async () => {
    const ok = await actualizarOrden(editando, editForm);
    if (ok) {
      setOrdenes(os => os.map(o => o.id === editando ? { ...o, ...editForm } : o));
      setEditando(null);
      showAlert("Orden actualizada correctamente.");
    } else {
      showAlert("Error al actualizar.", "info");
    }
  };

  const OrdenCard = ({ o, finalizada = false }) => (
    <div key={o.id} className="order-card">
      {editando === o.id ? (
        <div>
          <div className="form-row">
            <label className="form-label">Descripción</label>
            <textarea className="form-input form-textarea" value={editForm.descripcion} onChange={e => setEditForm(f => ({ ...f, descripcion: e.target.value }))} style={{ minHeight: 80 }} />
          </div>
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Prioridad</label>
              <select className="form-input form-select" value={editForm.prioridad || ""} onChange={e => setEditForm(f => ({ ...f, prioridad: e.target.value }))}>
                <option value="">Sin prioridad</option>
                <option value="Baja">Baja</option>
                <option value="Moderada">Moderada</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">Estado</label>
              <select className="form-input form-select" value={editForm.estado} onChange={e => setEditForm(f => ({ ...f, estado: e.target.value }))}>
                <option value="Pendiente">Pendiente</option>
                <option value="En curso">En curso</option>
                <option value="Finalizado">Finalizado</option>
              </select>
            </div>
          </div>
          <div className="btn-row">
            <button className="btn-secondary" onClick={() => setEditando(null)}>Cancelar</button>
            <button className="btn-primary" onClick={guardarEdicion}>Guardar cambios</button>
          </div>
        </div>
      ) : (
        <>
          <div className="order-header">
            <div style={{ flex: 1 }}>
              <div className="order-id">#{String(o.id).padStart(4, "0")} · {o.tipo}</div>
              <div className="order-desc" style={{ marginTop: 4, color: finalizada ? "#6b7280" : "#374151" }}>{o.descripcion}</div>
            </div>
            <div className="order-badges">
              {o.prioridad && <span className={"badge badge-" + o.prioridad.toLowerCase()}>{o.prioridad}</span>}
              <span className={"badge badge-" + (o.estado === "Finalizado" ? "finalizado" : o.estado === "En curso" ? "curso" : "pendiente")}>{o.estado}</span>
            </div>
          </div>
          <div className="order-meta">
            <span>📅 {o.fecha}</span><span>👤 {o.usuario}</span><span>📍 {o.sector}</span>
          </div>
          {o.resolucion && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#16a34a" }}>
              ✓ {o.resolucion.tecnico} · {o.resolucion.tiempo}
            </div>
          )}
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {!finalizada && (
              <button className="btn-primary" style={{ padding: "7px 18px", fontSize: 13 }} onClick={() => setModal(o)}>
                {o.estado === "Pendiente" ? "Aceptar y ver detalle" : "Cargar resolución"}
              </button>
            )}
            {esAdmin && <>
              <button onClick={() => iniciarEdicion(o)} style={{ padding: "7px 14px", fontSize: 13, borderRadius: 8, border: "1px solid rgba(34,197,94,0.4)", background: "transparent", color: "#4ade80", cursor: "pointer" }}>
                ✏️ Editar
              </button>
              <button onClick={() => eliminarOrden(o.id)} style={{ padding: "7px 14px", fontSize: 13, borderRadius: 8, border: "1px solid rgba(220,38,38,0.4)", background: "transparent", color: "#f87171", cursor: "pointer" }}>
                🗑️ Eliminar
              </button>
            </>}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>Panel de Mantenimiento</h1>
        <p>Solicitudes asignadas al área.{esAdmin && <span style={{ color: "#f97316", marginLeft: 8, fontSize: 13 }}>· Modo administrador</span>}</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-label">Pendientes</div><div className="stat-val">{activas.filter(o => o.estado === "Pendiente").length}</div></div>
        <div className="stat-card"><div className="stat-label">En curso</div><div className="stat-val" style={{ color: "#ea580c" }}>{activas.filter(o => o.estado === "En curso").length}</div></div>
        <div className="stat-card"><div className="stat-label">Finalizados</div><div className="stat-val" style={{ color: "#16a34a" }}>{finalizadas.length}</div></div>
        <div className="stat-card"><div className="stat-label">Urgentes</div><div className="stat-val" style={{ color: "#dc2626" }}>{activas.filter(o => o.prioridad === "Urgente").length}</div></div>
      </div>

      <div className="card">
        <div className="card-title">Solicitudes activas</div>
        {activas.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🔧</div><div className="empty-text">Sin solicitudes activas en este momento.</div></div>
        ) : activas.sort((a, b) => a.prioridad === "Urgente" ? -1 : 1).map(o => <OrdenCard key={o.id} o={o} />)}
      </div>

      {finalizadas.length > 0 && (
        <div className="card">
          <div className="card-title">Órdenes finalizadas</div>
          {finalizadas.map(o => <OrdenCard key={o.id} o={o} finalizada />)}
        </div>
      )}
    </div>
  );
}