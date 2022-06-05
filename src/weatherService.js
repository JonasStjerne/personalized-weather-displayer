export default class WeatherService {
      constructor(location) {
            this.location = location;
      }

      getAirTemperature() {
            return 20;
      }

      getWaterTemperature() {
            return 14.2;
      }

      getWeatherState() {
            return "rainy";
      }

      getWindSpeed() {
            return 2.3;
      }

}