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

export { getPreviousPeriodReset, getEndOfDay };
