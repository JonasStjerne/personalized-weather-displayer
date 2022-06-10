import * as API_KEYS from '../public/apiKeys.json';

export default class WeatherService {
      constructor(location) {
            this.location = location;
            this.DMI_API_KEY_OCEANOBS = API_KEYS.DMI_API_KEY_OCEANOBS;
            this.DMI_API_KEY_METOBS = API_KEYS.DMI_API_KEY_METOBS;
            console.log(this.DMI_API_KEY_OCEANOBS)
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