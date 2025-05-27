# src/components/ui/Notifiche.svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';

  interface Notifica {
    id: string;
    tipo: 'richiesta_partecipazione';
    eventoId: string;
    eventoTitolo: string;
    richiedente: {
      id: string;
      nome: string;
      avatar?: string;
    };
    data: string;
    letta: boolean;
  }

  let notifiche: Notifica[] = [];
  let notificheNonLette = 0;
  let mostraNotifiche = false;

  // Carica le notifiche dal localStorage
  function caricaNotifiche() {
    const notificheSalvate = JSON.parse(localStorage.getItem('notifiche') || '[]');
    notifiche = notificheSalvate.sort((a: Notifica, b: Notifica) => 
      new Date(b.data).getTime() - new Date(a.data).getTime()
    );
    notificheNonLette = notifiche.filter(n => !n.letta).length;
  }

  // Segna una notifica come letta
  function segnaComeLetta(notificaId: string) {
    const index = notifiche.findIndex(n => n.id === notificaId);
    if (index !== -1) {
      notifiche[index].letta = true;
      localStorage.setItem('notifiche', JSON.stringify(notifiche));
      notificheNonLette = notifiche.filter(n => !n.letta).length;
    }
  }

  // Gestisci la richiesta di partecipazione
  function gestisciRichiesta(notifica: Notifica, approvata: boolean) {
    // Recupera l'evento
    const eventiOrganizzati = JSON.parse(localStorage.getItem('eventiOrganizzati') || '[]');
    const eventoIndex = eventiOrganizzati.findIndex((e: any) => e.id === notifica.eventoId);
    
    if (eventoIndex !== -1) {
      const evento = eventiOrganizzati[eventoIndex];
      
      // Trova la richiesta pendente
      const richiestaIndex = evento.richiestePendenti?.findIndex((r: any) => r.id === notifica.richiedente.id);
      
      if (richiestaIndex !== -1) {
        if (approvata) {
          // Sposta il partecipante dalla lista delle richieste alla lista dei partecipanti
          const partecipante = evento.richiestePendenti[richiestaIndex];
          partecipante.stato = 'approvato';
          evento.partecipanti.push(partecipante);
          evento.numeroPartecipanti++;
          
          // Aggiungi l'evento alla lista degli eventi prenotati del partecipante
          const eventiPrenotati = JSON.parse(localStorage.getItem(`eventiPrenotati_${partecipante.id}`) || '[]');
          if (!eventiPrenotati.includes(evento.id)) {
            eventiPrenotati.push(evento.id);
            localStorage.setItem(`eventiPrenotati_${partecipante.id}`, JSON.stringify(eventiPrenotati));
          }
        } else {
          // Segna la richiesta come rifiutata
          evento.richiestePendenti[richiestaIndex].stato = 'rifiutato';
        }
        
        // Rimuovi la richiesta dalla lista delle richieste pendenti
        evento.richiestePendenti.splice(richiestaIndex, 1);
        
        // Salva le modifiche
        eventiOrganizzati[eventoIndex] = evento;
        localStorage.setItem('eventiOrganizzati', JSON.stringify(eventiOrganizzati));
      }
    }
    
    // Rimuovi la notifica
    const notificaIndex = notifiche.findIndex(n => n.id === notifica.id);
    if (notificaIndex !== -1) {
      notifiche.splice(notificaIndex, 1);
      localStorage.setItem('notifiche', JSON.stringify(notifiche));
      notificheNonLette = notifiche.filter(n => !n.letta).length;
    }
  }

  // Formatta la data della notifica
  function formattaData(data: string): string {
    const date = new Date(data);
    const oggi = new Date();
    const ieri = new Date(oggi);
    ieri.setDate(ieri.getDate() - 1);

    if (date.toDateString() === oggi.toDateString()) {
      return `Oggi ${date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === ieri.toDateString()) {
      return `Ieri ${date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('it-IT', { 
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  onMount(() => {
    caricaNotifiche();
    // Aggiorna le notifiche ogni minuto
    const intervallo = setInterval(caricaNotifiche, 60000);
    return () => clearInterval(intervallo);
  });
</script>

<div class="relative">
  <button 
    class="btn btn-ghost btn-circle"
    on:click={() => {
      mostraNotifiche = !mostraNotifiche;
      if (mostraNotifiche) {
        notifiche.forEach(n => !n.letta && segnaComeLetta(n.id));
      }
    }}
  >
    <div class="indicator">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {#if notificheNonLette > 0}
        <span class="badge badge-primary badge-sm indicator-item">{notificheNonLette}</span>
      {/if}
    </div>
  </button>

  {#if mostraNotifiche}
    <div class="absolute right-0 mt-2 w-80 bg-base-100 rounded-lg shadow-xl z-50">
      <div class="p-4">
        <h3 class="font-bold text-lg mb-4">Notifiche</h3>
        {#if notifiche.length === 0}
          <p class="text-center text-base-content/70 py-4">Nessuna notifica</p>
        {:else}
          <div class="space-y-4 max-h-96 overflow-y-auto">
            {#each notifiche as notifica (notifica.id)}
              <div class="card bg-base-200 shadow-sm {notifica.letta ? 'opacity-75' : ''}">
                <div class="card-body p-4">
                  <div class="flex items-start gap-3">
                    <div class="avatar">
                      <div class="w-10 rounded-full">
                        <img src={notifica.richiedente.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(notifica.richiedente.nome)}`} alt={notifica.richiedente.nome} />
                      </div>
                    </div>
                    <div class="flex-1">
                      <p class="text-sm">
                        <span class="font-semibold">{notifica.richiedente.nome}</span> ha richiesto di partecipare all'evento <span class="font-semibold cursor-pointer hover:text-primary" on:click={() => push(`/evento/${notifica.eventoId}`)}>{notifica.eventoTitolo}</span>
                      </p>
                      <p class="text-xs text-base-content/70 mt-1">{formattaData(notifica.data)}</p>
                      
                      <div class="flex gap-2 mt-3">
                        <button 
                          class="btn btn-success btn-sm flex-1"
                          on:click={() => gestisciRichiesta(notifica, true)}
                        >
                          Approva
                        </button>
                        <button 
                          class="btn btn-error btn-sm flex-1"
                          on:click={() => gestisciRichiesta(notifica, false)}
                        >
                          Rifiuta
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  /* Animazione per il menu delle notifiche */
  div[class*="absolute"] {
    animation: slideDown 0.2s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style> 