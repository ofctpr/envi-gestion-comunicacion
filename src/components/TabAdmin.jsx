import { useState } from "react";
import { AREAS, crearUsuario, actualizarUsuario } from "../data/datos";

const cardStyle = { background: "rgba(10, 22, 40, 0.9)", border: "1px solid rgba(34, 197, 94, 0.2)", marginBottom: "1.5rem" };
const titleStyle = { fontSize: 16, fontWeight: 700, color: "#f0fdf4" };
const labelStyle = { fontWeight: 700, color: "#4ade80" };
const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(34,197,94,0.2)", color: "#f0fdf4" };
const selectStyle = { background: "#0a1628", border: "1px solid rgba(34,197,94,0.2)", color: "#f0fdf4" };

const AvatarManzana = () => (
  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(22,163,74,0.15)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
      <path d="M50 18 C50 18 62 8 72 12" stroke="#4ade80" strokeWidth="3" strokeLinecap="round"/>
      <path d="M50 24 C36 24 22 34 20 50 C17 68 26 86 36 90 C41 92 46 90 50 90 C54 90 59 92 64 90 C74 86 83 68 80 50 C78 34 64 24 50 24Z" fill="#16a34a"/>
      <path d="M50 24 C50 24 44 32 44 40" stroke="#15803d" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  </div>
);

const SplashManzana = ({ onDone }) => {
  useState(() => { setTimeout(onDone, 2000); }, []);
  return (
    <div style={{
      minHeight: "calc(100vh - 52px)", margin: "-2rem -1.5rem",
      background: "linear-gradient(135deg, #0a1628 0%, #0d2a1a 40%, #0a1628 70%, #091420 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24,
    }}>
      <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }`}</style>
      <div style={{ animation: "pulse 1.5s ease infinite" }}>
        <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
          <path d="M50 18 C50 18 62 8 72 12" stroke="#4ade80" strokeWidth="3" strokeLinecap="round"/>
          <path d="M50 24 C36 24 22 34 20 50 C17 68 26 86 36 90 C41 92 46 90 50 90 C54 90 59 92 64 90 C74 86 83 68 80 50 C78 34 64 24 50 24Z" fill="#16a34a"/>
          <path d="M50 24 C50 24 44 32 44 40" stroke="#15803d" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#4ade80", marginBottom: 8 }}>EnVi</div>
        <div style={{ fontSize: 16, color: "#f0fdf4", marginBottom: 4 }}>Usuario registrado correctamente</div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>El nuevo usuario ya puede ingresar al sistema.</div>
      </div>
    </div>
  );
};

export default function TabAdmin({ usuarios, setUsuarios, showAlert }) {
  const empty = { username: "", password: "", nombre: "", rol: "colaborador", area: "Producción", sector: "" };
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState("");
  const [splash, setSplash] = useState(false);
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [busqueda, setBusqueda] = useState("");

  const addUser = async () => {
    if (!form.username || !form.password || !form.nombre || !form.sector) {
      setErr("Completá todos los campos."); return;
    }
    if (usuarios.find((u) => u.username === form.username)) {
      setErr("El nombre de usuario ya existe."); return;
    }
    const nuevo = await crearUsuario(form);
    if (nuevo) {
      setUsuarios((u) => [...u, nuevo]);
      setForm(empty);
      setErr("");
      setSplash(true);
    } else {
      setErr("Error al guardar. Intentá de nuevo.");
    }
  };

  const iniciarEdicion = (u) => { setEditando(u.id); setEditForm({ ...u }); };

  const guardarEdicion = async () => {
    const ok = await actualizarUsuario(editando, editForm);
    if (ok) {
      setUsuarios((us) => us.map((u) => u.id === editando ? { ...u, ...editForm } : u));
      setEditando(null);
      showAlert("Usuario actualizado correctamente. ✓");
    } else {
      showAlert("Error al actualizar.", "info");
    }
  };

  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.username.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.area.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.rol.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (splash) return <SplashManzana onDone={() => setSplash(false)} />;

  return (
    <div style={{
      background: "linear-gradient(135deg, #0a1628 0%, #0d2a1a 40%, #0a1628 70%, #091420 100%)",
      minHeight: "calc(100vh - 52px)", margin: "-2rem -1.5rem", padding: "2rem 1.5rem",
    }}>
      <div className="card" style={cardStyle}>
        <div className="card-title" style={titleStyle}>Registrar nuevo usuario</div>
        {err && <div className="alert alert-info">{err}</div>}
        <div className="form-grid">
          <div className="form-row">
            <label className="form-label" style={labelStyle}>Nombre completo *</label>
            <input className="form-input" style={inputStyle} value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
          </div>
          <div className="form-row">
            <label className="form-label" style={labelStyle}>Nombre de usuario *</label>
            <input className="form-input" style={inputStyle} value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
          </div>
          <div className="form-row">
            <label className="form-label" style={labelStyle}>Contraseña *</label>
            <input className="form-input" style={inputStyle} type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          </div>
          <div className="form-row">
            <label className="form-label" style={labelStyle}>Rol *</label>
            <select className="form-input form-select" style={selectStyle} value={form.rol} onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value }))}>
              <option value="colaborador">Colaborador</option>
              <option value="supervisor">Supervisor</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </div>
          <div className="form-row">
            <label className="form-label" style={labelStyle}>Área *</label>
            <select className="form-input form-select" style={selectStyle} value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}>
              {AREAS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label className="form-label" style={labelStyle}>Sector / Puesto *</label>
            <input className="form-input" style={inputStyle} value={form.sector} onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))} placeholder="Ej: Línea B, Taller eléctrico..." />
          </div>
        </div>
        <div className="btn-row">
          <button className="btn-primary" onClick={addUser}>Registrar usuario</button>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <div className="card-title" style={titleStyle}>Usuarios registrados ({usuarios.length})</div>
        <div style={{ marginBottom: 16 }}>
          <input
            className="form-input"
            style={{ ...inputStyle, width: "100%" }}
            placeholder="Buscar por nombre, usuario, área o rol..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        {usuariosFiltrados.map((u) => (
          <div key={u.id}>
            {editando === u.id ? (
              <div style={{ padding: "12px 0", borderBottom: "1px solid rgba(34,197,94,0.1)" }}>
                <div className="form-grid" style={{ marginBottom: 12 }}>
                  <div className="form-row">
                    <label className="form-label" style={labelStyle}>Nombre</label>
                    <input className="form-input" style={inputStyle} value={editForm.nombre} onChange={(e) => setEditForm((f) => ({ ...f, nombre: e.target.value }))} />
                  </div>
                  <div className="form-row">
                    <label className="form-label" style={labelStyle}>Username</label>
                    <input className="form-input" style={inputStyle} value={editForm.username} onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))} />
                  </div>
                  <div className="form-row">
                    <label className="form-label" style={labelStyle}>Contraseña</label>
                    <input className="form-input" style={inputStyle} value={editForm.password} onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))} />
                  </div>
                  <div className="form-row">
                    <label className="form-label" style={labelStyle}>Rol</label>
                    <select className="form-input form-select" style={selectStyle} value={editForm.rol} onChange={(e) => setEditForm((f) => ({ ...f, rol: e.target.value }))}>
                      <option value="colaborador">Colaborador</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="mantenimiento">Mantenimiento</option>
                    </select>
                  </div>
                  <div className="form-row">
                    <label className="form-label" style={labelStyle}>Área</label>
                    <select className="form-input form-select" style={selectStyle} value={editForm.area} onChange={(e) => setEditForm((f) => ({ ...f, area: e.target.value }))}>
                      {AREAS.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div className="form-row">
                    <label className="form-label" style={labelStyle}>Sector</label>
                    <input className="form-input" style={inputStyle} value={editForm.sector} onChange={(e) => setEditForm((f) => ({ ...f, sector: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button className="btn-secondary" style={{ borderColor: "rgba(255,255,255,0.2)", color: "#9ca3af", background: "transparent" }} onClick={() => setEditando(null)}>Cancelar</button>
                  <button className="btn-primary" onClick={guardarEdicion}>Guardar cambios</button>
                </div>
              </div>
            ) : (
              <div className="user-row" style={{ borderColor: "rgba(34,197,94,0.1)" }}>
                <AvatarManzana />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: "#f0fdf4", fontWeight: 500 }}>{u.nombre}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{u.username} · {u.area} / {u.sector}</div>
                </div>
                <span className={"badge badge-" + u.rol} style={{ marginRight: 10 }}>{u.rol}</span>
                <button onClick={() => iniciarEdicion(u)} style={{ background: "transparent", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 6, padding: "4px 12px", color: "#4ade80", fontSize: 12, cursor: "pointer" }}>Editar</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}