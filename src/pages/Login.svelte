<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { login } from '../stores/auth';
  
  let email = '';
  let password = '';
  let ricordami = false;
  let errorMessage = '';
  let loading = false;
  
  async function onSubmit() {
    loading = true;
    errorMessage = '';
    
    try {
      const userData = await login(email, password);
      // Salva i dati dell'utente nel localStorage
      localStorage.setItem('userEmail', email);
      // Se il backend restituisce il nome dell'utente, lo salviamo
      if (userData?.name) {
        localStorage.setItem('userName', userData.name);
      }
      if (userData?.createdAt) {
        localStorage.setItem('userCreatedAt', userData.createdAt);
      }
      push('/');
    } catch (error: any) {
      errorMessage = error.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="hero min-h-[calc(100vh-64px)] bg-base-200">
  <div class="hero-content flex-col lg:flex-row-reverse w-full">
    <div class="card flex-shrink-0 w-full max-w-md shadow-2xl bg-base-100">
      <div class="card-body">
        <div class="text-center mb-4">
          <h2 class="text-2xl font-bold">Accedi</h2>
          <p class="text-sm opacity-70 mt-1">Accedi al tuo account EventHub</p>
        </div>
        
        {#if errorMessage}
          <div class="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{errorMessage}</span>
          </div>
        {/if}
        
        <form on:submit|preventDefault={onSubmit}>
          <div class="form-control">
            <label class="label" for="email">
              <span class="label-text">Email</span>
            </label>
            <input 
              type="email" 
              id="email" 
              placeholder="email@esempio.it" 
              class="input input-bordered" 
              required
              bind:value={email}
            />
          </div>
          
          <div class="form-control">
            <label class="label" for="password">
              <span class="label-text">Password</span>
            </label>
            <input 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              class="input input-bordered" 
              required
              bind:value={password}
            />
            <label class="label">
              <a href="#" class="label-text-alt link link-hover">Password dimenticata?</a>
            </label>
          </div>
          
          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-2">
              <input 
                type="checkbox" 
                class="checkbox checkbox-primary" 
                bind:checked={ricordami} 
              />
              <span class="label-text">Ricordami</span>
            </label>
          </div>
          
          <div class="form-control mt-6">
            <button 
              type="submit" 
              class="btn btn-primary" 
              disabled={loading}
            >
              {#if loading}
                <span class="loading loading-spinner"></span>
              {/if}
              Accedi
            </button>
          </div>
        </form>
        
        <div class="divider">OPPURE</div>
        
        <div class="text-center">
          <p class="mb-4">
            Non hai un account?
            <a 
              href="/registrazione" 
              class="text-primary hover:underline"
              on:click|preventDefault={() => push('/registrazione')}
            >
              Registrati
            </a>
          </p>
        </div>
      </div>
    </div>
    
    <div class="text-center lg:text-left lg:mr-8 lg:w-1/2">
      <h1 class="text-3xl md:text-4xl font-bold mb-6">Benvenuto su EventHub</h1>
      <p class="py-6">Accedi per scoprire eventi straordinari nella tua città, gestire la tua partecipazione e interagire con gli organizzatori. EventHub è la piattaforma ideale per chi cerca esperienze uniche ed eventi memorabili.</p>
      <div class="mt-4 space-y-4">
        <div class="flex items-center">
          <div class="bg-primary/10 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 class="font-medium">Sicuro e affidabile</h3>
            <p class="text-sm opacity-70">Le tue informazioni sono al sicuro con noi</p>
          </div>
        </div>
        <div class="flex items-center">
          <div class="bg-primary/10 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-medium">Community attiva</h3>
            <p class="text-sm opacity-70">Unisciti a migliaia di appassionati di eventi</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
