import { useState } from "react";
import { AREAS, SECTORES, TIPOS, crearOrden } from "../data/datos";

function nowStr() {
  return new Date().toLocaleString("es-AR", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

const PRIORIDADES = [
  { key: "Baja", color: "#16a34a", bg: "rgba(22,163,74,0.15)", fill: 33, label: "Sin urgencia inmediata" },
  { key: "Moderada", color: "#d97706", bg: "rgba(217,119,6,0.15)", fill: 66, label: "Requiere atención pronto" },
  { key: "Urgente", color: "#dc2626", bg: "rgba(220,38,38,0.15)", fill: 100, label: "Atención inmediata" },
];

const cardStyle = { background: "rgba(10, 22, 40, 0.9)", border: "1px solid rgba(34, 197, 94, 0.2)", marginBottom: "1.5rem" };
const titleStyle = { fontSize: 16, fontWeight: 700, color: "#f0fdf4" };
const labelStyle = { fontWeight: 700, color: "#4ade80" };

const Termometro = ({ value, onChange }) => {
  const selected = PRIORIDADES.find((p) => p.key === value);
  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "stretch", marginBottom: 16 }}>
        {PRIORIDADES.map((p) => (
          <div
            key={p.key}
            onClick={() => onChange(p.key)}
            style={{
              flex: 1, padding: "14px 10px", borderRadius: 10, cursor: "pointer",
              border: `2px solid ${value === p.key ? p.color : "rgba(255,255,255,0.1)"}`,
              background: value === p.key ? p.bg : "rgba(255,255,255,0.05)",
              textAlign: "center", transition: "all 0.2s",
              transform: value === p.key ? "translateY(-3px)" : "none",
              boxShadow: value === p.key ? `0 4px 12px ${p.color}40` : "none",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: value === p.key ? p.color : "#6b7280" }}>{p.key}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 20, height: 16, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 20,
          width: selected ? `${selected.fill}%` : "0%",
          background: selected ? `linear-gradient(90deg, #16a34a, ${selected.color})` : "transparent",
          transition: "all 0.4s ease",
        }} />
      </div>
      {selected && (
        <div style={{ marginTop: 8, fontSize: 13, color: selected.color, fontWeight: 500, textAlign: "center" }}>
          {selected.label}
        </div>
      )}
    </div>
  );
};

export default function TabSolicitud({ usuario, ordenes, setOrdenes, showAlert }) {
  const empty = { destino: [], sector: usuario.sector, area: usuario.area, tipo: "", descripcion: "", prioridad: "", adjunto: null };
  const [form, setForm] = useState(empty);
  const [done, setDone] = useState(false);

  const toggleDest = (a) =>
    setForm((f) => ({
      ...f,
      destino: f.destino.includes(a) ? f.destino.filter((x) => x !== a) : [...f.destino, a],
    }));

  const handleSave = async () => {
    if (!form.destino.length || !form.tipo || !form.descripcion.trim() || !form.prioridad) {
      showAlert("Completá todos los campos obligatorios.", "info");
      return;
    }
    const nueva = {
      fecha: nowStr(),
      usuario: usuario.nombre,
      sector: form.sector,
      area: form.area,
      destino: JSON.stringify(form.destino),
      tipo: form.tipo,
      descripcion: form.descripcion,
      prioridad: form.prioridad,
      estado: form.tipo === "Solicitud de trabajo" ? "Pendiente" : "Enviado",
      resolucion: null,
    };
    const guardada = await crearOrden(nueva);
    if (guardada) {
      setOrdenes((o) => [{ ...guardada, destino: form.destino }, ...o]);
      setDone(true);
      setTimeout(() => handleReset(), 2500);
    } else {
      showAlert("Error al guardar la solicitud. Intentá de nuevo.", "info");
    }
  };

  const handleReset = () => { setForm(empty); setDone(false); };

  if (done) return (
    <div style={{
      minHeight: "calc(100vh - 52px)",
      margin: "-2rem -1.5rem",
      background: "linear-gradient(135deg, #0a1628 0%, #0d2a1a 40%, #0a1628 70%, #091420 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 24, animation: "fadeIn 1.5s ease",
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
      `}</style>
      <div style={{ animation: "pulse 2.0s ease infinite" }}>
        <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
          <path d="M50 18 C50 18 62 8 72 12" stroke="#4ade80" strokeWidth="3" strokeLinecap="round"/>
          <path d="M50 24 C36 24 22 34 20 50 C17 68 26 86 36 90 C41 92 46 90 50 90 C54 90 59 92 64 90 C74 86 83 68 80 50 C78 34 64 24 50 24Z" fill="#16a34a"/>
          <path d="M50 24 C50 24 44 32 44 40" stroke="#15803d" strokeWidth="2" strokeLinecap="round"/>
          <path d="M34 42 C34 42 28 52 30 64" stroke="#15803d" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
        </svg>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#4ade80", marginBottom: 8 }}>EnVi</div>
        <div style={{ fontSize: 16, color: "#f0fdf4", marginBottom: 4 }}>Solicitud enviada correctamente</div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>La solicitud fue registrada en el sistema.</div>
      </div>
    </div>
  );

  return (
    <div style={{
      background: "linear-gradient(135deg, #0a1628 0%, #0d2a1a 40%, #0a1628 70%, #091420 100%)",
      minHeight: "calc(100vh - 52px)",
      margin: "-2rem -1.5rem",
      padding: "2rem 1.5rem",
    }}>
      <div className="card" style={cardStyle}>
        <div className="card-title" style={titleStyle}>Destino</div>
        <div className="form-row">
          <label className="form-label" style={labelStyle}>Áreas destinatarias *</label>
          <div className="check-group">
            {AREAS.map((a) => (
              <div key={a}
                className={"check-pill" + (form.destino.includes(a) ? " selected" : "")}
                onClick={() => toggleDest(a)}
                // style={{ background: form.destino.includes(a) ? "rgba(22,163,74,0.2)" : "rgba(255,255,255,0.05)", borderColor: form.destino.includes(a) ? "#16a34a" : "rgba(255,255,255,0.15)", color: form.destino.includes(a) ? "#4ade80" : "#9ca3af" }}padding: "10px 50px", fontSize: 14
              >{a}</div>
            ))}
          </div>
        </div>
        <div className="form-row">
          <label className="form-label" style={labelStyle}>Tipo de solicitud *</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TIPOS.map((t) => (
              <div key={t} onClick={() => setForm((f) => ({ ...f, tipo: t }))}
                style={{
                  padding: "10px 50px", borderRadius: 50, cursor: "pointer", fontSize: 13,
                  border: `1.5px solid ${form.tipo === t ? "#16a34a" : "rgba(255,255,255,0.15)"}`,
                  background: form.tipo === t ? "rgba(22,163,74,0.2)" : "rgba(255,255,255,0.05)",
                  color: form.tipo === t ? "#4ade80" : "#9ca3af",
                  fontWeight: form.tipo === t ? 600 : 400,
                  transition: "all 0.15s",
                }}
              >{t}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <div className="card-title" style={titleStyle}>Contenido</div>
        <div className="form-row">
          <label className="form-label" style={labelStyle}>Descripción *</label>
          <textarea className="form-input form-textarea" value={form.descripcion}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
            placeholder="Describí en detalle la solicitud, problema o aviso..."
            style={{ minHeight: 120, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(34,197,94,0.2)", color: "#f0fdf4" }}
          />
        </div>
        <div className="form-row">
          <label className="form-label" style={labelStyle}>Adjunto (imagen o video)</label>
          <input type="file" accept="image/*,video/mp4" className="form-input"
            style={{ padding: "6px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(34,197,94,0.2)", color: "#f0fdf4" }}
            onChange={(e) => setForm((f) => ({ ...f, adjunto: e.target.files[0] }))}
          />
          {form.adjunto && <div style={{ marginTop: 8, fontSize: 13, color: "#4ade80" }}>✓ {form.adjunto.name}</div>}
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <div className="card-title" style={titleStyle}>Nivel de prioridad *</div>
        <Termometro value={form.prioridad} onChange={(p) => setForm((f) => ({ ...f, prioridad: p }))} />
      </div>

      <div className="card" style={cardStyle}>
        <div className="card-title" style={titleStyle}>Origen</div>
        <div className="form-grid">
          <div className="form-row">
            <label className="form-label" style={labelStyle}>Fecha de solicitud</label>
            <input className="form-input" readOnly value={nowStr()} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(34,197,94,0.2)", color: "#9ca3af" }} />
          </div>
          <div className="form-row">
            <label className="form-label" style={labelStyle}>Solicitante</label>
            <input className="form-input" readOnly value={usuario.nombre} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(34,197,94,0.2)", color: "#9ca3af" }} />
          </div>
        </div>
        <div className="form-grid">
          <div className="form-row">
            <label className="form-label" style={labelStyle}>Sección de origen</label>
            <select className="form-input form-select" value={form.sector}
              onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
              style={{ background: "#0a1628", border: "1px solid rgba(34,197,94,0.2)", color: "#f0fdf4" }}
            >
              {SECTORES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label className="form-label" style={labelStyle}>Área de origen</label>
            <select className="form-input form-select" value={form.area}
              onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
              style={{ background: "#0a1628", border: "1px solid rgba(34,197,94,0.2)", color: "#f0fdf4" }}
            >
              {AREAS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <div className="btn-row">
          <button className="btn-secondary" onClick={handleReset} style={{ borderColor: "rgba(255,255,255,0.2)", color: "#9ca3af", background: "transparent" }}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave}>Guardar solicitud</button>
        </div>
      </div>
    </div>
  );
}