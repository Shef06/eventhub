<script lang="ts">
  import { onMount } from 'svelte';
  import { getEventById, updateEventStatus, deleteEvent } from '../services/api';
  import { push } from 'svelte-spa-router';
  import { token } from '../stores/auth';

  // Parametro per l'ID dell'evento dalla route
  export let params: { id: string };

  interface Partecipante {
    id: string;
    nome: string;
    avatar?: string;
    stato?: 'in_attesa' | 'approvato' | 'rifiutato';
  }

  interface Evento {
    _id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    time?: string;
    location: string;
    imageUrl: string;
    maxParticipants: number | null;
    participants: Partecipante[];
    richiestePendenti: Partecipante[];
    creator: string;
    stato: 'bozza' | 'pubblicato' | 'concluso' | 'annullato';
  }

  let evento: Evento | null = null;
  let loading = true;
  let error: string | null = null;
  let statusUpdateLoading = false;
  let showDeleteConfirm = false;
  let deleteLoading = false;

  onMount(async () => {
    try {
      const data = await getEventById(params.id);
      evento = data;
    } catch (e) {
      error = "Errore nel caricamento dell'evento";
      console.error(e);
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

  async function approvaRichiesta(partecipanteId: string) {
    // TODO: Implementare l'approvazione della richiesta
    console.log('Approva richiesta:', partecipanteId);
  }

  async function rifiutaRichiesta(partecipanteId: string) {
    // TODO: Implementare il rifiuto della richiesta
    console.log('Rifiuta richiesta:', partecipanteId);
  }

  async function modificaStato(nuovoStato: Evento['stato']) {
    if (!evento) return;
    
    try {
      statusUpdateLoading = true;
      await updateEventStatus(evento._id, nuovoStato);
      evento = { ...evento, stato: nuovoStato };
    } catch (e) {
      console.error('Errore durante l\'aggiornamento dello stato:', e);
      error = "Errore durante l'aggiornamento dello stato dell'evento";
    } finally {
      statusUpdateLoading = false;
    }
  }

  async function handleDeleteEvent() {
    if (!evento || !$token) return;
    
    try {
      deleteLoading = true;
      await deleteEvent(evento._id, $token);
      push('/profilo');
    } catch (e) {
      console.error('Errore durante l\'eliminazione dell\'evento:', e);
      error = "Errore durante l'eliminazione dell'evento";
    } finally {
      deleteLoading = false;
      showDeleteConfirm = false;
    }
  }
</script>

{#if loading}
  <div class="flex justify-center items-center min-h-screen">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
{:else if error}
  <div class="alert alert-error">
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span>{error}</span>
  </div>
{:else if evento}
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Gestione Evento</h1>
      <div class="flex gap-2">
        <button 
          class="btn btn-outline"
          on:click={() => evento && push(`/evento/${evento._id}`)}
        >
          Visualizza evento
        </button>
        
        <button 
          class="btn btn-primary"
          on:click={() => evento && push(`/modifica-evento/${evento._id}`)}
        >
          Modifica evento
        </button>

        <button 
          class="btn btn-error"
          on:click={() => showDeleteConfirm = true}
        >
          Elimina evento
        </button>
      </div>
    </div>

    {#if showDeleteConfirm}
      <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div class="bg-base-100 p-6 rounded-lg max-w-md w-full mx-4">
          <h3 class="text-lg font-bold mb-4">Conferma eliminazione</h3>
          <p class="mb-6">Sei sicuro di voler eliminare questo evento? Questa azione non può essere annullata.</p>
          <div class="flex gap-2 justify-end">
            <button 
              class="btn btn-ghost" 
              on:click={() => showDeleteConfirm = false}
              disabled={deleteLoading}
            >
              Annulla
            </button>
            <button 
              class="btn btn-error" 
              on:click={handleDeleteEvent}
              disabled={deleteLoading}
            >
              {#if deleteLoading}
                <span class="loading loading-spinner loading-sm"></span>
              {/if}
              Conferma eliminazione
            </button>
          </div>
        </div>
      </div>
    {/if}

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Informazioni evento -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Informazioni evento</h2>
          <div class="space-y-4">
            <div>
              <div class="text-sm text-base-content/70">Titolo</div>
              <div class="font-medium">{evento.title}</div>
            </div>
            <div>
              <div class="text-sm text-base-content/70">Data</div>
              <div class="font-medium">{formattaData(evento.date)}</div>
            </div>
            <div>
              <div class="text-sm text-base-content/70">Luogo</div>
              <div class="font-medium">{evento.location}</div>
            </div>
            <div>
              <div class="text-sm text-base-content/70">Categoria</div>
              <div class="font-medium">{evento.category}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Richieste di partecipazione -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Richieste di partecipazione</h2>
          {#if evento.richiestePendenti?.length > 0}
            <div class="space-y-4">
              {#each evento.richiestePendenti as richiesta}
                <div class="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                  <div class="flex items-center gap-3">
                    <div class="avatar">
                      <div class="w-10 rounded-full">
                        <img src={richiesta.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(richiesta.nome)}`} alt={richiesta.nome} />
                      </div>
                    </div>
                    <div>
                      <div class="font-medium">{richiesta.nome}</div>
                      <div class="text-sm text-base-content/70">In attesa</div>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button 
                      class="btn btn-sm btn-success"
                      on:click={() => approvaRichiesta(richiesta.id)}
                    >
                      Approva
                    </button>
                    <button 
                      class="btn btn-sm btn-error"
                      on:click={() => rifiutaRichiesta(richiesta.id)}
                    >
                      Rifiuta
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="text-center py-8 text-base-content/70">
              Nessuna richiesta di partecipazione in attesa
            </div>
          {/if}
        </div>
      </div>

      <!-- Partecipanti -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Partecipanti</h2>
          {#if evento.participants?.length > 0}
            <div class="space-y-4">
              {#each evento.participants as partecipante}
                <div class="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                  <div class="flex items-center gap-3">
                    <div class="avatar">
                      <div class="w-10 rounded-full">
                        <img src={partecipante.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partecipante.nome)}`} alt={partecipante.nome} />
                      </div>
                    </div>
                    <div>
                      <div class="font-medium">{partecipante.nome}</div>
                      <div class="text-sm text-success">Partecipante</div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="text-center py-8 text-base-content/70">
              Nessun partecipante al momento
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if} 