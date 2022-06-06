//Returns animations which conditions are met by the weatherData
export default function getFilteredAnimations(animationList, weatherData) {
      const result = [];

      //For each animation
      animationList.default.forEach((animation, i) => {
            let conditionsMet = true;
            //Check if all its conditions are met
            Object.keys(animation.conditions).forEach(key => {
                  //If animation condition isn't passed passed in the weatherData log error
                  if(!weatherData[key]) { console.error("Animation condition error: No condition called ", key); return}
                  const condition = animation.conditions[key];

                  //If object it will have a min and or max value
                  if(typeof condition === 'object') {
                        if(condition.min !== null && condition.min > weatherData[key] ) {
                              conditionsMet = false;
                              return;
                        }
                        else if(condition.max !== null && condition.max < weatherData[key] ) {
                              conditionsMet = false;
                              return;
                        }
                  //If not object it should just check if equal to.  An example is weatherState = 'rainy'
                  } else {
                        if (condition != weatherData[key] ) {
                              conditionsMet = false;
                              return
                        }
                  }
            })
            if(conditionsMet) {
                  result.push(animation.src)
            }
      });

      return result;
}