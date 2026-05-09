import { useState, useEffect } from "react";
import { getUsuarios, getOrdenes } from "./data/datos";
import Login from "./components/Login";
import TopBar from "./components/TopBar";
import TabSolicitud from "./components/TabSolicitud";
import TabMantenimiento from "./components/TabMantenimiento";
import TabHistorial from "./components/TabHistorial";
import TabReportes from "./components/TabReportes";
import TabAdmin from "./components/TabAdmin";
import ModalMantenimiento from "./components/ModalMantenimiento";
import "./App.css";

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [tab, setTab] = useState("solicitud");
  const [ordenes, setOrdenes] = useState([]);
  const [modal, setModal] = useState(null);
  const [alert, setAlert] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => { 
    async function cargarDatos() {
      const [u, o] = await Promise.all([getUsuarios(), getOrdenes()]);
      console.log("usuarios cargados:", u);
      setUsuarios(u);
      setOrdenes(o);
      setCargando(false);
    }
    cargarDatos();
  }, []);

  useEffect(() => {
    if (alert) {
      const t = setTimeout(() => setAlert(null), 3500);
      return () => clearTimeout(t);
    }
  }, [alert]);

  const showAlert = (msg, type = "success") => setAlert({ msg, type });

  const canAccess = (section) => {
    if (!usuario) return false;
    const r = usuario.rol;
    if (section === "solicitud") return true;
    if (section === "mantenimiento") return r === "mantenimiento" || r === "admin";
    if (section === "historial") return r === "supervisor" || r === "admin" || r === "mantenimiento";
    if (section === "reportes") return r === "supervisor" || r === "admin";
    if (section === "admin") return r === "admin";
    return false;
  };

  if (cargando) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1117" }}>
      <div style={{ color: "#8b949e", fontSize: 14 }}>Cargando sistema...</div>
    </div>
  );

  if (!usuario) return <Login usuarios={usuarios} onLogin={setUsuario} />;

  return (
    <div className="envi-app">
      <TopBar
        usuario={usuario}
        tab={tab}
        setTab={setTab}
        onLogout={() => { setUsuario(null); setTab("solicitud"); }}
        canAccess={canAccess}
      />
      <div className="main-content">
        {alert && <div className={"alert alert-" + alert.type}>{alert.msg}</div>}
        {tab === "solicitud" && <TabSolicitud usuario={usuario} ordenes={ordenes} setOrdenes={setOrdenes} showAlert={showAlert} />}
        {tab === "mantenimiento" && canAccess("mantenimiento") && <TabMantenimiento ordenes={ordenes} setModal={setModal} />}
        {tab === "historial" && canAccess("historial") && <TabHistorial ordenes={ordenes} usuario={usuario} />}
        {tab === "reportes" && canAccess("reportes") && <TabReportes ordenes={ordenes} />}
        {tab === "admin" && canAccess("admin") && <TabAdmin usuarios={usuarios} setUsuarios={setUsuarios} showAlert={showAlert} />}
      </div>
      {modal && (
        <ModalMantenimiento
          orden={modal}
          onClose={() => setModal(null)}
          setOrdenes={setOrdenes}
          showAlert={showAlert}
        />
      )}
    </div>
  );
}