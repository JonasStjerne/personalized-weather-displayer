import * as API_KEYS from '../public/apiKeys.json';

export default class WeatherService {
      constructor() {
            this.DMI_API_KEY_METOBS = API_KEYS.DMI_API_KEY_METOBS;
            this.METOBS_STATION_ID = API_KEYS.METOBS_STATION_ID;

            this.DMI_API_KEY_OCEANOBS = API_KEYS.DMI_API_KEY_OCEANOBS;
            this.OCEANOBS_STATION_ID = API_KEYS.OCEANOBS_STATION_ID;
      }

      getMetObsEndpoint(obsType) {
            const endpoint = `https://dmigw.govcloud.dk/v2/metObs/collections/observation/items?stationId=${this.METOBS_STATION_ID}&parameterId=${obsType}&limit=1&sortorder=observed%2CDESC&bbox-crs=https%3A%2F%2Fwww.opengis.net%2Fdef%2Fcrs%2FOGC%2F1.3%2FCRS84&api-key=${this.DMI_API_KEY_METOBS}`

            return endpoint;
      }

      async getCloudCover() {
            const cloudCoverResponseJSON = await fetch(this.getMetObsEndpoint("cloud_cover"));
            const cloudCoverResponse = await cloudCoverResponseJSON.json();
            const cloudCover = cloudCoverResponse.features[0].properties.value;

            if (cloudCover <= 25) { return "sunny" }
            if (cloudCover >= 26 && cloudCover <= 75) { return "partCloudy" }
            if (cloudCover >= 76) { return  "cloudy" }
      }


      async getAirTemperature() {
            const responseJSON = await fetch(this.getMetObsEndpoint("temp_dry"));
            const response = await responseJSON.json();
            return Math.round(response.features[0].properties.value);
      }

      async getWaterTemperature() {
            const endpoint = `https://dmigw.govcloud.dk/v2/oceanObs/collections/observation/items?stationId=${this.OCEANOBS_STATION_ID}&parameterId=tw&limit=1&sortorder=observed%2CDESC&bbox-crs=https%3A%2F%2Fwww.opengis.net%2Fdef%2Fcrs%2FOGC%2F1.3%2FCRS84&api-key=${this.DMI_API_KEY_OCEANOBS}`;
            const responseJSON = await fetch(endpoint);
            const response = await responseJSON.json();
            return response.features[0].properties.value;
      }

      async getWeatherState() {
            const responseJSON = await fetch(this.getMetObsEndpoint("weather"));
            const response = await responseJSON.json();
            const weather = response.features[0].properties.value;
            
            if (weather <= 149) { return this.getCloudCover() }
            if (weather >= 150 && weather <= 169) { return "rainy" }
            if (weather >= 170 && weather <= 179) { return "snowy" }
            if (weather >= 180 && weather <= 194) { return "rainy" }
            if (weather >= 195 && weather <= 199) { return "lightning" }
      }

      async getWindSpeed() {
            const responseJSON = await fetch(this.getMetObsEndpoint("wind_max"));
            const response = await responseJSON.json();
            return Math.round(response.features[0].properties.value);
      }

}