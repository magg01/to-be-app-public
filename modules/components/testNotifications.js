import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

//async function which gets the current state of overall notification permission on IOS and Android.
// returns a string:
// 'allowed' - if notification permissions have been granted
// 'denied' - if notification permissions have been explicitly denied or are otherwise not allowed by device settings
// 'undetermined' - if the user has not yet made a decision
async function allowsNotificationsAsync() {
  const settings = await Notifications.getPermissionsAsync();
  console.log(Platform.OS)
  console.log(`settings are: ${JSON.stringify(settings, null, 1)}`)
  if(Platform.OS === 'ios'){
    if(
      settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED 
      || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL 
      || settings.ios?.status === Notifications.IosAuthorizationStatus.EPHEMERAL
    ){
      return 'allowed';
    } else if(settings.ios?.status === Notifications.IosAuthorizationStatus.DENIED){
      return 'denied';
    } else {
      return 'undetermined'
    }
  } else if (Platform.OS === 'android'){
    if(
      settings.granted 
    ) {
      return ('allowed')
    } else if (
      !settings.granted 
    ) {
      return ('denied');
    } else {
      return ('undetermined');
    }
  } else {
    return 'denied';
  }
}

const checkNotificationPermission = async () => {
  const permissionState = await allowsNotificationsAsync();
  if(permissionState === 'allowed'){
    Alert.alert("great, notifications are allowed")
  }
  else if(permissionState === 'denied'){
    Alert.alert("You or your device settings have not allowed notifications from this app. If you'd like to enable notifications please allow them in your phone's settings.")
  } else if(permissionState === 'undetermined'){
    return await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
      },
    });
  }
}

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

export { triggerNotifications, allowsNotificationsAsync, checkNotificationPermission }