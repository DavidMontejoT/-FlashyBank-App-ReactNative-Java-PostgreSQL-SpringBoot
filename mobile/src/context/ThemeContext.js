import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);

// Definición de temas (paletas de colores)
export const themes = {
  green: {
    name: 'Verde Flashy',
    id: 'green',
    primary: '#BAF742',
    primaryLight: '#D9FF9B',
    primaryDark: '#8FC73E',
    accent: '#6B21A8',
  },
  ocean: {
    name: 'Océano',
    id: 'ocean',
    primary: '#00D4FF',
    primaryLight: '#7FEFFF',
    primaryDark: '#0099CC',
    accent: '#FF6B35',
  },
  sunset: {
    name: 'Atardecer',
    id: 'sunset',
    primary: '#FF6B6B',
    primaryLight: '#FFB3B3',
    primaryDark: '#CC5555',
    accent: '#4ECDC4',
  },
  purple: {
    name: 'Violeta',
    id: 'purple',
    primary: '#A855F7',
    primaryLight: '#C084FC',
    primaryDark: '#7C3AED',
    accent: '#F59E0B',
  },
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('green');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [autoMode, setAutoMode] = useState(false); // Por defecto DESACTIVADO

  useEffect(() => {
    loadTheme();
    // Check time every minute only if auto mode is enabled
    const interval = setInterval(() => {
      if (autoMode) {
        checkTimeOfDay();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoMode) {
      checkTimeOfDay();
    }
  }, [autoMode]);

  const checkTimeOfDay = () => {
    if (!autoMode) return;

    const hour = new Date().getHours();
    // Dark mode: 7pm - 6am (19:00 - 06:00)
    // Light mode: 6am - 7pm (06:00 - 19:00)
    const shouldBeDark = hour >= 19 || hour < 6;

    setIsDarkMode(shouldBeDark);
  };

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      const savedAutoMode = await AsyncStorage.getItem('autoMode');
      const savedDarkMode = await AsyncStorage.getItem('darkMode');

      if (savedTheme && themes[savedTheme]) {
        setCurrentTheme(savedTheme);
      }

      if (savedAutoMode !== null) {
        const isAuto = savedAutoMode === 'true';
        setAutoMode(isAuto);

        if (isAuto) {
          checkTimeOfDay();
        } else if (savedDarkMode !== null) {
          // Si no es auto, usar la preferencia guardada
          setIsDarkMode(savedDarkMode === 'true');
        }
      } else {
        // Primera vez: NO detectar hora, mantener light mode por defecto
        setIsDarkMode(false);
        setAutoMode(false);
      }
    } catch (e) {
      console.log('Error loading theme:', e);
    }
  };

  const setTheme = async (themeId) => {
    try {
      await AsyncStorage.setItem('theme', themeId);
      setCurrentTheme(themeId);
    } catch (e) {
      console.log('Error saving theme:', e);
    }
  };

  const toggleDarkMode = async () => {
    try {
      // When user manually toggles, disable auto mode
      const newAutoMode = false;
      const newMode = !isDarkMode;

      await AsyncStorage.setItem('autoMode', newAutoMode.toString());
      await AsyncStorage.setItem('darkMode', newMode.toString());

      setAutoMode(newAutoMode);
      setIsDarkMode(newMode);
    } catch (e) {
      console.log('Error saving dark mode:', e);
    }
  };

  const toggleAutoMode = async () => {
    try {
      const newAutoMode = !autoMode;
      await AsyncStorage.setItem('autoMode', newAutoMode.toString());
      setAutoMode(newAutoMode);

      if (newAutoMode) {
        checkTimeOfDay();
      }
    } catch (e) {
      console.log('Error saving auto mode:', e);
    }
  };

  // Get all colors for the current theme and mode
  const getColors = () => {
    const theme = themes[currentTheme];

    if (isDarkMode) {
      // DARK MODE - Fondo oscuro
      return {
        // Theme colors
        primary: theme.primary,
        primaryLight: theme.primaryLight,
        primaryDark: theme.primaryDark,
        accent: theme.accent,

        // Background colors - DARK
        background: '#0a0a0a',
        backgroundLight: '#141414',
        backgroundCard: '#1a1a1a',
        gradientStart: '#0a0a0a',
        gradientMid: '#141414',
        gradientEnd: '#0a0a0a',

        // Glass effect - DARK
        glassBackground: 'rgba(255, 255, 255, 0.05)',
        glassBorder: 'rgba(255, 255, 255, 0.1)',
        glassShadow: 'rgba(0, 0, 0, 0.3)',

        // Text colors
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255,255,255,0.9)',
        textMuted: 'rgba(255,255,255,0.65)',
        textWhite: '#ffffff',

        // Border colors
        border: 'rgba(255,255,255,0.1)',
        borderLight: 'rgba(255,255,255,0.05)',

        // Card/overlay colors
        card: 'rgba(255,255,255,0.05)',
        cardTransparent: 'rgba(255,255,255,0.08)',
        overlay: 'rgba(0,0,0,0.5)',

        // Status colors (fixed)
        success: '#22c55e',
        successLight: '#4ade80',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',

        // Sent/Received
        sent: '#ef4444',
        received: '#22c55e',

        // Shadows
        shadow: 'rgba(0,0,0,0.3)',
        shadowPrimary: theme.primary + '40',
        neonGlow: theme.primary,
      };
    } else {
      // LIGHT MODE - Fondo con gradiente del tema
      return {
        // Theme colors
        primary: theme.primary,
        primaryLight: theme.primaryLight,
        primaryDark: theme.primaryDark,
        accent: theme.accent,

        // Background colors - LIGHT con tonos del tema
        background: '#f8f9fa',
        backgroundLight: '#ffffff',
        backgroundCard: '#ffffff',
        // Gradiente sutil con tonos del tema
        gradientStart: theme.primary + '08',
        gradientMid: theme.primary + '04',
        gradientEnd: '#f8f9fa',

        // Glass effect - LIGHT (más pronunciado para legibilidad)
        glassBackground: 'rgba(255, 255, 255, 0.85)',
        glassBorder: theme.primary + '20',
        glassShadow: theme.primary + '15',

        // Text colors - alto contraste
        textPrimary: '#1a1a1a',
        textSecondary: '#2d2d2d',
        textMuted: '#5a5a5a',
        textWhite: '#ffffff',

        // Border colors
        border: theme.primary + '20',
        borderLight: theme.primary + '10',

        // Card/overlay colors - con tinte del tema
        card: 'rgba(255, 255, 255, 0.9)',
        cardTransparent: theme.primary + '08',
        overlay: 'rgba(0,0,0,0.2)',

        // Status colors (fixed)
        success: '#16a34a',
        successLight: '#22c55e',
        error: '#dc2626',
        warning: '#d97706',
        info: '#2563eb',

        // Sent/Received
        sent: '#dc2626',
        received: '#16a34a',

        // Shadows
        shadow: 'rgba(0,0,0,0.08)',
        shadowPrimary: theme.primary + '25',
        neonGlow: theme.primary,
      };
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        isDarkMode,
        toggleDarkMode,
        autoMode,
        toggleAutoMode,
        getColors,
        themes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
