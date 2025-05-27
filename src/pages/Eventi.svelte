<script lang="ts">
  import EventoCard from '../components/ui/EventoCard.svelte';
  import { onMount } from 'svelte';
  import { getEvents } from '../services/api';

  interface Evento {
    _id: number;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    category: string;
    maxParticipants: number;
    imageUrl: string;
    creator: any;
    participants: number[];
    state: 'bozza' | 'pubblicato' | 'concluso' | 'annullato';
  }
  
  let eventi: Evento[] = [];
  let eventiFiltrati: Evento[] = [];
  let categorie: string[] = [];
  let luoghi: string[] = [];
  let ricerca = '';
  let categoriaSelezionata = '';
  let luogoSelezionato = '';
  let dataSelezionata = '';
  let statoSelezionato: 'bozza' | 'pubblicato' | 'concluso' | 'annullato' | '' = '';
  let isLoading = true;

  // Funzione per caricare gli eventi con i filtri
  async function caricaEventi() {
    isLoading = true;
    try {
      const filtri = {
        search: ricerca || undefined,
        category: categoriaSelezionata || undefined,
        city: luogoSelezionato || undefined,
        date: dataSelezionata || undefined,
        status: statoSelezionato || undefined
      };

      const eventiData = await getEvents(filtri);
      eventi = eventiData;
      eventiFiltrati = eventi;
      
      // Estrai categorie e luoghi unici dagli eventi
      categorie = [...new Set(eventi.map(e => e.category))];
      luoghi = [...new Set(eventi.map(e => e.location.split(',')[0].trim()))];
      
      console.log('Eventi caricati:', eventi);
    } catch (error) {
      console.error('Errore nel caricamento degli eventi:', error);
    } finally {
      isLoading = false;
    }
  }

  // Reattività: ricarica gli eventi quando cambiano i filtri
  $: {
    console.log('Valori cambiati:', { ricerca, categoriaSelezionata, luogoSelezionato, dataSelezionata, statoSelezionato });
    caricaEventi();
  }

  function resetFiltri() {
    ricerca = '';
    categoriaSelezionata = '';
    luogoSelezionato = '';
    dataSelezionata = '';
    statoSelezionato = '';
    caricaEventi();
  }

  // Carica gli eventi all'avvio
  onMount(async () => {
    await caricaEventi();
  });
</script>

<div class="page-container">
  <div class="text-center mb-10">
    <h1 class="text-3xl font-bold mb-2">Esplora gli Eventi</h1>
    <p class="text-base-content/70 max-w-2xl mx-auto">Trova i migliori eventi in base ai tuoi interessi e alla tua posizione</p>
  </div>

  <!-- Filtri e Ricerca -->
  <div class="bg-base-100 rounded-box shadow-md p-4 mb-8">
    <div class="mb-4">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg class="w-4 h-4 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <input 
          type="search" 
          class="input input-bordered pl-10 w-full" 
          placeholder="Cerca eventi, luoghi, organizzatori..." 
          bind:value={ricerca}
          on:input={caricaEventi}
        />
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="form-control">
        <select 
          class="select select-bordered w-full" 
          bind:value={categoriaSelezionata}
        >
          <option value="">Tutte le categorie</option>
          {#each categorie as categoria}
            <option value={categoria}>{categoria}</option>
          {/each}
        </select>
      </div>

      <div class="form-control">
        <select 
          class="select select-bordered w-full" 
          bind:value={luogoSelezionato}
        >
          <option value="">Tutte le città</option>
          {#each luoghi as luogo}
            <option value={luogo}>{luogo}</option>
          {/each}
        </select>
      </div>

      <div class="form-control">
        <input 
          type="date" 
          class="input input-bordered w-full" 
          bind:value={dataSelezionata}
        />
      </div>

      <div class="form-control">
        <select 
          class="select select-bordered w-full" 
          bind:value={statoSelezionato}
        >
          <option value="">Tutti gli stati</option>
          <option value="bozza">Bozza</option>
          <option value="pubblicato">Pubblicato</option>
          <option value="concluso">Concluso</option>
          <option value="annullato">Annullato</option>
        </select>
      </div>
    </div>
    
    <div class="flex justify-end mt-4">
      <button class="btn btn-outline btn-sm mr-2" on:click={resetFiltri}>
        Reset filtri
      </button>
    </div>
  </div>

  <!-- Risultati -->
  <div>

    {@html (() => { console.log("Lunghezza eventiFiltrati?:", isLoading); return ""; })()}

    {#if isLoading}
      <div class="text-center py-16">
        <div class="loading loading-spinner loading-lg"></div>
        <p class="mt-4 text-base-content/70">Caricamento eventi...</p>
      </div>
    {:else if eventiFiltrati.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {#each eventiFiltrati as evento (evento._id)}
          <div class="animate-fade-in">
            <EventoCard 
              id={evento._id.toString()}
              titolo={evento.title}
              data={evento.date}
              luogo={evento.location}
              categoria={evento.category}
              immagine={evento.imageUrl}
              numeroPartecipanti={evento.participants?.length || 0}
              maxPartecipanti={evento.maxParticipants}
              organizzatore={{
                id: evento.creator?._id || evento.creator,
                nome: evento.creator?.name || evento.organizzatore?.nome || 'Organizzatore'
              }}
              state={evento.state}
            />
          </div>
        {/each}
      </div>
    {:else}
      <div class="text-center py-16">
        <div class="mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold mb-2">Nessun evento trovato</h3>
        <p class="text-base-content/70 max-w-md mx-auto">Non abbiamo trovato eventi che corrispondono ai tuoi criteri di ricerca. Prova a modificare i filtri o a cercare qualcos'altro.</p>
        <button class="btn btn-primary mt-4" on:click={resetFiltri}>
          Reset filtri
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
</style>