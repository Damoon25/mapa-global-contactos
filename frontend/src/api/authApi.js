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

export const getAuthorizedUser = async ({ userId, email }) => {
  const normalizedEmail = email?.trim().toLowerCase() || null;

  if (userId) {
    const { data, error } = await supabase
      .from("usuarios_autorizados")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    if (data) return data;
  }

  if (normalizedEmail) {
    const { data, error } = await supabase
      .from("usuarios_autorizados")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) throw error;
    if (data) return data;
  }

  return null;
};

export const upsertPendingAuthorizedUser = async (user) => {
  const normalizedEmail = user.email.trim().toLowerCase();

  const { data, error } = await supabase
    .from("usuarios_autorizados")
    .upsert(
      {
        user_id: user.id,
        email: normalizedEmail,
        tipo_mapa: "global",
        rol: "viewer",
        activo: false,
      },
      { onConflict: "email" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const syncAuthorizedUserIdentity = async (authorizedUser, user) => {
  const normalizedEmail = user.email.trim().toLowerCase();

  const needsSync =
    authorizedUser.user_id !== user.id ||
    authorizedUser.email !== normalizedEmail;

  if (!needsSync) return authorizedUser;

  const { data, error } = await supabase
    .from("usuarios_autorizados")
    .update({
      user_id: user.id,
      email: normalizedEmail,
    })
    .eq("id", authorizedUser.id)
    .select()
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


export const getAllAuthorizedUsers = async () => {
  const { data, error } = await supabase
    .from("usuarios_autorizados")
    .select("*")
    .order("activo", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const updateAuthorizedUser = async (id, updates) => {
  const { data, error } = await supabase
    .from("usuarios_autorizados")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};