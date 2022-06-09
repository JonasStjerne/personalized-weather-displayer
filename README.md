# Personalized Weather displayer
Web-based weather data displayer where you can insert animations/pictures of yourself. The animations of yourself can contain conditions for certain weather criteria to be present when shown.

![Gif of weather applikation](https://github.com/JonasStjerne/personalized-weather-displayer/blob/main/displayer.gif)

Record a video or take a picture of yourself in rain clothes to be shown when it's raining or you in winter clothes when temerature hits below 5 degress.

The videos have to be converted to GIF to support transparent background. 

## Configure animations
To display your custom animations upload them in .gif or a image format to the folder:

`public/assets/animations`

In the file `list.json` add the animation/picture file name and the conditions for it to be displayed.
The default weather data contains the following data points that can be used for conditions:

```
airTemperature: number
waterTemperature: number
windSpeed: number
weatherState: "sunny" | "partCloudy" | "rainy" | "snowy" | "lightning"
currentDate: Date (format Day/Month ex. 12/3)
```

The data points with type of number can hold a min and or max condition for the number and the data point with type of string/date will be checked if equal to the set value. 

Example:

```JSON
[
      {
         "src":"happy.gif",
         "conditions": 
         {
               "windSpeed":{
                  "max": 5
               },
               "weatherState": "sunny",
               "airTemperature" : {
                   "min": 18,
                   "max": 30
               }
            }
      },
      ...
]
```

