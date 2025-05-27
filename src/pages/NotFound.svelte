<script>
  import { push } from 'svelte-spa-router';
</script>

<div class="hero min-h-[70vh] bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 class="text-9xl font-extrabold text-primary mb-8">404</h1>
      <h2 class="text-3xl font-bold mb-4">Pagina Non Trovata</h2>
      <p class="mb-8">Ci dispiace, ma la pagina che stai cercando non esiste o è stata spostata.</p>
      <button class="btn btn-primary mr-2" on:click={() => push('/')}>
        Torna alla Home
      </button>
      <button class="btn btn-outline" on:click={() => push('/eventi')}>
        Esplora Eventi
      </button>
    </div>
  </div>
</div>