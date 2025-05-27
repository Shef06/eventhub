<script lang="ts">
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { token } from '../stores/auth';
  import { getEventById, updateEvent, type EventUpdateData } from '../services/api';

  // Parametro per l'ID dell'evento dalla route
  export let params: { id: string };

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
    isPublic: boolean;
    creator: string;
    stato: 'bozza' | 'pubblicato' | 'concluso' | 'annullato';
  }

  let loading = true;
  let saving = false;
  let error: string | null = null;
  let success = false;

  // Form fields
  let title = '';
  let description = '';
  let category = '';
  let date = '';
  let time = '';
  let location = '';
  let imageUrl = '';
  let maxParticipants: number | null = null;
  let isPublic = true;
  let stato: 'bozza' | 'pubblicato' | 'concluso' | 'annullato' = 'bozza';

  onMount(async () => {
    try {
      const evento = await getEventById(params.id);
      
      // Popola i campi del form con i dati dell'evento
      title = evento.title;
      description = evento.description;
      category = evento.category;
      date = new Date(evento.date).toISOString().split('T')[0];
      time = evento.time || '';
      location = evento.location;
      imageUrl = evento.imageUrl;
      maxParticipants = evento.maxParticipants;
      isPublic = evento.isPublic ?? true;
      stato = evento.stato || 'bozza';
    } catch (e) {
      error = "Errore nel caricamento dell'evento";
      console.error(e);
    } finally {
      loading = false;
    }
  });

  async function handleSubmit() {
    try {
      saving = true;
      error = null;

      // Validazione
      if (!title || !description || !category || !date || !location) {
        error = 'Compila tutti i campi obbligatori';
        return;
      }

      // Prepara i dati da aggiornare
      const updateData: EventUpdateData = {
        title,
        description,
        category,
        date: new Date(date + (time ? 'T' + time : 'T00:00:00')).toISOString(),
        time,
        location,
        imageUrl,
        maxParticipants: maxParticipants || null,
        isPublic,
        state: stato
      };

      // Verifica che il token sia disponibile
      if (!$token) {
        error = 'Sessione scaduta. Effettua nuovamente il login.';
        return;
      }

      // Aggiorna l'evento tramite API
      await updateEvent(params.id, updateData, $token);

      success = true;
      setTimeout(() => {
        push(`/gestione-evento/${params.id}`);
      }, 1500);
    } catch (e: any) {
      error = e.message || "Errore durante l'aggiornamento dell'evento";
      console.error(e);
    } finally {
      saving = false;
    }
  }

  function handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg';
  }
</script>

<div class="page-container">
  {#if loading}
    <div class="flex justify-center items-center min-h-[50vh]">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else if error}
    <div class="alert alert-error shadow-lg mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{error}</span>
    </div>
  {:else if success}
    <div class="alert alert-success shadow-lg mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Evento aggiornato con successo!</span>
    </div>
  {/if}

  <div class="card bg-base-100 shadow-xl max-w-4xl mx-auto">
    <div class="card-body">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">Modifica Evento</h2>
        <button 
          class="btn btn-ghost" 
          on:click={() => push(`/gestione-evento/${params.id}`)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Indietro
        </button>
      </div>

      <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Colonna sinistra -->
          <div class="space-y-6">
            <div class="form-control">
              <label class="label" for="title">
                <span class="label-text">Titolo evento *</span>
              </label>
              <input
                type="text"
                id="title"
                class="input input-bordered w-full"
                bind:value={title}
                required
              />
            </div>

            <div class="form-control">
              <label class="label" for="description">
                <span class="label-text">Descrizione *</span>
              </label>
              <textarea
                id="description"
                class="textarea textarea-bordered h-32"
                bind:value={description}
                required
              ></textarea>
            </div>

            <div class="form-control">
              <label class="label" for="category">
                <span class="label-text">Categoria *</span>
              </label>
              <select 
                id="category"
                class="select select-bordered w-full"
                bind:value={category}
                required
              >
                <option value="">Seleziona una categoria</option>
                <option value="Musica">Musica</option>
                <option value="Sport">Sport</option>
                <option value="Arte">Arte</option>
                <option value="Food">Food & Drink</option>
                <option value="Tech">Tech</option>
                <option value="Business">Business</option>
                <option value="Altro">Altro</option>
              </select>
            </div>

            <div class="form-control">
              <label class="label" for="stato">
                <span class="label-text">Stato evento *</span>
              </label>
              <select 
                id="stato"
                class="select select-bordered w-full"
                bind:value={stato}
                required
              >
                <option value="bozza">Bozza</option>
                <option value="pubblicato">Pubblicato</option>
                <option value="concluso">Concluso</option>
                <option value="annullato">Annullato</option>
              </select>
            </div>
          </div>

          <!-- Colonna destra -->
          <div class="space-y-6">
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label" for="date">
                  <span class="label-text">Data *</span>
                </label>
                <input
                  type="date"
                  id="date"
                  class="input input-bordered w-full"
                  bind:value={date}
                  required
                />
              </div>

              <div class="form-control">
                <label class="label" for="time">
                  <span class="label-text">Ora</span>
                </label>
                <input
                  type="time"
                  id="time"
                  class="input input-bordered w-full"
                  bind:value={time}
                />
              </div>
            </div>

            <div class="form-control">
              <label class="label" for="location">
                <span class="label-text">Luogo *</span>
              </label>
              <input
                type="text"
                id="location"
                class="input input-bordered w-full"
                bind:value={location}
                required
              />
            </div>

            <div class="form-control">
              <label class="label" for="imageUrl">
                <span class="label-text">Immagine</span>
              </label>
              <input
                type="url"
                id="imageUrl"
                class="input input-bordered w-full"
                bind:value={imageUrl}
                placeholder="https://..."
              />
              {#if imageUrl}
                <div class="mt-2 relative aspect-video rounded-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    class="w-full h-full object-cover"
                    on:error={handleImageError}
                  />
                </div>
              {/if}
            </div>

            <div class="form-control">
              <label class="label" for="maxParticipants">
                <span class="label-text">Numero massimo partecipanti</span>
              </label>
              <input
                type="number"
                id="maxParticipants"
                class="input input-bordered w-full"
                bind:value={maxParticipants}
                min="1"
                placeholder="Lascia vuoto per nessun limite"
              />
            </div>

            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  class="checkbox"
                  bind:checked={isPublic}
                />
                <span class="label-text">Evento pubblico</span>
              </label>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-4 mt-8">
          <button 
            type="button" 
            class="btn btn-ghost" 
            on:click={() => push(`/gestione-evento/${params.id}`)}
          >
            Annulla
          </button>
          <button 
            type="submit" 
            class="btn btn-primary" 
            disabled={saving}
          >
            {#if saving}
              <span class="loading loading-spinner loading-sm"></span>
              Salvataggio...
            {:else}
              Salva modifiche
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

<style>
  .page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
</style> 