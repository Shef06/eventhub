<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { token } from '../stores/auth';
  import { createEvent } from '../services/api';
  
  // Form state
  let titolo = '';
  let descrizione = '';
  let categoria = '';
  let luogo = '';
  let indirizzo = '';
  let data = '';
  let orarioInizio = '';
  let orarioFine = '';
  let prezzo = '';
  let maxPartecipanti = '';
  
  let isCreating = false;
  let isCreated = false;
  let eventoId = '';
  let errorMessage = '';
  
  interface CreateEventData {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    category: string;
    maxParticipants: number | null;
    imageUrl: string;
    isPublic: boolean;
  }
  
  // Categorie di esempio
  const categorie = [
    'Musica', 'Arte', 'Sport', 'Food', 'Tecnologia', 
    'Business', 'Scienza', 'Cultura', 'Educazione', 
    'Sociale', 'Moda', 'Salute', 'Altro'
  ];
  
  // Città di esempio
  const citta = [
    'Milano', 'Roma', 'Napoli', 'Torino', 'Firenze',
    'Bologna', 'Venezia', 'Palermo', 'Genova', 'Bari'
  ];
  
  interface Partecipante {
    id: string;
    nome: string;
    avatar?: string;
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
  }
  
  async function onSubmit() {
    if (!$token) {
      push('/login');
      return;
    }

    // Validazione orari
    const oraInizio = new Date(`${data}T${orarioInizio}`);
    const oraFine = new Date(`${data}T${orarioFine}`);
    
    if (oraFine <= oraInizio) {
      errorMessage = 'L\'orario di fine deve essere successivo all\'orario di inizio';
      return;
    }
    
    isCreating = true;
    errorMessage = '';
    
    try {
      // Crea l'oggetto evento nel formato richiesto dall'API
      const nuovoEvento: CreateEventData = {
        title: titolo,
        description: descrizione,
        date: data,
        time: orarioInizio,
        location: `${luogo}, ${indirizzo}`,
        category: categoria,
        maxParticipants: maxPartecipanti ? parseInt(maxPartecipanti) : null,
        imageUrl: 'https://px-web-images7.pixpa.com/xB5M4v1pCU1DyOWizUgd3-doew2js6qd_6kvlRFWGEk/rs:fit:1200:0/q:80/aHR0cHM6Ly9waXhwYWNvbS1pbWcucGl4cGEuY29tL2NvbS9hcnRpY2xlcy8xNTU5MjA4NzI0LTk2MTcyNS1kZXBvc2l0cGhvdG9zLTE2NjUwNjg5OC1sLTIwMTVqcGVnLmpwZw==',
        isPublic: true
      };
      
      const eventoCreato = await createEvent(nuovoEvento, $token);
      eventoId = eventoCreato.id;
      isCreated = true;
    } catch (error) {
      console.error('Errore durante la creazione dell\'evento:', error);
      errorMessage = error instanceof Error ? error.message : 'Si è verificato un errore durante la creazione dell\'evento. Riprova.';
    } finally {
      isCreating = false;
    }
  }
  
  function navigateTo(path: string) {
    if (path === '/evento/1' && eventoId) {
      path = `/evento/${eventoId}`;
    }
    push(path);
  }
</script>

<div class="page-container">
  <div class="text-center mb-10">
    <h1 class="text-3xl font-bold mb-2">Crea il Tuo Evento</h1>
    <p class="text-base-content/70 max-w-2xl mx-auto">Condividi la tua passione creando un evento unico per la community</p>
  </div>
  
  {#if isCreated}
    <div class="card bg-base-100 shadow-xl max-w-3xl mx-auto">
      <div class="card-body text-center">
        <div class="mb-6">
          <div class="mx-auto w-20 h-20 bg-success/20 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 class="text-2xl font-bold mb-4">Evento creato con successo!</h2>
        <p class="mb-8">Il tuo evento è stato creato e pubblicato. Puoi gestirlo dalla sezione eventi del tuo profilo.</p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <button class="btn btn-primary" on:click={() => navigateTo('/profilo')}>
            Vai al profilo
          </button>
          <button class="btn btn-outline" on:click={() => navigateTo(`/evento/${eventoId}`)}>
            Visualizza evento
          </button>
        </div>
      </div>
    </div>
  {:else}
    <div class="card bg-base-100 shadow-xl max-w-3xl mx-auto">
      <div class="card-body">
        <form on:submit|preventDefault={onSubmit}>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Titolo -->
            <div class="form-control md:col-span-2">
              <label class="label" for="titolo">
                <span class="label-text">Titolo dell'evento*</span>
              </label>
              <input 
                type="text" 
                id="titolo" 
                placeholder="Es. Workshop di fotografia" 
                class="input input-bordered w-full" 
                required
                bind:value={titolo}
              />
            </div>
            
            <!-- Descrizione -->
            <div class="form-control md:col-span-2">
              <label class="label" for="descrizione">
                <span class="label-text">Descrizione*</span>
              </label>
              <textarea 
                id="descrizione" 
                class="textarea textarea-bordered h-32" 
                placeholder="Descrivi il tuo evento in dettaglio..."
                required
                bind:value={descrizione}
              ></textarea>
            </div>
            
            <!-- Categoria -->
            <div class="form-control">
              <label class="label" for="categoria">
                <span class="label-text">Categoria*</span>
              </label>
              <select 
                id="categoria" 
                class="select select-bordered w-full" 
                required
                bind:value={categoria}
              >
                <option value="" disabled selected>Seleziona una categoria</option>
                {#each categorie as cat}
                  <option value={cat}>{cat}</option>
                {/each}
              </select>
            </div>
            
            <!-- Città -->
            <div class="form-control">
              <label class="label" for="luogo">
                <span class="label-text">Città*</span>
              </label>
              <select 
                id="luogo" 
                class="select select-bordered w-full" 
                required
                bind:value={luogo}
              >
                <option value="" disabled selected>Seleziona una città</option>
                {#each citta as city}
                  <option value={city}>{city}</option>
                {/each}
                <option value="Altro">Altra città</option>
              </select>
            </div>
            
            <!-- Indirizzo -->
            <div class="form-control md:col-span-2">
              <label class="label" for="indirizzo">
                <span class="label-text">Indirizzo completo*</span>
              </label>
              <input 
                type="text" 
                id="indirizzo" 
                placeholder="Es. Via Roma 123, 00100" 
                class="input input-bordered w-full" 
                required
                bind:value={indirizzo}
              />
            </div>
            
            <!-- Data -->
            <div class="form-control">
              <label class="label" for="data">
                <span class="label-text">Data*</span>
              </label>
              <input 
                type="date" 
                id="data" 
                class="input input-bordered w-full" 
                required
                bind:value={data}
              />
            </div>
            
            <!-- Orari -->
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label" for="orario-inizio">
                  <span class="label-text">Inizio*</span>
                </label>
                <input 
                  type="time" 
                  id="orario-inizio" 
                  class="input input-bordered w-full" 
                  required
                  bind:value={orarioInizio}
                />
              </div>
              
              <div class="form-control">
                <label class="label" for="orario-fine">
                  <span class="label-text">Fine*</span>
                </label>
                <input 
                  type="time" 
                  id="orario-fine" 
                  class="input input-bordered w-full" 
                  required
                  bind:value={orarioFine}
                />
              </div>
            </div>
            
            <!-- Prezzo -->
            <div class="form-control">
              <label class="label" for="prezzo">
                <span class="label-text">Prezzo (€)</span>
              </label>
              <input 
                type="number" 
                id="prezzo" 
                placeholder="0.00" 
                min="0" 
                step="0.01" 
                class="input input-bordered w-full" 
                bind:value={prezzo}
              />
              <label class="label">
                <span class="label-text-alt">Lascia vuoto se gratuito</span>
              </label>
            </div>
            
            <!-- Massimo partecipanti -->
            <div class="form-control">
              <label class="label" for="max-partecipanti">
                <span class="label-text">Numero massimo partecipanti</span>
              </label>
              <input 
                type="number" 
                id="max-partecipanti" 
                placeholder="Illimitato" 
                min="1" 
                class="input input-bordered w-full" 
                bind:value={maxPartecipanti}
              />
              <label class="label">
                <span class="label-text-alt">Lascia vuoto per nessun limite</span>
              </label>
            </div>
            
            <!-- Immagine -->
            <div class="form-control md:col-span-2">
              <label class="label" for="immagine">
                <span class="label-text">Immagine di copertina</span>
              </label>
              <input 
                type="file" 
                id="immagine" 
                class="file-input file-input-bordered w-full"
                accept="image/*"
              />
              <label class="label">
                <span class="label-text-alt">Formato consigliato: 1200x630px, max 2MB</span>
              </label>
            </div>
            
            <p class="text-sm text-base-content/70 mt-4">* Campi obbligatori</p>
          
          <div class="flex flex-col-reverse sm:flex-row justify-end gap-4 mt-8">
            <button 
              type="button" 
              class="btn btn-outline" 
              on:click={() => navigateTo('/profilo')}
            >
              Annulla
            </button>
            <button 
              type="submit" 
              class="btn btn-primary" 
              disabled={isCreating}
            >
              {#if isCreating}
                <span class="loading loading-spinner"></span>
              {/if}
              Crea Evento
            </button>
          </div>
          
          {#if errorMessage}
            <div class="alert alert-error mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          {/if}
          
          
        </form>
      </div>
    </div>
  {/if}
</div>