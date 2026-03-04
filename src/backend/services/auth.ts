import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Validation schemas
export const signUpSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  displayName: z.string().trim().min(1, "Display name is required").max(100).optional(),
});

export const signInSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(1, "Password is required").max(128),
});

export const profileUpdateSchema = z.object({
  display_name: z.string().trim().min(1).max(100).optional(),
  bio: z.string().trim().max(500).optional(),
  avatar_url: z.string().url().max(2048).optional(),
});

export const signUp = async (email: string, password: string, displayName?: string) => {
  const validated = signUpSchema.parse({ email, password, displayName });
  const { data, error } = await supabase.auth.signUp({
    email: validated.email,
    password: validated.password,
    options: {
      data: { display_name: validated.displayName },
      emailRedirectTo: window.location.origin,
    },
  });
  if (error) throw new Error("Unable to create account. Please try again.");
  return data;
};

export const signIn = async (email: string, password: string) => {
  const validated = signInSchema.parse({ email, password });
  const { data, error } = await supabase.auth.signInWithPassword({
    email: validated.email,
    password: validated.password,
  });
  if (error) throw new Error("Invalid email or password.");
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error("Unable to sign out. Please try again.");
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw new Error("Authentication required.");
  return user;
};

/** Always fetches profile for the currently authenticated user — never accepts arbitrary userId */
export const getMyProfile = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required.");
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (error) throw new Error("Unable to load profile.");
  return data;
};

/** @deprecated Use getMyProfile() instead to prevent IDOR attacks */
export const getProfile = async (userId: string) => {
  const user = await getCurrentUser();
  if (!user || user.id !== userId) throw new Error("Authentication required.");
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) throw new Error("Unable to load profile.");
  return data;
};

export const updateProfile = async (updates: { display_name?: string; bio?: string; avatar_url?: string }) => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required.");
  
  const validated = profileUpdateSchema.parse(updates);
  
  const { data, error } = await supabase
    .from("profiles")
    .update(validated)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) throw new Error("Unable to update profile.");
  return data;
};
