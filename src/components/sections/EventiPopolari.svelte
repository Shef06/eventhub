<script lang="ts">
  import EventoCard from '../ui/EventoCard.svelte';
  import { onMount } from 'svelte';
  import { getEvents } from '../../services/api';
  import { push } from 'svelte-spa-router';
  
  interface EventoAPI {
    _id: number;
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    category: string;
    maxParticipants: number;
    imageUrl: string;
    creator: string | null;
    participants: number[];
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
    titolo: string;
    data: string;
    luogo: string;
    categoria: string;
    immagine: string;
    partecipanti: number;
    organizzatore: string;
  }

  interface EventoCardData {
    id: string;
    titolo: string;
    data: string;
    luogo: string;
    categoria: string;
    immagine: string;
    numeroPartecipanti: number;
    organizzatore: {
      id: string;
      nome: string;
    };
  }
  
  let eventiPopolari: EventoCardData[] = [];
  let isLoading = true;
  let error: string | null = null;

  async function caricaEventiPopolari() {
    try {
      const eventi = await getEvents();
      // Ordina gli eventi per numero di partecipanti e prendi i primi 4
      eventiPopolari = eventi
        .sort((a: EventoAPI, b: EventoAPI) => (b.participants?.length || 0) - (a.participants?.length || 0))
        .slice(0, 4)
        .map((evento: EventoAPI): EventoCardData => ({
          id: evento._id.toString(),
          titolo: evento.title,
          data: evento.date,
          luogo: evento.location,
          categoria: evento.category,
          immagine: evento.imageUrl || evento.immagine,
          numeroPartecipanti: evento.participants?.length || 0,
          organizzatore: {
            id: evento.creator || '',
            nome: evento.creator?.nome || evento.organizzatore || 'Organizzatore'
          }
        }));
    } catch (err) {
      error = 'Errore nel caricamento degli eventi popolari';
      console.error('Errore nel caricamento degli eventi:', err);
    } finally {
      isLoading = false;
    }
  }

  function navigateTo(path: string) {
    push(path);
  }

  onMount(() => {
    caricaEventiPopolari();
  });
</script>

<section class="bg-base-100 py-16">
  <div class="container mx-auto px-4">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold mb-2">Eventi Popolari</h2>
      <p class="text-base-content/70 max-w-2xl mx-auto">Scopri gli eventi più interessanti e partecipati della nostra community</p>
    </div>
    
    {#if isLoading}
      <div class="flex justify-center items-center py-16">
        <div class="flex flex-col items-center">
          <span class="loading loading-spinner loading-lg text-primary"></span>
          <p class="mt-4 text-base-content/70">Caricamento eventi...</p>
        </div>
      </div>
    {:else if error}
      <div class="max-w-2xl mx-auto">
        <div class="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each eventiPopolari as evento, i (evento.id)}
          <div 
            class="animate-slide-up" 
            style="animation-delay: {i * 0.1}s;"
          >
            <EventoCard {...evento} />
          </div>
        {/each}
      </div>
      
      <div class="text-center mt-12">
        <button 
          class="btn btn-primary btn-wide" 
          on:click={() => navigateTo('/eventi')}
        >
          Visualizza tutti gli eventi
        </button>
      </div>
    {/if}
  </div>
</section>

<style>
  .animate-slide-up {
    opacity: 0;
    transform: translateY(20px);
    animation: slideUp 0.5s ease-out forwards;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>