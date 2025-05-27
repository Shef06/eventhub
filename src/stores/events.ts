import { writable } from 'svelte/store';
import { getEvents, getUserEvents } from '../services/api';
import { token } from './auth';

export const events = writable([]);
export const userEvents = writable({ createdEvents: [], subscribedEvents: [] });

export async function loadEvents() {
  try {
    const data = await getEvents();
    events.set(data);
  } catch (error) {
    console.error('Error loading events:', error);
  }
}

export async function loadUserEvents() {
  try {
    let currentToken;
    token.subscribe(value => currentToken = value)();
    
    if (currentToken) {
      const data = await getUserEvents(currentToken);
      userEvents.set(data);
    }
  } catch (error) {
    console.error('Error loading user events:', error);
  }
}