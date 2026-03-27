import { supabase } from "../lib/supabase";

// Traer todos los contactos
export const getContacts = async ({ userId, mapType }) => {
  let query = supabase
    .from("contactos")
    .select(`
      id,
      nombre,
      cargo,
      empresa,
      ciudad,
      telefono,
      email,
      paises (
        id,
        nombre,
        iso,
        codigo_telefono,
        lat,
        lng,
        continente
      ),
      empleados (
        id,
        nombre,
        cargo,
        telefono,
        email
      )
    `)
    .eq("usuario_id", userId); // clave

  // filtro por tipo de mapa
  if (mapType === "argentina") {
    query = query.eq("paises.nombre", "Argentina");
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error al obtener contactos:", error.message);
    throw error;
  }

  return data || [];
};

// Buscar contactos con filtros
export const searchContacts = async ({
  nombre = "",
  cargo = "",
  empresa = "",
  pais = ""
}) => {
  let query = supabase
    .from("contactos")
    .select(`
      id,
      nombre,
      cargo,
      empresa,
      ciudad,
      telefono,
      email,
      paises!inner (
        id,
        nombre,
        iso,
        codigo_telefono,
        lat,
        lng,
        continente
      ),
      empleados (
        id,
        nombre,
        cargo,
        telefono,
        email
      )
    `);

  if (nombre.trim()) {
    query = query.ilike("nombre", `%${nombre.trim()}%`);
  }

  if (cargo.trim()) {
    query = query.ilike("cargo", `%${cargo.trim()}%`);
  }

  if (empresa.trim()) {
    query = query.ilike("empresa", `%${empresa.trim()}%`);
  }

  if (pais.trim()) {
    query = query.ilike("paises.nombre", `%${pais.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error al buscar contactos:", error.message);
    throw error;
  }

  return data || [];
};