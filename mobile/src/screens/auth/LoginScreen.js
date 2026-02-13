import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Image, ScrollView, TouchableOpacity, Animated, Easing, StatusBar } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { colors, spacing, borderRadius, fontSizes } from '../../theme/colors';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);

  const { login } = useAuth();
  const { isDarkMode, getColors } = useTheme();
  const colors = getColors();

  // Animations
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkBiometricAndCredentials();
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Logo animation
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // Title animation
    Animated.timing(titleOpacity, {
      toValue: 1,
      duration: 600,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Form animation
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 600,
        delay: 500,
        useNativeDriver: true,
      }),
      Animated.timing(formTranslateY, {
        toValue: 0,
        duration: 600,
        delay: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const checkBiometricAndCredentials = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (hasHardware && isEnrolled) {
        setBiometricAvailable(true);
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Touch ID');
        } else {
          setBiometricType('Biometría');
        }
      }
    } catch (e) {
      console.log('Biometric check error:', e);
    }

    try {
      const savedUsername = await SecureStore.getItemAsync('savedUsername');
      if (savedUsername) {
        setUsername(savedUsername);
        setHasSavedCredentials(true);
      }
    } catch (e) {
      console.log('Credentials check error:', e);
    }
  };

  const handleBiometricLogin = async () => {
    if (!biometricAvailable || !hasSavedCredentials) return;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Usa ${biometricType} para iniciar sesión`,
        subtitle: 'Autentica para acceder a FlashyBank',
        fallbackLabel: 'Usar contraseña',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      if (result.success) {
        const savedPassword = await SecureStore.getItemAsync('savedPassword');
        if (savedPassword) {
          setPassword(savedPassword);
          setLoading(true);
          setError('');
          const response = await login(username, savedPassword);
          if (!response.success) {
            setError(response.error);
          }
          setLoading(false);
        }
      }
    } catch (e) {
      setError('Error de autenticación biométrica');
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    const response = await login(username, password);

    if (response.success) {
      try {
        await SecureStore.setItemAsync('savedUsername', username);
        await SecureStore.setItemAsync('savedPassword', password);
      } catch (e) {
        console.log('Error saving credentials:', e);
      }
    } else {
      setError(response.error);
    }

    setLoading(false);
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
      style={styles.gradient}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Animated.View
              style={{
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              }}
            >
              <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
                <Image
                  source={require('../../../assets/logoflashy.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </Animated.View>

            <Animated.Text style={[styles.appName, { color: colors.textWhite, opacity: titleOpacity }]}>
              Flashy
            </Animated.Text>

            <Animated.Text style={[styles.subtitle, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', opacity: titleOpacity }]}>
              Inicia sesión en tu cuenta
            </Animated.Text>
          </View>

          {/* Form Section with Animation */}
          <Animated.View
            style={{
              opacity: formOpacity,
              transform: [{ translateY: formTranslateY }],
            }}
          >
            {/* Biometric Login Button */}
            {biometricAvailable && hasSavedCredentials && (
              <TouchableOpacity onPress={handleBiometricLogin} style={[styles.biometricButton, { backgroundColor: colors.primary }]}>
                <Text style={styles.biometricIcon}>
                  {biometricType === 'Face ID' ? '😊' : '👆'}
                </Text>
                <Text style={[styles.biometricButtonText, { color: colors.textDark }]}>
                  Usar {biometricType}
                </Text>
              </TouchableOpacity>
            )}

            <View style={[styles.formCard, isDarkMode ? styles.formCardDark : styles.formCardLight]}>
              <TextInput
                label="Usuario"
                value={username}
                onChangeText={setUsername}
                mode="outlined"
                style={styles.input}
                autoCapitalize="none"
                disabled={loading}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
                textColor={colors.textPrimary}
                placeholderTextColor={colors.textMuted}
              />

              <TextInput
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                    color={colors.textPrimary}
                  />
                }
                mode="outlined"
                style={styles.input}
                disabled={loading}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
                textColor={colors.textPrimary}
                placeholderTextColor={colors.textMuted}
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={[styles.loginButton, { backgroundColor: colors.primary }]}
                contentStyle={styles.buttonContent}
                labelStyle={[styles.loginButtonLabel, { color: colors.textDark }]}
              >
                Iniciar Sesión
              </Button>

              <Button
                mode="text"
                onPress={() => navigation.navigate('Register')}
                disabled={loading}
                labelStyle={[styles.registerButtonLabel, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}
              >
                ¿No tienes cuenta? Regístrate
              </Button>
            </View>
          </Animated.View>
        </ScrollView>

        <Snackbar
          visible={!!error}
          onDismiss={() => setError('')}
          duration={3000}
          style={styles.snackbar}
        >
          {error}
        </Snackbar>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    shadowColor: '#BAF742',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.pill,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  biometricIcon: {
    fontSize: 24,
  },
  biometricButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  formCard: {
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
  },
  formCardLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(186, 247, 66, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formCardDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(186, 247, 66, 0.2)',
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: 'transparent',
  },
  loginButton: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.pill,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  loginButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  registerButtonLabel: {
    fontSize: 14,
  },
  snackbar: {
    backgroundColor: '#ef4444',
  },
});

export default LoginScreen;
