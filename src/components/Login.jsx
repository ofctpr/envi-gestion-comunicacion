import { useState } from "react";

export default function Login({ usuarios, onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const handleLogin = () => {
    const encontrado = usuarios.find(
      (u) => u.username === user.trim() && u.password === pass
    );
    if (encontrado) {
      onLogin(encontrado);
    } else {
      setErr("Usuario o contraseña incorrectos.");
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-mark">EV</div>
          <div className="login-title">EnVi · Sistema de Gestión</div>
        </div>
        <h2>Gestión de la Comunicación</h2>
        <p className="login-sub">Ingresá tus credenciales para continuar</p>

        {err && <div className="login-err">{err}</div>}

        <label className="field-label">Usuario</label>
        <input
          className="login-input"
          value={user}
          onChange={(e) => { setUser(e.target.value); setErr(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="usuario"
          autoFocus
        />

        <label className="field-label">Contraseña</label>
        <input
          className="login-input"
          type="password"
          value={pass}
          onChange={(e) => { setPass(e.target.value); setErr(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="••••••••"
        />

        <button className="login-btn" onClick={handleLogin}>
          Ingresar al sistema
        </button>
  );
}