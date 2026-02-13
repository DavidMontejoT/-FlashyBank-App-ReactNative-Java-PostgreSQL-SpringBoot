import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Animated, Easing } from 'react-native';
import { Text, Button, Snackbar } from 'react-native-paper';
import * as LocalAuthentication from 'expo-local-authentication';
import { transactionService } from '../../services/transactionService';
import { useAuth } from '../../context/AuthContext';
import { colors, borderRadius, spacing } from '../../theme/colors';

const ConfirmScreen = ({ navigation, route }) => {
  const { receiverUsername, amount, description } = route.params;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [authenticating, setAuthenticating] = useState(false);
  const { user } = useAuth();

  // Animation for fingerprint
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    checkBiometricAvailability();

    // Pulse animation for fingerprint icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (hasHardware && isEnrolled) {
        setBiometricAvailable(true);
        // Determine biometric type
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
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    if (biometricAvailable) {
      setAuthenticating(true);
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Autentica para confirmar la transferencia',
          subtitle: `Enviando $${parseFloat(amount).toFixed(2)} a @${receiverUsername}`,
          fallbackLabel: 'Usar PIN',
          cancelLabel: 'Cancelar',
          disableDeviceFallback: false,
        });

        setAuthenticating(false);

        if (result.success) {
          await executeConfirmation();
        } else {
          setError('Autenticación cancelada o fallida');
          setLoading(false);
        }
      } catch (e) {
        setAuthenticating(false);
        setError('Error de autenticación biométrica');
        setLoading(false);
      }
    } else {
      // No biometric available, proceed directly
      await executeConfirmation();
    }
  };

  const executeConfirmation = async () => {
    try {
      // Initiate transfer
      const initiateResponse = await transactionService.initiateTransfer(
        receiverUsername,
        amount,
        description || ''
      );

      if (!initiateResponse.success) {
        setError(initiateResponse.error);
        setLoading(false);
        return;
      }

      // Confirm transfer
      const confirmResponse = await transactionService.confirmTransfer(
        initiateResponse.data.id
      );

      setLoading(false);

      if (confirmResponse.success) {
        // Navigate to success screen
        navigation.replace('Success', {
          receiverUsername,
          amount,
        });
      } else {
        setError(confirmResponse.error);
      }
    } catch (e) {
      setError('Error al procesar la transferencia');
      setLoading(false);
    }
  };

  const getBiometricIcon = () => {
    if (biometricType === 'Face ID') {
      return 'Face ID';
    } else if (biometricType === 'Touch ID') {
      return '👆';
    }
    return '🔐';
  };

  return (
    <View style={styles.container}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/logoflashy.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Confirma datos</Text>

      {/* Data Fields */}
      <View style={styles.dataSection}>
        <View style={styles.dataField}>
          <Text style={styles.dataLabel}>Vas a enviar a:</Text>
          <View style={styles.dataInput}>
            <Text style={styles.dataValue}>@{receiverUsername}</Text>
          </View>
        </View>

        <View style={styles.dataField}>
          <Text style={styles.dataLabel}>Desde tu cuenta:</Text>
          <View style={styles.dataInput}>
            <Text style={styles.dataValue}>@{user?.username}</Text>
          </View>
        </View>

        <View style={styles.dataField}>
          <Text style={styles.dataLabel}>Monto a enviar:</Text>
          <View style={styles.dataInput}>
            <Text style={styles.amountValue}>${parseFloat(amount).toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Biometric Section */}
      {biometricAvailable ? (
        <View style={styles.biometricSection}>
          <Animated.View style={[styles.fingerprintContainer, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.fingerprintIcon}>{getBiometricIcon()}</Text>
          </Animated.View>
          <Text style={styles.biometricTitle}>
            {authenticating ? 'Autenticando...' : `Usa ${biometricType} para confirmar`}
          </Text>
          <Text style={styles.biometricSubtitle}>
            Toca el botón abaixo y autentica con tu {biometricType === 'Face ID' ? 'rostro' : 'huella'}
          </Text>
        </View>
      ) : (
        <View style={styles.noBiometricSection}>
          <Text style={styles.noBiometricIcon}>🔒</Text>
          <Text style={styles.noBiometricTitle}>Confirmar transferencia</Text>
          <Text style={styles.noBiometricSubtitle}>
            Tu dispositivo no tiene biometría configurada. La transferencia se confirmará directamente.
          </Text>
        </View>
      )}

      {/* Confirm Button */}
      <Button
        mode="contained"
        onPress={handleConfirm}
        loading={loading}
        disabled={loading}
        style={styles.confirmButton}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
        icon={biometricAvailable ? "fingerprint" : "send"}
      >
        {loading ? 'Procesando...' : biometricAvailable ? `Confirmar con ${biometricType}` : 'Confirmar Transferencia'}
      </Button>

      <Button
        mode="outlined"
        onPress={() => navigation.goBack()}
        disabled={loading}
        style={styles.cancelButton}
        labelStyle={styles.cancelLabel}
      >
        Cancelar
      </Button>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  logoContainer: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: 'normal',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  dataSection: {
    marginBottom: spacing.xl,
  },
  dataField: {
    marginBottom: spacing.md,
  },
  dataLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  dataInput: {
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dataValue: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  biometricSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
  },
  fingerprintContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  fingerprintIcon: {
    fontSize: 50,
  },
  biometricTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  biometricSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  noBiometricSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
  },
  noBiometricIcon: {
    fontSize: 50,
    marginBottom: spacing.md,
  },
  noBiometricTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  noBiometricSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
  },
  buttonContent: {
    paddingVertical: spacing.md,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cancelButton: {
    borderColor: colors.primary,
    borderRadius: borderRadius.xl,
  },
  cancelLabel: {
    color: colors.textPrimary,
  },
  snackbar: {
    backgroundColor: colors.error,
  },
});

export default ConfirmScreen;
