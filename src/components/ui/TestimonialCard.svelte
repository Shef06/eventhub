<script lang="ts">
  export let nome: string;
  export let ruolo: string = '';
  export let testo: string;
  export let avatar: string;
  export let rating: number = 5;
</script>

<div class="card bg-base-100 shadow-md">
  <div class="card-body">
    <div class="flex items-center mb-4">
      <div class="avatar mr-4">
        <div class="w-12 h-12 rounded-full">
          <img src={avatar} alt={nome} />
        </div>
      </div>
      <div>
        <h4 class="font-bold">{nome}</h4>
        {#if ruolo}
          <p class="text-sm opacity-70">{ruolo}</p>
        {/if}
      </div>
    </div>
    
    <div class="rating rating-sm mb-3">
      {#each Array(5) as _, i}
        <input 
          type="radio" 
          name={`rating-${nome.replace(/\s+/g, '-')}`} 
          class="mask mask-star-2 bg-accent" 
          checked={i + 1 === rating}
          disabled
        />
      {/each}
    </div>
    
    <p class="italic">{testo}</p>
  </div>
</div>