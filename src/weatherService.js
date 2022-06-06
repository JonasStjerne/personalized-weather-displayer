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
            return "partlyCloudy";
      }

      getWindSpeed() {
            return 2;
      }

}