import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/app/HomeScreen';
import TransferScreen from '../screens/app/TransferScreen';
import SuccessScreen from '../screens/app/SuccessScreen';
import QuickModeScreen from '../screens/app/QuickModeScreen';
import HistoryScreen from '../screens/app/HistoryScreen';
import ProfileScreen from '../screens/app/ProfileScreen';
import { useQuickMode } from '../context/QuickModeContext';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isQuickModeEnabled } = useQuickMode();
  const { getColors } = useTheme();
  const colors = getColors();

  // Set initial route based on Quick Mode
  const initialRoute = isQuickModeEnabled ? 'QuickMode' : 'Home';

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="QuickMode"
        component={QuickModeScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        name="Transfer"
        component={TransferScreen}
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        name="Success"
        component={SuccessScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ gestureEnabled: true }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
