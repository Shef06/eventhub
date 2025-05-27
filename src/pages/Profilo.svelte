<script lang="ts">
  import { onMount } from 'svelte';
  import { getUserProfile, getEventById } from '../services/api';
  import { push } from 'svelte-spa-router';
  import EventoPublicoCard from '../components/ui/EventoPublicoCard.svelte';
  import EventoOrganizzatoCard from '../components/ui/EventoOrganizzatoCard.svelte';
  // Importo il nuovo componente per gli eventi organizzati
  import EventiOrganizzati from '../components/sections/EventiOrganizzati.svelte';
  import { deleteAccount } from '../stores/auth';
  
  interface Partecipante {
    id: string;
    nome: string;
    avatar?: string;
  }
  
  // Interfaccia per la risposta dell'API di un singolo evento
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
    stato?: 'bozza' | 'pubblicato' | 'concluso' | 'annullato';
    richiestePendenti?: number;
  }

  // Interfaccia per i dati attesi dal componente EventoCard
  interface EventoCardData {
    id: string;
    titolo: string;
    data: string;
    luogo: string;
    categoria: string;
    immagine: string;
    organizzatore: { id: string; nome: string };
    numeroPartecipanti: number;
    maxPartecipanti?: number | null;
    stato?: 'bozza' | 'pubblicato' | 'concluso' | 'annullato';
    richiestePendenti?: number;
    partecipanti: Partecipante[];
  }

  interface ProfiloUtente {
    _id: number;
    name: string;
    email: string;
    role: string;
    createdEvents: string[];
    subscribedEvents: string[];
    createdAt: string;
    updatedAt: string;
    profileImageUrl: string;
    bio: string;
    eventiPartecipati: number;
    eventiOrganizzati: number;
  }
  
  let activeTab = 'partecipazioni';
  let utente: ProfiloUtente | null = null;
  let loading = true;
  let error = '';
  let eventiPartecipati: EventoCardData[] = [];
  let eventiOrganizzati: EventoCardData[] = [];
  let showDeleteConfirm = false;
  let deleteError = '';

  function getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  }

  function getAvatarUrl(utente: ProfiloUtente | null): string {
    if (utente && utente.profileImageUrl) {
      return utente.profileImageUrl;
    }
    if (utente && utente.name) {
      const initials = getInitials(utente.name);
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random`;    }
    return 'https://randomuser.me/api/portraits/men/32.jpg';
  }
  
  // Funzione per recuperare i dettagli completi di un array di eventi
  async function fetchEventDetails(eventIds: string[], isOrganized: boolean = false): Promise<EventoCardData[]> {
    console.log(`Fetching ${isOrganized ? 'organized' : 'participated'} events for IDs:`, eventIds);
    const validEventIds = eventIds.filter(id => id);
    const eventPromises = validEventIds.map(async (id) => {
      try {
        console.log('Fetching event details for ID:', id);
        const eventDetail: EventoAPIResponse = await getEventById(id);
        console.log('Received event details:', eventDetail);
        
        // Transform the data
        const transformedEvent: EventoCardData = {
          id: eventDetail._id.toString(),
          titolo: eventDetail.title,
          data: eventDetail.date,
          luogo: eventDetail.location,
          categoria: eventDetail.category,
          immagine: eventDetail.imageUrl || 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
          numeroPartecipanti: eventDetail.participants?.length || 0,
          maxPartecipanti: eventDetail.maxParticipants,
          organizzatore: { 
            id: eventDetail.creator?.toString() || '', 
            nome: eventDetail.organizzatore?.nome || 'Organizzatore' 
          },
          partecipanti: (eventDetail.participants || []).map(p => {
            if (typeof p === 'object' && p !== null) {
              return {
                id: (p as any).id || (p as any)._id || '',
                nome: (p as any).nome || (p as any).name || 'Partecipante',
                avatar: (p as any).avatar
              };
            }
            return { id: p.toString(), nome: 'Partecipante' };
          }),
        };

        if (isOrganized) {
          transformedEvent.stato = eventDetail.stato || 'pubblicato';
          transformedEvent.richiestePendenti = eventDetail.richiestePendenti || 0;
        }
        
        console.log('Transformed event data:', transformedEvent);
        return transformedEvent;
      } catch (err) {
        console.error(`Errore nel caricamento evento ${id}:`, err);
        return null;
      }
    });

    const events = await Promise.all(eventPromises);
    // Filtra gli eventi null (quelli che hanno dato errore)
    const validEvents = events.filter((event): event is EventoCardData => event !== null);
    console.log(`Final ${isOrganized ? 'organized' : 'participated'} events array:`, validEvents);
    return validEvents;
  }

  onMount(async () => {
    try {
      const profilo = await getUserProfile();
      console.log('Profilo utente caricato:', profilo);
      utente = profilo;

      // Carica eventi partecipati
      if (utente?.subscribedEvents && utente.subscribedEvents.length > 0) {
        console.log('Eventi sottoscritti trovati:', utente.subscribedEvents);
        const partecipati = await fetchEventDetails(utente.subscribedEvents);
        console.log('Eventi partecipati caricati e trasformati:', partecipati);
        eventiPartecipati = partecipati;
      }

      // Carica eventi organizzati
      if (utente?.createdEvents && utente.createdEvents.length > 0) {
        console.log('Eventi organizzati trovati:', utente.createdEvents);
        const organizzati = await fetchEventDetails(utente.createdEvents, true);
        console.log('Eventi organizzati caricati e trasformati:', organizzati);
        eventiOrganizzati = organizzati;
      }

    } catch (e: any) {
      error = 'Errore nel caricamento dei dati del profilo.';
      console.error('Errore:', e);
    } finally {
      loading = false;
    }
  });
  
  function formattaData(dataString: string): string {
    if (!dataString) return 'Data non disponibile';
    const data = new Date(dataString);
    if (isNaN(data.getTime())) return 'Data non valida';
    return data.toLocaleDateString('it-IT', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  }
  
  function navigateTo(path: string) {
    push(path);
  }

  async function handleDeleteAccount() {
    try {
      await deleteAccount();
      push('/');
    } catch (error: any) {
      deleteError = error.message || 'Error deleting account';
    }
  }
</script>

{#if loading}
  <div class="flex justify-center items-center min-h-[calc(100vh-64px)]">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
{:else if error}
  <div class="alert alert-error">
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    <span>{error}</span>
  </div>
{:else if utente}
  <div class="page-container bg-base-100">
    <div class="flex flex-col lg:flex-row gap-6 mb-8">
      <!-- Colonna profilo -->
      <div class="lg:w-1/3">
        <div class="card bg-base-100 shadow-md">
          <div class="card-body">
            <div class="flex flex-col items-center text-center">
              <div class="avatar mb-4">
                <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={getAvatarUrl(utente)} alt={utente.name} />
                </div>
              </div>
              <h2 class="text-2xl font-bold">{utente.name}</h2>
              <p class="text-base-content/70 mb-4">{utente.email}</p>
              {#if utente.bio}
                <p class="text-base-content/70 mb-4">{utente.bio}</p>
              {/if}
              <div class="stats stats-vertical shadow bg-base-200 w-full">
                <div class="stat">
                  <div class="stat-title">Registrato il</div>
                  <div class="stat-value text-lg">{formattaData(utente.createdAt)}</div>
                </div>
                <div class="stat">
                  <div class="stat-title">Eventi Partecipati</div>
                  <div class="stat-value text-lg">{utente.eventiPartecipati}</div>
                </div>
                <div class="stat">
                  <div class="stat-title">Eventi Organizzati</div>
                  <div class="stat-value text-lg">{utente.eventiOrganizzati}</div>
                </div>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="flex flex-col gap-2">
              <button class="btn btn-primary w-full" on:click={() => navigateTo('/crea-evento')}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crea nuovo evento
              </button>
              <button class="btn btn-outline w-full" on:click={() => navigateTo('/modifica-profilo')}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Modifica profilo
              </button>
            </div>

            <div class="divider">Zona Pericolosa</div>
            
            <div class="space-y-4">
              {#if !showDeleteConfirm}
                <button class="btn btn-error w-full" on:click={() => showDeleteConfirm = true}>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Elimina Account
                </button>
              {:else}
                <div class="alert alert-warning">
                  <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h3 class="font-bold">Sei sicuro di voler eliminare il tuo account?</h3>
                    <p class="text-sm">Questa azione non può essere annullata.</p>
                  </div>
                </div>
                
                {#if deleteError}
                  <div class="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{deleteError}</span>
                  </div>
                {/if}
                
                <div class="flex gap-2">
                  <button class="btn btn-ghost flex-1" on:click={() => showDeleteConfirm = false}>
                    Annulla
                  </button>
                  <button class="btn btn-error flex-1" on:click={handleDeleteAccount}>
                    Conferma Eliminazione
                  </button>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Colonna eventi -->
      <div class="lg:w-2/3">
        <div class="card bg-base-100 shadow-md overflow-visible">
          <div class="card-body overflow-visible">
            <div class="tabs tabs-boxed bg-base-200 mb-6">
              <a 
                class="tab tab-lg {activeTab === 'partecipazioni' ? 'tab-active' : ''}"
                on:click={() => activeTab = 'partecipazioni'}
              >
                I miei eventi ({eventiPartecipati.length})
              </a>
              <a 
                class="tab tab-lg {activeTab === 'organizzati' ? 'tab-active' : ''}"
                on:click={() => activeTab = 'organizzati'}
              >
                Eventi organizzati ({utente?.eventiOrganizzati || 0})
              </a>
            </div>
            
            {#if activeTab === 'partecipazioni'}
              {#if eventiPartecipati.length > 0}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  {#each eventiPartecipati as evento (evento.id)}
                    <div class="relative z-20 w-full h-full">
                      <EventoPublicoCard 
                        {...evento} 
                        isUserParticipating={true}
                      />
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
                  <h3 class="text-xl font-bold mb-2">Nessun evento in programma</h3>
                  <p class="text-base-content/70 mb-6">Non stai partecipando a nessun evento al momento.</p>
                  <button class="btn btn-primary" on:click={() => navigateTo('/eventi')}>
                    Scopri nuovi eventi
                  </button>
                </div>
              {/if}
            {:else}
              {#if eventiOrganizzati.length > 0}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  {#each eventiOrganizzati as evento (evento.id)}
                    <div class="relative z-20 w-full h-full">
                      <EventoOrganizzatoCard {...evento} />
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
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  :global(.page-container) {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    position: relative;
    z-index: 1;
  }

  :global(.card) {
    position: relative;
    z-index: 10;
  }

  :global(.card-body) {
    position: relative;
    z-index: 20;
  }

  .animate-fade-in {
    animation: fadeIn 0.5s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>