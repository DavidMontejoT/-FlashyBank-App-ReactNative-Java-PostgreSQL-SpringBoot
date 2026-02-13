import React, { useMemo, useEffect } from 'react';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

/**
 * ThemeWrapper - Componente que sincroniza el ThemeContext con PaperProvider
 *
 * PROBLEMA QUE SOLUCIONA:
 * El PaperProvider en App.js siempre usaba MD3LightTheme (fijo)
 * pero las pantallas usan isDarkMode del ThemeContext.
 * Esto causaba conflicto de colores y una "línea blanca tachando" los labels
 * en modo dark porque los TextInput usaban colores light del PaperProvider
 * mientras el fondo estaba oscuro.
 *
 * SOLUCIÓN:
 * Este wrapper lee isDarkMode del ThemeContext y construye un tema dinámico
 * que se pasa al PaperProvider.
 */
const ThemeWrapper = ({ children }) => {
  const { isDarkMode, getColors } = useTheme();
  const colors = getColors();

  // Construir tema dinámico basado en isDarkMode
  const theme = useMemo(() => {
    const baseTheme = isDarkMode ? MD3DarkTheme : MD3LightTheme;

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        // Sobrescribir colores clave con los del ThemeContext
        primary: colors.primary,
        primaryContainer: isDarkMode ? colors.primaryDark : colors.primaryLight,
        secondary: isDarkMode ? colors.primaryLight : colors.primaryDark,
        secondaryContainer: isDarkMode ? colors.primaryDark : colors.primaryLight,

        // Background colors
        background: colors.background,
        surface: colors.card,
        onSurface: colors.textPrimary,
        onSurfaceVariant: colors.textSecondary,

        // Text colors
        onPrimary: isDarkMode ? colors.textDark : colors.textPrimary,
        onPrimaryContainer: isDarkMode ? colors.textPrimary : colors.primary,
        onSecondary: isDarkMode ? colors.textPrimary : colors.textPrimary,
        onSecondaryContainer: isDarkMode ? colors.card : colors.background,

        // Input/text colors - CRÍTICO para el problema de la línea blanca
        // En dark mode, el onSurfaceVariant debe ser claro (blanco)
        // y el background debe ser oscuro/transparente
        onError: colors.textWhite,

        // Border colors
        outline: colors.border,
        outlineVariant: isDarkMode ? colors.borderLight : colors.border,
      },
      roundness: 16,
    };
  }, [isDarkMode, colors]);

  return (
    <PaperProvider theme={theme}>
      {children}
    </PaperProvider>
  );
};

export default ThemeWrapper;
