export default class WeatherService {
      constructor(location) {
            this.location = location;
      }

      getAirTemperature() {
            return 20;
      }

      getWaterTemperature() {
            return 14;
      }

      getWeatherState() {
            return "partCloudy";
      }

      getWindSpeed() {
            return 2;
      }

}