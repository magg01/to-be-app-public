import * as Notifications from 'expo-notifications';
import { Alert, Modal, Platform } from 'react-native';
import { addNotificationToCalEvent } from '../database/database';

//async function which gets the current state of overall notification permission on IOS and Android.
// returns a string:
// 'allowed' - if notification permissions have been granted
// 'denied' - if notification permissions have been explicitly denied or are otherwise not allowed by device settings
// 'undetermined' - if the user has not yet made a decision
async function allowsNotificationsAsync() {
  const settings = await Notifications.getPermissionsAsync();
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

const checkOrGetNotificationPermission = async () => {
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

const confirmRemoveNotification = () => {
  return new Promise((resolve, reject) => {
    Alert.alert(
      'Remove existing notification?',
      'Your scheduled notification will be cancelled.',
      [
        {
          text: 'Cancel',
          onPress: () => resolve(false),
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => resolve(true),
          style: 'destructive',
        },
      ],
      {
        cancelable: false,
      }
    );
  })
}

const cancelNotificationEvent = (notificationIdentifier) => {
  //cancel the scheduled notification
  Notifications.cancelScheduledNotificationAsync(notificationIdentifier);
}

//add or remove an notification on a calEvent. After operations should return true if a notification is present and false if not
// const addRemoveNotificationOnCalEvent = async (calEventId) => {
  
//   //if yes
//   if (calEvent.eventnotification != null){
    
//   } else {
//     //check permissions
//     permissionState = await allowsNotificationsAsync();
//     //if granted
//     if(permissionState === 'allowed'){
//       const notificationID = await Notifications.scheduleNotificationAsync({
//         content: {
//           title: "Time's up!",
//           body: 'Change sides!',
//         },
//         trigger: {
//           seconds: 3,
//         },
//       })
      // addNotificationToCalEvent(calEventId, notificationID);
//       return(true);
//       //open a datetimepickermodal to set a date and time for the notification
//       //with what is returned from the dtpicker schedule a notification
//       //add the notification id to the calEvent in the database
//       //fill in the icon to show a presence of notification
//     //if denied
//     } else if (permissionState === 'denied'){
//       //show an alert about being denied
//       Alert.alert("You or your device settings have not allowed notifications from this app. If you'd like to enable notifications please allow them in your phone's settings.")
//       //make sure notification icon remains greyed out
//       return(false)
//     //if undetermined
//     } else if (permissionState === 'undetermined'){
//       //ask for permissions grant
//       //if granted
//         //open a datetimepickermodal to set a date and time for the notification
//         //with what is returned from the dtpicker 
//         //schedule a notification
//         //add the notification id to the calEvent in the database
//         //fill in the icon to show a presence of notification
//       //if not granted
//       //show alert that notification permissions will need to be granted in the phone settings
//     }
//   }
// }
      
export { 
  triggerNotifications, 
  allowsNotificationsAsync, 
  checkOrGetNotificationPermission,
  confirmRemoveNotification, 
  cancelNotificationEvent 
}