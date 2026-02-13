import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Animated, Easing, StatusBar } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useQuickMode } from '../../context/QuickModeContext';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, fontSizes } from '../../theme/colors';

const QuickModeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const {
    formatTimeRemaining,
    timeRemaining,
    extendQuickMode,
    disableQuickMode
  } = useQuickMode();
  const { isDarkMode, getColors } = useTheme();
  const colors = getColors();

  // Animations
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const greetingOpacity = useRef(new Animated.Value(0)).current;
  const button1Scale = useRef(new Animated.Value(0.9)).current;
  const button1Opacity = useRef(new Animated.Value(0)).current;
  const button2Opacity = useRef(new Animated.Value(0)).current;
  const timerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Logo
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Greeting
    Animated.timing(greetingOpacity, {
      toValue: 1,
      duration: 500,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Button 1
    Animated.parallel([
      Animated.spring(button1Scale, {
        toValue: 1,
        delay: 500,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(button1Opacity, {
        toValue: 1,
        duration: 400,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Button 2
    Animated.timing(button2Opacity, {
      toValue: 1,
      duration: 400,
      delay: 700,
      useNativeDriver: true,
    }).start();

    // Timer
    Animated.timing(timerOpacity, {
      toValue: 1,
      duration: 400,
      delay: 900,
      useNativeDriver: true,
    }).start();
  };

  const handleTransfer = () => {
    navigation.navigate('Transfer');
  };

  const handleDashboard = () => {
    navigation.navigate('Home');
  };

  const handleExtend = async () => {
    await extendQuickMode();
  };

  const handleExit = async () => {
    await disableQuickMode();
    navigation.navigate('Home');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
      style={styles.gradient}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={styles.container}>
        {/* Decorative circles */}
        <View style={[styles.backgroundCircle1, { backgroundColor: colors.primary + '08' }]} />
        <View style={[styles.backgroundCircle2, { backgroundColor: colors.primary + '12' }]} />

        {/* Logo */}
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
        >
          <View style={[styles.logoContainer, { backgroundColor: isDarkMode ? '#1a1a1a' : '#fff' }]}>
            <Image
              source={require('../../../assets/logoflashy.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Greeting */}
        <Animated.View style={{ opacity: greetingOpacity }}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()}</Text>
          <Text style={[styles.username, { color: colors.textPrimary }]}>{user?.username}</Text>
        </Animated.View>

        {/* Quick Mode Badge */}
        <Animated.View style={[styles.quickBadge, { opacity: timerOpacity, backgroundColor: colors.primary + '20', borderColor: colors.primary + '40' }]}>
          <Text style={styles.badgeIcon}>⚡</Text>
          <Text style={[styles.badgeText, { color: colors.primary }]}>Modo Rápido</Text>
          {timeRemaining && (
            <Text style={[styles.timerText, { color: colors.textSecondary }]}>{formatTimeRemaining()}</Text>
          )}
        </Animated.View>

        {/* Main Action - Transfer */}
        <Animated.View
          style={{
            opacity: button1Opacity,
            transform: [{ scale: button1Scale }],
            width: '100%',
          }}
        >
          <TouchableOpacity
            style={styles.mainButton}
            onPress={handleTransfer}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.mainButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.mainButtonIcon}>↑</Text>
              <Text style={[styles.mainButtonLabel, { color: isDarkMode ? '#fff' : '#000' }]}>Enviar Dinero</Text>
              <Text style={[styles.mainButtonSubtext, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>Transferir rápidamente</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Secondary Action - Dashboard */}
        <Animated.View style={{ opacity: button2Opacity, width: '100%' }}>
          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.primary + '40' }]}
            onPress={handleDashboard}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonIcon}>🏠</Text>
            <Text style={[styles.secondaryButtonLabel, { color: colors.textPrimary }]}>Ver Dashboard</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Timer Actions */}
        <Animated.View style={[styles.timerActions, { opacity: timerOpacity }]}>
          <TouchableOpacity
            onPress={handleExtend}
            style={[styles.extendButton, { backgroundColor: colors.primary + '20' }]}
          >
            <Text style={[styles.extendText, { color: colors.primary }]}>+2 horas</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleExit} style={styles.exitModeButton}>
            <Text style={[styles.exitModeText, { color: colors.textSecondary }]}>Salir del Modo Rápido</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundCircle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    top: -100,
    right: -100,
  },
  backgroundCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    bottom: -50,
    left: -50,
  },
  logoContainer: {
    padding: spacing.lg,
    borderRadius: 32,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 80,
    height: 80,
  },
  greeting: {
    fontSize: 18,
    textAlign: 'center',
  },
  username: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  quickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 30,
    borderWidth: 1,
    gap: spacing.sm,
  },
  badgeIcon: {
    fontSize: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timerText: {
    fontSize: 12,
    marginLeft: spacing.sm,
  },
  mainButton: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  mainButtonGradient: {
    borderRadius: 32,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  mainButtonIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  mainButtonLabel: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  mainButtonSubtext: {
    fontSize: 14,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 24,
    borderWidth: 1,
    gap: spacing.md,
  },
  secondaryButtonIcon: {
    fontSize: 24,
  },
  secondaryButtonLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  timerActions: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  extendButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 30,
  },
  extendText: {
    fontWeight: '600',
  },
  exitModeButton: {
    paddingVertical: spacing.sm,
  },
  exitModeText: {
    fontSize: 14,
  },
});

export default QuickModeScreen;
