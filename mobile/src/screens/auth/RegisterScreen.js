import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Image, ScrollView, Animated, Easing, StatusBar } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, fontSizes } from '../../theme/colors';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { isDarkMode, getColors } = useTheme();
  const colors = getColors();

  // Animations
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

  const handleRegister = async () => {
    if (!username || !password || !confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    const response = await register(username, password);

    if (!response.success) {
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
              Crea tu cuenta
            </Animated.Text>
          </View>

          {/* Form Section with Animation */}
          <Animated.View
            style={{
              opacity: formOpacity,
              transform: [{ translateY: formTranslateY }],
            }}
          >
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

              <TextInput
                label="Confirmar Contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
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
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                style={[styles.registerButton, { backgroundColor: colors.primary }]}
                contentStyle={styles.buttonContent}
                labelStyle={[styles.registerButtonLabel, { color: colors.textDark }]}
              >
                Registrarse
              </Button>

              <Button
                mode="text"
                onPress={() => navigation.goBack()}
                disabled={loading}
                labelStyle={[styles.backButtonLabel, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}
              >
                ¿Ya tienes cuenta? Inicia sesión
              </Button>
            </View>
          </Animated.View>
        </ScrollView>

        <Snackbar
          visible={!!error}
          onDismiss={() => setError('')}
          duration={3000}
          style={[styles.snackbar, { backgroundColor: '#ff4444' }]}
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
    marginBottom: spacing.xl,
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
  registerButton: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.pill,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  registerButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonLabel: {
    fontSize: 14,
  },
  snackbar: {
    borderRadius: 8,
  },
});

export default RegisterScreen;
