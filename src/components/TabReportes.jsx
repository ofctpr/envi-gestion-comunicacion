import { useState } from "react";
import { AREAS, TIPOS } from "../data/datos";

export default function TabReportes({ ordenes }) {
  const [vista, setVista] = useState("resumen");

  const total = ordenes.length;
  const finalizados = ordenes.filter((o) => o.estado === "Finalizado").length;
  const pendientes = ordenes.filter((o) => o.estado === "Pendiente").length;
  const enCurso = ordenes.filter((o) => o.estado === "En curso").length;

  const porArea = AREAS.reduce((acc, a) => {
    acc[a] = ordenes.filter((o) => o.destino.includes(a)).length;
    return acc;
  }, {});

  const porTipo = TIPOS.reduce((acc, t) => {
    acc[t] = ordenes.filter((o) => o.tipo === t).length;
    return acc;
  }, {});

  const maxArea = Math.max(...Object.values(porArea), 1);
  const maxTipo = Math.max(...Object.values(porTipo), 1);

  const tiempos = ordenes.filter((o) => o.resolucion?.tiempo).map((o) => {
    const m = o.resolucion.tiempo.match(/(\d+)h\s*(\d+)?/);
    return m ? parseInt(m[1]) * 60 + (parseInt(m[2]) || 0) : 0;
  });
  const promMin = tiempos.length ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0;

  return (
    <div>
      <div className="page-header">
        <h1>Reportes y Dashboards</h1>
        <p>Análisis y métricas del sistema.</p>
      </div>
      <div className="tabs">
        <button className={"tab" + (vista === "resumen" ? " active" : "")} onClick={() => setVista("resumen")}>Resumen general</button>
        <button className={"tab" + (vista === "areas" ? " active" : "")} onClick={() => setVista("areas")}>Por área</button>
        <button className={"tab" + (vista === "kpi" ? " active" : "")} onClick={() => setVista("kpi")}>KPIs</button>
      </div>

      {vista === "resumen" && <>
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-label">Total órdenes</div><div className="stat-val">{total}</div></div>
          <div className="stat-card"><div className="stat-label">Pendientes</div><div className="stat-val" style={{ color: "#2563eb" }}>{pendientes}</div></div>
          <div className="stat-card"><div className="stat-label">En curso</div><div className="stat-val" style={{ color: "#ea580c" }}>{enCurso}</div></div>
          <div className="stat-card"><div className="stat-label">Finalizados</div><div className="stat-val" style={{ color: "#16a34a" }}>{finalizados}</div></div>
        </div>
        <div className="card">
          <div className="card-title">Solicitudes por tipo</div>
          {Object.entries(porTipo).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([tipo, count]) => (
            <div key={tipo} className="mini-bar">
              <div className="mini-label">{tipo}</div>
              <div className="mini-track"><div className="mini-fill" style={{ width: `${(count / maxTipo) * 100}%` }} /></div>
              <div className="mini-count">{count}</div>
            </div>
          ))}
        </div>
      </>}

      {vista === "areas" && (
        <div className="card">
          <div className="card-title">Solicitudes por área destinataria</div>
          {Object.entries(porArea).sort((a, b) => b[1] - a[1]).map(([area, count]) => (
            <div key={area} className="mini-bar">
              <div className="mini-label">{area}</div>
              <div className="mini-track"><div className="mini-fill" style={{ width: `${(count / maxArea) * 100}%`, background: "#7c3aed" }} /></div>
              <div className="mini-count">{count}</div>
            </div>
          ))}
        </div>
      )}

      {vista === "kpi" && <>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Tasa de resolución</div>
            <div className="stat-val">{total > 0 ? Math.round((finalizados / total) * 100) : 0}%</div>
            <div className="stat-sub">{finalizados} de {total} órdenes</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Tiempo promedio</div>
            <div className="stat-val">{Math.floor(promMin / 60)}h {promMin % 60}m</div>
            <div className="stat-sub">De resolución</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Alta prioridad</div>
            <div className="stat-val" style={{ color: "#dc2626" }}>{ordenes.filter((o) => o.prioridad === "Alta").length}</div>
            <div className="stat-sub">Órdenes activas</div>
          </div>
        </div>
        <div className="card">
          <div className="card-title">Estado de solicitudes de trabajo</div>
          {["Pendiente", "En curso", "Finalizado"].map((estado) => {
            const c = ordenes.filter((o) => o.tipo === "Solicitud de trabajo" && o.estado === estado).length;
            const tot = ordenes.filter((o) => o.tipo === "Solicitud de trabajo").length || 1;
            const colors = { Finalizado: "#16a34a", "En curso": "#ea580c", Pendiente: "#2563eb" };
            return (
              <div key={estado} className="mini-bar">
                <div className="mini-label">{estado}</div>
                <div className="mini-track"><div className="mini-fill" style={{ width: `${(c / tot) * 100}%`, background: colors[estado] }} /></div>
                <div className="mini-count">{c}</div>
              </div>
            );
          })}
        </div>
      </>}
    </div>
  );
}