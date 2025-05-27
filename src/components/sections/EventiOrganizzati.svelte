<script lang="ts">
  import { onMount } from 'svelte';
  import { getEventById } from '../../services/api';
  import EventoCard from '../ui/EventoCard.svelte';
  import { push } from 'svelte-spa-router';
  
  // Interfacce riprese da Profilo.svelte per coerenza
  interface Partecipante {
    id: string;
    nome: string;
    avatar?: string;
  }
  
  interface EventoAPIResponse {
    _id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    time?: string;
    location: string;
    imageUrl: string;
    maxParticipants: number | null;
    participants: string[];
    creator: string;
    createdAt?: string;
    updatedAt?: string;
    isPublic?: boolean;
    bio?: string;
    indirizzo?: string;
    prezzo?: number;
    dataFine?: string;
    organizzatore?: { id: string; nome: string };
  }

  interface EventoCardData {
    id: string;
    titolo: string;
    data: string;
    luogo: string;
    categoria: string;
    immagine: string;
    organizzatore: { id: string; nome: string };
    numeroPartecipanti: number;
    partecipanti: Partecipante[];
  }

  // Prop che riceve l'array di ID degli eventi organizzati
  export let eventIds: string[] = [];
  
  let eventiOrganizzati: EventoCardData[] = [];
  let isLoading = true;
  let error: string | null = null;

  // Funzione per recuperare i dettagli completi di un array di eventi dato i loro ID
  async function fetchEventDetails(ids: string[]): Promise<EventoCardData[]> {
    const validEventIds = ids.filter(id => id);
    const eventPromises = validEventIds.map(async (id) => {
      try {
        const eventDetail: EventoAPIResponse = await getEventById(id);
        return {
          id: eventDetail._id,
          titolo: eventDetail.title,
          data: eventDetail.date,
          luogo: eventDetail.location,
          categoria: eventDetail.category,
          immagine: eventDetail.imageUrl,
          numeroPartecipanti: eventDetail.participants.length,
          organizzatore: eventDetail.organizzatore || { id: eventDetail.creator || '', nome: 'Organizzatore Sconosciuto' },
          partecipanti: eventDetail.participants.map(pId => ({ id: pId, nome: ''})),
        };
      } catch (err) {
        console.error(`Errore nel caricamento evento ${id}:`, err);
        return {
          id: id,
          titolo: 'Errore nel caricamento',
          data: '',
          luogo: '',
          categoria: '',
          immagine: '',
          numeroPartecipanti: 0,
          organizzatore: { id: '', nome: 'Errore' },
          partecipanti: [],
        };
      }
    });
    return Promise.all(eventPromises);
  }

  // Quando il componente viene montato o l'array eventIds cambia, carichiamo i dettagli degli eventi
  $: if (eventIds) {
    isLoading = true;
    error = null;
    fetchEventDetails(eventIds)
      .then(events => {
        eventiOrganizzati = events;
      })
      .catch(err => {
        error = 'Errore nel caricamento degli eventi organizzati.';
        console.error(err);
      })
      .finally(() => {
        isLoading = false;
      });
  }

  // Funzione per la navigazione
  function navigateTo(path: string) {
    push(path);
  }

</script>

{#if isLoading}
  <div class="flex justify-center items-center py-8">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
{:else if error}
  <div class="alert alert-error">
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    <span>{error}</span>
  </div>
{:else if eventiOrganizzati.length > 0}
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    {#each eventiOrganizzati as evento (evento.id)}
      <div class="animate-fade-in">
        <EventoCard {...evento} />
      </div>
    {/each}
  </div>
{:else}
  <div class="text-center py-16">
    <div class="mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
    <h3 class="text-xl font-bold mb-2">Nessun evento organizzato</h3>
    <p class="text-base-content/70 mb-6">Non hai ancora organizzato nessun evento. Inizia creando il tuo primo evento!</p>
    <button class="btn btn-primary" on:click={() => navigateTo('/crea-evento')}>
      Crea il tuo primo evento
    </button>
  </div>
{/if}

<style>
  /* Aggiungi stili specifici se necessario */
</style> 