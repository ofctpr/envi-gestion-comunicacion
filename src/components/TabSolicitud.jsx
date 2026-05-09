import { useState } from "react";
import { AREAS, SECTORES, TIPOS, PRIORIDADES, crearOrden } from "../data/datos";

function nowStr() {
  return new Date().toLocaleString("es-AR", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function TabSolicitud({ usuario, ordenes, setOrdenes, showAlert }) {
  const empty = { destino: [], sector: usuario.sector, area: usuario.area, tipo: "", descripcion: "", prioridad: "" };
  const [form, setForm] = useState(empty);
  const [done, setDone] = useState(false);

  const needsPrio = form.tipo === "Solicitud de trabajo";

  const toggleDest = (a) =>
    setForm((f) => ({
      ...f,
      destino: f.destino.includes(a) ? f.destino.filter((x) => x !== a) : [...f.destino, a],
    }));

  const handleSave = async () => {
    if (!form.destino.length || !form.tipo || !form.descripcion.trim() || (needsPrio && !form.prioridad)) {
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
      prioridad: needsPrio ? form.prioridad : null,
      estado: form.tipo === "Solicitud de trabajo" ? "Pendiente" : "Enviado",
      resolucion: null,
    };
    const guardada = await crearOrden(nueva);
    if (guardada) {
      setOrdenes((o) => [{ ...guardada, destino: form.destino }, ...o]);
      setDone(true);
    } else {
      showAlert("Error al guardar la solicitud. Intentá de nuevo.", "info");
    }
  };

  const handleReset = () => { setForm(empty); setDone(false); };

  if (done) return (
    <div>
      <div className="page-header"><h1>Nueva solicitud</h1></div>
      <div className="card">
        <div className="success-box">
          <div className="success-icon">✅</div>
          <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Solicitud enviada correctamente</h2>
          <p style={{ color: "#6b7280", marginBottom: 24 }}>La solicitud fue registrada en el sistema.</p>
          <button className="btn-primary" onClick={handleReset}>Cargar nueva solicitud</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1>Nueva solicitud de trabajo</h1>
        <p>Cargá una orden, solicitud o comunicado.</p>
      </div>
      <div className="card">
        <div className="card-title">Destino y origen</div>
        <div className="form-row">
          <label className="form-label">Áreas destinatarias *</label>
          <div className="check-group">
            {AREAS.map((a) => (
              <div key={a} className={"check-pill" + (form.destino.includes(a) ? " selected" : "")} onClick={() => toggleDest(a)}>{a}</div>
            ))}
          </div>
        </div>
        <div className="form-grid">
          <div className="form-row">
            <label className="form-label">Fecha de solicitud</label>
            <input className="form-input" readOnly value={nowStr()} />
          </div>
          <div className="form-row">
            <label className="form-label">Solicitante</label>
            <input className="form-input" readOnly value={usuario.nombre} />
          </div>
        </div>
        <div className="form-grid">
          <div className="form-row">
            <label className="form-label">Sección de origen</label>
            <select className="form-input form-select" value={form.sector} onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}>
              {SECTORES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label className="form-label">Área de origen</label>
            <select className="form-input form-select" value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}>
              {AREAS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">Tipo y contenido</div>
        <div className="form-row">
          <label className="form-label">Tipo de solicitud *</label>
          <select className="form-input form-select" value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value, prioridad: "" }))}>
            <option value="">— Seleccionar tipo —</option>
            {TIPOS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-row">
          <label className="form-label">Descripción *</label>
          <textarea className="form-input form-textarea" value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} placeholder="Describí en detalle la solicitud, problema o aviso..." />
        </div>
        {needsPrio && (
          <div className="form-row">
            <label className="form-label">Prioridad *</label>
            <div className="prio-group">
              {PRIORIDADES.map((p) => (
                <button key={p} className={"prio-btn prio-" + p.toLowerCase() + (form.prioridad === p ? " selected" : "")} onClick={() => setForm((f) => ({ ...f, prioridad: p }))}>{p}</button>
              ))}
            </div>
          </div>
        )}
        <div className="btn-row">
          <button className="btn-secondary" onClick={handleReset}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave}>Guardar solicitud</button>
        </div>
      </div>
    </div>
  );
}