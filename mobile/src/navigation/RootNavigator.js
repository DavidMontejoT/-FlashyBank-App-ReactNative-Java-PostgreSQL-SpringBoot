import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useQuickMode } from '../context/QuickModeContext';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import HomeScreen from '../screens/app/HomeScreen';
import QuickModeScreen from '../screens/app/QuickModeScreen';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isQuickModeEnabled } = useQuickMode();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If not authenticated, show auth screens
  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  // If authenticated and quick mode is enabled, show quick mode first
  // The AppNavigator handles the routing between QuickMode and other screens
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default RootNavigator;
