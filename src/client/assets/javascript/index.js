import Api from "./api.js";
// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
const store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
	race_length: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		Api.getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

/**
 * @description Handles the asynchronous request allowing re-use of request failure handling
 * @param {function} func - the callback function
 * @param {Array} params - the parameters for the callback function
 * @returns {Object} - response from the callback function
 */
async function handleAsyncRequest(func, params= []) {

	const res = await func(...params);
	if (!res) {
		throw new Error("Request failed!");
	}
	return res;
}

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	// render starting UI
	renderAt('#race', renderRaceStartView())

	// Get player_id and track_id from the store
	const { player_id, track_id } = store;
	
	try {
		//  invoke the API call to create the race, then save the result
		const race = await handleAsyncRequest(createRace, [player_id, track_id]);

		// update the store with the race id
		store.race_id = race.ID - 1;
		store.race_length = race.Track.segments.length;
		// The race has been created, now start the countdown
		await handleAsyncRequest(runCountdown);

    await handleAsyncRequest(startRace, [store.race_id]);

		await handleAsyncRequest(runRace, [store.race_id]);

	} catch (err) {
		console.log(err);
	}
}

function runRace(raceID) {
	return new Promise(resolve => {
	// get the race info every 500ms
	const intervalId = setInterval(async () => {
		const res = await getRace(raceID);
		switch (res.status) {
			case "in-progress":
				// update the leaderboard
				renderAt('#leaderBoard', raceProgress(res.positions));
				break
			case "finished":
				clearInterval(intervalId);
				renderAt('#race', resultsView(res.positions));
				resolve(res);
				break;
			default:
				console.log("Unsupported status::", res.status);
		}
	}, 500);
	})
		.catch(err => console.log("Problem with runRace request::", err))
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			// use Javascript's built in setInterval method to count down once per second
			const intervalId = setInterval(() => {
				// run this DOM manipulation to decrement the countdown for the user
				if (timer > 0) {
					document.getElementById('big-numbers').innerHTML = --timer;
				} else {
					// if the countdown is done, clear the interval, resolve the promise, and return
					clearInterval(intervalId);
					resolve("Countdown complete!");
				}
			}, 1000)
		})
	} catch(error) {
		console.log(error);
	}
}

function handleSelectPodRacer(target) {
	console.log("selected a pod", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// save the selected racer to the store
	store.player_id = target.id;
}

function handleSelectTrack(target) {
	console.log("selected a track", target.id)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// save the selected track id to the store
	store.track_id = target.id;
	
}

function handleAccelerate() {
	console.log("accelerate button clicked")
	try {
		handleAsyncRequest(accelerate, [store.race_id]);
	} catch (err) {
		console.log(err);
	}
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track

	return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	return `
		<header>
<!--			TODO Re-enable track name-->
			<h1>Race: </h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function racePositionsView(positions) {
	const userPlayer = positions.find(e => e.id === parseInt(store.player_id))
	userPlayer.driver_name += " (you)"

	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name} (${Math.round((p.segment / store.race_length) * 100)}%)</h3>
				</td>
			</tr>
		`
	}).join("");

	return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`

}
function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${racePositionsView(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	return `
		<main>
			${racePositionsView(positions)}
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// function getTracks() {
// 	return fetch(`${SERVER}/api/tracks`)
// 		.then(res => res.json())
// 		.catch(err => console.log("Problem with getTracks request::", err))
// }

function getRacers() {
	return fetch(`${SERVER}/api/cars`)
		.then(res => res.json())
		.catch(err => console.log("Problem with getRacers request::", err))
}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }
	
	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with createRace request::", err))
}

function getRace(id) {
	return fetch( `${SERVER}/api/races/${id}`)
		.then(res => res.json())
		.catch(err => console.log("Problem with getRace request::", err))
}

function startRace(id) {
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
		.then(res => res.ok)
		.catch(err => console.log("Problem with startRace request::", err))
}

function accelerate(id) {
	return fetch(`${SERVER}/api/races/${id}/accelerate`, {
		method: 'POST',
		...defaultFetchOpts()
	})
		.then(res => res.ok)
		.catch(err => console.log("Problem with accelerate request::", err))
}
