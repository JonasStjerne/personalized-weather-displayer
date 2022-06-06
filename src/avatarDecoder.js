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
                  if(!weatherData[key]) { console.error("Animation condition error: No condition called ", key); return}
                  if(typeof condition === 'object') {
                        if(condition.min !== null && condition.min > weatherData[key] ) {
                              conditionsMet = false;
                              return;
                        }
                        else if(condition.max !== null && condition.max < weatherData[key] ) {
                              conditionsMet = false;
                              return;
                        }
                  //Else it will be a string
                  } else {
                        if (condition != weatherData[key] ) {
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