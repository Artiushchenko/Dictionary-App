const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const searchBlock = document.getElementById('search-result');
const sound = document.getElementById('word-pronouncing');
const searchButton = document.getElementById('search-button');
const themeToggleButton = document.getElementById('theme-toggle-button');
const themeIcon = document.getElementById('theme-icon');
const favoriteWordsButton = document.getElementById('favorite-words-button');
const favoriteWordsModal = document.getElementById('favorite-words-modal');
const favoriteWordsList = document.getElementById('favorite-words-list');
const closeModalButton = document.getElementById('close-modal');

/* LOAD THEME FROM COOKIES */

document.addEventListener('DOMContentLoaded', () => {
	const theme = getCookie('theme');

	if (theme) {
		document.body.classList.add(theme);
	}
});

/* SEARCH THE WORD */

searchButton.addEventListener('click', () => {
	let inputWord = document.getElementById('input-word').value;

	fetch(`${API_URL}/${inputWord}`)
		.then(response => response.json())
		.then(data => {
			console.log(data);
			const wordData = data[0];
			const word = wordData.word;
			const partOfSpeech = wordData.meanings[0].partOfSpeech;
			const phonetic = wordData.phonetics[0].text;
			const definition = wordData.meanings[0].definitions[0].definition;
			const example = wordData.meanings[0].definitions[0].example || '';

			const isFavorite = checkIfFavorite(word);

			searchBlock.innerHTML = `
				<section class="word">
					<h3>${word}</h3>
					<section class="word-control-panel">
						<button class="heart-button ${isFavorite ? 'favorite' : ''}" onclick="toggleFavorite('${word}', '${definition}')">
							<i class="fa-solid fa-heart"></i>
						</button>
						<button onclick="playSound()">
							<i class="fa-solid fa-volume-high"></i>
						</button>
					</section>
				</section>

				<section class="word-details">
					<p>${partOfSpeech}</p>
					<p>${phonetic}</p>
				</section>

				<p class="word-meaning">
					${definition}
				</p>

				<p class="word-example">
					${example}
				</p>
			`;

			sound.setAttribute('src', `${data[0].phonetics[0].audio}`);
		})
		.catch(() => {
			searchBlock.innerHTML = `<h3 class="error">Couldn't find the word!</h3>`;
		});
});

/* PLAY PRONUNCIATION  */

function playSound() {
	sound.play();
}

/* CHANGE THEME */

themeToggleButton.addEventListener('click', () => {
	if (document.body.classList.contains('dark-theme')) {
		document.body.classList.remove('dark-theme');
		themeIcon.classList.remove('fa-sun');
		themeIcon.classList.add('fa-moon');

		/* REMOVE COOKIE */
		setCookie('theme', '', -1);
	} else {
		document.body.classList.add('dark-theme');
		themeIcon.classList.remove('fa-moon');
		themeIcon.classList.add('fa-sun');

		/* SET COOKIE FOR 7 DAYS */
		setCookie('theme', 'dark-theme', 7);
	}
});

/* HANDLE COOKIE */

function setCookie(cookieName, cookieValue, days) {
	const date = new Date();
	date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

	const expires = 'expires=' + date.toUTCString();

	document.cookie = cookieName + '=' + cookieValue + ';' + expires + ';path=/';
}

function getCookie(cookieName) {
	const name = cookieName + '=';
	const decodeCookie = decodeURIComponent(document.cookie);
	const cookieArray = decodeCookie.split(';');

	for (let i = 0; i < cookieArray.length; i++) {
		let cookie = cookieArray[i].trim();

		if (cookie.indexOf(name) === 0) {
			return cookie.substring(name.length, cookie.length);
		}
	}

	return '';
}

/* TOGGLE FAVORITE WORD */

function toggleFavorite(word, definition) {
	let favorites = JSON.parse(localStorage.getItem('favorites')) || {};

	if (favorites[word]) {
		delete favorites[word];
	} else {
		favorites[word] = definition;
	}

	localStorage.setItem('favorites', JSON.stringify(favorites));
	updateFavoriteButton(word);
	loadFavoriteWords();
}

/* UPDATE FAVORITE BUTTON */

function updateFavoriteButton(word) {
	const heartButton = document.querySelector('.heart-button');

	if (checkIfFavorite(word)) {
		heartButton.classList.add('favorite');
	} else {
		heartButton.classList.remove('favorite');
	}
}

/* CHECK IF WORD IS FAVORITE */

function checkIfFavorite(word) {
	let favorites = JSON.parse(localStorage.getItem('favorites')) || {};

	return !!favorites[word];
}

/* LOAD FAVORITE WORDS */

function loadFavoriteWords() {
	const favorites = JSON.parse(localStorage.getItem('favorites')) || {};
	favoriteWordsList.innerHTML = '';

	if (Object.keys(favorites).length === 0) {
		const NO_WORDS_MESSAGE = document.createElement('li');
		NO_WORDS_MESSAGE.textContent = 'No favorite words yet.';
		NO_WORDS_MESSAGE.classList.add('no-words-in-list');
		favoriteWordsList.appendChild(NO_WORDS_MESSAGE);
	} else {
		for (let word in favorites) {
			const li = document.createElement('li');
			li.innerHTML = `
				<section class="favorite-list-definition-wrapper">	
					<section class="wppp">
						<b>${word}:</b>			
						${favorites[word]}
					</section>
					<section class="favorite-remove-button">
						<button onclick="removeFavorite('${word}')">
							<i class="fa-solid fa-trash"></i>
						</button>
					</section>
				</section>
			`;
			favoriteWordsList.appendChild(li);
		}
	}
}

/* REMOVE FAVORITE WORD */

function removeFavorite(word) {
	let favorites = JSON.parse(localStorage.getItem('favorites')) || {};
	delete favorites[word];

	localStorage.setItem('favorites', JSON.stringify(favorites));
	loadFavoriteWords();
	updateFavoriteButton(word);
}

/* OPEN MODAL */

favoriteWordsButton.addEventListener('click', () => {
	favoriteWordsModal.style.display = 'block';
	loadFavoriteWords();
});

/* CLOSE MODAL */

closeModalButton.addEventListener('click', () => {
	favoriteWordsModal.style.display = 'none';
});

/* CLOSE MODAL WHEN CLICKED OUTSIDE */

window.addEventListener('click', event => {
	if (event.target === favoriteWordsModal) {
		favoriteWordsModal.style.display = 'none';
	}
});
