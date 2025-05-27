import { writable } from 'svelte/store';

interface UserData {
  name: string;
  email: string;
  avatar: string;
  bio: string;
  telefono: string;
  citta: string;
}

function createUserStore() {
  const { subscribe, set, update } = writable<UserData>({
    name: localStorage.getItem('userName') || 'Utente',
    email: localStorage.getItem('userEmail') || '',
    avatar: localStorage.getItem('userAvatar') || '',
    bio: localStorage.getItem('userBio') || '',
    telefono: localStorage.getItem('userTelefono') || '',
    citta: localStorage.getItem('userCitta') || ''
  });

  return {
    subscribe,
    update: (data: Partial<UserData>) => {
      update(user => {
        const updatedUser = { ...user, ...data };
        // Aggiorna localStorage
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined) {
            localStorage.setItem(`user${key.charAt(0).toUpperCase() + key.slice(1)}`, value || '');
          }
        });
        return updatedUser;
      });
    },
    reset: () => {
      set({
        name: 'Utente',
        email: '',
        avatar: '',
        bio: '',
        telefono: '',
        citta: ''
      });
      // Pulisce localStorage
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userAvatar');
      localStorage.removeItem('userBio');
      localStorage.removeItem('userTelefono');
      localStorage.removeItem('userCitta');
    }
  };
}

export const userData = createUserStore(); 