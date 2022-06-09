export default class WeatherService {
      constructor(location) {
            this.location = location;
      }

      async getAirTemperature() {
            // const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
            // const airTemperature = await response.json();
            return 20;
      }

      async getWaterTemperature() {
            return 14;
      }

      async getWeatherState() {
            return "partCloudy";
      }

      async getWindSpeed() {
            return 2;
      }

}