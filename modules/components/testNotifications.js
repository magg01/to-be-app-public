import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';


const fetchPermissionSettings = async () => {
  const settings = await Notifications.getPermissionsAsync();
  console.log(`Notification permission settings are: ${JSON.stringify(settings, null, 1)}`)
  return settings;
}

// function which takes a NotificationPermissionsStatus object and 
// returns a string:
// 'allowed' - if notification permissions have been granted
// 'provisional' - if notifications are allowed to be delivered quietly only (iOS)
// 'denied' - if notification permissions have been explicitly denied or are otherwise not allowed by device settings
// 'undetermined' - if the user has not yet made a decision
const checkPermissionSettings = (settings) => {
  if(Platform.OS === 'ios'){
    if(
      settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED 
      || settings.ios?.status === Notifications.IosAuthorizationStatus.EPHEMERAL
    ){
      return 'granted';
    } else if(settings.ios?.status === Notifications.IosAuthorizationStatus.DENIED){
      return 'denied';
    } else if (settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL){
      return 'provisional';
    } else {
      return 'undetermined'
    }
  } else if (Platform.OS === 'android'){
    if(settings.granted) {
      return ('granted')
    } else if (!settings.granted) {
      return ('denied');
    } else {
      return ('undetermined');
    }
  } else {
    return 'denied';
  }
}

//function that returns true if scheduling a notification is allowed and false if not, based on current user permissions
//if user has not determined - asks user for permission and returns true if granted and false if denied
const isScheduleNotificationAllowed = async () => {
  const settings = await fetchPermissionSettings();
  let permissionState = checkPermissionSettings(settings);
  if(permissionState === 'undetermined'){
    //ask the user for a decision
    let permissionRequestResponse = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true,
        allowAnnouncements: true,
      },
    });
    permissionState = checkPermissionSettings(permissionRequestResponse);
  }
  if(permissionState === 'granted'){
    return true;
  }
  else if(permissionState === 'denied'){
    return false;
  }
}

//function that checks the current permissions nad returns a state

//function that requests permissions

//function that 

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
//     permissionState = await checkPermissionSettings();
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
  fetchPermissionSettings,
  triggerNotifications, 
  checkPermissionSettings, 
  isScheduleNotificationAllowed,
  confirmRemoveNotification, 
  cancelNotificationEvent 
}