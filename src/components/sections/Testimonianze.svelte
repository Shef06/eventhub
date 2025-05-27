<script lang="ts">
  import TestimonialCard from '../ui/TestimonialCard.svelte';
  
  // Dati di esempio per le testimonianze
  const testimonianze = [
    {
      nome: 'Marco Bianchi',
      ruolo: 'Organizzatore di Eventi',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      testo: 'EventHub ha trasformato il modo in cui organizzo i miei eventi. La piattaforma è intuitiva e mi permette di raggiungere facilmente il mio pubblico target.',
      rating: 5
    },
    {
      nome: 'Laura Rossi',
      ruolo: 'Appassionata di concerti',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      testo: 'Grazie a EventHub ho scoperto eventi nella mia città che non avrei mai trovato altrimenti. L\'interfaccia è semplice e la ricerca è molto efficace!',
      rating: 4
    },
    {
      nome: 'Giovanni Verdi',
      ruolo: 'Promoter Culturale',
      avatar: 'https://randomuser.me/api/portraits/men/62.jpg',
      testo: 'Come organizzatore di eventi culturali, trovo che EventHub sia lo strumento perfetto per promuovere le nostre iniziative e raggiungere un pubblico più ampio.',
      rating: 5
    }
  ];
</script>

<section class="py-16 bg-primary/5">
  <div class="container mx-auto px-4">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold mb-2">Cosa Dicono di Noi</h2>
      <p class="text-base-content/70 max-w-2xl mx-auto">Scopri le esperienze dei nostri utenti con EventHub</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {#each testimonianze as testimonianza, i}
        <div class="animate-fade-in" style="animation-delay: {i * 0.15}s;">
          <TestimonialCard {...testimonianza} />
        </div>
      {/each}
    </div>
  </div>
</section>