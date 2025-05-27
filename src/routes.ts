import Home from './pages/Home.svelte';
import Login from './pages/Login.svelte';
import Registrazione from './pages/Registrazione.svelte';
import Eventi from './pages/Eventi.svelte';
import EventoDettaglio from './pages/EventoDettaglio.svelte';
import CreazioneEvento from './pages/CreazioneEvento.svelte';
import Profilo from './pages/Profilo.svelte';
import EventiOrganizzati from './pages/EventiOrganizzati.svelte';
import Contatti from './pages/Contatti.svelte';
import NotFound from './pages/NotFound.svelte';
import TestEventoDettaglio from './pages/TestEventoDettaglio.svelte';
import GestioneEvento from './pages/GestioneEvento.svelte';
import ModificaEvento from './pages/ModificaEvento.svelte';
import ModificaProfilo from './pages/ModificaProfilo.svelte';
import ProfiloOrganizzatore from './pages/ProfiloOrganizzatore.svelte';

export default {
  '/': Home,
  '/login': Login,
  '/registrazione': Registrazione,
  '/eventi': Eventi,
  '/evento/:id': EventoDettaglio,
  '/crea-evento': CreazioneEvento,
  '/profilo': Profilo,
  '/eventi-organizzati': EventiOrganizzati,
  '/contatti': Contatti,
  '/test-evento': TestEventoDettaglio,
  '/gestione-evento/:id': GestioneEvento,
  '/modifica-evento/:id': ModificaEvento,
  '/modifica-profilo': ModificaProfilo,
  '/organizzatore/:id': ProfiloOrganizzatore,
  '*': NotFound,
};