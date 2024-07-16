const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const searchBlock = document.getElementById('search-result');
const sound = document.getElementById('word-pronouncing');
const searchButton = document.getElementById('search-button');

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

function playSound() {
	sound.play();
}
