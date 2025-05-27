<script lang="ts">
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import EventoCard from '../components/ui/EventoCard.svelte';
  import { getOrganizerProfile } from '../services/api';

  export let params = { id: '' };

  interface Evento {
    id: string;
    titolo: string;
    descrizione: string;
    categoria: string;
    data: string;
    dataFine: string;
    luogo: string;
    indirizzo: string;
    immagine: string;
    numeroPartecipanti: number;
    organizzatore: {
      id: string;
      nome: string;
      profileImageUrl?: string;
      bio?: string;
      contatti?: {
        email?: string;
        telefono?: string;
        website?: string;
      };
    };
    prezzo: number;
    maxPartecipanti: number | null;
    partecipanti: any[];
  }

  let organizzatore: {
    id: string;
    nome: string;
    profileImageUrl?: string;
    bio?: string;
    contatti?: {
      email?: string;
      telefono?: string;
      website?: string;
    };
    eventiOrganizzati?: Evento[];
  } | null = null;

  let loading = true;
  let error = '';

  async function loadOrganizerProfile() {
    loading = true;
    error = '';

    try {
      const profile = await getOrganizerProfile(params.id);
      organizzatore = profile;
    } catch (e: any) {
      error = e.message || 'Si è verificato un errore nel caricamento del profilo';
      console.error('Error loading organizer profile:', e);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    if (params.id) {
      loadOrganizerProfile();
    } else {
      error = 'ID organizzatore non valido';
      loading = false;
    }
  });

  function formattaData(dataString: string): string {
    const data = new Date(dataString);
    return data.toLocaleDateString('it-IT', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  }

  function getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  }

  function getAvatarUrl(name: string, profileImageUrl: string | undefined): string {
    if (profileImageUrl) {
      return profileImageUrl;
    }
    if (name) {
      const initials = getInitials(name);
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random`;
    }
    return 'https://randomuser.me/api/portraits/men/32.jpg';
  }
</script>

<div class="page-container">
  <button class="btn btn-ghost mb-6" on:click={() => window.history.back()}>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
    Indietro
  </button>

  {#if loading}
    <div class="flex justify-center items-center min-h-[50vh]">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else if error}
    <div class="text-center py-16">
      <div class="mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 class="text-xl font-bold mb-2">Errore</h3>
      <p class="text-base-content/70">{error}</p>
    </div>
  {:else if organizzatore}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Profilo -->
      <div class="lg:col-span-1">
        <div class="bg-base-100 p-6 rounded-lg shadow-md">
          <div class="text-center mb-6">
            <div class="avatar mb-4">
              <div class="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={getAvatarUrl(organizzatore.nome, organizzatore.profileImageUrl)} alt={organizzatore.nome} />
              </div>
            </div>
            <h1 class="text-2xl font-bold">{organizzatore.nome}</h1>
            {#if organizzatore.contatti?.email}
              <a href="mailto:{organizzatore.contatti.email}" class="text-primary hover:underline">
                {organizzatore.contatti.email}
              </a>
            {/if}
          </div>

          <div class="divider"></div>

          <div class="space-y-4">
            <div>
              <h3 class="font-semibold mb-2">Bio</h3>
              <p class="text-base-content/70">{organizzatore.bio}</p>
            </div>

            {#if organizzatore.contatti}
              <div>
                <h3 class="font-semibold mb-2">Contatti</h3>
                <ul class="space-y-2">
                  {#if organizzatore.contatti.telefono}
                    <li class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href="tel:{organizzatore.contatti.telefono}" class="hover:text-primary">
                        {organizzatore.contatti.telefono}
                      </a>
                    </li>
                  {/if}
                  {#if organizzatore.contatti.website}
                    <li class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <a href={organizzatore.contatti.website} target="_blank" rel="noopener noreferrer" class="hover:text-primary">
                        {organizzatore.contatti.website}
                      </a>
                    </li>
                  {/if}
                </ul>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Eventi organizzati -->
      <div class="lg:col-span-2">
        <h2 class="text-2xl font-bold mb-6">Eventi organizzati</h2>
        {#if organizzatore.eventiOrganizzati && organizzatore.eventiOrganizzati.length > 0}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            {#each organizzatore.eventiOrganizzati as evento (evento.id)}
              <EventoCard 
                id={evento.id}
                titolo={evento.titolo}
                data={evento.data}
                luogo={evento.luogo}
                categoria={evento.categoria}
                immagine={evento.immagine}
                numeroPartecipanti={evento.numeroPartecipanti}
                organizzatore={evento.organizzatore}
              />
            {/each}
          </div>
        {:else}
          <div class="text-center py-8 bg-base-200 rounded-lg">
            <p class="text-base-content/70">Nessun evento organizzato</p>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div> 