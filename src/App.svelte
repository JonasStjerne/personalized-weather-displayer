<script>
	import { onMount } from 'svelte';
	import WeatherService from './weatherService';
	import getFilteredAnimations from './getAnimations';
	import * as animations from '../public/assets/animations/list.json';

	const weatherService = new WeatherService("Hou");

	const updateWeatherDataIntervalMinutes = 0.1;
	const animationCycleTimeMinutes = 5;

	const defaultAnimation = 'defaultAnimation.mp4';

	const latitude = 55.92028279;
	const longitude = 10.24266992;
	let brightness;

	let airTemperature, waterTemperature, weatherState, windSpeed, currentAnimation;

	//Set the brighness of the video according to daylight outside
	//Thanks to https://sunrise-sunset.org/api for using the API
	function setBrightnessToDaylight(lat, lng) {
		fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=today&formatted=0`)
		.then(response => response.json())
		.then(data => {
			if(data.status == "OK") {
				const sunrise = new Date(data.results.sunrise);
				const sunset = new Date(data.results.sunset);
				const currentTime = new Date();

				if(currentTime.getHours() > sunrise.getHours()+1 && currentTime.getHours() < sunset.getHours()-1){
					brightness = 1;
				} else if (currentTime.getHours() == sunrise.getHours()+1 || currentTime.getHours() == sunset.getHours()-1) {
					brightness = 0.6;
				} else {
					brightness = 0.3;
				}
			}
		})
	}
	
	function updateWeather() {
		airTemperature = weatherService.getAirTemperature();
		waterTemperature = weatherService.getWaterTemperature();
		weatherState = weatherService.getWeatherState();
		windSpeed = weatherService.getWindSpeed();
	}

	function runNewAnimation() {
		//Save last animation
		const previousAnimation = currentAnimation;
		var pickedAnimation;
		
		//Get animations which conditions match weatherData
		let animationContainer = getFilteredAnimations(animations, { airTemperature, waterTemperature,weatherState, windSpeed });

		function pickRandomAnimation() {
			//If no animations condition are met, play default animation
			if (animationContainer.length == 0) {
				pickRandomAnimation = defaultAnimation;
				return;
			}
			//Select random animation from animationContainer
			pickedAnimation = animationContainer[Math.floor(animationContainer.length * Math.random()) | 0];
			//If its the same as last animation and there are others to pick, pick a new one
			if(pickedAnimation == previousAnimation && animationContainer.length > 1) {
				pickRandomAnimation()
			}
		}
		//Call function
		pickRandomAnimation();

		//Set the new animation
		currentAnimation = pickedAnimation;
	}

	onMount(() => {
		//Get weather information and update every set amount of time
		updateWeather()
		setInterval(updateWeather, updateWeatherDataIntervalMinutes*60*1000)

		//Set new animation and set a new one every set amount of time
		runNewAnimation()
		setInterval(runNewAnimation, animationCycleTimeMinutes*60*1000)

		setBrightnessToDaylight(latitude, longitude)
	})

</script>
<div class="wrapper">
	<video autoplay muted loop class="idiot">
		<source src="https://www.w3schools.com/howto/rain.mp4" type="video/mp4">
	</video>
	<div class="weatherVideoContainer">
	<video autoplay muted loop class="backgroundWeather" style="filter: blur(4px) brightness({brightness})">
			<source src={ `./assets/weather/${weatherState}.mp4`} type="video/mp4">
		</video>
		<div class="weatherInformationContainer">
			<div class="airTemperature">
			<h1>{ airTemperature }°</h1>
			</div>
			<div class="secondaryWeatherInfo">
				<div class="windSpeedContainer">
					<img src="./assets/windIcon.png" alt="">
					<h2>{ windSpeed }m/s</h2>
				</div>
				<div class="waterTemperature">
					<img src="./assets/waterIcon.png" alt="">
				<h2>{ waterTemperature }°</h2>
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