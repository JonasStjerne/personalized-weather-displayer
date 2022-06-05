export default function avatarDecoder(avatarList, weatherData) {
      const result = [];
      const { airTemperature, waterTemperature, weatherState, windSpeed, ...rest} = weatherData;

      //const avatarList = JSON.parse(avatarListJson);

      //Check if weather satisfy each avatars conditions
      console.log(avatarList.default)
      //For each avatar
      avatarList.default.forEach((avatar, i) => {
            const conditionsMet = true;
            //Check if all its conditions are met
            avatar.conditions.forEach(condition => {
                  //If object it will have a min of max val
                  if(Object(condition)) {
                        if(condition.min !== null && condition.min > weatherData[Object.keys( {condition} )[0]] ) {
                              conditionsMet = false;
                              console.log("checked min")
                              return;
                        }
                        else if(condition.max !== null && condition.max < weatherData[Object.keys( {condition} )[0]] ) {
                              conditionsMet = false;
                              console.log("checked max")

                              return;
                        }
                  //Else it will be a string
                  } else {
                        if (condition !== weatherData[Object.keys( {condition} )[0]] ) {
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