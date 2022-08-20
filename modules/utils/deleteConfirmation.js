// a component that displays a delete confirmation dialogue when the users selects something to
// delete. Takes a title message and submessage to display in the alert, boolean to decide
// if it's cancelable (by clicking outside the alert) or not.
// calls the passed onConfirmed prop functio when deletion is confirmed.
// calls the onCancelled prop function when the deletion is cancelled.

// call onDismiss if cancelled by clicking outside of the alert ??

import { Alert } from 'react-native';

const confirmDelete = (title, message, onConfirmed, onCancelled) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        onPress: onCancelled,
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: onConfirmed,
        style: 'destructive',
      },
    ],
    {
      cancelable: true,
      onDismiss: () => onCancelled,
    },
  );
};

export { confirmDelete };
