<script lang="ts">
  import { push } from 'svelte-spa-router';
  
  interface Partecipante {
    id: string;
    nome: string;
    avatar?: string;
  }
  
  export let id: string;
  export let titolo: string;
  export let data: string;
  export let luogo: string;
  export let categoria: string;
  export let immagine: string;
  export let organizzatore: { id: string; nome: string };
  export let numeroPartecipanti: number;
  export let maxPartecipanti: number | null = null;
  export let isUserParticipating: boolean = false;
  
  function navigateTo(path: string) {
    push(path);
  }
  
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

  function handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg';
  }
</script>

<div class="card bg-base-100 shadow-xl h-full hover:shadow-2xl transition-all duration-300" 
  on:click={() => navigateTo(`/evento/${id}`)}
>
  <figure class="relative aspect-[16/9] overflow-hidden">
    <img 
      src={immagine} 
      alt={titolo} 
      class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      on:error={handleImageError}
    />
    <div class="absolute top-4 left-4 flex gap-2">
      <div class="badge badge-primary">{categoria}</div>
      {#if isUserParticipating}
        <div class="badge badge-success">Partecipi</div>
      {/if}
    </div>
  </figure>
  
  <div class="card-body p-4">
    <h2 class="card-title text-lg hover:text-primary transition-colors line-clamp-2">
      {titolo}
    </h2>
    
    <div class="flex flex-col gap-2 mt-2">
      <div class="flex items-center gap-2 text-sm text-base-content/70">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="truncate">{formattaData(data)}</span>
      </div>
      
      <div class="flex items-center gap-2 text-sm text-base-content/70">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="truncate">{luogo}</span>
      </div>
      
      <div class="flex items-center gap-2 text-sm text-base-content/70">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span>
          {numeroPartecipanti} {maxPartecipanti ? `/ ${maxPartecipanti}` : ''} partecipanti
        </span>
      </div>
      
      <div class="flex items-center gap-2 text-sm text-base-content/70">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        {#if organizzatore?.id}
        <p>
          Organizzato da {organizzatore.nome || "Anonimo"}
        </p>
        {:else}
          <span class="truncate">Organizzato da {organizzatore?.nome || "Anonimo"}</span>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .card {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 24rem;
    opacity: 1 !important;
    visibility: visible !important;
  }

  .card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style> 