import { useState, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

const cardStyle = { background: "rgba(10, 22, 40, 0.9)", border: "1px solid rgba(34, 197, 94, 0.2)", marginBottom: "1.5rem" };
const titleStyle = { fontSize: 16, fontWeight: 700, color: "#f0fdf4" };
const tooltipStyle = { background: "#0a1628", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, color: "#f0fdf4", fontSize: 12 };
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const COLORS = ["#16a34a", "#4ade80", "#d97706", "#dc2626", "#2563eb", "#7c3aed"];

function parseFecha(fechaStr) {
  if (!fechaStr) return null;
  const [fecha] = fechaStr.split(" ");
  const [dia, mes, anio] = fecha.split("/");
  return new Date(anio, mes - 1, dia);
}

function parseMinutos(tiempo) {
  if (!tiempo) return 0;
  const m = tiempo.match(/(\d+)h\s*(\d+)?/);
  return m ? parseInt(m[1]) * 60 + (parseInt(m[2]) || 0) : 0;
}

export default function TabReportes({ ordenes }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("todos");
  const [filtroMes, setFiltroMes] = useState("todos");
  const [vistaTab, setVistaTab] = useState("kpi");

  const solicitudes = ordenes.filter(o => o.tipo === "Solicitud de trabajo");

  const filtradas = solicitudes.filter(o => {
    if (filtroEstado !== "todos" && o.estado !== filtroEstado) return false;
    if (filtroPrioridad !== "todos" && o.prioridad !== filtroPrioridad) return false;
    if (filtroMes !== "todos") {
      const fecha = parseFecha(o.fecha);
      if (!fecha) return false;
      if (`${MESES[fecha.getMonth()]} ${fecha.getFullYear()}` !== filtroMes) return false;
    }
    if (busqueda && !o.descripcion.toLowerCase().includes(busqueda.toLowerCase()) &&
        !o.usuario.toLowerCase().includes(busqueda.toLowerCase()) &&
        !o.sector.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  // KPIs base
  const total = solicitudes.length;
  const finalizadas = solicitudes.filter(o => o.estado === "Finalizado").length;
  const pendientes = solicitudes.filter(o => o.estado === "Pendiente").length;
  const enCurso = solicitudes.filter(o => o.estado === "En curso").length;
  const urgentes = solicitudes.filter(o => o.prioridad === "Urgente").length;
  const tasaResolucion = total > 0 ? Math.round((finalizadas / total) * 100) : 0;

  const tiempos = solicitudes.filter(o => o.resolucion?.tiempo).map(o => parseMinutos(o.resolucion.tiempo));
  const promMin = tiempos.length ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0;
  const maxMin = tiempos.length ? Math.max(...tiempos) : 0;
  const minMin = tiempos.length ? Math.min(...tiempos) : 0;

  // Datos por mes
  const datosPorMes = useMemo(() => {
    const mapa = {};
    solicitudes.forEach(o => {
      const fecha = parseFecha(o.fecha);
      if (!fecha) return;
      const key = `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`;
      if (!mapa[key]) mapa[key] = { mes: key, total: 0, finalizadas: 0, urgentes: 0, pendientes: 0 };
      mapa[key].total++;
      if (o.estado === "Finalizado") mapa[key].finalizadas++;
      if (o.estado === "Pendiente") mapa[key].pendientes++;
      if (o.prioridad === "Urgente") mapa[key].urgentes++;
    });
    return Object.values(mapa);
  }, [solicitudes]);

  const mesesDisponibles = datosPorMes.map(d => d.mes);

  // Datos por técnico
  const datosPorTecnico = useMemo(() => {
    const mapa = {};
    solicitudes.filter(o => o.resolucion?.tecnico).forEach(o => {
      const t = o.resolucion.tecnico;
      if (!mapa[t]) mapa[t] = { tecnico: t.split(" ")[0], ordenes: 0, minutos: [] };
      mapa[t].ordenes++;
      mapa[t].minutos.push(parseMinutos(o.resolucion.tiempo));
    });
    return Object.values(mapa).map(t => ({
      ...t,
      promedio: t.minutos.length ? Math.round(t.minutos.reduce((a, b) => a + b, 0) / t.minutos.length) : 0
    })).sort((a, b) => b.ordenes - a.ordenes);
  }, [solicitudes]);

  // Datos por prioridad (pie)
  const datosPrioridad = useMemo(() => {
    const mapa = { Urgente: 0, Moderada: 0, Baja: 0 };
    solicitudes.forEach(o => { if (mapa[o.prioridad] !== undefined) mapa[o.prioridad]++; });
    return Object.entries(mapa).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [solicitudes]);

  // Repuestos más usados
  const repuestosMasUsados = useMemo(() => {
    const mapa = {};
    solicitudes.filter(o => o.resolucion?.repuesto && o.resolucion.repuesto !== "Ninguno").forEach(o => {
      const r = o.resolucion.repuesto;
      mapa[r] = (mapa[r] || 0) + 1;
    });
    return Object.entries(mapa).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([nombre, cantidad]) => ({ nombre, cantidad }));
  }, [solicitudes]);

  // Export CSV con ;
  const exportarCSV = () => {
    const encabezado = "ID;Fecha;Usuario;Sector;Descripcion;Prioridad;Estado;Tecnico;Tiempo_Resolucion;Repuesto;Detalle_Resolucion";
    const filas = filtradas.map(o => [
      String(o.id).padStart(4, "0"),
      o.fecha,
      o.usuario,
      o.sector,
      `"${o.descripcion.replace(/"/g, "'")}"`,
      o.prioridad || "",
      o.estado,
      o.resolucion?.tecnico || "",
      o.resolucion?.tiempo || "",
      o.resolucion?.repuesto || "",
      o.resolucion?.detalle ? `"${o.resolucion.detalle.replace(/"/g, "'")}"` : "",
    ].join(";"));
    const contenido = [encabezado, ...filas].join("\n");
    const blob = new Blob(["\uFEFF" + contenido], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EnVi_Datos_${new Date().toLocaleDateString("es-AR").replace(/\//g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, #0a1628 0%, #0d2a1a 40%, #0a1628 70%, #091420 100%)",
      minHeight: "calc(100vh - 52px)", margin: "-2rem -1.5rem", padding: "2rem 1.5rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#f0fdf4" }}>Informes y Dashboard</div>
          <div style={{ fontSize: 14, color: "#6b7280" }}>Solicitudes de trabajo · Supervisores y administrador</div>
        </div>
        <button onClick={exportarCSV} style={{
          background: "rgba(22,163,74,0.2)", border: "1px solid rgba(34,197,94,0.4)",
          borderRadius: 8, padding: "9px 20px", color: "#4ade80", fontSize: 13,
          fontWeight: 600, cursor: "pointer",
        }}>↓ Exportar para Power BI</button>
      </div>

      <div style={{ display: "flex", gap: 2, marginBottom: "1.5rem", background: "rgba(255,255,255,0.05)", padding: 4, borderRadius: 10, width: "fit-content" }}>
        {[["kpi","KPIs"],["graficos","Gráficos"],["detalle","Detalle"]].map(([v, l]) => (
          <button key={v} onClick={() => setVistaTab(v)} style={{
            padding: "7px 18px", borderRadius: 7, border: "none", fontSize: 13, cursor: "pointer",
            background: vistaTab === v ? "#16a34a" : "transparent",
            color: vistaTab === v ? "#fff" : "#6b7280", transition: "all 0.15s",
          }}>{l}</button>
        ))}
      </div>

      {vistaTab === "kpi" && <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
          {[
            { label: "Total órdenes", val: total, color: "#4ade80", sub: "solicitudes registradas" },
            { label: "Finalizadas", val: finalizadas, color: "#16a34a", sub: `${tasaResolucion}% de resolución` },
            { label: "En curso", val: enCurso, color: "#d97706", sub: "en proceso" },
            { label: "Pendientes", val: pendientes, color: "#2563eb", sub: "sin asignar" },
            { label: "Urgentes", val: urgentes, color: "#dc2626", sub: "alta criticidad" },
            { label: "Tasa resolución", val: `${tasaResolucion}%`, color: "#4ade80", sub: "órdenes cerradas" },
            { label: "Tiempo promedio", val: `${Math.floor(promMin/60)}h ${promMin%60}m`, color: "#7c3aed", sub: "por resolución" },
            { label: "Tiempo máximo", val: `${Math.floor(maxMin/60)}h ${maxMin%60}m`, color: "#dc2626", sub: "caso más largo" },
            { label: "Tiempo mínimo", val: `${Math.floor(minMin/60)}h ${minMin%60}m`, color: "#16a34a", sub: "caso más rápido" },
            { label: "Técnicos activos", val: datosPorTecnico.length, color: "#0ea5e9", sub: "con órdenes resueltas" },
            { label: "Repuestos usados", val: repuestosMasUsados.length, color: "#f59e0b", sub: "tipos distintos" },
            { label: "Órdenes/mes", val: datosPorMes.length ? Math.round(total / datosPorMes.length) : 0, color: "#4ade80", sub: "promedio mensual" },
          ].map((k, i) => (
            <div key={i} style={{ ...cardStyle, padding: "1rem 1.25rem", borderRadius: 10, marginBottom: 0 }}>
              <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: 26, fontWeight: 300, color: k.color, fontFamily: "monospace", marginBottom: 4 }}>{k.val}</div>
              <div style={{ fontSize: 11, color: "#4b5563" }}>{k.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <div className="card" style={cardStyle}>
            <div className="card-title" style={titleStyle}>Rendimiento por técnico</div>
            {datosPorTecnico.map((t, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: "#f0fdf4" }}>{t.tecnico}</span>
                  <span style={{ fontSize: 12, color: "#4ade80", fontFamily: "monospace" }}>{t.ordenes} órd · {Math.floor(t.promedio/60)}h{t.promedio%60}m prom</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 4, background: "linear-gradient(90deg, #16a34a, #4ade80)", width: `${(t.ordenes / datosPorTecnico[0].ordenes) * 100}%`, transition: "width 0.5s" }} />
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={cardStyle}>
            <div className="card-title" style={titleStyle}>Repuestos más utilizados</div>
            {repuestosMasUsados.length === 0 ? (
              <div style={{ color: "#6b7280", fontSize: 13 }}>Sin datos de repuestos aún.</div>
            ) : repuestosMasUsados.map((r, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: "#f0fdf4" }}>{r.nombre}</span>
                  <span style={{ fontSize: 12, color: "#f59e0b", fontFamily: "monospace" }}>{r.cantidad}x</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 4, background: "linear-gradient(90deg, #d97706, #fbbf24)", width: `${(r.cantidad / repuestosMasUsados[0].cantidad) * 100}%`, transition: "width 0.5s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </>}

      {vistaTab === "graficos" && <>
        <div className="card" style={cardStyle}>
          <div className="card-title" style={titleStyle}>Evolución mensual de solicitudes</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={datosPorMes} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mes" tick={{ fill: "#6b7280", fontSize: 11 }} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: "#6b7280", fontSize: 12 }} />
              <Line type="monotone" dataKey="total" stroke="#4ade80" strokeWidth={2} dot={{ fill: "#4ade80", r: 4 }} name="Total" />
              <Line type="monotone" dataKey="finalizadas" stroke="#16a34a" strokeWidth={2} dot={{ fill: "#16a34a", r: 4 }} name="Finalizadas" />
              <Line type="monotone" dataKey="urgentes" stroke="#dc2626" strokeWidth={2} dot={{ fill: "#dc2626", r: 4 }} name="Urgentes" />
              <Line type="monotone" dataKey="pendientes" stroke="#2563eb" strokeWidth={2} dot={{ fill: "#2563eb", r: 4 }} name="Pendientes" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div className="card" style={cardStyle}>
            <div className="card-title" style={titleStyle}>Órdenes resueltas por técnico</div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={datosPorTecnico} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="tecnico" tick={{ fill: "#6b7280", fontSize: 11 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="ordenes" fill="#16a34a" radius={[4, 4, 0, 0]} name="Órdenes" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={cardStyle}>
            <div className="card-title" style={titleStyle}>Distribución por prioridad</div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={datosPrioridad} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`} labelLine={{ stroke: "#4ade80" }}>
                  {datosPrioridad.map((_, i) => <Cell key={i} fill={["#dc2626", "#d97706", "#16a34a"][i % 3]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>}

      {vistaTab === "detalle" && (
        <div className="card" style={cardStyle}>
          <div className="card-title" style={titleStyle}>Detalle de solicitudes</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <input placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
              style={{ flex: 1, minWidth: 200, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "8px 14px", color: "#f0fdf4", fontSize: 13, outline: "none" }} />
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
              style={{ background: "#0a1628", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "8px 14px", color: "#f0fdf4", fontSize: 13 }}>
              <option value="todos">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En curso">En curso</option>
              <option value="Finalizado">Finalizado</option>
            </select>
            <select value={filtroPrioridad} onChange={e => setFiltroPrioridad(e.target.value)}
              style={{ background: "#0a1628", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "8px 14px", color: "#f0fdf4", fontSize: 13 }}>
              <option value="todos">Todas las prioridades</option>
              <option value="Urgente">Urgente</option>
              <option value="Moderada">Moderada</option>
              <option value="Baja">Baja</option>
            </select>
            <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)}
              style={{ background: "#0a1628", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "8px 14px", color: "#f0fdf4", fontSize: 13 }}>
              <option value="todos">Todos los meses</option>
              {mesesDisponibles.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>{filtradas.length} resultados</div>
          {filtradas.map(o => (
            <div key={o.id} style={{ padding: "12px 0", borderBottom: "1px solid rgba(34,197,94,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#4ade80", fontFamily: "monospace", marginBottom: 4 }}>#{String(o.id).padStart(4, "0")}</div>
                  <div style={{ fontSize: 14, color: "#f0fdf4", marginBottom: 4 }}>{o.descripcion}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>📅 {o.fecha} · 👤 {o.usuario} · 📍 {o.sector}</div>
                  {o.resolucion && <div style={{ fontSize: 12, color: "#16a34a", marginTop: 4 }}>✓ {o.resolucion.detalle} · ⏱ {o.resolucion.tiempo} · 🔧 {o.resolucion.tecnico}</div>}
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {o.prioridad && (
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: o.prioridad === "Urgente" ? "rgba(220,38,38,0.2)" : o.prioridad === "Moderada" ? "rgba(217,119,6,0.2)" : "rgba(22,163,74,0.2)", color: o.prioridad === "Urgente" ? "#f87171" : o.prioridad === "Moderada" ? "#fbbf24" : "#4ade80" }}>{o.prioridad}</span>
                  )}
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: o.estado === "Finalizado" ? "rgba(22,163,74,0.2)" : o.estado === "En curso" ? "rgba(217,119,6,0.2)" : "rgba(37,99,235,0.2)", color: o.estado === "Finalizado" ? "#4ade80" : o.estado === "En curso" ? "#fbbf24" : "#60a5fa" }}>{o.estado}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}