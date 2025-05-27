<script lang="ts">
  import { onMount } from 'svelte';
  import { push, location } from 'svelte-spa-router';
  import EventoCard from '../components/ui/EventoCard.svelte';
  import { token } from '../stores/auth';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import { getEventById, getEvents, joinEvent, leaveEvent } from '../services/api';

  interface Partecipante {
    id: string;
    nome: string;
    avatar?: string;
    stato?: 'in_attesa' | 'approvato' | 'rifiutato';
  }

  interface Evento {
    id: string;
    titolo: string;
    descrizione: string;
    categoria: string;
    data: string;
    dataFine: string;
    luogo: string;
    indirizzo: string;
    immagine: string;
    numeroPartecipanti: number;
    organizzatore: {
      id: string;
      nome: string;
    };
    prezzo: number;
    maxPartecipanti: number | null;
    partecipanti: Partecipante[];
    richiedeAutorizzazione: boolean;
    richiestePendenti?: Partecipante[];
  }

  // Get the event ID from the URL
  let id = '';
  let evento: Evento | null = null;
  let loading = true;
  let error = '';
  let eventiCorrelati: Evento[] = [];
  let isPartecipando = false;
  let richiestaInviata = false;
  let mapContainer: HTMLElement;
  let map: any;
  let actionLoading = false;

  $: if ($location) {
    id = $location.split('/').pop() || '';
    loadEventData();
  }

  async function loadEventData() {
    loading = true;
    error = '';
    
    try {
      // Fetch event data from API
      const eventData = await getEventById(id);
      
      // Transform API response to match our Evento interface
      evento = {
        id: eventData._id.toString(),
        titolo: eventData.title,
        descrizione: eventData.description,
        categoria: eventData.category,
        data: eventData.date,
        dataFine: eventData.time || eventData.date,
        luogo: eventData.location,
        indirizzo: eventData.indirizzo || eventData.location,
        immagine: eventData.imageUrl,
        numeroPartecipanti: eventData.participants.length,
        organizzatore: {
          id: eventData.creator?.id || eventData.creator?._id || '',
          nome: eventData.creator?.nome || eventData.creator?.name || eventData.organizzatore?.nome || 'Organizzatore'
        },
        prezzo: eventData.prezzo || 0,
        maxPartecipanti: eventData.maxParticipants,
        partecipanti: eventData.participants.map((p: any) => ({
          id: typeof p === 'object' ? (p.id || p._id).toString() : p.toString(),
          nome: typeof p === 'object' ? (p.nome || p.name || 'Partecipante') : 'Partecipante',
          avatar: typeof p === 'object' ? p.avatar : undefined
        })),
        richiedeAutorizzazione: eventData.richiedeAutorizzazione || false,
        richiestePendenti: eventData.richiestePendenti || []
      };

      // Check if current user is participating
      const userId = localStorage.getItem('userId');
      if (userId && evento.partecipanti) {
        // Convert userId to string for comparison
        const userIdStr = userId.toString();
        isPartecipando = evento.partecipanti.some(p => p.id.toString() === userIdStr);
        richiestaInviata = evento.richiestePendenti?.some(p => 
          (typeof p === 'object' ? (p.id || p._id).toString() : p.toString()) === userIdStr
        ) || false;
        console.log('Stato partecipazione:', { 
          isPartecipando, 
          userId: userIdStr, 
          partecipanti: evento.partecipanti.map(p => p.id)
        });
      }

      // Load similar events
      const allEvents = await getEvents({ category: evento.categoria });
      eventiCorrelati = allEvents
        .filter((e: any) => e._id.toString() !== id)
        .slice(0, 3)
        .map((e: any) => ({
          id: e._id.toString(),
          titolo: e.title,
          data: e.date,
          luogo: e.location,
          categoria: e.category,
          immagine: e.imageUrl,
          numeroPartecipanti: e.participants.length,
          organizzatore: {
            id: e.creator?.id || e.creator?._id || '',
            nome: e.creator?.nome || e.creator?.name || e.organizzatore?.nome || 'Organizzatore'
          },
          partecipanti: []
        }));

    } catch (e: any) {
      console.error('Error loading event:', e);
      error = e.message || 'Errore nel caricamento dell\'evento';
    } finally {
      loading = false;
    }
  }

  // Funzione per inviare una richiesta di partecipazione
  async function inviaRichiesta() {
    if (!$token) {
      push('/login');
      return;
    }
    
    if (!evento) return;

    const userId = localStorage.getItem('userId');
    if (!userId) {
      push('/login');
      return;
    }

    actionLoading = true;
    try {
      await joinEvent(evento.id, $token);
      richiestaInviata = true;
      // Ricarica i dati dell'evento per aggiornare lo stato
      await loadEventData();
    } catch (e: any) {
      console.error('Error sending participation request:', e);
      error = e.message || 'Errore nell\'invio della richiesta di partecipazione';
    } finally {
      actionLoading = false;
    }
  }

  // Funzione per verificare lo stato della richiesta
  function verificaStatoRichiesta() {
    if (!evento || !evento.richiestePendenti) return null;
    
    const userId = localStorage.getItem('userId');
    if (!userId) return null;

    return evento.richiestePendenti.find(r => r.id === userId)?.stato || null;
  }

  async function togglePartecipazione() {
    if (!$token) {
      push('/login');
      return;
    }
    
    if (!evento) return;
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
      push('/login');
      return;
    }

    // Se l'evento richiede autorizzazione e l'utente non è già partecipante
    if (evento.richiedeAutorizzazione && !isPartecipando) {
      await inviaRichiesta();
      return;
    }
    
    actionLoading = true;
    try {
      if (isPartecipando) {
        await leaveEvent(evento.id, $token);
      } else {
        await joinEvent(evento.id, $token);
      }
      // Ricarica i dati dell'evento per aggiornare lo stato
      await loadEventData();
    } catch (e: any) {
      console.error('Error toggling participation:', e);
      error = e.message || 'Errore nella gestione della partecipazione';
    } finally {
      actionLoading = false;
    }
  }
  
  // Funzione per formattare la data
  function formattaData(dataString: string): string {
    const data = new Date(dataString);
    return data.toLocaleDateString('it-IT', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  }
  
  // Funzione per formattare l'ora
  function formattaOra(dataString: string): string {
    const data = new Date(dataString);
    return data.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  }
  
  async function initMap() {
    if (!evento || !mapContainer) return;

    try {
      const address = `${evento.indirizzo}, ${evento.luogo}`;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        
        if (map) {
          map.remove();
        }

        map = L.map(mapContainer).setView([parseFloat(lat), parseFloat(lon)], 15);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        L.marker([parseFloat(lat), parseFloat(lon)])
          .addTo(map)
          .bindPopup(`<b>${evento.titolo}</b><br>${evento.indirizzo}`);
      }
    } catch (error) {
      console.error('Errore nel caricamento della mappa:', error);
    }
  }

  $: {
    if (evento) {
      setTimeout(initMap, 100);
    }
  }

  onMount(() => {
    loadEventData();
    return () => {
      if (map) {
        map.remove();
      }
    };
  });
</script>

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
</svelte:head>

<div class="page-container">
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
  {:else if !evento}
    <div class="alert alert-warning">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>Evento non trovato</span>
    </div>
  {:else}
    <div class="mb-10">
      <button class="btn btn-ghost mb-4" on:click={() => push('/eventi')}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Torna agli eventi
      </button>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Colonna immagine e dettagli -->
        <div class="lg:col-span-2">
          <div class="rounded-lg overflow-hidden shadow-md mb-6 aspect-video">
            <img 
              src={evento.immagine} 
              alt={evento.titolo} 
              class="w-full h-full object-cover" 
            />
          </div>
          
          <div class="bg-base-100 p-6 rounded-lg shadow-md">
            <div class="flex flex-wrap justify-between items-start mb-4">
              <div>
                <div class="badge badge-secondary mb-2">{evento.categoria}</div>
                <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">{evento.titolo}</h1>
                <p class="text-base-content/70 text-lg">
                  Organizzato da: 
                  {#if evento?.organizzatore?.id}
                    <a 
                      href="/organizzatore/{evento.organizzatore.id}" 
                      class="text-primary hover:underline"
                      on:click|preventDefault={() => push(`/organizzatore/${evento.organizzatore.id}`)}
                    >
                      {evento.organizzatore?.nome || 'EventHub'}
                    </a>
                  {:else}
                    <span>{evento.organizzatore?.nome || 'EventHub'}</span>
                  {/if}
                </p>
              </div>
              
              <!-- Pulsante in alto a destra -->
              {#if isPartecipando}
                <button class="btn btn-error" on:click={togglePartecipazione} disabled={actionLoading}>
                  {#if actionLoading}
                    <span class="loading loading-spinner loading-sm"></span>
                  {/if}
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Lascia evento
                </button>
              {:else if richiestaInviata}
                <button class="btn btn-disabled">
                  Richiesta inviata
                </button>
              {:else if evento?.richiedeAutorizzazione}
                <button class="btn btn-primary" on:click={togglePartecipazione} disabled={actionLoading}>
                  {#if actionLoading}
                    <span class="loading loading-spinner loading-sm"></span>
                  {/if}
                  Richiedi di partecipare
                </button>
              {:else}
                <div class="tooltip" data-tip={evento.maxPartecipanti && evento.numeroPartecipanti >= evento.maxPartecipanti ? "L'evento è al completo" : ""}>
                  <button 
                    class="btn btn-primary" 
                    on:click={togglePartecipazione} 
                    disabled={actionLoading || (evento.maxPartecipanti && evento.numeroPartecipanti >= evento.maxPartecipanti)}
                  >
                    {#if actionLoading}
                      <span class="loading loading-spinner loading-sm"></span>
                    {/if}
                    Partecipa all'evento
                  </button>
                </div>
              {/if}
            </div>
            
            <div class="divider"></div>
            
            <h3 class="text-xl font-semibold mb-4">Descrizione</h3>
            <p class="mb-6">{evento.descrizione}</p>
            
            <h3 class="text-xl font-semibold mb-4">Dettagli</h3>
            <ul class="space-y-4">
              <li class="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <span class="font-semibold">Data:</span> {formattaData(evento.data)}
                </div>
              </li>
              <li class="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <span class="font-semibold">Orario:</span> dalle {formattaOra(evento.data)} alle {formattaOra(evento.dataFine)}
                </div>
              </li>
              <li class="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <span class="font-semibold">Luogo:</span> {evento.luogo}
                  <div class="text-sm text-base-content/70">{evento.indirizzo}</div>
                </div>
              </li>
              {#if evento.prezzo}
              <li class="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                <div>
                    <span class="font-semibold">Prezzo:</span> €{evento.prezzo}
                </div>
              </li>
              {/if}
            </ul>
          </div>
        </div>
        
        <!-- Colonna laterale -->
        <div class="lg:col-span-1">
          <div class="bg-base-100 p-6 rounded-lg shadow-md mb-6">
            <h3 class="text-lg font-semibold mb-4">Partecipanti</h3>
            <div class="flex items-center">
              <div class="avatar-group -space-x-6 mb-4">
                {#each (evento.partecipanti || []).slice(0, 4) as partecipante}
                <div class="avatar">
                  <div class="w-12">
                      <img src={partecipante.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partecipante.nome)}`} alt={partecipante.nome} />
                  </div>
                </div>
                {/each}
                {#if (evento.partecipanti?.length || 0) > 4}
                <div class="avatar placeholder">
                  <div class="w-12 bg-neutral text-neutral-content">
                      <span>+{evento.partecipanti.length - 4}</span>
                  </div>
                </div>
                {/if}
              </div>
            </div>
            <div class="text-sm mb-4">
              {evento.numeroPartecipanti || 0} persone partecipano a questo evento
            </div>
            {#if isPartecipando}
              <div class="alert alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <span class="font-semibold">Stai partecipando a questo evento!</span>
                  <p class="text-sm mt-1">Puoi annullare la tua partecipazione usando il pulsante in alto</p>
                </div>
              </div>
            {:else if richiestaInviata}
              <div class="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>La tua richiesta di partecipazione è in attesa di approvazione</span>
              </div>
            {:else}
              <div class="tooltip" data-tip={evento.maxPartecipanti && evento.numeroPartecipanti >= evento.maxPartecipanti ? "L'evento è al completo" : ""}>
                <button 
                  class="btn btn-primary" 
                  on:click={togglePartecipazione} 
                  disabled={actionLoading || (evento.maxPartecipanti && evento.numeroPartecipanti >= evento.maxPartecipanti)}
                >
                  {#if actionLoading}
                    <span class="loading loading-spinner loading-sm"></span>
                  {/if}
                  Partecipa all'evento
                </button>
              </div>
            {/if}
          </div>
          
          <div class="bg-base-100 p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold mb-4">Condividi l'evento</h3>
            <div class="flex gap-2 mb-4">
              <button class="btn btn-circle btn-outline">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-facebook" viewBox="0 0 16 16">
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                </svg>
              </button>
              <button class="btn btn-circle btn-outline">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-twitter" viewBox="0 0 16 16">
                  <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                </svg>
              </button>
              <button class="btn btn-circle btn-outline">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-linkedin" viewBox="0 0 16 16">
                  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                </svg>
              </button>
              <button class="btn btn-circle btn-outline">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-whatsapp" viewBox="0 0 16 16">
                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                </svg>
              </button>
              <button class="btn btn-circle btn-outline">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-envelope" viewBox="0 0 16 16">
                  <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.758 2.855L15 11.114v-5.73zm-.034 6.878L9.271 8.82 8 9.583 6.728 8.82l-5.694 3.44A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.739zM1 11.114l4.758-2.876L1 5.383v5.73z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mappa -->
      <div class="mt-8 bg-base-100 p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold mb-4">Luogo dell'evento</h3>
        <div bind:this={mapContainer} class="h-64 rounded-lg"></div>
        <p class="mt-4 text-base-content/70">{evento.indirizzo}</p>
      </div>

      <!-- Eventi Correlati -->
      {#if eventiCorrelati.length > 0}
        <div class="mt-12">
          <h2 class="text-2xl font-bold mb-6">Eventi Simili</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each eventiCorrelati as eventoCorrelato (eventoCorrelato.id)}
              <div class="animate-fade-in">
                <EventoCard 
                  id={eventoCorrelato.id} 
                  titolo={eventoCorrelato.titolo}
                  data={eventoCorrelato.data}
                  luogo={eventoCorrelato.luogo}
                  categoria={eventoCorrelato.categoria}
                  immagine={eventoCorrelato.immagine}
                  numeroPartecipanti={eventoCorrelato.numeroPartecipanti}
                  organizzatore={eventoCorrelato.organizzatore}
                  partecipanti={eventoCorrelato.partecipanti}
                />
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  :global(.leaflet-container) {
    height: 100%;
    width: 100%;
    border-radius: 0.5rem;
  }
</style>