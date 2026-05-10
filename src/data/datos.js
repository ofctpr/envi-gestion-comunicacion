import { supabase } from '../supabase'

export const AREAS = ["Ingeniería", "Sistemas", "Mantenimiento", "Producción", "Calidad", "Logística", "RRHH"];
export const SECTORES = ["Línea A", "Línea B", "Taller", "Administración", "Depósito", "Planta", "Oficinas"];
export const TIPOS = ["Solicitud de trabajo", "Comunicado"];
export const PRIORIDADES = ["Alta", "Media", "Baja"];

export async function getUsuarios() {
  const { data, error } = await supabase.from('usuarios').select('*')
  if (error) { console.error(error); return []; }
  return data;
}

export async function getOrdenes() {
  const { data, error } = await supabase.from('ordenesv').select('*').order('id', { ascending: false })
  if (error) { console.error(error); return []; }
  return data.map(o => ({ ...o, destino: JSON.parse(o.destino || '[]'), resolucion: o.resolucion || null }));
}

export async function crearOrden(orden) {
  const { data, error } = await supabase.from('ordenesv').insert([{ ...orden, destino: JSON.stringify(orden.destino) }]).select()
  if (error) { console.error(error); return null; }
  return data[0];
}

export async function actualizarOrden(id, cambios) {
  const { error } = await supabase.from('ordenesv').update(cambios).eq('id', id)
  if (error) { console.error(error); return false; }
  return true;
}

export async function getMaquinas() {
  const { data, error } = await supabase.from('maquinas').select('*')
  if (error) { console.error(error); return {}; }
  return data.reduce((acc, m) => {
    acc[m.nombre] = {
      herramientas: typeof m.herramientas === 'string' ? JSON.parse(m.herramientas) : m.herramientas,
      manual: m.manual,
      historico: typeof m.historico === 'string' ? JSON.parse(m.historico) : m.historico,
    };
    return acc;
  }, {});
}

export async function crearUsuario(usuario) {
  const { data, error } = await supabase.from('usuarios').insert([usuario]).select()
  if (error) { console.error(error); return null; }
  return data[0];
}

export async function actualizarUsuario(id, cambios) {
  const { error } = await supabase.from('usuarios').update(cambios).eq('id', id)
  if (error) { console.error(error); return false; }
  return true;
  
}
export async function getMaquinasPorCategoria(categoria) {
  const { data, error } = await supabase.from('maquinas').select('*').eq('categoria', categoria).eq('activa', true)
  if (error) { console.error(error); return []; }
  return data;
}