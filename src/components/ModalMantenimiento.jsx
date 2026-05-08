import { useState } from "react";
import { MAQUINAS } from "../data/datos";

export default function ModalMantenimiento({ orden, onClose, setOrdenes, showAlert }) {
  const [step, setStep] = useState(orden.estado === "En curso" ? "resolucion" : "detalle");
  const [resolucion, setResolucion] = useState({ tecnico: "", tiempo: "", repuesto: "", herramientas: "", detalle: "" });

  const maquinaKey = Object.keys(MAQUINAS).find((k) =>
    orden.descripcion.toLowerCase().includes(k.toLowerCase())
  );
  const maquina = maquinaKey ? MAQUINAS[maquinaKey] : null;

  const aceptar = () => {
    setOrdenes((os) => os.map((o) => o.id === orden.id ? { ...o, estado: "En curso" } : o));
    setStep("resolucion");
  };

  const finalizar = () => {
    if (!resolucion.tecnico || !resolucion.tiempo || !resolucion.detalle) {
      showAlert("Completá los campos obligatorios.", "info");
      return;
    }
    const herrs = resolucion.herramientas.split(",").map((h) => h.trim()).filter(Boolean);
    setOrdenes((os) => os.map((o) => o.id === orden.id ? { ...o, estado: "Finalizado", resolucion: { ...resolucion, herramientas: herrs } } : o));
    showAlert("Resolución cargada correctamente. ✓");
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">
          Orden #{String(orden.id).padStart(4, "0")} — {orden.tipo}
          {orden.prioridad && <span className={"badge badge-" + orden.prioridad.toLowerCase()}>{orden.prioridad}</span>}
        </div>

        {step === "detalle" && <>
          <div className="modal-section">
            <div className="modal-section-title">Descripción de la solicitud</div>
            <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{orden.descripcion}</p>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>Solicitado por {orden.usuario} · {orden.fecha} · Desde {orden.sector}</p>
          </div>
          {maquina ? <>
            <div className="modal-section">
              <div className="modal-section-title">🔧 Herramientas sugeridas</div>
              <div className="tool-list">{maquina.herramientas.map((h) => <span key={h} className="tool-chip">{h}</span>)}</div>
            </div>
            <div className="modal-section">
              <div className="modal-section-title">📄 Manual técnico</div>
              <span className="tool-chip" style={{ background: "#eff6ff", color: "#2563eb" }}>📘 {maquina.manual}</span>
            </div>
            <div className="modal-section">
              <div className="modal-section-title">📋 Historial de reparaciones</div>
              {maquina.historico.map((h, i) => {
                const [fecha, ...desc] = h.split(": ");
                return <div key={i} className="hist-item"><span className="hist-date">{fecha}</span> — {desc.join(": ")}</div>;
              })}
            </div>
          </> : (
            <div className="modal-section">
              <p style={{ fontSize: 13, color: "#9ca3af" }}>No se encontró maquinaria específica. Revisá manualmente los recursos necesarios.</p>
            </div>
          )}
          <div className="btn-row">
            <button className="btn-secondary" onClick={onClose}>Cerrar</button>
            <button className="btn-primary" onClick={aceptar}>Aceptar orden →</button>
          </div>
        </>}

        {step === "resolucion" && <>
          <div className="modal-section">
            <div className="modal-section-title">Solicitud original</div>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>{orden.descripcion}</p>
          </div>
          <div className="resol-form">
            <div className="resol-form-title">Formulario de resolución</div>
            <div className="form-grid">
              <div className="form-row">
                <label className="form-label">Técnico responsable *</label>
                <input className="form-input" value={resolucion.tecnico} onChange={(e) => setResolucion((r) => ({ ...r, tecnico: e.target.value }))} placeholder="Nombre del técnico" />
              </div>
              <div className="form-row">
                <label className="form-label">Tiempo empleado *</label>
                <input className="form-input" value={resolucion.tiempo} onChange={(e) => setResolucion((r) => ({ ...r, tiempo: e.target.value }))} placeholder="Ej: 2h 30min" />
              </div>
            </div>
            <div className="form-row">
              <label className="form-label">Repuesto utilizado</label>
              <input className="form-input" value={resolucion.repuesto} onChange={(e) => setResolucion((r) => ({ ...r, repuesto: e.target.value }))} placeholder="Nombre del repuesto (si aplica)" />
            </div>
            <div className="form-row">
              <label className="form-label">Herramientas utilizadas</label>
              <input className="form-input" value={resolucion.herramientas} onChange={(e) => setResolucion((r) => ({ ...r, herramientas: e.target.value }))} placeholder="Separadas por coma: Llave allen, Calibre..." />
            </div>
            <div className="form-row">
              <label className="form-label">Descripción de la solución *</label>
              <textarea className="form-input form-textarea" value={resolucion.detalle} onChange={(e) => setResolucion((r) => ({ ...r, detalle: e.target.value }))} placeholder="Detallá la solución implementada..." />
            </div>
          </div>
          <div className="btn-row">
            <button className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn-primary" onClick={finalizar}>Finalizar y guardar</button>
          </div>
        </>}
      </div>
    </div>
  );
}