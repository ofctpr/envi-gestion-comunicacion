import { useState, useEffect } from "react";
import { AREAS, SECTORES, TIPOS, crearOrden, getMaquinasPorCategoria } from "../data/datos";

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
const titleStyle = { fontSize: 18, fontWeight: 700, color: "#f0fdf4" };
const labelStyle = { fontWeight: 700, color: "#4ade80", fontSize: 14 };

const CATEGORIA_MAP = {
  "Mantenimiento": "Producción",
  "Sistemas": "Sistemas",
  "Ingeniería": "Ingeniería",
};

const ARBOL_MANTENIMIENTO = {
  inicio: { pregunta: "¿Qué tipo de falla es?", opciones: [{ label: "Eléctrica", next: "electrica" }, { label: "Mecánica", next: "mecanica" }, { label: "Hidráulica", next: "hidraulica" }, { label: "Desconozco", next: "nosabe_tipo" }] },
  electrica: { pregunta: "¿Hay humo, chispa o olor a quemado?", opciones: [{ label: "Sí", resultado: { personas: 2, nota: "Posible falla eléctrica grave. Cortar alimentación antes de intervenir.", riesgo: "Alto" } }, { label: "No", next: "electrica_2" }, { label: "Desconozco", resultado: { personas: 2, nota: "Ante la duda, precaución máxima.", riesgo: "Alto" } }] },
  electrica_2: { pregunta: "¿El equipo se apagó completamente o es una falla parcial?", opciones: [{ label: "Se apagó completamente", resultado: { personas: 2, nota: "Falla eléctrica total. Verificar tablero y fusibles.", riesgo: "Medio" } }, { label: "Falla parcial", resultado: { personas: 1, nota: "Falla eléctrica parcial. Verificar conexiones y componentes.", riesgo: "Bajo" } }, { label: "Desconozco", resultado: { personas: 2, nota: "Ante la duda se sugieren 2 personas por precaución.", riesgo: "Medio" } }] },
  mecanica: { pregunta: "¿Requiere desmontaje de componentes?", opciones: [{ label: "Sí", next: "mecanica_2" }, { label: "No", resultado: { personas: 1, nota: "Intervención mecánica simple. Sin desmontaje mayor.", riesgo: "Bajo" } }, { label: "Desconozco", resultado: { personas: 2, nota: "Se sugieren 2 personas por si requiere desmontaje.", riesgo: "Medio" } }] },
  mecanica_2: { pregunta: "¿El componente a desmontar es pesado o de gran tamaño?", opciones: [{ label: "Sí", resultado: { personas: 3, nota: "Desmontaje de componente pesado. Se requiere personal adicional.", riesgo: "Alto" } }, { label: "No", resultado: { personas: 2, nota: "Desmontaje estándar. Se recomienda trabajo en pareja.", riesgo: "Medio" } }, { label: "Desconozco", resultado: { personas: 3, nota: "Ante la duda se sugieren 3 personas por seguridad.", riesgo: "Alto" } }] },
  hidraulica: { pregunta: "¿Hay pérdida de fluido visible?", opciones: [{ label: "Sí", resultado: { personas: 2, nota: "Pérdida de fluido hidráulico. Verificar sellos y mangueras. Usar EPP.", riesgo: "Medio" } }, { label: "No", resultado: { personas: 1, nota: "Falla hidráulica sin pérdida visible. Verificar presión y válvulas.", riesgo: "Bajo" } }, { label: "Desconozco", resultado: { personas: 2, nota: "Se sugieren 2 personas por precaución.", riesgo: "Medio" } }] },
  nosabe_tipo: { pregunta: "¿El equipo está completamente fuera de servicio?", opciones: [{ label: "Sí, está apagado", resultado: { personas: 2, nota: "Equipo fuera de servicio. Evaluación completa antes de intervenir.", riesgo: "Medio" } }, { label: "Funciona con problemas", resultado: { personas: 1, nota: "Falla parcial. Un técnico puede hacer la evaluación inicial.", riesgo: "Bajo" } }, { label: "Desconozco", resultado: { personas: 2, nota: "Sin información suficiente. Se sugieren 2 personas para evaluación.", riesgo: "Medio" } }] },
};

const ARBOL_SISTEMAS = {
  inicio: { pregunta: "¿Qué tipo de falla es?", opciones: [{ label: "Software", next: "software" }, { label: "Hardware", next: "hardware" }, { label: "Red / Conectividad", next: "red" }, { label: "Desconozco", resultado: { personas: 1, nota: "Un técnico hará la evaluación inicial.", riesgo: "Bajo" } }] },
  software: { pregunta: "¿La falla afecta a más de un equipo?", opciones: [{ label: "Sí", resultado: { personas: 2, nota: "Falla de sistema múltiple. Puede requerir intervención en servidor.", riesgo: "Medio" } }, { label: "No", resultado: { personas: 1, nota: "Falla de software individual. Intervención técnica estándar.", riesgo: "Bajo" } }, { label: "Desconozco", resultado: { personas: 1, nota: "Intervención técnica de software.", riesgo: "Bajo" } }] },
  hardware: { pregunta: "¿Es un servidor o equipo crítico?", opciones: [{ label: "Sí", resultado: { personas: 2, nota: "Equipo crítico. Intervención con respaldo técnico.", riesgo: "Alto" } }, { label: "No", resultado: { personas: 1, nota: "Equipo estándar. Intervención técnica individual.", riesgo: "Bajo" } }, { label: "Desconozco", resultado: { personas: 2, nota: "Se sugieren 2 personas por precaución.", riesgo: "Medio" } }] },
  red: { pregunta: "¿Afecta a toda la red o a un sector específico?", opciones: [{ label: "Toda la red", resultado: { personas: 2, nota: "Falla de red general. Verificar switches y servidores.", riesgo: "Alto" } }, { label: "Un sector", resultado: { personas: 1, nota: "Falla de red local. Verificar switch y cables del sector.", riesgo: "Bajo" } }, { label: "Desconozco", resultado: { personas: 2, nota: "Se sugieren 2 personas para diagnóstico de red.", riesgo: "Medio" } }] },
};

const ARBOL_INGENIERIA = {
  inicio: { pregunta: "¿Qué tipo de falla es?", opciones: [{ label: "Mecánica", next: "mecanica" }, { label: "Eléctrica", next: "electrica" }, { label: "Software / CAD", next: "software" }, { label: "Estructura / Civil", next: "estructura" }, { label: "Desconozco", resultado: { personas: 2, nota: "Se sugieren 2 personas para evaluación inicial.", riesgo: "Medio" } }] },
  mecanica: { pregunta: "¿Requiere desmontaje?", opciones: [{ label: "Sí", resultado: { personas: 2, nota: "Desmontaje requerido. Se recomienda trabajo en pareja.", riesgo: "Medio" } }, { label: "No", resultado: { personas: 1, nota: "Sin desmontaje. Intervención individual.", riesgo: "Bajo" } }, { label: "Desconozco", resultado: { personas: 2, nota: "Se sugieren 2 personas por precaución.", riesgo: "Medio" } }] },
  electrica: { pregunta: "¿Hay riesgo eléctrico visible?", opciones: [{ label: "Sí", resultado: { personas: 2, nota: "Riesgo eléctrico. Cortar alimentación antes de intervenir.", riesgo: "Alto" } }, { label: "No", resultado: { personas: 1, nota: "Sin riesgo visible. Intervención estándar.", riesgo: "Bajo" } }, { label: "Desconozco", resultado: { personas: 2, nota: "Ante la duda, precaución máxima.", riesgo: "Alto" } }] },
  software: { pregunta: "¿Afecta a más de un equipo?", opciones: [{ label: "Sí", resultado: { personas: 2, nota: "Falla de software múltiple.", riesgo: "Medio" } }, { label: "No", resultado: { personas: 1, nota: "Falla individual de software.", riesgo: "Bajo" } }, { label: "Desconozco", resultado: { personas: 1, nota: "Intervención técnica individual.", riesgo: "Bajo" } }] },
  estructura: { pregunta: "¿Requiere trabajo en altura?", opciones: [{ label: "Sí", resultado: { personas: 3, nota: "Trabajo en altura. Arnés, línea de vida y personal en tierra.", riesgo: "Alto" } }, { label: "No", resultado: { personas: 2, nota: "Intervención estructural a nivel suelo.", riesgo: "Medio" } }, { label: "Desconozco", resultado: { personas: 3, nota: "Ante la duda se sugieren 3 personas.", riesgo: "Alto" } }] },
};

const ArbolDecision = ({ destinos, onResultado }) => {
  const arbol = destinos.includes("Mantenimiento") ? ARBOL_MANTENIMIENTO
    : destinos.includes("Sistemas") ? ARBOL_SISTEMAS
    : ARBOL_INGENIERIA;

  const [paso, setPaso] = useState("inicio");
  const [historial, setHistorial] = useState([]);
  const [completado, setCompletado] = useState(false);

  const nodoActual = arbol[paso];

  const elegir = (opcion) => {
    setHistorial(h => [...h, opcion.label]);
    if (opcion.resultado) {
      setCompletado(true);
      onResultado(opcion.resultado);
    } else if (opcion.next) {
      setPaso(opcion.next);
    }
  };

  return (
    <div>
      {historial.length > 0 && (
        <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {historial.map((h, i) => (
            <span key={i} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20, background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}>{h}</span>
          ))}
        </div>
      )}
      {!completado ? (
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#f0fdf4", marginBottom: 16 }}>{nodoActual.pregunta}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {nodoActual.opciones.map((o, i) => (
              <button key={i} onClick={() => elegir(o)} style={{
                padding: "12px 24px", borderRadius: 8, cursor: "pointer", fontSize: 14,
                border: "1.5px solid rgba(34,197,94,0.3)", background: "rgba(255,255,255,0.05)",
                color: "#f0fdf4", transition: "all 0.15s", fontFamily: "DM Sans, sans-serif",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(22,163,74,0.2)"; e.currentTarget.style.borderColor = "#16a34a"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(34,197,94,0.3)"; }}
              >{o.label}</button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(22,163,74,0.2)", border: "2px solid #16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✓</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#4ade80" }}>Diagnóstico completado</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>La información fue registrada para el técnico</div>
          </div>
        </div>
      )}
    </div>
  );
};

const SelectorMaquinas = ({ destinos, seleccionadas, onChange }) => {
  const [maquinas, setMaquinas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    setCargando(true);
    const categorias = [...new Set(destinos.map(d => CATEGORIA_MAP[d]).filter(Boolean))];
    if (categorias.length === 0) { setMaquinas([]); setCargando(false); return; }
    Promise.all(categorias.map(c => getMaquinasPorCategoria(c)))
      .then(resultados => {
        setMaquinas(resultados.flat());
        setCargando(false);
      });
  }, [destinos.join(",")]);

  const filtradas = maquinas.filter(m =>
    filtro === "" ||
    m.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    m.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
    m.tipo.toLowerCase().includes(filtro.toLowerCase()) ||
    m.ubicacion.toLowerCase().includes(filtro.toLowerCase())
  );

  const toggleMaquina = (m) => {
    const yaEsta = seleccionadas.find(s => s.codigo === m.codigo);
    if (yaEsta) {
      onChange(seleccionadas.filter(s => s.codigo !== m.codigo));
    } else {
      onChange([...seleccionadas, m]);
    }
  };

  if (cargando) return <div style={{ color: "#6b7280", fontSize: 13 }}>Cargando equipos...</div>;
  if (maquinas.length === 0) return <div style={{ color: "#6b7280", fontSize: 13 }}>No hay equipos registrados para esta área.</div>;

  return (
    <div>
      <input
        placeholder="Buscar por nombre, código, tipo o ubicación..."
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
        style={{ width: "100%", marginBottom: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "8px 14px", color: "#f0fdf4", fontSize: 13, outline: "none", fontFamily: "DM Sans, sans-serif" }}
      />
      {seleccionadas.length > 0 && (
        <div style={{ marginBottom: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {seleccionadas.map((m, i) => (
            <span key={i} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20, background: "rgba(34,197,94,0.2)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.4)", cursor: "pointer" }} onClick={() => toggleMaquina(m)}>
              {m.codigo} · {m.nombre} ✕
            </span>
          ))}
        </div>
      )}
      <div style={{ maxHeight: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        {filtradas.map((m, i) => {
          const seleccionada = seleccionadas.find(s => s.codigo === m.codigo);
          return (
            <div key={i} onClick={() => toggleMaquina(m)} style={{
              padding: "10px 14px", borderRadius: 8, cursor: "pointer",
              border: `1.5px solid ${seleccionada ? "#16a34a" : "rgba(255,255,255,0.1)"}`,
              background: seleccionada ? "rgba(22,163,74,0.15)" : "rgba(255,255,255,0.03)",
              transition: "all 0.15s",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 13, color: "#f0fdf4", fontWeight: 500 }}>{m.nombre}</span>
                  <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 8 }}>{m.ubicacion}</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#4ade80", fontFamily: "monospace", background: "rgba(34,197,94,0.1)", padding: "2px 8px", borderRadius: 4 }}>{m.codigo}</span>
                  {seleccionada && <span style={{ color: "#4ade80", fontSize: 16 }}>✓</span>}
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{m.tipo} · Complejidad {m.complejidad}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Termometro = ({ value, onChange }) => {
  const selected = PRIORIDADES.find((p) => p.key === value);
  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "stretch", marginBottom: 16 }}>
        {PRIORIDADES.map((p) => (
          <div key={p.key} onClick={() => onChange(p.key)} style={{
            flex: 1, padding: "16px 10px", borderRadius: 10, cursor: "pointer",
            border: `2px solid ${value === p.key ? p.color : "rgba(255,255,255,0.1)"}`,
            background: value === p.key ? p.bg : "rgba(255,255,255,0.05)",
            textAlign: "center", transition: "all 0.2s",
            transform: value === p.key ? "translateY(-3px)" : "none",
            boxShadow: value === p.key ? `0 4px 12px ${p.color}40` : "none",
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: value === p.key ? p.color : "#6b7280" }}>{p.key}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 20, height: 16, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 20, width: selected ? `${selected.fill}%` : "0%", background: selected ? `linear-gradient(90deg, #16a34a, ${selected.color})` : "transparent", transition: "all 0.4s ease" }} />
      </div>
      {selected && <div style={{ marginTop: 10, fontSize: 14, color: selected.color, fontWeight: 500, textAlign: "center" }}>{selected.label}</div>}
    </div>
  );
};

export default function TabSolicitud({ usuario, ordenes, setOrdenes, showAlert }) {
  const empty = { destino: [], sector: usuario.sector, area: usuario.area, tipo: "", maquinas: [], descripcion: "", prioridad: "", adjunto: null, diagnostico: null };
  const [form, setForm] = useState(empty);
  const [done, setDone] = useState(false);

  const destinosConEquipos = ["Mantenimiento", "Ingeniería", "Sistemas"];
  const esSolicitudTrabajo = form.tipo === "Solicitud de trabajo";
  const mostrarEquipos = esSolicitudTrabajo && form.destino.some(d => destinosConEquipos.includes(d));
  const mostrarDescripcion = form.tipo !== "";
  const mostrarArbol = esSolicitudTrabajo && form.descripcion.trim().length > 10 && form.destino.some(d => destinosConEquipos.includes(d));

  const toggleDest = (a) =>
    setForm((f) => ({ ...f, destino: f.destino.includes(a) ? f.destino.filter((x) => x !== a) : [...f.destino, a] }));

  const handleSave = async () => {
    if (!form.destino.length || !form.tipo || !form.descripcion.trim() || !form.prioridad) {
      showAlert("Completá todos los campos obligatorios.", "info"); return;
    }
    if (mostrarArbol && !form.diagnostico) {
      showAlert("Completá el diagnóstico de falla antes de guardar.", "info"); return;
    }
    const maquinasTexto = form.maquinas.length > 0
      ? `[Equipos: ${form.maquinas.map(m => `${m.codigo} - ${m.nombre}`).join(", ")}] `
      : "";
    const nueva = {
      fecha: nowStr(), usuario: usuario.nombre, sector: form.sector, area: form.area,
      destino: JSON.stringify(form.destino), tipo: form.tipo,
      descripcion: maquinasTexto + form.descripcion,
      prioridad: form.prioridad, estado: esSolicitudTrabajo ? "Pendiente" : "Enviado", resolucion: null,
    };
    const guardada = await crearOrden(nueva);
    if (guardada) {
      setOrdenes((o) => [{ ...guardada, destino: form.destino }, ...o]);
      setDone(true);
      setTimeout(() => handleReset(), 3000);
    } else {
      showAlert("Error al guardar la solicitud. Intentá de nuevo.", "info");
    }
  };

  const handleReset = () => { setForm(empty); setDone(false); };

  if (done) return (
    <div style={{ minHeight: "calc(100vh - 52px)", margin: "-2rem -1.5rem", background: "linear-gradient(135deg, #0a1628 0%, #0d2a1a 40%, #0a1628 70%, #091420 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}} @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}`}</style>
      <div style={{ animation: "fadeIn 0.5s ease forwards, pulse 1.5s ease 0.5s infinite" }}>
        <svg width="140" height="140" viewBox="0 0 100 100" fill="none">
          <path d="M50 18 C50 18 62 8 72 12" stroke="#4ade80" strokeWidth="3" strokeLinecap="round"/>
          <path d="M50 24 C36 24 22 34 20 50 C17 68 26 86 36 90 C41 92 46 90 50 90 C54 90 59 92 64 90 C74 86 83 68 80 50 C78 34 64 24 50 24Z" fill="#16a34a"/>
          <path d="M50 24 C50 24 44 32 44 40" stroke="#15803d" strokeWidth="2" strokeLinecap="round"/>
          <path d="M34 42 C34 42 28 52 30 64" stroke="#15803d" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
        </svg>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#4ade80", marginBottom: 8 }}>EnVi</div>
        <div style={{ fontSize: 18, color: "#f0fdf4", marginBottom: 4 }}>Solicitud enviada correctamente</div>
        <div style={{ fontSize: 14, color: "#6b7280" }}>La solicitud fue registrada en el sistema.</div>
      </div>
    </div>
  );

  return (
    <div style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d2a1a 40%, #0a1628 70%, #091420 100%)", minHeight: "calc(100vh - 52px)", margin: "-2rem -1.5rem", padding: "2rem 1.5rem" }}>

      <div className="card" style={cardStyle}>
        <div className="card-title" style={titleStyle}>Destino</div>
        <div className="form-row">
          <label className="form-label" style={labelStyle}>Áreas destinatarias *</label>
          <div className="check-group">
            {AREAS.map((a) => (
              <div key={a} className={"check-pill" + (form.destino.includes(a) ? " selected" : "")} onClick={() => toggleDest(a)}
                style={{ background: form.destino.includes(a) ? "rgba(22,163,74,0.2)" : "rgba(255,255,255,0.05)", borderColor: form.destino.includes(a) ? "#16a34a" : "rgba(255,255,255,0.15)", color: form.destino.includes(a) ? "#4ade80" : "#9ca3af", fontSize: 14, padding: "10px 18px" }}
              >{a}</div>
            ))}
          </div>
        </div>
        <div className="form-row">
          <label className="form-label" style={labelStyle}>Tipo de solicitud *</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {TIPOS.map((t) => (
              <div key={t} onClick={() => setForm((f) => ({ ...f, tipo: t, maquinas: [] }))}
                style={{ padding: "12px 32px", borderRadius: 50, cursor: "pointer", fontSize: 15, border: `1.5px solid ${form.tipo === t ? "#16a34a" : "rgba(255,255,255,0.15)"}`, background: form.tipo === t ? "rgba(22,163,74,0.2)" : "rgba(255,255,255,0.05)", color: form.tipo === t ? "#4ade80" : "#9ca3af", fontWeight: form.tipo === t ? 600 : 400, transition: "all 0.15s" }}
              >{t}</div>
            ))}
          </div>
        </div>
      </div>

      {mostrarEquipos && (
        <div className="card" style={{ ...cardStyle, borderColor: "rgba(34,197,94,0.4)" }}>
          <div className="card-title" style={titleStyle}>
            Equipos involucrados
            <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 400, marginLeft: 10 }}>
              Seleccioná uno o más equipos afectados
            </span>
          </div>
          <SelectorMaquinas
            destinos={form.destino}
            seleccionadas={form.maquinas}
            onChange={(m) => setForm(f => ({ ...f, maquinas: m }))}
          />
        </div>
      )}

      {mostrarDescripcion && (
        <div className="card" style={cardStyle}>
          <div className="card-title" style={titleStyle}>Contenido</div>
          <div className="form-row">
            <label className="form-label" style={labelStyle}>Descripción *</label>
            <textarea className="form-input form-textarea" value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              placeholder="Describí en detalle el problema o solicitud..."
              style={{ minHeight: 130, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(34,197,94,0.2)", color: "#f0fdf4", fontSize: 14 }}
            />
          </div>
          <div className="form-row">
            <label className="form-label" style={labelStyle}>Adjunto (imagen o video)</label>
            <input type="file" accept="image/*,video/mp4" className="form-input"
              style={{ padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(34,197,94,0.2)", color: "#f0fdf4", fontSize: 14 }}
              onChange={(e) => setForm((f) => ({ ...f, adjunto: e.target.files[0] }))}
            />
            {form.adjunto && <div style={{ marginTop: 8, fontSize: 14, color: "#4ade80" }}>✓ {form.adjunto.name}</div>}
          </div>
        </div>
      )}

      {mostrarArbol && (
        <div className="card" style={{ ...cardStyle, borderColor: "rgba(34,197,94,0.5)" }}>
          <div className="card-title" style={titleStyle}>
            🔍 Diagnóstico de falla
            <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 400, marginLeft: 10 }}>Respondé las preguntas para ayudar al técnico</span>
          </div>
          <ArbolDecision destinos={form.destino} onResultado={(r) => setForm(f => ({ ...f, diagnostico: r }))} />
        </div>
      )}

      {form.descripcion.trim().length > 0 && (
        <div className="card" style={cardStyle}>
          <div className="card-title" style={titleStyle}>Nivel de prioridad *</div>
          <Termometro value={form.prioridad} onChange={(p) => setForm((f) => ({ ...f, prioridad: p }))} />
        </div>
      )}

      {form.prioridad && (
        <div className="card" style={cardStyle}>
          <div className="card-title" style={titleStyle}>Origen</div>
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label" style={labelStyle}>Fecha de solicitud</label>
              <input className="form-input" readOnly value={nowStr()} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(34,197,94,0.2)", color: "#9ca3af", fontSize: 14 }} />
            </div>
            <div className="form-row">
              <label className="form-label" style={labelStyle}>Solicitante</label>
              <input className="form-input" readOnly value={usuario.nombre} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(34,197,94,0.2)", color: "#9ca3af", fontSize: 14 }} />
            </div>
          </div>
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label" style={labelStyle}>Sección de origen</label>
              <select className="form-input form-select" value={form.sector} onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
                style={{ background: "#0a1628", border: "1px solid rgba(34,197,94,0.2)", color: "#f0fdf4", fontSize: 14 }}>
                {SECTORES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label" style={labelStyle}>Área de origen</label>
              <select className="form-input form-select" value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                style={{ background: "#0a1628", border: "1px solid rgba(34,197,94,0.2)", color: "#f0fdf4", fontSize: 14 }}>
                {AREAS.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="btn-row">
            <button className="btn-secondary" onClick={handleReset} style={{ borderColor: "rgba(255,255,255,0.2)", color: "#9ca3af", background: "transparent", fontSize: 14 }}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave} style={{ fontSize: 14 }}>Guardar solicitud</button>
          </div>
        </div>
      )}
    </div>
  );
}