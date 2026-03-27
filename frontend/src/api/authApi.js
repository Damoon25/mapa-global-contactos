import { supabase } from "../lib/supabase";

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
};

export const signInWithEmail = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

export const getAuthorizedUser = async (email) => {
  const { data, error } = await supabase
    .from("usuarios_autorizados")
    .select("*")
    .eq("email", email)
    .eq("activo", true)
    .single();

  if (error) throw error;
  return data;
};

export const createOrUpdateProfileFromAuthorizedUser = async (
  user,
  authorizedUser
) => {
  const payload = {
    id: user.id,
    nombre_completo:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      "",
    email: user.email,
    avatar_url: user.user_metadata?.avatar_url || "",
    tipo_mapa: authorizedUser.tipo_mapa,
  };

  const { data, error } = await supabase
    .from("perfiles")
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};