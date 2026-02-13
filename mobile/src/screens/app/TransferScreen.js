import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Animated, Easing, TouchableOpacity, Image } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { transactionService } from '../../services/transactionService';
import { spacing, fontSizes } from '../../theme/colors';

const TransferScreen = ({ navigation }) => {
  const { user, refreshUserProfile } = useAuth();
  const { isDarkMode, getColors } = useTheme();
  const colors = getColors();

  const [receiverUsername, setReceiverUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [userValid, setUserValid] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('biometría');

  // Animations
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    checkBiometrics();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(formTranslateY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const checkBiometrics = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(2)) setBiometricType('Face ID');
      else if (types.includes(1)) setBiometricType('Touch ID');
      else setBiometricType('huella o rostro');
    } catch (e) {
      console.log('Biometrics check error:', e);
    }
  };

  const validateUser = async (username) => {
    if (username.length < 3) {
      setUserValid(null);
      return;
    }

    if (username === user?.username) {
      setUserValid(false);
      return;
    }

    try {
      const response = await transactionService.checkUser(username);
      setUserValid(response.success && response.data?.valid);
    } catch (e) {
      setUserValid(false);
    }
  };

  const handleSend = async () => {
    if (!receiverUsername || !amount) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!userValid) {
      setError('El usuario destinatario no es válido');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Ingresa un monto válido');
      return;
    }

    // Animate button press
    Animated.sequence([
      Animated.spring(buttonScale, { toValue: 0.95, useNativeDriver: true }),
      Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }),
    ]).start();

    // Biometric authentication
    if (biometricAvailable) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: `Autentícate para enviar`,
          cancelLabel: 'Cancelar',
          fallbackLabel: 'Usar código',
        });

        if (!result.success) {
          setError('Autenticación fallida');
          return;
        }
      } catch (e) {
        setError('Error de autenticación');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const response = await transactionService.transfer(
        receiverUsername,
        numAmount,
        description
      );

      if (response.success) {
        await refreshUserProfile();
        navigation.replace('Success', {
          receiverUsername,
          amount: numAmount,
        });
      } else {
        setError(response.error || 'Error al procesar la transacción');
      }
    } catch (e) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Background */}
      <View style={[styles.backgroundGradient, { backgroundColor: colors.background }]}>
        {!isDarkMode && (
          <>
            <View style={[styles.decorCircle1, { backgroundColor: colors.primary + '10' }]} />
            <View style={[styles.decorCircle2, { backgroundColor: colors.primaryDark + '08' }]} />
          </>
        )}
      </View>

      <LinearGradient
        colors={isDarkMode
          ? [colors.gradientStart, colors.gradientMid, colors.gradientEnd]
          : ['transparent', 'transparent', 'transparent']
        }
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={[styles.backButton, isDarkMode && styles.backButtonDark]}
              >
                <Text style={[styles.backText, isDarkMode && styles.backTextDark]}>← Atrás</Text>
              </TouchableOpacity>

              <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
                <Image
                  source={require('../../../assets/logoflashy.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>

            <Text style={[styles.title, { color: colors.textPrimary }]}>Enviar Dinero</Text>

            <Animated.View
              style={[
                styles.formCard,
                {
                  opacity: formOpacity,
                  transform: [{ translateY: formTranslateY }],
                  backgroundColor: isDarkMode ? colors.card : colors.glassBackground,
                  borderColor: isDarkMode ? colors.border : colors.glassBorder,
                },
              ]}
            >
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Usuario destinatario:</Text>
                <TextInput
                  value={receiverUsername}
                  onChangeText={(text) => {
                    setReceiverUsername(text);
                    validateUser(text);
                  }}
                  mode="outlined"
                  placeholder="@username"
                  autoCapitalize="none"
                  style={styles.input}
                  disabled={loading}
                  outlineColor={isDarkMode ? colors.primary + '30' : colors.glassBorder}
                  activeOutlineColor={colors.primary}
                  textColor={colors.textPrimary}
                  placeholderTextColor={colors.textMuted}
                  theme={{
                    colors: {
                      primary: colors.primary,
                      onSurfaceVariant: colors.textSecondary,
                      surface: 'transparent',
                    }
                  }}
                />
                {userValid === true && (
                  <Text style={[styles.validText, { color: colors.success }]}>✓ Usuario válido</Text>
                )}
                {userValid === false && (
                  <Text style={[styles.invalidText, { color: colors.error }]}>✗ Usuario no encontrado</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Monto:</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  mode="outlined"
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  style={styles.input}
                  disabled={loading}
                  outlineColor={isDarkMode ? colors.primary + '30' : colors.glassBorder}
                  activeOutlineColor={colors.primary}
                  textColor={colors.textPrimary}
                  placeholderTextColor={colors.textMuted}
                  left={<TextInput.Affix text="$" />}
                  theme={{
                    colors: {
                      primary: colors.primary,
                      onSurfaceVariant: colors.textSecondary,
                      surface: 'transparent',
                    }
                  }}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nota (opcional):</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  mode="outlined"
                  placeholder="Ej: Pago de servicios"
                  style={styles.input}
                  disabled={loading}
                  outlineColor={isDarkMode ? colors.primary + '30' : colors.glassBorder}
                  activeOutlineColor={colors.primary}
                  textColor={colors.textPrimary}
                  placeholderTextColor={colors.textMuted}
                  theme={{
                    colors: {
                      primary: colors.primary,
                      onSurfaceVariant: colors.textSecondary,
                      surface: 'transparent',
                    }
                  }}
                />
              </View>
            </Animated.View>

            {/* Biometric info */}
            {biometricAvailable && (
              <View style={[styles.biometricInfo, {
                backgroundColor: isDarkMode ? colors.primary + '20' : colors.glassBackground,
                borderColor: colors.primary + '30'
              }]}>
                <Text style={styles.biometricIcon}>🔐</Text>
                <Text style={[styles.biometricText, { color: colors.textSecondary }]}>
                  Se requerirá {biometricType} para autorizar
                </Text>
              </View>
            )}

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <Button
                mode="contained"
                onPress={handleSend}
                loading={loading}
                disabled={loading || !userValid}
                style={[styles.sendButton, { backgroundColor: colors.primary }]}
                contentStyle={styles.buttonContent}
                labelStyle={[styles.buttonLabel, { color: isDarkMode ? '#fff' : '#000' }]}
                icon={biometricAvailable ? "fingerprint" : "send"}
              >
                {loading ? 'Procesando...' : biometricAvailable ? `Enviar con ${biometricType}` : 'Enviar'}
              </Button>
            </Animated.View>
          </ScrollView>

          <Snackbar
            visible={!!error}
            onDismiss={() => setError('')}
            duration={3000}
            style={{ backgroundColor: colors.error }}
          >
            {error}
          </Snackbar>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  decorCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -100,
    right: -50,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: 100,
    left: -50,
  },
  gradient: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 30,
  },
  backButtonDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  backText: {
    color: '#000',
    fontWeight: '600',
  },
  backTextDark: {
    color: '#fff',
  },
  logoContainer: {
    padding: spacing.sm,
    borderRadius: 16,
  },
  logo: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  formCard: {
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'transparent',
  },
  validText: {
    marginTop: spacing.xs,
    fontSize: 12,
  },
  invalidText: {
    marginTop: spacing.xs,
    fontSize: 12,
  },
  biometricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 30,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
  },
  biometricIcon: {
    fontSize: 18,
  },
  biometricText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sendButton: {
    borderRadius: 30,
    marginBottom: spacing.md,
  },
  buttonContent: {
    paddingVertical: spacing.md,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default TransferScreen;
