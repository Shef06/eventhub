<script>
  const vantaggi = [
    {
      icona: 'calendar',
      titolo: 'Eventi Diversificati',
      descrizione: 'Offriamo una vasta gamma di eventi in diverse categorie per soddisfare tutti gli interessi.'
    },
    {
      icona: 'map',
      titolo: 'Facilità di Ricerca',
      descrizione: 'Trova facilmente eventi nella tua zona grazie ai nostri filtri avanzati e alla ricerca geografica.'
    },
    {
      icona: 'users',
      titolo: 'Community Attiva',
      descrizione: 'Unisciti a una community appassionata di persone che condividono i tuoi stessi interessi.'
    },
    {
      icona: 'shield',
      titolo: 'Prenotazioni Sicure',
      descrizione: 'Sistema di prenotazione sicuro e affidabile con conferme istantanee e supporto dedicato.'
    }
  ];
</script>

<section class="py-16 bg-base-200">
  <div class="container mx-auto px-4">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold mb-2">Perché Scegliere EventHub</h2>
      <p class="text-base-content/70 max-w-2xl mx-auto">Scopri i vantaggi di utilizzare la nostra piattaforma per trovare e organizzare i tuoi eventi</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {#each vantaggi as vantaggio, i}
        <div 
          class="card bg-base-100 shadow-md hover:shadow-lg transition-all duration-300 p-6 text-center"
          style="animation-delay: {i * 0.1}s;"
        >
          <div class="mx-auto mb-4 bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
            {#if vantaggio.icona === 'calendar'}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            {:else if vantaggio.icona === 'map'}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            {:else if vantaggio.icona === 'users'}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            {:else if vantaggio.icona === 'shield'}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            {/if}
          </div>
          <h3 class="text-xl font-bold mb-3">{vantaggio.titolo}</h3>
          <p class="text-base-content/70">{vantaggio.descrizione}</p>
        </div>
      {/each}
    </div>
  </div>
</section>