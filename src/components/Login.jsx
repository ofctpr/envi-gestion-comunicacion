import { useState } from "react";

const LogoManzana = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 18 C50 18 62 8 72 12" stroke="#4ade80" strokeWidth="3" strokeLinecap="round"/>
    <path d="M50 24 C36 24 22 34 20 50 C17 68 26 86 36 90 C41 92 46 90 50 90 C54 90 59 92 64 90 C74 86 83 68 80 50 C78 34 64 24 50 24Z" fill="#16a34a"/>
    <path d="M50 24 C50 24 44 32 44 40" stroke="#15803d" strokeWidth="2" strokeLinecap="round"/>
    <path d="M34 42 C34 42 28 52 30 64" stroke="#15803d" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    <path d="M50 24 C50 24 58 30 62 38" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

export const LogoManzanaSmall = () => (
  <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 18 C50 18 62 8 72 12" stroke="#4ade80" strokeWidth="3" strokeLinecap="round"/>
    <path d="M50 24 C36 24 22 34 20 50 C17 68 26 86 36 90 C41 92 46 90 50 90 C54 90 59 92 64 90 C74 86 83 68 80 50 C78 34 64 24 50 24Z" fill="#16a34a"/>
  </svg>
);

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
          <div className="logo-mark">
            <LogoManzana size={90} />
          </div>
          <div>
            <div className="login-brand">EnVi</div>
            <div className="login-title">Sistema de Gestión</div>
          </div>
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
      </div>
    </div>
  );
}