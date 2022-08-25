import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';

// This component necessary for screens in Tab navigator (not stack navigator)
// otherwise status bar shown on all screens is always that configured on the last tab
// screen in the navigator. see docs https://reactnavigation.org/docs/status-bar/#tabs-and-drawer for more.
function FocusAwareStatusBar({style}) {
  const isFocussed = useIsFocused();
  return isFocussed ? <StatusBar style={style} /> : null;
}

export default FocusAwareStatusBar;
