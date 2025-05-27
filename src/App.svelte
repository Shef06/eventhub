<script lang="ts">
  import Router from 'svelte-spa-router';
  import routes from './routes';
  import Navbar from './components/layout/Navbar.svelte';
</script>

<div class="app min-h-screen flex flex-col">
  <Navbar />
  
  <main class="flex-grow">
    <Router {routes} />
  </main>
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
</style>