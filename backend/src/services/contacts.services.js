import supabase from "../config/db.js";

export const getContacts = async () => {
  const { data, error } = await supabase
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
    `)
    .order("nombre", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const searchContacts = async ({ nombre = "", cargo = "", empresa = "", pais = "" }) => {
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

  query = query.order("nombre", { ascending: true });

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data;
};