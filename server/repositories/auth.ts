import bcrypt from 'bcryptjs';
import { getSupabase } from '../supabase.js';
import { db as localDb } from '../db.js';

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin';
  token?: string;
}

export async function authenticate(
  identifier: string,
  pass: string
): Promise<AdminUser | null> {
  const supabase = getSupabase();

  // Local fallback is only allowed when Supabase is not configured.
  if (!supabase) {
    return localDb.authenticate(identifier, pass);
  }

  const normalizedIdentifier = identifier.trim().toLowerCase();

  // Look up by username first.
  let { data, error } = await supabase
    .from('admin_users')
    .select('id, username, name, email, role, password_hash')
    .eq('username', normalizedIdentifier)
    .maybeSingle();

  // If not found, try email.
  if (!data && !error) {
    const emailResult = await supabase
      .from('admin_users')
      .select('id, username, name, email, role, password_hash')
      .eq('email', normalizedIdentifier)
      .maybeSingle();

    data = emailResult.data;
    error = emailResult.error;
  }

  if (error || !data) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(
    pass,
    data.password_hash
  );

  if (!passwordMatches) {
    return null;
  }

  return {
    id: data.id,
    username: data.username,
    name: data.name || data.username,
    email: data.email || '',
    role: data.role || 'admin',
    token: `token-${data.id}-${Date.now()}`
  };
}

export async function getUsers(): Promise<AdminUser[]> {
  const supabase = getSupabase();

  if (!supabase) {
    return localDb.getUsers();
  }

  const { data, error } = await supabase
    .from('admin_users')
    .select('id, username, name, email, role');

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function createUser(user: {
  username: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin';
  password: string;
}): Promise<AdminUser> {
  const supabase = getSupabase();

  if (!supabase) {
    return localDb.createUser(user);
  }

  const id = 'usr-' + Date.now();

  const passwordHash = await bcrypt.hash(
    user.password,
    12
  );

  const { data, error } = await supabase
    .from('admin_users')
    .insert([
      {
        id,
        username: user.username.trim().toLowerCase(),
        name: user.name,
        email: user.email.trim().toLowerCase(),
        role: user.role,
        password_hash: passwordHash
      }
    ])
    .select('id, username, name, email, role')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteUser(
  id: string
): Promise<boolean> {
  const supabase = getSupabase();

  if (!supabase) {
    return localDb.deleteUser(id);
  }

  const { error } = await supabase
    .from('admin_users')
    .delete()
    .eq('id', id);

  return !error;
}