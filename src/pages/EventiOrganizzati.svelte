<script lang="ts">
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import EventoCard from '../components/ui/EventoCard.svelte';
  import { token } from '../stores/auth';
  
  interface Partecipante {
    id: string;
    nome: string;
    avatar?: string;
  }

  interface Evento {
    id: string;
    titolo: string;
    data: string;
    luogo: string;
    categoria: string;
    immagine: string;
    organizzatore: {
      id: string;
      nome: string;
    };
    numeroPartecipanti: number;
    partecipanti: Partecipante[];
  }

  let eventiOrganizzati: Evento[] = [];
  let loading = true;
  let error = '';
  
  onMount(() => {
    if (!$token) {
      push('/login');
      return;
    }
    
    try {
      // Recupera gli eventi organizzati dal localStorage
      eventiOrganizzati = JSON.parse(localStorage.getItem('eventiOrganizzati') || '[]');
      // Ordina gli eventi per data (più recenti prima)
      eventiOrganizzati.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  });
  
  function navigateTo(path: string) {
    push(path);
  }
</script>

<div class="page-container">
  <div class="flex justify-between items-center mb-8">
    <div>
      <h1 class="text-3xl font-bold">I tuoi eventi</h1>
      <p class="text-base-content/70 mt-2">Gestisci gli eventi che hai organizzato</p>
    </div>
    <button class="btn btn-primary" on:click={() => navigateTo('/crea-evento')}>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      Crea nuovo evento
    </button>
  </div>
  
  {#if loading}
    <div class="flex justify-center items-center min-h-[50vh]">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else if error}
    <div class="alert alert-error">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{error}</span>
    </div>
  {:else if eventiOrganizzati.length === 0}
    <div class="text-center py-16 bg-base-200 rounded-lg">
      <div class="mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 class="text-xl font-bold mb-2">Nessun evento organizzato</h3>
      <p class="text-base-content/70 mb-6 max-w-md mx-auto">
        Non hai ancora organizzato nessun evento. Inizia creando il tuo primo evento e condividi la tua passione con la community!
      </p>
      <button class="btn btn-primary" on:click={() => navigateTo('/crea-evento')}>
        Crea il tuo primo evento
      </button>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each eventiOrganizzati as evento (evento.id)}
        <div class="card bg-base-100 shadow-xl">
          <EventoCard 
            id={evento.id}
            titolo={evento.titolo}
            data={evento.data}
            luogo={evento.luogo}
            categoria={evento.categoria}
            immagine={evento.immagine}
            numeroPartecipanti={evento.numeroPartecipanti}
            organizzatore={evento.organizzatore}
            partecipanti={evento.partecipanti}
          />
          <div class="card-body pt-0">
            <div class="flex justify-between items-center mt-4">
              <div class="badge badge-outline">
                {evento.numeroPartecipanti} partecipanti
              </div>
              <div class="flex gap-2">
                <button class="btn btn-sm btn-ghost" on:click={() => navigateTo(`/evento/${evento.id}`)}>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button class="btn btn-sm btn-ghost" on:click={() => navigateTo(`/modifica-evento/${evento.id}`)}>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button class="btn btn-sm btn-ghost text-error">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
</style> 