import { supabase } from "../lib/supabase";

/**
 * Normaliza lat/lng a número o null
 */
const toNullableNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Limpia strings vacíos
 */
const toNullableString = (value) => {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  return trimmed === "" ? null : trimmed;
};

/**
 * Trae todos los países para selects/autocompletado
 */
export async function getCountries() {
  const { data, error } = await supabase
    .from("paises")
    .select("id, nombre, iso, codigo_telefono, continente")
    .order("nombre", { ascending: true });

  if (error) {
    throw new Error(`Error al obtener países: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Trae contactos con país, provincia, ciudad y empleados asociados
 */
export async function getContacts() {
  const { data, error } = await supabase
    .from("contactos")
    .select(`
      id,
      pais_id,
      provincia_id,
      ciudad_id,
      nombre,
      cargo,
      empresa,
      direccion,
      telefono,
      email,
      usuario_id,
      lat,
      lng,
      paises (
        id,
        nombre,
        iso,
        codigo_telefono,
        continente
      ),
      provincias (
        id,
        nombre,
        codigo,
        pais_id
      ),
      ciudades (
        id,
        name,
        lat,
        lng,
        pais_id,
        provincia_id,
        population
      ),
      empleados (
        id,
        contacto_id,
        nombre,
        cargo,
        telefono,
        email
      )
    `)
    .order("id", { ascending: false });

  if (error) {
    throw new Error(`Error al obtener contactos: ${error.message}`);
  }

  return (data ?? []).map((contacto) => ({
    ...contacto,
    lat: toNullableNumber(contacto.lat),
    lng: toNullableNumber(contacto.lng),
    empleados: contacto.empleados ?? [],
  }));
}

/**
 * Búsqueda simple por texto en nombre, cargo, empresa o email
 */
export async function searchContacts(searchTerm) {
  const term = (searchTerm ?? "").trim();

  if (!term) {
    return getContacts();
  }

  const { data, error } = await supabase
    .from("contactos")
    .select(`
      id,
      pais_id,
      provincia_id,
      ciudad_id,
      nombre,
      cargo,
      empresa,
      direccion,
      telefono,
      email,
      usuario_id,
      lat,
      lng,
      paises (
        id,
        nombre,
        iso,
        codigo_telefono,
        continente
      ),
      provincias (
        id,
        nombre,
        codigo,
        pais_id
      ),
      ciudades (
        id,
        name,
        lat,
        lng,
        pais_id,
        provincia_id,
        population
      ),
      empleados (
        id,
        contacto_id,
        nombre,
        cargo,
        telefono,
        email
      )
    `)
    .or(
      `nombre.ilike.%${term}%,cargo.ilike.%${term}%,empresa.ilike.%${term}%,email.ilike.%${term}%`,
    )
    .order("id", { ascending: false });

  if (error) {
    throw new Error(`Error al buscar contactos: ${error.message}`);
  }

  return (data ?? []).map((contacto) => ({
    ...contacto,
    lat: toNullableNumber(contacto.lat),
    lng: toNullableNumber(contacto.lng),
    empleados: contacto.empleados ?? [],
  }));
}

/**
 * Inserta empleados para un contacto
 */
async function insertEmployees(contactId, empleados = []) {
  if (!Array.isArray(empleados) || empleados.length === 0) return [];

  const payload = empleados
    .map((empleado) => ({
      contacto_id: contactId,
      nombre: toNullableString(empleado.nombre),
      cargo: toNullableString(empleado.cargo),
      telefono: toNullableString(empleado.telefono),
      email: toNullableString(empleado.email),
    }))
    .filter((empleado) => empleado.nombre);

  if (payload.length === 0) return [];

  const { data, error } = await supabase
    .from("empleados")
    .insert(payload)
    .select("*");

  if (error) {
    throw new Error(`Error al insertar empleados: ${error.message}`);
  }

  return data ?? [];
}

/*
  RECOLECTAR DATOS DE LATITUD Y LONGITUD PARA CONTACTOS EXISTENTES
*/

export async function resolveCityCoordinates({
  ciudad,
  paisId,
  provinciaId = null,
}) {
  const city = (ciudad || "").trim();

  if (!city || !paisId) {
    return { lat: null, lng: null, ciudadId: null };
  }

  let query = supabase
    .from("ciudades")
    .select("id, name, lat, lng, pais_id, provincia_id, population")
    .eq("pais_id", paisId)
    .ilike("name", `%${city}%`);

  if (provinciaId) {
    query = query.eq("provincia_id", provinciaId);
  }

  const { data, error } = await query
    .order("population", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(
      `Error al resolver coordenadas de ciudad: ${error.message}`,
    );
  }

  const match = data?.[0];

  return {
    ciudadId: match?.id ?? null,
    lat: match?.lat ?? null,
    lng: match?.lng ?? null,
  };
}

export async function getCitiesByCountry({
  paisId,
  provinciaId = null,
  search = "",
}) {
  if (!paisId) return [];

  let query = supabase
    .from("ciudades")
    .select("id, name, lat, lng, pais_id, provincia_id, population")
    .eq("pais_id", paisId);

  if (provinciaId) {
    query = query.eq("provincia_id", provinciaId);
  }

  const term = (search || "").trim();
  if (term) {
    query = query.ilike("name", `%${term}%`);
  }

  const { data, error } = await query
    .order("population", { ascending: false })
    .limit(30);

  if (error) {
    throw new Error(`Error al obtener ciudades: ${error.message}`);
  }

  return data ?? [];
}

export async function getProvincesByCountry({ paisId }) {
  if (!paisId) return [];

  const { data, error } = await supabase
    .from("provincias")
    .select("id, nombre, pais_id")
    .eq("pais_id", paisId)
    .order("nombre", { ascending: true });

  if (error) {
    throw new Error(`Error al obtener provincias: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Crea un contacto con empleados asociados
 */
export async function createContact(payload) {
  const contactoPayload = {
    pais_id: payload.pais_id,
    provincia_id: payload.provincia_id ?? null,
    ciudad_id: payload.ciudad_id ?? null,
    nombre: toNullableString(payload.nombre),
    cargo: toNullableString(payload.cargo),
    empresa: toNullableString(payload.empresa),
    direccion: toNullableString(payload.direccion),
    telefono: toNullableString(payload.telefono),
    email: toNullableString(payload.email),
    lat: toNullableNumber(payload.lat),
    lng: toNullableNumber(payload.lng),
  };

  const { data: createdContact, error: contactError } = await supabase
    .from("contactos")
    .insert(contactoPayload)
    .select(`
      id,
      pais_id,
      provincia_id,
      ciudad_id,
      nombre,
      cargo,
      empresa,
      direccion,
      telefono,
      email,
      usuario_id,
      lat,
      lng,
      paises (
        id,
        nombre,
        iso,
        codigo_telefono,
        continente
      ),
      provincias (
        id,
        nombre,
        codigo,
        pais_id
      ),
      ciudades (
        id,
        name,
        lat,
        lng,
        pais_id,
        provincia_id,
        population
      )
    `)
    .single();

  if (contactError) {
    throw new Error(`Error al crear contacto: ${contactError.message}`);
  }

  const empleados = await insertEmployees(createdContact.id, payload.empleados);

  return {
    ...createdContact,
    lat: toNullableNumber(createdContact.lat),
    lng: toNullableNumber(createdContact.lng),
    empleados,
  };
}

/**
 * Actualiza un contacto y reemplaza empleados
 */
export async function updateContact(contactId, payload) {
  const contactoPayload = {
    pais_id: payload.pais_id,
    provincia_id: payload.provincia_id ?? null,
    ciudad_id: payload.ciudad_id ?? null,
    nombre: toNullableString(payload.nombre),
    cargo: toNullableString(payload.cargo),
    empresa: toNullableString(payload.empresa),
    direccion: toNullableString(payload.direccion),
    telefono: toNullableString(payload.telefono),
    email: toNullableString(payload.email),
    lat: toNullableNumber(payload.lat),
    lng: toNullableNumber(payload.lng),
  };

  const { data: updatedContact, error: updateError } = await supabase
    .from("contactos")
    .update(contactoPayload)
    .eq("id", contactId)
    .select(`
      id,
      pais_id,
      provincia_id,
      ciudad_id,
      nombre,
      cargo,
      empresa,
      direccion,
      telefono,
      email,
      usuario_id,
      lat,
      lng,
      paises (
        id,
        nombre,
        iso,
        codigo_telefono,
        continente
      ),
      provincias (
        id,
        nombre,
        codigo,
        pais_id
      ),
      ciudades (
        id,
        name,
        lat,
        lng,
        pais_id,
        provincia_id,
        population
      )
    `)
    .single();

  if (updateError) {
    throw new Error(`Error al actualizar contacto: ${updateError.message}`);
  }

  const { error: deleteEmployeesError } = await supabase
    .from("empleados")
    .delete()
    .eq("contacto_id", contactId);

  if (deleteEmployeesError) {
    throw new Error(
      `Error al reemplazar empleados: ${deleteEmployeesError.message}`,
    );
  }

  const empleados = await insertEmployees(contactId, payload.empleados);

  return {
    ...updatedContact,
    lat: toNullableNumber(updatedContact.lat),
    lng: toNullableNumber(updatedContact.lng),
    empleados,
  };
}

/**
 * Elimina primero empleados y luego contacto
 */
export async function deleteContact(contactId) {
  const { error: empleadosError } = await supabase
    .from("empleados")
    .delete()
    .eq("contacto_id", contactId);

  if (empleadosError) {
    throw new Error(`Error al eliminar empleados: ${empleadosError.message}`);
  }

  const { error: contactoError } = await supabase
    .from("contactos")
    .delete()
    .eq("id", contactId);

  if (contactoError) {
    throw new Error(`Error al eliminar contacto: ${contactoError.message}`);
  }

  return true;
}

export async function findExistingContact({
  email,
  nombre,
  empresa,
  paisId,
  ciudadId = null,
}) {
  const normalizedEmail = toNullableString(email)?.toLowerCase();
  const normalizedNombre = toNullableString(nombre);
  const normalizedEmpresa = toNullableString(empresa);

  if (normalizedEmail) {
    let query = supabase
      .from("contactos")
      .select("id, nombre, empresa, email, pais_id, ciudad_id")
      .eq("pais_id", paisId)
      .ilike("email", normalizedEmail)
      .limit(1);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error al buscar contacto existente por email: ${error.message}`);
    }

    if (data?.length) {
      return data[0];
    }
  }

  let query = supabase
    .from("contactos")
    .select("id, nombre, empresa, email, pais_id, ciudad_id")
    .eq("pais_id", paisId)
    .ilike("nombre", normalizedNombre || "");

  if (normalizedEmpresa) {
    query = query.ilike("empresa", normalizedEmpresa);
  }

  if (ciudadId) {
    query = query.eq("ciudad_id", ciudadId);
  }

  const { data, error } = await query.limit(1);

  if (error) {
    throw new Error(`Error al buscar contacto existente por datos base: ${error.message}`);
  }

  return data?.[0] ?? null;
}


export async function getCitiesForImport({
  paisId,
  provinciaId = null,
}) {
  if (!paisId) return [];

  let query = supabase
    .from("ciudades")
    .select("id, name, lat, lng, pais_id, provincia_id, population")
    .eq("pais_id", paisId);

  if (provinciaId) {
    query = query.eq("provincia_id", provinciaId);
  }

  const { data, error } = await query.order("population", { ascending: false });

  if (error) {
    throw new Error(`Error al obtener ciudades para importación: ${error.message}`);
  }

  return data ?? [];
}