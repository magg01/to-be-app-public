import * as Notifications from 'expo-notifications';

const triggerNotifications = async () => {
  await Notifications.scheduleNotificationAsync({
  content: {
    title: "You've got mail! 📬",
    body: 'Here is the notification body',
    data: { data: 'goes here' },
  },
  trigger: { seconds: 5 },
  });
}

export { triggerNotifications}