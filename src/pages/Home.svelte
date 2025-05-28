<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { token } from '../stores/auth';
  import EventiPopolari from '../components/sections/EventiPopolari.svelte';
  import PercheSceglierci from '../components/sections/PercheSceglierci.svelte';
  import Testimonianze from '../components/sections/Testimonianze.svelte';

  function navigateTo(path: string) {
    if (path === '/crea-evento' && !$token) {
      push('/login');
      return;
    }
    push(path);
  }
</script>

<!-- Hero Section -->
<section class="hero min-h-[80vh] bg-gradient-to-br from-primary/90 to-secondary/90 text-primary-content">
  <div class="hero-content text-center">
    <div class="max-w-3xl py-12 md:py-20">
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-slide-up">Scopri eventi straordinari</h1>
      <p class="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto animate-slide-up" style="animation-delay: 0.1s;">
        Trova e partecipa ai migliori eventi nella tua città o crea e promuovi i tuoi eventi con EventHub.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style="animation-delay: 0.2s;">
        <button class="btn btn-lg btn-accent text-white" on:click={() => navigateTo('/eventi')}>
          Esplora Eventi
        </button>
        <button class="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-primary" on:click={() => navigateTo('/crea-evento')}>
          Crea il Tuo Evento
        </button>
      </div>
      
      <div class="mt-12 flex justify-center animate-slide-up" style="animation-delay: 0.3s;">
        <div class="stats stats-vertical md:stats-horizontal shadow bg-base-100 text-base-content">
          <div class="stat">
            <div class="stat-title">Eventi Totali</div>
            <div class="stat-value text-primary">2,540</div>
            <div class="stat-desc">↗︎ 90 (14%)</div>
          </div>
          
          <div class="stat">
            <div class="stat-title">Utenti</div>
            <div class="stat-value text-secondary">15,200</div>
            <div class="stat-desc">↗︎ 400 (22%)</div>
          </div>
          
          <div class="stat">
            <div class="stat-title">Categorie</div>
            <div class="stat-value text-accent">6</div>
            <div class="stat-desc">Varietà per tutti</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Sezione Categorie Principali -->
<section class="py-16">
  <div class="container mx-auto px-4">
    <div class="text-center mb-10">
      <h2 class="text-3xl font-bold mb-2">Categorie Principali</h2>
      <p class="text-base-content/70 max-w-2xl mx-auto">Esplora gli eventi in base ai tuoi interessi</p>
    </div>
    
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div 
        class="card bg-base-100 shadow-md hover:shadow-lg cursor-pointer transition-all hover:-translate-y-1 duration-300"
        on:click={() => navigateTo('/eventi?categoria=musica')}
      >
        <div class="card-body items-center text-center p-6">
          <div class="rounded-full bg-primary/10 w-20 h-20 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h3 class="font-bold text-lg">Musica</h3>
          <p class="text-sm text-base-content/70 mt-1">Concerti ed eventi musicali</p>
        </div>
      </div>
      
      <div 
        class="card bg-base-100 shadow-md hover:shadow-lg cursor-pointer transition-all hover:-translate-y-1 duration-300"
        on:click={() => navigateTo('/eventi?categoria=cinema')}
      >
        <div class="card-body items-center text-center p-6">
          <div class="rounded-full bg-primary/10 w-20 h-20 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
          <h3 class="font-bold text-lg">Cinema</h3>
          <p class="text-sm text-base-content/70 mt-1">Proiezioni e festival</p>
        </div>
      </div>
      
      <div 
        class="card bg-base-100 shadow-md hover:shadow-lg cursor-pointer transition-all hover:-translate-y-1 duration-300"
        on:click={() => navigateTo('/eventi?categoria=sport')}
      >
        <div class="card-body items-center text-center p-6">
          <div class="rounded-full bg-primary/10 w-20 h-20 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
            </svg>
          </div>
          <h3 class="font-bold text-lg">Sport</h3>
          <p class="text-sm text-base-content/70 mt-1">Eventi e tornei sportivi</p>
        </div>
      </div>
      
      <div 
        class="card bg-base-100 shadow-md hover:shadow-lg cursor-pointer transition-all hover:-translate-y-1 duration-300"
        on:click={() => navigateTo('/eventi?categoria=cultura')}
      >
        <div class="card-body items-center text-center p-6">
          <div class="rounded-full bg-primary/10 w-20 h-20 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 class="font-bold text-lg">Cultura</h3>
          <p class="text-sm text-base-content/70 mt-1">Mostre e eventi culturali</p>
        </div>
      </div>
    </div>
    
    <div class="text-center mt-10">
      <button class="btn btn-outline btn-primary" on:click={() => navigateTo('/eventi')}>
        Tutte le categorie
      </button>
    </div>
  </div>
</section>

<!-- Sezione Eventi Popolari -->
<EventiPopolari />

<!-- Sezione Perché Sceglierci -->
<PercheSceglierci />

<!-- Sezione Testimonianze -->
<Testimonianze />

<!-- Call to Action -->
<section class="py-16 bg-gradient-to-r from-primary to-secondary text-white">
  <div class="container mx-auto px-4 text-center">
    <h2 class="text-3xl font-bold mb-4">Pronto a Partecipare?</h2>
    <p class="max-w-xl mx-auto mb-8">Unisciti a migliaia di persone che ogni giorno scoprono eventi straordinari attraverso EventHub.</p>
    <div class="flex flex-col sm:flex-row justify-center gap-4">
      <button class="btn btn-lg btn-accent" on:click={() => navigateTo('/registrazione')}>
        Crea un account
      </button>
      <button class="btn btn-lg btn-outline text-white border-white hover:bg-white hover:text-primary" on:click={() => navigateTo('/eventi')}>
        Esplora eventi
      </button>
    </div>
  </div>
</section>

<!-- Newsletter -->
<section class="py-16">
  <div class="container mx-auto px-4">
    <div class="max-w-xl mx-auto text-center">
      <h2 class="text-2xl font-bold mb-4">Resta aggiornato</h2>
      <p class="mb-6">Iscriviti alla nostra newsletter per ricevere aggiornamenti sugli eventi più interessanti.</p>
      <div class="join">
        <input class="input input-bordered join-item" placeholder="La tua email"/>
        <button class="btn btn-primary join-item">Iscriviti</button>
      </div>
    </div>
  </div>
</section>
