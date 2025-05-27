<script lang="ts">
  import { push } from 'svelte-spa-router';
  import { register } from '../stores/auth';
  
  let nome = '';
  let email = '';
  let password = '';
  let confermaPassword = '';
  let privacyAccettata = false;
  let errorMessage = '';
  let loading = false;
  
  $: passwordMatch = password === confermaPassword;
  
  async function onSubmit() {
    if (!passwordMatch) {
      errorMessage = 'Le password non coincidono';
      return;
    }
    
    if (!privacyAccettata) {
      errorMessage = 'Devi accettare i termini e le condizioni';
      return;
    }
    
    loading = true;
    errorMessage = '';
    
    try {
      await register(nome, email, password);
      // Salva i dati dell'utente nel localStorage
      localStorage.setItem('userName', nome);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userCreatedAt', new Date().toISOString());
      push('/');
    } catch (error: any) {
      errorMessage = error.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="hero min-h-[calc(100vh-64px)] bg-base-200">
  <div class="hero-content flex-col lg:flex-row w-full">
    <div class="text-center lg:text-left lg:mr-8 lg:w-1/2">
      <h1 class="text-3xl md:text-4xl font-bold mb-6">Unisciti a EventHub</h1>
      <p class="py-6">Registrati per accedere a tutti i vantaggi della nostra piattaforma. Potrai partecipare a eventi esclusivi, ricevere notifiche su nuovi eventi nella tua zona e creare i tuoi eventi per condividere le tue passioni.</p>
      <div class="mt-4 space-y-4">
        <div class="flex items-center">
          <div class="bg-primary/10 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 class="font-medium">Tieni traccia degli eventi</h3>
            <p class="text-sm opacity-70">Visualizza tutti gli eventi a cui partecipi</p>
          </div>
        </div>
        <div class="flex items-center">
          <div class="bg-primary/10 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <div>
            <h3 class="font-medium">Crea i tuoi eventi</h3>
            <p class="text-sm opacity-70">Diventa un organizzatore e condividi la tua passione</p>
          </div>
        </div>
      </div>
    </div>
    <div class="card flex-shrink-0 w-full max-w-md shadow-2xl bg-base-100">
      <div class="card-body">
        <div class="text-center mb-4">
          <h2 class="text-2xl font-bold">Registrazione</h2>
          <p class="text-sm opacity-70 mt-1">Crea il tuo account EventHub</p>
        </div>
        
        {#if errorMessage}
          <div class="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{errorMessage}</span>
          </div>
        {/if}
        
        <form on:submit|preventDefault={onSubmit}>
          <div class="form-control">
            <label class="label" for="nome">
              <span class="label-text">Nome completo</span>
            </label>
            <input 
              type="text" 
              id="nome" 
              placeholder="Mario Rossi" 
              class="input input-bordered" 
              required
              bind:value={nome}
            />
          </div>
          
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
            <span class="label-text-alt mt-1 ml-1">Almeno 8 caratteri con lettere, numeri e simboli</span>
          </div>
          
          <div class="form-control">
            <label class="label" for="conferma-password">
              <span class="label-text">Conferma password</span>
            </label>
            <input 
              type="password" 
              id="conferma-password" 
              placeholder="••••••••" 
              class="input input-bordered" 
              required
              class:input-error={!passwordMatch && confermaPassword.length > 0}
              bind:value={confermaPassword}
            />
            {#if !passwordMatch && confermaPassword.length > 0}
              <label class="label">
                <span class="label-text-alt text-error">Le password non coincidono</span>
              </label>
            {/if}
          </div>
          
          <div class="form-control mt-4">
            <label class="label cursor-pointer justify-start gap-2">
              <input 
                type="checkbox" 
                class="checkbox checkbox-primary" 
                bind:checked={privacyAccettata} 
              />
              <span class="label-text">Accetto i <a href="#" class="text-primary hover:underline">Termini di servizio</a> e la <a href="#" class="text-primary hover:underline">Privacy Policy</a></span>
            </label>
          </div>
          
          <div class="form-control mt-6">
            <button 
              type="submit" 
              class="btn btn-primary" 
              disabled={loading || !passwordMatch}
            >
              {#if loading}
                <span class="loading loading-spinner"></span>
              {/if}
              Registrati
            </button>
          </div>
        </form>
        
        <div class="divider mt-6">OPPURE</div>
        
        <div class="text-center">
          <p class="mb-4">
            Hai già un account?
            <a 
              href="/login" 
              class="text-primary hover:underline"
              on:click|preventDefault={() => push('/login')}
            >
              Accedi
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</div>