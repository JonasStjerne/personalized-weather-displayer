<script>
	import { onMount } from 'svelte';
	import WeatherService from './weatherService';
	import avatarDecoder from './avatarDecoder';
	import * as avatarList from '../public/assets/avatar/list.json';

	const weatherService = new WeatherService("Hou");

	const updateIntervalMinutes = 1;
	let airTemperature, waterTemperature, weatherState, windSpeed;


	function updateWeather() {
		airTemperature = weatherService.getAirTemperature();
		waterTemperature = weatherService.getWaterTemperature();
		weatherState = weatherService.getWeatherState();
		windSpeed = weatherService.getWindSpeed();
	}

	function getPossibleAvatars() {
		return avatarDecoder(avatarList, { airTemperature, waterTemperature,weatherState, windSpeed })
	}

	onMount(() => {
		setInterval(updateWeather(), updateIntervalMinutes*1000*60)
		console.log(getPossibleAvatars());
	})

</script>
<div class="wrapper">
	<video autoplay muted loop class="idiot">
		<source src="https://www.w3schools.com/howto/rain.mp4" type="video/mp4">
	</video>
	<div class="weatherVideoContainer">
		<video autoplay muted loop class="backgroundWeather">
			<source src="https://www.w3schools.com/howto/rain.mp4" type="video/mp4">
		</video>
		<div class="weatherInformationContainer">
			<div class="airTemperature">
				<h1>21°</h1>
			</div>
			<div class="secondaryWeatherInfo">
				<div class="windSpeedContainer">
					<img src="./assets/windIcon.png" alt="">
					<h2>5m/s</h2>
				</div>
				<div class="waterTemperature">
					<img src="./assets/waterIcon.png" alt="">
					<h2>10°</h2>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.wrapper {
		height: 100vh;
	}

	.idiot {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 40vw;
		max-height: 100vh;
		z-index: 1;
	}

	.weatherVideoContainer {
		position: fixed;
		border-radius: 2em;
		overflow: hidden;
		inset: 4em;
	}

	.backgroundWeather {
		width: 100%;
		height: 100%;
		object-fit: cover;
		position: absolute;
		z-index: -1;
		filter: blur(4px);
	}

	.weatherInformationContainer {
		margin-left: 40%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: end;
		align-items: center;
		gap: 2em;
	}

	.secondaryWeatherInfo {
		display: flex;
		justify-content: space-evenly;
		width: 100%;
	}

	.secondaryWeatherInfo > * {
		display: flex;
	}

	.secondaryWeatherInfo img {
		aspect-ratio: 1 / 1;
		height: 5rem;
		margin: auto 0;
	}



</style>