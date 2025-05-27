import { API_URL } from '../config';

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function register(name: string, email: string, password: string) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function getEvents(filters?: { search?: string; category?: string; city?: string; date?: string; status?: 'bozza' | 'pubblicato' | 'concluso' | 'annullato' }) {
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.category) queryParams.append('category', filters.category);
  if (filters?.city) queryParams.append('city', filters.city);
  if (filters?.date) queryParams.append('date', filters.date);
  if (filters?.status) queryParams.append('status', filters.status);

  const response = await fetch(`${API_URL}/api/events?${queryParams.toString()}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function getEventById(id: string) {
  const response = await fetch(`${API_URL}/api/events/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function createEvent(eventData: any, token: string) {
  const response = await fetch(`${API_URL}/api/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function joinEvent(eventId: string, token: string) {
  const response = await fetch(`${API_URL}/api/events/${eventId}/join`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function leaveEvent(eventId: string, token: string) {
  const response = await fetch(`${API_URL}/api/events/${eventId}/leave`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function getUserEvents(token: string) {
  const response = await fetch(`${API_URL}/api/events/user/events`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function getNotifications(token: string) {
  const response = await fetch(`${API_URL}/api/notifications`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function getUserProfile() {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/api/auth/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function getEventCategories() {
  const response = await fetch(`${API_URL}/api/events/categories`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function getEventCities() {
  const response = await fetch(`${API_URL}/api/events/cities`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

// Update user profile
interface UserProfileUpdateData {
  name?: string;
  email?: string;
  profileImageUrl?: string;
  bio?: string;
}

export async function updateUserProfile(profileData: UserProfileUpdateData, token: string) {
  const response = await fetch(`${API_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function deleteAccount(token: string) {
  const response = await fetch(`${API_URL}/api/auth/account`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function getOrganizerProfile(id: string) {
  const response = await fetch(`${API_URL}/api/events/organizer/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export async function updateEventStatus(eventId: string, newStatus: 'bozza' | 'pubblicato' | 'concluso' | 'annullato') {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token non trovato');
  }

  const response = await fetch(`${API_URL}/api/events/${eventId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status: newStatus }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export interface EventUpdateData {
  title: string;
  description: string;
  category: string;
  date: string;
  time?: string;
  location: string;
  imageUrl?: string;
  maxParticipants: number | null;
  isPublic: boolean;
  state?: 'bozza' | 'pubblicato' | 'concluso' | 'annullato';
}

export async function updateEvent(eventId: string, eventData: EventUpdateData, token: string) {
  const response = await fetch(`${API_URL}/api/events/${eventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(eventData),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || "Error updating event");
  }

  return data;
}

export async function deleteEvent(eventId: string, token: string) {
  const response = await fetch(`${API_URL}/api/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error deleting event");
  }

  return response.json();
}