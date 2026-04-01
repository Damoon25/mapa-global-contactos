import { supabase } from "../lib/supabase";

const MEETING_SELECT = `
  id,
  contacto_id,
  titulo,
  descripcion,
  lugar,
  fecha_inicio,
  fecha_fin,
  estado,
  created_at,
  contactos (
    id,
    nombre,
    cargo,
    empresa,
    telefono,
    email,
    lat,
    lng,
    direccion,
    pais_id,
    provincia_id,
    ciudad_id,
    paises (
      id,
      nombre,
      iso,
      continente,
      codigo_telefono
    ),
    provincias (
      id,
      nombre
    ),
    ciudades (
      id,
      name,
      lat,
      lng
    )
  )
`;

export async function getMeetings() {
  const { data, error } = await supabase
    .from("reuniones")
    .select(MEETING_SELECT)
    .order("fecha_inicio", { ascending: true });

  if (error) {
    console.error("Error loading meetings:", error);
    throw error;
  }

  return data ?? [];
}

export async function createMeeting(payload) {
  const { data, error } = await supabase
    .from("reuniones")
    .insert([payload])
    .select(MEETING_SELECT)
    .single();

  if (error) {
    console.error("Error creating meeting:", error);
    throw error;
  }

  return data;
}

export async function updateMeeting(meetingId, payload) {
  const { data, error } = await supabase
    .from("reuniones")
    .update(payload)
    .eq("id", meetingId)
    .select(MEETING_SELECT)
    .single();

  if (error) {
    console.error("Error updating meeting:", error);
    throw error;
  }

  return data;
}

export async function deleteMeeting(meetingId) {
  const { error } = await supabase
    .from("reuniones")
    .delete()
    .eq("id", meetingId);

  if (error) {
    console.error("Error deleting meeting:", error);
    throw error;
  }

  return true;
}