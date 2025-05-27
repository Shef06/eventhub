<script lang="ts">
  import { push, location } from 'svelte-spa-router';
  import { fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { isAuthenticated, logout } from '../../stores/auth';
  import { userData } from '../../stores/user';

  let isMenuOpen = false;
  let isScrolled = false;

  onMount(() => {
    window.addEventListener('scroll', () => {
      isScrolled = window.scrollY > 20;
    });
  });

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function closeMenu() {
    isMenuOpen = false;
  }

  function navigateTo(path: string) {
    push(path);
    closeMenu();
  }

  function handleLogout() {
    logout();
    userData.reset();
    navigateTo('/');
  }

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  function getAvatarUrl(name: string, avatar: string): string {
    if (avatar) {
      return avatar;
    }
    if (name) {
      const initials = getInitials(name);
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random`;
    }
    return 'https://randomuser.me/api/portraits/men/32.jpg';
  }
  
  $: isActive = (path: string) => $location === path;
  $: userInitials = getInitials($userData.name);
</script>

<header class="sticky top-0 z-50 transition-all duration-300" class:bg-base-100={isScrolled} class:shadow-md={isScrolled} class:bg-transparent={!isScrolled}>
  <div class="navbar container mx-auto px-4 py-3">
    <div class="navbar-start">
      <a href="/" class="text-2xl font-bold text-primary" on:click|preventDefault={() => navigateTo('/')}>
        Event<span class="text-accent">Hub</span>
      </a>
    </div>
    
    <!-- Menu Desktop -->
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1 gap-2">
        <li><a class:active={isActive('/')} on:click|preventDefault={() => navigateTo('/')}>Home</a></li>
        <li><a class:active={isActive('/eventi')} on:click|preventDefault={() => navigateTo('/eventi')}>Eventi</a></li>
        <li><a class:active={isActive('/contatti')} on:click|preventDefault={() => navigateTo('/contatti')}>Contatti</a></li>
      </ul>
    </div>
    
    <div class="navbar-end">
      {#if $isAuthenticated}
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-ghost btn-circle avatar">
            <div class="avatar">
              <div class="w-10 rounded-full">
                <img src={getAvatarUrl($userData.name, $userData.avatar)} alt={$userData.name} />
              </div>
            </div>
          </label>
          <ul tabindex="0" class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
            <li>
              <div class="flex flex-col px-4 py-2 text-sm border-b border-base-200">
                <span class="font-medium">{$userData.name}</span>
              </div>
            </li>
            <li><a on:click|preventDefault={() => navigateTo('/profilo')}>Profilo</a></li>
            <li><a on:click|preventDefault={() => navigateTo('/crea-evento')}>Crea Evento</a></li>
            <li><a on:click|preventDefault={handleLogout}>Logout</a></li>
          </ul>
        </div>
      {:else}
        <div class="flex gap-2">
          <button class="btn btn-sm btn-outline" on:click={() => navigateTo('/login')}>Accedi</button>
          <button class="btn btn-sm btn-primary" on:click={() => navigateTo('/registrazione')}>Registrati</button>
        </div>
      {/if}
      
      <!-- Menu Mobile Toggle -->
      <button class="btn btn-ghost lg:hidden ml-2" on:click={toggleMenu}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </div>
  
  <!-- Mobile Menu -->
  {#if isMenuOpen}
    <div 
      transition:fly={{ y: -20, duration: 200 }}
      class="lg:hidden fixed inset-0 bg-base-100 z-40 pt-16"
    >
      <ul class="menu p-4 text-lg">
        <li><a class:active={isActive('/')} on:click|preventDefault={() => navigateTo('/')}>Home</a></li>
        <li><a class:active={isActive('/eventi')} on:click|preventDefault={() => navigateTo('/eventi')}>Eventi</a></li>
        <li><a class:active={isActive('/contatti')} on:click|preventDefault={() => navigateTo('/contatti')}>Contatti</a></li>
        <div class="divider"></div>
        {#if $isAuthenticated}
          <li>
            <div class="flex items-center gap-3 px-4 py-2">
              <div class="avatar">
                <div class="w-8 rounded-full">
                  <img src={getAvatarUrl($userData.name, $userData.avatar)} alt={$userData.name} />
                </div>
              </div>
              <span class="font-medium">{$userData.name}</span>
            </div>
          </li>
          <li><a on:click|preventDefault={() => navigateTo('/profilo')}>Profilo</a></li>
          <li><a on:click|preventDefault={() => navigateTo('/crea-evento')}>Crea Evento</a></li>
          <li><a on:click|preventDefault={handleLogout}>Logout</a></li>
        {:else}
          <li><a on:click|preventDefault={() => navigateTo('/login')}>Accedi</a></li>
          <li><a on:click|preventDefault={() => navigateTo('/registrazione')}>Registrati</a></li>
        {/if}
      </ul>
    </div>
  {/if}
</header>