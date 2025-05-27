<script lang="ts">
  let nome = '';
  let email = '';
  let messaggio = '';
  let tipoRichiesta = '';
  let isSubmitted = false;
  let loading = false;
  
  function onSubmit() {
    loading = true;
    // Simuliamo un ritardo di invio
    setTimeout(() => {
      // Qui implementeremmo la vera logica di invio del messaggio
      isSubmitted = true;
      loading = false;
    }, 1500);
  }
  
  function resetForm() {
    nome = '';
    email = '';
    messaggio = '';
    tipoRichiesta = '';
    isSubmitted = false;
  }
</script>

<div class="page-container">
  <div class="text-center mb-10">
    <h1 class="text-3xl font-bold mb-2">Contattaci</h1>
    <p class="text-base-content/70 max-w-2xl mx-auto">Hai domande o suggerimenti? Siamo qui per aiutarti!</p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
    <!-- Informazioni di contatto -->
    <div>
      <h2 class="text-2xl font-bold mb-6">Informazioni di Contatto</h2>
      
      <div class="space-y-6">
        <div class="flex items-start">
          <div class="bg-primary/10 p-3 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold mb-1">Telefono</h3>
            <p>+39 02 1234567</p>
            <p class="text-sm text-base-content/70 mt-1">Lun-Ven, 9:00-18:00</p>
          </div>
        </div>
        
        <div class="flex items-start">
          <div class="bg-primary/10 p-3 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold mb-1">Email</h3>
            <p>info@eventhub.it</p>
            <p class="text-sm text-base-content/70 mt-1">Risposta entro 24 ore</p>
          </div>
        </div>
        
        <div class="flex items-start">
          <div class="bg-primary/10 p-3 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold mb-1">Sede</h3>
            <p>Via Roma 123, 20121 Milano</p>
            <p class="text-sm text-base-content/70 mt-1">Aperto su appuntamento</p>
          </div>
        </div>
      </div>
      
      <div class="mt-10 space-y-6">
        <h2 class="text-2xl font-bold">Domande Frequenti</h2>
        
        <div tabindex="0" class="collapse collapse-plus bg-base-200">
          <input type="checkbox" /> 
          <div class="collapse-title text-lg font-medium">
            Come posso partecipare a un evento?
          </div>
          <div class="collapse-content"> 
            <p>Per partecipare a un evento, devi prima creare un account. Una volta effettuato l'accesso, puoi navigare tra gli eventi disponibili e cliccare sul pulsante "Partecipa" nella pagina dettaglio dell'evento che ti interessa.</p>
          </div>
        </div>
        
        <div tabindex="0" class="collapse collapse-plus bg-base-200">
          <input type="checkbox" /> 
          <div class="collapse-title text-lg font-medium">
            Posso annullare la mia partecipazione?
          </div>
          <div class="collapse-content"> 
            <p>Sì, puoi annullare la tua partecipazione a un evento in qualsiasi momento. Vai alla pagina dell'evento o alla sezione "I miei eventi" nel tuo profilo e clicca su "Annulla partecipazione".</p>
          </div>
        </div>
        
        <div tabindex="0" class="collapse collapse-plus bg-base-200">
          <input type="checkbox" /> 
          <div class="collapse-title text-lg font-medium">
            Come posso creare un mio evento?
          </div>
          <div class="collapse-content"> 
            <p>Puoi creare un evento cliccando sul pulsante "Crea il tuo evento" nella home page o nella sezione profilo. Dovrai fornire tutti i dettagli dell'evento, come titolo, data, luogo e descrizione.</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Form di contatto -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        {#if isSubmitted}
          <div class="text-center py-8">
            <div class="mb-4">
              <div class="mx-auto w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 class="text-xl font-bold mb-2">Messaggio inviato!</h3>
            <p class="text-base-content/70 mb-6">Grazie per averci contattato. Riceverai una risposta entro 24 ore.</p>
            <button class="btn btn-primary" on:click={resetForm}>
              Invia un altro messaggio
            </button>
          </div>
        {:else}
          <h2 class="text-2xl font-bold mb-6">Inviaci un messaggio</h2>
          
          <form on:submit|preventDefault={onSubmit}>
            <div class="form-control mb-4">
              <label class="label" for="nome">
                <span class="label-text">Nome completo</span>
              </label>
              <input 
                type="text" 
                id="nome" 
                placeholder="Il tuo nome" 
                class="input input-bordered" 
                required
                bind:value={nome}
              />
            </div>
            
            <div class="form-control mb-4">
              <label class="label" for="email">
                <span class="label-text">Email</span>
              </label>
              <input 
                type="email" 
                id="email" 
                placeholder="La tua email" 
                class="input input-bordered" 
                required
                bind:value={email}
              />
            </div>
            
            <div class="form-control mb-4">
              <label class="label" for="tipo-richiesta">
                <span class="label-text">Tipo di richiesta</span>
              </label>
              <select 
                id="tipo-richiesta" 
                class="select select-bordered w-full" 
                required
                bind:value={tipoRichiesta}
              >
                <option value="" disabled selected>Seleziona un'opzione</option>
                <option value="info">Informazioni generali</option>
                <option value="supporto">Supporto tecnico</option>
                <option value="partnership">Proposta di partnership</option>
                <option value="feedback">Feedback</option>
                <option value="altro">Altro</option>
              </select>
            </div>
            
            <div class="form-control mb-6">
              <label class="label" for="messaggio">
                <span class="label-text">Il tuo messaggio</span>
              </label>
              <textarea 
                id="messaggio" 
                class="textarea textarea-bordered h-32" 
                placeholder="Scrivi qui il tuo messaggio..."
                required
                bind:value={messaggio}
              ></textarea>
            </div>
            
            <div class="form-control">
              <button 
                type="submit" 
                class="btn btn-primary" 
                disabled={loading}
              >
                {#if loading}
                  <span class="loading loading-spinner"></span>
                {/if}
                Invia messaggio
              </button>
            </div>
          </form>
        {/if}
      </div>
    </div>
  </div>
</div>