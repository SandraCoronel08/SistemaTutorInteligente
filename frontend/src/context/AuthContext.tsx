import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import type { Session } from "@supabase/supabase-js";
import { deleteCurrentAccount } from "../services/api";
import { supabase } from "../services/supabaseClient";
import type { AuthUser } from "../types/user";

const AVATAR_BUCKET = "profile-avatars";

const getProfileName = (user: AuthUser | null) => {
  const metadata = user?.user_metadata as Record<string, unknown> | undefined;
  const name = [metadata?.name, metadata?.full_name, metadata?.display_name].find(
    (value): value is string => typeof value === "string" && value.trim().length > 0
  );

  return name?.trim() ?? "Usuario";
};

const getAvatarPath = (user: AuthUser | null) => {
  const avatarPath = (user?.user_metadata as Record<string, unknown> | undefined)
    ?.avatar_path;

  return typeof avatarPath === "string" && avatarPath.length > 0 ? avatarPath : undefined;
};

type AuthContextValue = {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  profile: { name: string; avatarUrl?: string };
  updateProfileName: (name: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  removeAvatar: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren): JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string>();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setLoading(false);
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          full_name: name
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  }, []);

  const user = session?.user ?? null;
  const avatarPath = getAvatarPath(user);

  const refreshAvatarUrl = useCallback(async (path?: string) => {
    if (!path) {
      setAvatarUrl(undefined);
      return;
    }

    const { data, error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .createSignedUrl(path, 60 * 60);

    if (error) {
      throw new Error("No se pudo cargar la foto de perfil.");
    }

    setAvatarUrl(data.signedUrl);
  }, []);

  useEffect(() => {
    void refreshAvatarUrl(avatarPath).catch(() => setAvatarUrl(undefined));
  }, [avatarPath, refreshAvatarUrl]);

  const updateSessionUser = useCallback((nextUser: AuthUser) => {
    setSession((current) => (current ? { ...current, user: nextUser } : current));
  }, []);

  const deleteAccount = useCallback(async () => {
    await deleteCurrentAccount();

    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      throw new Error(error.message);
    }
  }, []);

  const updateProfileName = useCallback(async (name: string) => {
    const normalizedName = name.trim();

    if (!normalizedName || normalizedName.length > 80) {
      throw new Error("El nombre debe tener entre 1 y 80 caracteres.");
    }

    const { data, error } = await supabase.auth.updateUser({
      data: { name: normalizedName, full_name: normalizedName }
    });

    if (error || !data.user) {
      throw new Error("No se pudo actualizar el perfil.");
    }

    updateSessionUser(data.user);
  }, [updateSessionUser]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!user) {
      throw new Error("Usuario autenticado requerido.");
    }

    const path = `${user.id}/avatar`;
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      throw new Error("No se pudo guardar la foto de perfil.");
    }

    const { data, error } = await supabase.auth.updateUser({
      data: { avatar_path: path }
    });

    if (error || !data.user) {
      throw new Error("No se pudo actualizar el perfil.");
    }

    updateSessionUser(data.user);
    await refreshAvatarUrl(path);
  }, [refreshAvatarUrl, updateSessionUser, user]);

  const removeAvatar = useCallback(async () => {
    if (!user || !avatarPath) {
      return;
    }

    const { error: removeError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .remove([avatarPath]);

    if (removeError) {
      throw new Error("No se pudo eliminar la foto de perfil.");
    }

    const { data, error } = await supabase.auth.updateUser({
      data: { avatar_path: null }
    });

    if (error || !data.user) {
      throw new Error("No se pudo actualizar el perfil.");
    }

    updateSessionUser(data.user);
    setAvatarUrl(undefined);
  }, [avatarPath, updateSessionUser, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      deleteAccount,
      profile: { name: getProfileName(user), avatarUrl },
      updateProfileName,
      uploadAvatar,
      removeAvatar
    }),
    [
      avatarUrl,
      deleteAccount,
      loading,
      removeAvatar,
      session,
      signIn,
      signOut,
      signUp,
      updateProfileName,
      uploadAvatar,
      user
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }

  return context;
};
