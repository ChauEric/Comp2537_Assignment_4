const pokeAPI = 'https://pokeapi.co/api/v2/pokemon/';
const game = document.getElementById('game');
let isPaused = false;
let firstPick;
let matches;

const loadPokemon = async () => {
  const randomIDs = new Set();
  while (randomIDs.size < 8) {
    const randomNumber = Math.ceil(Math.random() * 810);
    randomIDs.add(randomNumber);
  }
  const pokePromises = [...randomIDs].map((id) => fetch(pokeAPI + id));
  const responses = await Promise.all(pokePromises);
  return await Promise.all(responses.map((res) => res.json()));
};

const resetGame = async () => {
  game.innerHTML = '';
  isPaused = true;
  firstPick = null;
  matches = 0;
  setTimeout(async () => {
    const loadedPokemon = await loadPokemon();
    displayPokemon([...loadedPokemon, ...loadedPokemon]);
    isPaused = false;
  }, 200);
};

const displayPokemon = (pokemon) => {
  pokemon.sort((_) => Math.random() - 0.5);
  const pokemonHTML = pokemon
    .map((pokemon) => {
      return `
    <div class="card" onclick="clickCard(event)"
    data-pokename="${pokemon.name}">
    <div class="front">
    </div>
      <div class="back rotated" style="background-color:gray">
        <img src="${pokemon.sprites.front_default}" alt=${pokemon.name}/>
        <h2>${pokemon.name}</h2>
      </div>
    </div>
    `;
    })
    .join('');
  game.innerHTML = pokemonHTML;
};

const clickCard = (event) => {
  const pokemonCard = event.currentTarget;
  const [front, back] = getFrontAndBackFromCard(pokemonCard);

  if (front.classList.contains('rotated') || isPaused) {
    return;
  }
  isPaused = true;
  rotateElements([front, back]);
  if (!firstPick) {
    firstPick = pokemonCard;
    isPaused = false;
  } else {
    const secondPokemonName = pokemonCard.dataset.pokename;
    const firstPokemonName = firstPick.dataset.pokename;
    if (firstPokemonName !== secondPokemonName) {
      const [firstFront, firstBack] = getFrontAndBackFromCard(firstPick);
      setTimeout(() => {
        rotateElements([front, back, firstFront, firstBack]);
        firstPick = null;
        isPaused = false;
      }, 500);
    } else {
      matches++;
      if (matches === 8) {
        console.log('WINNER');
      }
      firstPick = null;
      isPaused = false;
    }
  }
};

const getFrontAndBackFromCard = (card) => {
  const front = card.querySelector('.front');
  const back = card.querySelector('.back');
  return [front, back];
};

const rotateElements = (elements) => {
  if (typeof elements !== 'object' || !elements.length) return;
  elements.forEach((element) => element.classList.toggle('rotated'));
};

resetGame();
