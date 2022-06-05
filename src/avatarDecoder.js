export default function avatarDecoder(avatarList, weatherData) {
      const result = [];
      const { airTemperature, waterTemperature, weatherState, windSpeed, ...rest} = weatherData;

      //const avatarList = JSON.parse(avatarListJson);

      //Check if weather satisfy each avatars conditions

      //For each avatar
      avatarList.default.forEach((avatar, i) => {
            let conditionsMet = true;
            //Check if all its conditions are met
            Object.keys(avatar.conditions).forEach(key => {
                  const condition = avatar.conditions[key];
                  //If object it will have a min of max val
                  if(typeof condition === 'object') {
                        console.log("Max: " + condition.max)
                        console.log("Actual weather: " + weatherData[key])
                        if(condition.min !== null && condition.min > weatherData[key] ) {
                              conditionsMet = false;
                              console.log("checked min")
                              return;
                        }
                        else if(condition.max !== null && condition.max < weatherData[key] ) {
                              conditionsMet = false;
                              console.log("checked max")

                              return;
                        }
                  //Else it will be a string
                  } else {
                        console.log("not object")
                        if (condition != weatherData[key] ) {
                              console.log("string not equal")
                              console.log(weatherState)
                              console.log(condition)
                              conditionsMet = false;
                              return
                        }
                  }
            })
            if(conditionsMet) {
                  result.push(avatar.src)
            }
      });

      return result;
}