import bcrypt from 'bcryptjs';
import { getSupabase } from '../supabase.js';
import { db as localDb } from '../db.js';
import { createAdminToken } from '../authToken.js';

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

  if (!supabase) {
    return localDb.authenticate(identifier, pass);
  }

  const normalizedIdentifier = identifier.trim().toLowerCase();

  let { data, error } = await supabase
    .from('admin_users')
    .select('id, username, name, email, role, password_hash')
    .eq('username', normalizedIdentifier)
    .maybeSingle();

  if (!data && !error) {
    const emailResult = await supabase
      .from('admin_users')
      .select('id, username, name, email, role, password_hash')
      .eq('email', normalizedIdentifier)
      .maybeSingle();

    data = emailResult.data;
    error = emailResult.error;
  }

  if (error) {
    console.error('Admin authentication database error:', error);
    throw new Error('Unable to authenticate administrator.');
  }

  if (!data || !data.password_hash) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(
    pass,
    data.password_hash
  );

  if (!passwordMatches) {
    return null;
  }

  const role: 'super_admin' | 'admin' =
    data.role === 'super_admin'
      ? 'super_admin'
      : 'admin';

  const token = createAdminToken({
    id: data.id,
    username: data.username,
    role
  });

  return {
    id: data.id,
    username: data.username,
    name: data.name || data.username,
    email: data.email || '',
    role,
    token
  };
}

export async function getUsers(): Promise<AdminUser[]> {
  const supabase = getSupabase();

  if (!supabase) {
    return localDb.getUsers();
  }

  const { data, error } = await supabase
    .from('admin_users')
    .select('id, username, name, email, role')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to load admin users:', error);
    throw new Error('Unable to load administrators.');
  }

  return (data || []).map(user => ({
    id: user.id,
    username: user.username,
    name: user.name || user.username,
    email: user.email || '',
    role:
      user.role === 'super_admin'
        ? 'super_admin'
        : 'admin'
  }));
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

  const username = user.username.trim().toLowerCase();
  const email = user.email.trim().toLowerCase();

  if (!username) {
    throw new Error('Username is required.');
  }

  if (!user.password || user.password.length < 10) {
    throw new Error(
      'Administrator password must be at least 10 characters long.'
    );
  }

  const passwordHash = await bcrypt.hash(
    user.password,
    12
  );

  const id = `usr-${Date.now()}`;

  const { data, error } = await supabase
    .from('admin_users')
    .insert([
      {
        id,
        username,
        name: user.name?.trim() || username,
        email,
        role: user.role,
        password_hash: passwordHash,
        created_at: new Date().toISOString()
      }
    ])
    .select('id, username, name, email, role')
    .single();

  if (error) {
    console.error('Failed to create admin user:', error);
    throw new Error(error.message);
  }

  return {
    id: data.id,
    username: data.username,
    name: data.name || data.username,
    email: data.email || '',
    role:
      data.role === 'super_admin'
        ? 'super_admin'
        : 'admin'
  };
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

  if (error) {
    console.error('Failed to delete admin user:', error);
    return false;
  }

  return true;
}