<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { token } from '../../stores/auth';
  import Notifiche from './Notifiche.svelte';
  
  function navigateTo(path: string) {
    push(path);
  }
  
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userAvatar');
    token.set(null);
    push('/login');
  }
</script>

<div class="navbar bg-base-100 shadow-md">
  <div class="flex-1">
    <a href="/" class="btn btn-ghost normal-case text-xl" on:click|preventDefault={() => push('/')}>EventHub</a>
  </div>
  <div class="flex-none gap-2">
    {#if $token}
      <div class="flex items-center gap-4">
        <Notifiche />
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-ghost btn-circle avatar">
            <div class="w-10 rounded-full">
              <img src={localStorage.getItem('userAvatar') || `https://ui-avatars.com/api/?name=${encodeURIComponent(localStorage.getItem('userName') || 'User')}`} alt="Profile" />
            </div>
          </label>
          <ul tabindex="0" class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
            <li><a href="/profilo" on:click|preventDefault={() => push('/profilo')}>Profilo</a></li>
            <li><a href="/eventi/organizzati" on:click|preventDefault={() => push('/eventi/organizzati')}>I miei eventi</a></li>
            <li><a href="/eventi/prenotati" on:click|preventDefault={() => push('/eventi/prenotati')}>Eventi prenotati</a></li>
            <li><a href="/eventi/crea" on:click|preventDefault={() => push('/eventi/crea')}>Crea evento</a></li>
            <li><a href="/login" on:click|preventDefault={logout}>Logout</a></li>
          </ul>
        </div>
      </div>
    {:else}
      <a href="/login" class="btn btn-primary" on:click|preventDefault={() => push('/login')}>Accedi</a>
    {/if}
  </div>
</div> 