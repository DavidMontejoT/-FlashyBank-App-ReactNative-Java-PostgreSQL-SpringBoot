import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';

const QuickModeContext = createContext(null);

const QUICK_MODE_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
const WARNING_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds

export const QuickModeProvider = ({ children }) => {
  const [isQuickModeEnabled, setIsQuickModeEnabled] = useState(false);
  const [quickModeEndTime, setQuickModeEndTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const intervalRef = useRef(null);
  const warningShownRef = useRef(false);

  useEffect(() => {
    loadQuickModeState();
    setupNotifications();

    // Handle app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isQuickModeEnabled && quickModeEndTime) {
      startTimer();
    } else {
      stopTimer();
    }
  }, [isQuickModeEnabled, quickModeEndTime]);

  const setupNotifications = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus === 'granted') {
      await Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    }
  };

  const loadQuickModeState = async () => {
    try {
      const savedEndTime = await SecureStore.getItemAsync('quickModeEndTime');
      if (savedEndTime) {
        const endTime = parseInt(savedEndTime, 10);
        const now = Date.now();

        if (endTime > now) {
          // Still has time remaining
          setIsQuickModeEnabled(true);
          setQuickModeEndTime(endTime);
        } else {
          // Expired
          await clearQuickMode();
        }
      }
    } catch (e) {
      console.log('Error loading quick mode state:', e);
    }
  };

  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active' && isQuickModeEnabled && quickModeEndTime) {
      // Check if expired while app was in background
      const now = Date.now();
      if (now >= quickModeEndTime) {
        disableQuickMode();
      }
    }
  };

  const startTimer = () => {
    stopTimer();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = quickModeEndTime - now;

      if (remaining <= 0) {
        disableQuickMode();
      } else {
        setTimeRemaining(remaining);

        // Check if 30 minutes remaining and show warning
        if (remaining <= WARNING_TIME && remaining > WARNING_TIME - 60000 && !warningShownRef.current) {
          warningShownRef.current = true;
          showWarningNotification(remaining);
        }
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const showWarningNotification = async (remaining) => {
    const minutesLeft = Math.ceil(remaining / 60000);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚡ Modo Rápido por terminar',
        body: `Tu Modo Rápido terminará en ${minutesLeft} minutos. Abre la app para extenderlo.`,
        sound: true,
      },
      trigger: null,
    });
  };

  const enableQuickMode = async () => {
    const endTime = Date.now() + QUICK_MODE_DURATION;

    try {
      await SecureStore.setItemAsync('quickModeEndTime', endTime.toString());
      setIsQuickModeEnabled(true);
      setQuickModeEndTime(endTime);
      warningShownRef.current = false;
    } catch (e) {
      console.log('Error enabling quick mode:', e);
    }
  };

  const disableQuickMode = async () => {
    await clearQuickMode();
  };

  const clearQuickMode = async () => {
    try {
      await SecureStore.deleteItemAsync('quickModeEndTime');
    } catch (e) {
      console.log('Error clearing quick mode:', e);
    }
    setIsQuickModeEnabled(false);
    setQuickModeEndTime(null);
    setTimeRemaining(null);
    warningShownRef.current = false;
    stopTimer();
  };

  const extendQuickMode = async () => {
    const endTime = Date.now() + QUICK_MODE_DURATION;
    try {
      await SecureStore.setItemAsync('quickModeEndTime', endTime.toString());
      setQuickModeEndTime(endTime);
      warningShownRef.current = false;
    } catch (e) {
      console.log('Error extending quick mode:', e);
    }
  };

  const formatTimeRemaining = () => {
    if (!timeRemaining) return null;

    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} minutos`;
  };

  return (
    <QuickModeContext.Provider
      value={{
        isQuickModeEnabled,
        quickModeEndTime,
        timeRemaining,
        enableQuickMode,
        disableQuickMode,
        extendQuickMode,
        formatTimeRemaining,
      }}
    >
      {children}
    </QuickModeContext.Provider>
  );
};

export const useQuickMode = () => {
  const context = useContext(QuickModeContext);
  if (!context) {
    throw new Error('useQuickMode must be used within a QuickModeProvider');
  }
  return context;
};
