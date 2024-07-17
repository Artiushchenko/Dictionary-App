/* DECLARATION OF VARIABLES */

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
			let wordData = data[0];
			let word = wordData.word || '';
			let partOfSpeech = wordData.meanings?.[0]?.partOfSpeech || '';
			let phonetic = wordData.phonetics?.find(p => p.text)?.text || '';
			let audioSrc = wordData.phonetics?.find(p => p.audio)?.audio || '';
			let definition = wordData.meanings?.[0]?.definitions?.[0]?.definition || '';
			let example = wordData.meanings?.[0]?.definitions?.[0]?.example || '';

			if (word && definition) {
				const isFavorite = checkIfFavorite(word);

				searchBlock.innerHTML = `
                    <section class="word">
                        <h3>${word}</h3>
                        <section class="word-control-panel">
                            <button class="heart-button ${isFavorite ? 'favorite' : ''}" onclick="toggleFavorite('${word}', '${definition}')">
                                <i class="fa-solid fa-heart"></i>
                            </button>
                            ${
															audioSrc
																? `
                                <button onclick="playSound()">
                                    <i class="fa-solid fa-volume-high"></i>
                                </button>
                            `
																: ''
														}
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
                        ${example || ''}
                    </p>
                `;

				if (audioSrc) {
					sound.setAttribute('src', audioSrc);
				} else {
					sound.removeAttribute('src');
				}
			} else {
				throw new Error('Essential data is missing');
			}
		})
		.catch(() => {
			searchBlock.innerHTML = `<h3 class="search-error">Couldn't find the word!</h3>`;
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

		/* SET COOKIE */
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

/* TOGGLE STATUS OF THE FAVORITE WORD */

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

/* UPDATE STATUS FAVORITE WORD */

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

/* LOAD LIST OF FAVORITE WORDS */

function loadFavoriteWords() {
	const favorites = JSON.parse(localStorage.getItem('favorites')) || {};
	favoriteWordsList.innerHTML = '';

	if (Object.keys(favorites).length === 0) {
		const NO_WORDS_MESSAGE = document.createElement('li');
		NO_WORDS_MESSAGE.textContent = 'No favorite words yet.';
		NO_WORDS_MESSAGE.classList.add('no-favorites-message');
		favoriteWordsList.appendChild(NO_WORDS_MESSAGE);
	} else {
		for (let word in favorites) {
			const li = document.createElement('li');
			li.innerHTML = `
				<section class="favorite-list-wrapper">	
					<section class="favorite-word">
						<b>${word}:</b>			
						${favorites[word]}
					</section>
					<button onclick="removeFavorite('${word}')">
						<i class="fa-solid fa-trash"></i>
					</button>
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

/* OPEN MODAL WINDOW */

favoriteWordsButton.addEventListener('click', () => {
	favoriteWordsModal.style.display = 'block';
	loadFavoriteWords();
});

/* CLOSE MODAL WINDOW */

closeModalButton.addEventListener('click', () => {
	favoriteWordsModal.style.display = 'none';
});

/* CLOSE MODAL WINDOW WHEN CLICKED OUTSIDE */

window.addEventListener('click', event => {
	if (event.target === favoriteWordsModal) {
		favoriteWordsModal.style.display = 'none';
	}
});
