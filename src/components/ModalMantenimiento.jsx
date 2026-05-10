import { useState, useEffect } from "react";
import { getMaquinasPorCategoria } from "../data/datos";
import { actualizarOrden } from "../data/datos";

export default function ModalMantenimiento({ orden, onClose, setOrdenes, showAlert }) {
  const [step, setStep] = useState(orden.estado === "En curso" ? "resolucion" : "detalle");
  const [resolucion, setResolucion] = useState({ tecnico: "", tiempo: "", repuesto: "", herramientas: "", detalle: "" });
  const [equiposInfo, setEquiposInfo] = useState([]);

  useEffect(() => {
    const codigos = [];
    const regex = /\[(?:Equipos:\s*)?([A-Z0-9-]+) - ([^\]]+)\]/g;
    let match;
    while ((match = regex.exec(orden.descripcion)) !== null) {
      codigos.push({ codigo: match[1], nombre: match[2] });
    }

    if (codigos.length > 0) {
      Promise.all([
        getMaquinasPorCategoria("Producción"),
        getMaquinasPorCategoria("Sistemas"),
        getMaquinasPorCategoria("Ingeniería"),
      ]).then(([prod, sis, ing]) => {
        const todas = [...prod, ...sis, ...ing];
        const encontradas = codigos.map(c => todas.find(m => m.codigo === c.codigo)).filter(Boolean);
        setEquiposInfo(encontradas);
      });
    }
  }, []);

  const aceptar = async () => {
    await actualizarOrden(orden.id, { estado: "En curso" });
    setOrdenes((os) => os.map((o) => o.id === orden.id ? { ...o, estado: "En curso" } : o));
    setStep("resolucion");
  };

  const finalizar = async () => {
    if (!resolucion.tecnico || !resolucion.tiempo || !resolucion.detalle) {
      showAlert("Completá los campos obligatorios.", "info");
      return;
    }
    const herrs = resolucion.herramientas.split(",").map((h) => h.trim()).filter(Boolean);
    const resolucionFinal = { ...resolucion, herramientas: herrs };
    await actualizarOrden(orden.id, { estado: "Finalizado", resolucion: resolucionFinal });
    setOrdenes((os) => os.map((o) => o.id === orden.id ? { ...o, estado: "Finalizado", resolucion: resolucionFinal } : o));
    showAlert("Resolución cargada correctamente. ✓");
    onClose();
  };

  const descLimpia = orden.descripcion.replace(/\[[^\]]+\]/g, "").trim();

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">
          Orden #{String(orden.id).padStart(4, "0")} — {orden.tipo}
          {orden.prioridad && <span className={"badge badge-" + orden.prioridad.toLowerCase()} style={{ marginLeft: 8 }}>{orden.prioridad}</span>}
        </div>

        {step === "detalle" && <>
          <div className="modal-section">
            <div className="modal-section-title">Descripción de la solicitud</div>
            <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{descLimpia}</p>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>Solicitado por {orden.usuario} · {orden.fecha} · Desde {orden.sector}</p>
          </div>

          {equiposInfo.length > 0 && <>
            <div className="modal-section">
              <div className="modal-section-title">🖥️ Equipos involucrados</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {equiposInfo.map((m, i) => (
                  <span key={i} style={{ padding: "4px 12px", borderRadius: 6, background: "#eff6ff", color: "#2563eb", fontSize: 12, fontFamily: "monospace" }}>
                    {m.codigo} — {m.nombre}
                  </span>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <div className="modal-section-title">🔧 Herramientas sugeridas</div>
              <div className="tool-list">
                {[...new Set(equiposInfo.flatMap(m =>
                  Array.isArray(m.herramientas) ? m.herramientas : JSON.parse(m.herramientas || "[]")
                ))].map((h, i) => <span key={i} className="tool-chip">{h}</span>)}
              </div>
            </div>

            <div className="modal-section">
              <div className="modal-section-title">🧴 Insumos necesarios</div>
              <div className="tool-list">
                {[...new Set(equiposInfo.flatMap(m =>
                  Array.isArray(m.insumos) ? m.insumos : JSON.parse(m.insumos || "[]")
                ))].filter(Boolean).map((ins, i) => (
                  <span key={i} className="tool-chip" style={{ background: "#fffbeb", color: "#d97706" }}>{ins}</span>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <div className="modal-section-title">📄 Manuales técnicos</div>
              <div className="tool-list">
                {equiposInfo.map((m, i) => (
                  <span key={i} className="tool-chip" style={{ background: "#eff6ff", color: "#2563eb" }}>
                    📘 {m.manual}
                  </span>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <div className="modal-section-title">⚙️ Complejidad</div>
              <div className="tool-list">
                {equiposInfo.map((m, i) => (
                  <span key={i} className="tool-chip" style={{
                    background: m.complejidad === "Alta" ? "#fef2f2" : m.complejidad === "Media" ? "#fffbeb" : "#f0fdf4",
                    color: m.complejidad === "Alta" ? "#dc2626" : m.complejidad === "Media" ? "#d97706" : "#16a34a"
                  }}>
                    {m.nombre}: {m.complejidad}
                  </span>
                ))}
              </div>
            </div>
          </>}

          {equiposInfo.length === 0 && (
            <div className="modal-section">
              <p style={{ fontSize: 13, color: "#9ca3af" }}>No se identificaron equipos específicos en esta solicitud.</p>
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
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>{descLimpia}</p>
            {equiposInfo.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {equiposInfo.map((m, i) => (
                  <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#eff6ff", color: "#2563eb", fontFamily: "monospace" }}>{m.codigo}</span>
                ))}
              </div>
            )}
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
              <input className="form-input" value={resolucion.herramientas} onChange={(e) => setResolucion((r) => ({ ...r, herramientas: e.target.value }))} placeholder="Separadas por coma..." />
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