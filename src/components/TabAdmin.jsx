import { useState } from "react";
import { AREAS } from "../data/datos";

function getInitials(nombre) {
  return nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function TabAdmin({ usuarios, setUsuarios, showAlert }) {
  const empty = { username: "", password: "", nombre: "", rol: "colaborador", area: "Producción", sector: "" };
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState("");

  const addUser = () => {
    if (!form.username || !form.password || !form.nombre || !form.sector) {
      setErr("Completá todos los campos."); return;
    }
    if (usuarios.find((u) => u.username === form.username)) {
      setErr("El nombre de usuario ya existe."); return;
    }
    setUsuarios((u) => [...u, { ...form, id: u.length + 1 }]);
    setForm(empty);
    setErr("");
    showAlert("Usuario registrado correctamente. ✓");
  };

  return (
    <div>
      <div className="page-header">
        <h1>Administración del sistema</h1>
        <p>Alta y gestión de usuarios. Solo accesible para el administrador.</p>
      </div>
      <div className="card">
        <div className="card-title">Registrar nuevo usuario</div>
        {err && <div className="alert alert-info">{err}</div>}
        <div className="form-grid">
          <div className="form-row">
            <label className="form-label">Nombre completo *</label>
            <input className="form-input" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
          </div>
          <div className="form-row">
            <label className="form-label">Nombre de usuario *</label>
            <input className="form-input" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
          </div>
          <div className="form-row">
            <label className="form-label">Contraseña *</label>
            <input className="form-input" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          </div>
          <div className="form-row">
            <label className="form-label">Rol *</label>
            <select className="form-input form-select" value={form.rol} onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value }))}>
              <option value="colaborador">Colaborador</option>
              <option value="supervisor">Supervisor</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>
          <div className="form-row">
            <label className="form-label">Área *</label>
            <select className="form-input form-select" value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}>
              {AREAS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label className="form-label">Sector / Puesto *</label>
            <input className="form-input" value={form.sector} onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))} placeholder="Ej: Línea B, Taller eléctrico..." />
          </div>
        </div>
        <div className="btn-row">
          <button className="btn-primary" onClick={addUser}>Registrar usuario</button>
        </div>
      </div>
      <div className="card">
        <div className="card-title">Usuarios registrados ({usuarios.length})</div>
        {usuarios.map((u) => (
          <div key={u.id} className="user-row">
            <div className="user-initials">{getInitials(u.nombre)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: "#1f2937", fontWeight: 500 }}>{u.nombre}</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>{u.username} · {u.area} / {u.sector}</div>
            </div>
            <span className={"badge badge-" + u.rol}>{u.rol}</span>
          </div>
        ))}
      </div>
    </div>
  );
}