import { writable } from 'svelte/store';
import { login as apiLogin, register as apiRegister, deleteAccount as apiDeleteAccount } from '../services/api';
import { userData } from './user';

export const token = writable<string | null>(localStorage.getItem('token'));
export const userId = writable<string | null>(localStorage.getItem('userId'));
export const isAuthenticated = writable<boolean>(!!localStorage.getItem('token'));

export async function login(email: string, password: string) {
  try {
    const data = await apiLogin(email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);
    token.set(data.token);
    userId.set(data.userId);
    isAuthenticated.set(true);

    // Store all user profile data in localStorage
    localStorage.setItem('userName', data.name);
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('userAvatar', data.profileImageUrl || '');
    localStorage.setItem('userBio', data.bio || '');
    localStorage.setItem('userTelefono', data.telefono || '');
    localStorage.setItem('userCitta', data.citta || '');

    // Update user data store with complete profile information
    userData.update({
      name: data.name,
      email: data.email,
      avatar: data.profileImageUrl || '',
      bio: data.bio || '',
      telefono: data.telefono || '',
      citta: data.citta || ''
    });

    return data;
  } catch (error) {
    throw error;
  }
}

export async function register(name: string, email: string, password: string) {
  try {
    const data = await apiRegister(name, email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);
    token.set(data.token);
    userId.set(data.userId);
    isAuthenticated.set(true);

    // Update user data store with profile information
    userData.update({
      name: data.name,
      email: data.email,
      avatar: data.profileImageUrl || '',
      bio: data.bio || '',
      telefono: data.telefono || '',
      citta: data.citta || ''
    });

    return data;
  } catch (error) {
    throw error;
  }
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  token.set(null);
  userId.set(null);
  isAuthenticated.set(false);
}

export async function deleteAccount() {
  try {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      throw new Error('Not authenticated');
    }
    
    await apiDeleteAccount(currentToken);
    logout(); // Log out after successful deletion
    return { success: true };
  } catch (error) {
    throw error;
  }
}