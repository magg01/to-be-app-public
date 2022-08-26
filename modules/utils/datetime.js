function getPreviousPeriodReset(periodicity) {
  if (periodicity === 'daily') {
    const previousPeriodReset = new Date();
    previousPeriodReset.setHours(0, 0, 0, 0);
    console.log(`previous daily period reset is ${previousPeriodReset}`);
    return previousPeriodReset;
  }
  if (periodicity === 'weekly') {
    const previousPeriodReset = new Date();
    previousPeriodReset.setDate(previousPeriodReset.getDate() - previousPeriodReset.getDay() + 1);
    previousPeriodReset.setHours(0, 0, 0, 0);
    console.log(`previous weekly period reset is ${previousPeriodReset}`);
    return previousPeriodReset;
  }
  if (periodicity === 'monthly') {
    const previousPeriodReset = new Date();
    previousPeriodReset.setDate(1);
    previousPeriodReset.setHours(0, 0, 0, 0);
    console.log(`previous monthly period reset is ${previousPeriodReset}`);
    return previousPeriodReset;
  }
}

function getEndOfDay(dateTime) {
  dateTime.setHours(23, 59, 59, 999);
  return dateTime;
}

const zeroPadTime = (time) => {
  // would rather use .toLocaleString on Date objects here but doesn't work for Android see (https://stackoverflow.com/questions/41408025/react-native-tolocalestring-not-working-on-android)
  // could get around it (see: https://expo.canny.io/feature-requests/p/add-intl-support) but wouldn't work in Expo Go. 
  if (time < 10) {
    return `0${time}`;
  }
  return time;
};

// takes an ISO datetime string
// returns true if the datetime is after the current datetime
// returns false if the datetime is equal to or earlier than the current datetime
const hasEndDateElapsed = (ISODateTimeString) => {
  // if there is no enddate for this item
  if (ISODateTimeString === null) return false;
  const endDate = new Date(ISODateTimeString);
  return (endDate < new Date());
};

export { getPreviousPeriodReset, getEndOfDay, zeroPadTime, hasEndDateElapsed };
