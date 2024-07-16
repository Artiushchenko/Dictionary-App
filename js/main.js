const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const searchBlock = document.getElementById('search-result');
const sound = document.getElementById('word-pronouncing');
const searchButton = document.getElementById('search-button');
const themeToggleButton = document.getElementById('theme-toggle-button');
const themeIcon = document.getElementById('theme-icon');

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
			searchBlock.innerHTML = `
				<section class="word">
					<h3>${data[0].word}</h3>
					<button onclick="playSound()">
						<i class="fa-solid fa-volume-high"></i>
					</button>
				</section>

				<section class="word-details">
					<p>${data[0].meanings[0].partOfSpeech}</p>
					<p>${data[0].phonetics[0].text}</p>
				</section>

				<p class="word-meaning">
					${data[0].meanings[0].definitions[0].definition}
				</p>

				<p class="word-example">
					${data[0].meanings[0].definitions[0].example || ''}
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

	console.log(`Cookie set: ${cookieName}=${cookieValue}; ${expires}`);
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
