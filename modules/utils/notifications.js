import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

const fetchPermissionSettings = async () => {
  const settings = await Notifications.getPermissionsAsync();
  console.log(`Notification permission settings are: ${JSON.stringify(settings, null, 1)}`)
  return settings;
};

// function which takes a NotificationPermissionsStatus object and
// returns a string:
// 'allowed' - if notification permissions have been granted
// 'provisional' - if notifications are allowed to be delivered quietly only (iOS)
// 'denied' - if notification permissions have been explicitly denied
// or are otherwise not allowed by device settings
// 'undetermined' - if the user has not yet made a decision
const checkPermissionSettings = (settings) => {
  if (Platform.OS === 'ios') {
    if (
      settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED
      || settings.ios?.status === Notifications.IosAuthorizationStatus.EPHEMERAL
    ) {
      return 'granted';
    }
    if (settings.ios?.status === Notifications.IosAuthorizationStatus.DENIED) {
      return 'denied';
    }
    if (settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
      return 'provisional';
    }
    return 'undetermined';
  }
  if (Platform.OS === 'android') {
    if (settings.granted) {
      return ('granted');
    }
    if (!settings.granted) {
      return ('denied');
    }
    return ('undetermined');
  }
  return 'denied';
};

// function that returns true if scheduling a notification is allowed
// and false if not, based on current user permissions
// if user has not determined - asks user for permission and
// returns true if granted and false if denied
async function isScheduleNotificationAllowed() {
  const settings = await fetchPermissionSettings();
  let permissionState = checkPermissionSettings(settings);
  if (permissionState === 'undetermined') {
    // ask the user for a decision
    const permissionRequestResponse = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true,
        allowAnnouncements: true,
      },
    });
    permissionState = checkPermissionSettings(permissionRequestResponse);
  }
  if (permissionState === 'granted') {
    return true;
  }
  if (permissionState === 'denied') {
    return false;
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
};

const confirmRemoveNotification = () => new Promise((resolve, reject) => {
  try {
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
      },
    );
  } catch (e) {
    reject(e);
  }
});

const cancelNotificationEvent = (notificationIdentifier) => {
  // cancel the scheduled notification
  Notifications.cancelScheduledNotificationAsync(notificationIdentifier);
};

export {
  fetchPermissionSettings,
  triggerNotifications,
  checkPermissionSettings,
  isScheduleNotificationAllowed,
  confirmRemoveNotification,
  cancelNotificationEvent,
};
