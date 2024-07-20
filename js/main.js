/* 
----------------------------------------------------------------------------------------------
DECLARATION OF VARIABLES
----------------------------------------------------------------------------------------------
*/

/* API */
const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

/* WORD SEARCH BLOCK */
const searchBlock = document.getElementById('search-result');
const searchButton = document.getElementById('search-button');
const sound = document.getElementById('word-pronouncing');

/* FAVORITE WORDS MODAL WINDOW */
const favoriteWordsButton = document.getElementById('favorite-words-button');
const favoriteWordsModal = document.getElementById('favorite-words-modal');
const favoriteWordsList = document.getElementById('favorite-words-list');
const closeModalButton = document.getElementById('close-modal');

/* TOGGLE THEME */
const themeToggleButton = document.getElementById('theme-toggle-button');
const themeIcon = document.getElementById('theme-icon');

/* QUIZ MODAL WINDOW */
const startQuizButton = document.getElementById('start-quiz-button');
const quizModal = document.getElementById('quiz-modal');
const closeQuizModalButton = document.getElementById('close-quiz-modal');
const quizCardContainer = document.getElementById('quiz-card-container');
const nextCardButton = document.getElementById('next-card-button');
const quizCompletionMessage = document.getElementById('quiz-completion-message');
const quizContent = document.querySelector('.quiz-content');

/* 
----------------------------------------------------------------------------------------------
HANDLE COOKIE
----------------------------------------------------------------------------------------------
*/

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

/* 
----------------------------------------------------------------------------------------------
SEARCH THE WORD
----------------------------------------------------------------------------------------------
*/

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
                            				${audioSrc ? `
                                				<button onclick="playSound()">
                                    					<i class="fa-solid fa-volume-high"></i>
                                				</button>
                            				` : ''}
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

/* 
----------------------------------------------------------------------------------------------
TOGGLE STATUS OF THE FAVORITE WORD
----------------------------------------------------------------------------------------------
*/

function toggleFavorite(word, definition) {
	let favorites = JSON.parse(localStorage.getItem('favorites')) || {};
	let repeatCounters = getRepeatsCounters();

	if (favorites[word]) {
		delete favorites[word];
		delete repeatCounters[word];
	} else {
		favorites[word] = definition;
		repeatCounters[word] = repeatCounters[word] || 0;
	}

	localStorage.setItem('favorites', JSON.stringify(favorites));
	localStorage.setItem('repeatCounters', JSON.stringify(repeatCounters));
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
	const repeatCounters = getRepeatsCounters();
	favoriteWordsList.innerHTML = '';

	if (Object.keys(favorites).length === 0) {
		const NO_WORDS_MESSAGE = document.createElement('li');
		NO_WORDS_MESSAGE.textContent = 'No favorite words yet.';
		NO_WORDS_MESSAGE.classList.add('no-favorites-message');
		favoriteWordsList.appendChild(NO_WORDS_MESSAGE);
	} else {
		for (let word in favorites) {
			const repeats = repeatCounters[word] || 0;
			const emoji = getEmoji(repeats);
			const repeatColor = getRepeatColor(repeats);

			const li = document.createElement('li');
			li.innerHTML = `
				<section class="favorite-list-wrapper">	
					<section class="favorite-word">
						<section class="favorite-word-wrapper">
							<section class="repeat-counter" data-word="${word}" style="background-color: ${repeatColor}">
								<span>Count of repeats:</span>
								<span class="count">${repeats}</span>
								<span class="emoji">${emoji}</span>							
  							</section>
							<b>${word}</b>
						</section>			
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
	let repeatCounters = getRepeatsCounters();

	delete favorites[word];
	delete repeatCounters[word];

	localStorage.setItem('favorites', JSON.stringify(favorites));
	localStorage.setItem('repeatCounters', JSON.stringify(repeatCounters));
	loadFavoriteWords();
	updateFavoriteButton(word);
}

/* 
----------------------------------------------------------------------------------------------
MANAGING A MODAL WINDOW FOR LEARNING WORDS
----------------------------------------------------------------------------------------------
*/

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

/* 
----------------------------------------------------------------------------------------------
QUIZ MODAL WINDOW CONTROL
----------------------------------------------------------------------------------------------
*/

/* CLOSE QUIZ MODAL WINDOW */
closeQuizModalButton.addEventListener('click', () => {
	quizModal.style.display = 'none';
});

/* CLOSE QUIZ MODAL WINDOW WHEN CLICKED OUTSIDE */
window.addEventListener('click', event => {
	if (event.target === quizModal) {
		quizModal.style.display = 'none';
	}
});

/* START QUIZ */
startQuizButton.addEventListener('click', startQuiz);

/* LOAD NEXT QUIZ CARD */
nextCardButton.addEventListener('click', loadNextCard);

/* START QUIZ FUNCTION */
let currentCardIndex = 0;
let words = [];

function startQuiz() {
	const favorites = JSON.parse(localStorage.getItem('favorites')) || {};

	words = Object.keys(favorites).map(word => ({
		word,
		definition: favorites[word],
	}));

	currentCardIndex = 0;
	quizModal.style.display = 'block';
	quizCardContainer.style.display = 'block';
	nextCardButton.style.display = words.length > 0 ? 'block' : 'none';
	quizCompletionMessage.style.display = 'none';

	quizContent.classList.remove('complete');

	if (words.length > 0) {
		loadNextCard();
	} else {
		quizCompletionMessage.style.display = 'block';
		quizCompletionMessage.style.backgroundColor = 'red';
		quizCompletionMessage.textContent = 'No favorite words to quiz on!';
		quizCardContainer.innerHTML = '';
		nextCardButton.style.display = 'none';

		quizContent.classList.add('complete');

		setTimeout(() => {
			quizCompletionMessage.style.display = 'none';
			quizModal.style.display = 'none';
			quizContent.classList.remove('complete');
		}, 3000);
	}
}

/* LOAD NEXT QUIZ CARD FUNCTION */
function loadNextCard() {
	if (currentCardIndex >= words.length) {
		quizCardContainer.innerHTML = '';
		nextCardButton.style.display = 'none';
		quizCompletionMessage.style.display = 'block';
		quizCompletionMessage.style.backgroundColor = 'green';
		quizCompletionMessage.textContent = 'You have completed the quiz!';

		quizContent.classList.add('complete');

		setTimeout(() => {
			quizCompletionMessage.style.display = 'none';
			quizModal.style.display = 'none';
			quizContent.classList.remove('complete');
		}, 3000);

		return;
	}

	const word = words[currentCardIndex];
	quizCardContainer.innerHTML = `
		<section class="quiz-card" id="quiz-card">
			<section class="quiz-card-front">
				<h3>${word.word}</h3>
				<p>Tap to see the definition</p>
			</section>
			<section class="quiz-card-back">
				<h3>Definition</h3>
				<p>${word.definition}</p>
			</section>
		</section>
	`;

	const quizCard = document.getElementById('quiz-card');
	quizCard.addEventListener('click', () => {
		quizCard.classList.toggle('flip');

		if (quizCard.classList.contains('flip')) {
			incrementRepeatCounter(word.word);
		}
	});

	currentCardIndex++;
}

/* 
----------------------------------------------------------------------------------------------
MANAGING THE WORD REPETITION COUNTER
----------------------------------------------------------------------------------------------
*/

/* INCREMENT REPEAT COUNTER FUNCTION */
function incrementRepeatCounter(word) {
	const repeatCounters = getRepeatsCounters();
	repeatCounters[word] = (repeatCounters[word] || 0) + 1;

	localStorage.setItem('repeatCounters', JSON.stringify(repeatCounters));
	updateRepeatCounter(word, repeatCounters[word]);
}

/* UPDATE REPEAT COUNTER FUNCTION */
function updateRepeatCounter(word, repeats) {
	const counterElement = document.querySelector(`.repeat-counter[data-word="${word}"]`);

	if (counterElement) {
		counterElement.style.backgroundColor = getRepeatColor(repeats);
		counterElement.querySelector('.emoji').textContent = getEmoji(repeats);
		counterElement.querySelector('.count').textContent = repeats;
	}
}

/* GET WORD COUNTERS FROM LOCAL STORAGE FUNCTION */
function getRepeatsCounters() {
	const repeatCounters = JSON.parse(localStorage.getItem('repeatCounters')) || {};
	return repeatCounters;
}

/* GET EMOJI FUNCTION */
function getEmoji(repeats) {
	if (repeats >= 6) {
		return '😊';
	} else if (repeats >= 3) {
		return '😐';
	} else {
		return '😢';
	}
}

/* GET REPEAT COLOR FUNCTION */
function getRepeatColor(repeats) {
	if (repeats >= 6) {
		return '#7FFF00';
	} else if (repeats >= 3) {
		return '#FFFF00';
	} else {
		return '#FF0000';
	}
}

/* 
----------------------------------------------------------------------------------------------
THEME SWITCH CONTROL
----------------------------------------------------------------------------------------------
*/

/* LOAD THEME FROM COOKIES */
document.addEventListener('DOMContentLoaded', () => {
	const theme = getCookie('theme');

	if (theme) {
		document.body.classList.add(theme);
	}
});

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
