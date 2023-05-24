const pokeAPI = 'https://pokeapi.co/api/v2/pokemon/';
const game = document.getElementById('game');
let isPaused = false;
let firstPick;
let matches;
let clicks;

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
  document.getElementById('matches').innerHTML = matches;
  clicks = 0;
  document.getElementById('num-clicks').innerHTML = clicks;
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
      document.getElementById('matches').innerHTML = matches;
      if (matches === 8) {
        setTimeout(() => {
          alert('CONGRATULATIONS, YOU WIN');
        }, 200);
      }
      firstPick = null;
      isPaused = false;
    }
  }
  clicks++;
  updateClicks();
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

const updateClicks = () => {
  document.getElementById('num-clicks').innerHTML = clicks;
};

const startCountdown = (duration) => {
  let countdown = duration;
  let minuteElement = document.getElementById('minute');
  let secondElement = document.getElementById('second');

  let countdownInterval = setInterval(() => {
    let minutes = Math.floor(countdown / 60);
    let seconds = countdown % 60;

    let secondsString = seconds.toString().padStart(2, '0');

    minuteElement.innerHTML = minutes;
    secondElement.innerHTML = secondsString;

    if (countdown === 0) {
      clearInterval(countdownInterval);
    } else {
      countdown--;
    }
  }, 1000); // 1000 milliseconds = 1 second
};

const restartButton = document.getElementById('restart');
restartButton.addEventListener('click', () => {
  startCountdown(59);
});
const startButton = document.getElementById('start');
startButton.addEventListener('click', () => {
  startCountdown(59);
});

resetGame();
