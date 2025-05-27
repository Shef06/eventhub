<script lang="ts">
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { token } from '../stores/auth';
  import { userData } from '../stores/user';
  import { getUserProfile, updateUserProfile } from '../services/api';

  interface UserData {
    name: string;
    email: string;
    avatar: string;
    bio: string;
    telefono: string;
    citta: string;
  }

  let loading = true;
  let error = '';
  let success = false;
  let saving = false;

  // Form fields
  let name = '';
  let email = '';
  let avatar = '';
  let bio = '';
  let telefono = '';
  let citta = '';
  let password = '';
  let confirmPassword = '';

  onMount(async () => {
    try {
      // Recupera i dati dell'utente dall'API
      const profile = await getUserProfile();
      
      // Popola i campi del form con i dati del profilo
      name = profile.name;
      email = profile.email;
      avatar = profile.profileImageUrl;
      bio = profile.bio;
      telefono = profile.telefono;
      citta = profile.citta;

      // Aggiorna lo store con i dati più recenti
      userData.update({
        name: profile.name,
        email: profile.email,
        avatar: profile.profileImageUrl,
        bio: profile.bio,
        telefono: profile.telefono,
        citta: profile.citta
      });
    } catch (e) {
      error = 'Si è verificato un errore nel caricamento dei dati';
      console.error(e);
    } finally {
      loading = false;
    }
  });

  async function handleSubmit() {
    try {
      saving = true;
      error = '';

      // Validazione dei campi
      if (!name || !email) {
        error = 'Nome e email sono campi obbligatori';
        return;
      }

      // Validazione email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        error = 'Inserisci un indirizzo email valido';
        return;
      }

      // Validazione password
      if (password || confirmPassword) {
        if (password !== confirmPassword) {
          error = 'Le password non coincidono';
          return;
        }
        if (password.length < 6) {
          error = 'La password deve essere di almeno 6 caratteri';
          return;
        }
      }

      // Prepara i dati da aggiornare
      const updateData = {
        name,
        email,
        profileImageUrl: avatar,
        bio,
        telefono,
        citta
      };

      // Aggiorna il profilo tramite API
      const updatedProfile = await updateUserProfile(updateData, $token || '');

      // Aggiorna lo store con i nuovi dati
      userData.update({
        name: updatedProfile.name,
        email: updatedProfile.email,
        avatar: updatedProfile.profileImageUrl,
        bio: updatedProfile.bio,
        telefono: updatedProfile.telefono,
        citta: updatedProfile.citta
      });

      success = true;
      setTimeout(() => {
        push('/profilo');
      }, 1500);
    } catch (e: any) {
      error = e.message || 'Si è verificato un errore durante il salvataggio';
      console.error(e);
    } finally {
      saving = false;
    }
  }
</script>

<div class="page-container">
  {#if loading}
    <div class="flex justify-center items-center min-h-[50vh]">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else if error}
    <div class="alert alert-error shadow-lg mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{error}</span>
    </div>
  {:else if success}
    <div class="alert alert-success shadow-lg mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Profilo aggiornato con successo!</span>
    </div>
  {/if}

  <div class="card bg-base-100 shadow-xl max-w-3xl mx-auto">
    <div class="card-body">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">Modifica Profilo</h2>
        <button class="btn btn-ghost" on:click={() => push('/profilo')}>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Indietro
        </button>
      </div>

      <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        <div class="flex flex-col md:flex-row gap-6 items-start">
          <div class="w-full md:w-1/3">
            <div class="avatar mb-4">
              <div class="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 mx-auto">
                <img src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`} alt={name} />
              </div>
            </div>
            <div class="form-control">
              <label class="label" for="avatar">
                <span class="label-text">URL Avatar</span>
              </label>
              <input
                type="url"
                id="avatar"
                class="input input-bordered w-full"
                bind:value={avatar}
                placeholder="https://..."
              />
            </div>
          </div>

          <div class="w-full md:w-2/3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label" for="name">
                  <span class="label-text">Nome completo *</span>
                </label>
                <input
                  type="text"
                  id="name"
                  class="input input-bordered w-full"
                  bind:value={name}
                  required
                />
              </div>

              <div class="form-control">
                <label class="label" for="email">
                  <span class="label-text">Email *</span>
                </label>
                <input
                  type="email"
                  id="email"
                  class="input input-bordered w-full"
                  bind:value={email}
                  required
                />
              </div>
            </div>

            <div class="form-control mt-4">
              <label class="label" for="bio">
                <span class="label-text">Bio</span>
              </label>
              <textarea
                id="bio"
                class="textarea textarea-bordered h-24"
                bind:value={bio}
                placeholder="Racconta qualcosa di te..."
              ></textarea>
            </div>
          </div>
        </div>

        <div class="divider">Informazioni di contatto</div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label" for="telefono">
              <span class="label-text">Telefono</span>
            </label>
            <input
              type="tel"
              id="telefono"
              class="input input-bordered w-full"
              bind:value={telefono}
              placeholder="+39..."
            />
          </div>

          <div class="form-control">
            <label class="label" for="citta">
              <span class="label-text">Città</span>
            </label>
            <input
              type="text"
              id="citta"
              class="input input-bordered w-full"
              bind:value={citta}
              placeholder="La tua città..."
            />
          </div>
        </div>

        <div class="divider">Sicurezza</div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label" for="password">
              <span class="label-text">Nuova Password</span>
            </label>
            <input
              type="password"
              id="password"
              class="input input-bordered w-full"
              bind:value={password}
              placeholder="Lascia vuoto per non modificare"
            />
          </div>

          <div class="form-control">
            <label class="label" for="confirmPassword">
              <span class="label-text">Conferma Password</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              class="input input-bordered w-full"
              bind:value={confirmPassword}
              placeholder="Conferma la nuova password"
            />
          </div>
        </div>

        <div class="flex justify-end gap-4 mt-8">
          <button 
            type="button" 
            class="btn btn-ghost" 
            on:click={() => push('/profilo')}
          >
            Annulla
          </button>
          <button 
            type="submit" 
            class="btn btn-primary" 
            disabled={saving}
          >
            {#if saving}
              <span class="loading loading-spinner loading-sm"></span>
              Salvataggio...
            {:else}
              Salva modifiche
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

<style>
  .page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
</style> 