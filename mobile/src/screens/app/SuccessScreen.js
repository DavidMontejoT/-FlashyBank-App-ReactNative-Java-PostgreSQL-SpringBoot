import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Animated, Easing, StatusBar, Share } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSizes } from '../../theme/colors';

const SuccessScreen = ({ navigation, route }) => {
  const { receiverUsername, amount } = route.params;
  const { isDarkMode, getColors } = useTheme();
  const colors = getColors();

  // Animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

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
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Checkmark pop
    Animated.sequence([
      Animated.delay(300),
      Animated.spring(checkmarkScale, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Title animation
    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(titleTranslateY, {
        toValue: 0,
        duration: 600,
        delay: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // Card animation
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 500,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        delay: 600,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Buttons animation
    Animated.timing(buttonsOpacity, {
      toValue: 1,
      duration: 500,
      delay: 800,
      useNativeDriver: true,
    }).start();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡Transacción exitosa! Envié $${parseFloat(amount).toFixed(2)} a @${receiverUsername} con FlashyBank 💸`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleExit = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Background */}
      <View style={[styles.backgroundGradient, { backgroundColor: colors.background }]}>
        {!isDarkMode && (
          <>
            <View style={[styles.decorCircle1, { backgroundColor: colors.primary + '12' }]} />
            <View style={[styles.decorCircle2, { backgroundColor: colors.primaryDark + '08' }]} />
            <View style={[styles.decorCircle3, { backgroundColor: colors.primaryLight + '06' }]} />
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
        <View style={styles.content}>
          {/* Decorative circles for dark mode */}
          {isDarkMode && (
            <>
              <View style={styles.backgroundCircle1} />
              <View style={styles.backgroundCircle2} />
            </>
          )}

          {/* Logo */}
          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            }}
          >
            <View style={[styles.logoContainer, {
              backgroundColor: isDarkMode ? colors.primary + '30' : colors.glassBackground,
              shadowColor: isDarkMode ? colors.primary : '#000',
              shadowOpacity: isDarkMode ? 0.6 : 0.1,
            }]}>
              <Image
                source={require('../../../assets/logoflashy.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          {/* Checkmark */}
          <Animated.View style={[styles.checkmarkContainer, { transform: [{ scale: checkmarkScale }] }]}>
            <Text style={styles.checkmark}>✓</Text>
          </Animated.View>

          {/* Title */}
          <Animated.Text
            style={[
              styles.title,
              {
                opacity: titleOpacity,
                transform: [{ translateY: titleTranslateY }],
                color: colors.textPrimary,
              },
            ]}
          >
            Transacción Exitosa
          </Animated.Text>

          {/* Data Card */}
          <Animated.View
            style={{
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            }}
          >
            <View style={[styles.dataCard, {
              backgroundColor: isDarkMode ? colors.card : colors.glassBackground,
              borderColor: isDarkMode ? colors.border : colors.glassBorder,
            }]}>
              <View style={styles.dataField}>
                <Text style={[styles.dataLabel, { color: colors.textSecondary }]}>Llave</Text>
                <View style={[styles.dataInput, {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : colors.primary + '08',
                  borderColor: colors.primary,
                }]}>
                  <Text style={[styles.dataValue, { color: colors.textPrimary }]}>@{receiverUsername}</Text>
                </View>
              </View>

              <View style={styles.dataField}>
                <Text style={[styles.dataLabel, { color: colors.textSecondary }]}>Dinero enviado</Text>
                <View style={[styles.dataInput, {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : colors.primary + '08',
                  borderColor: colors.primary,
                }]}>
                  <Text style={[styles.amountValue, { color: colors.primary }]}>
                    ${parseFloat(amount).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Buttons */}
          <Animated.View style={[styles.buttonsContainer, { opacity: buttonsOpacity }]}>
            <Button
              mode="contained"
              onPress={handleShare}
              style={[styles.shareButton, { backgroundColor: colors.primary }]}
              contentStyle={styles.buttonContent}
              labelStyle={[styles.buttonLabel, { color: isDarkMode ? '#fff' : '#000' }]}
              icon="share-variant"
            >
              Compartir
            </Button>

            <Button
              mode="outlined"
              onPress={handleExit}
              style={[styles.exitButton, { borderColor: colors.primary }]}
              contentStyle={styles.buttonContent}
              labelStyle={[styles.exitButtonLabel, { color: colors.primary }]}
            >
              Salir
            </Button>
          </Animated.View>
        </View>
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
    width: 350,
    height: 350,
    borderRadius: 175,
    top: -100,
    right: -80,
  },
  decorCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    bottom: 150,
    left: -80,
  },
  decorCircle3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: 250,
    left: 50,
  },
  gradient: {
    flex: 1,
  },
  content: {
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
    backgroundColor: 'rgba(186, 247, 66, 0.05)',
    top: -100,
    right: -100,
  },
  backgroundCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(186, 247, 66, 0.08)',
    bottom: -50,
    left: -50,
  },
  logoContainer: {
    padding: spacing.lg,
    borderRadius: 32,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 10,
    marginBottom: spacing.lg,
  },
  logo: {
    width: 80,
    height: 80,
  },
  checkmarkContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  checkmark: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '700',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 44,
  },
  dataCard: {
    width: '100%',
    marginBottom: spacing.xxl,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  dataField: {
    marginBottom: spacing.md,
  },
  dataLabel: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.xs,
  },
  dataInput: {
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
  },
  dataValue: {
    fontSize: 16,
    textAlign: 'center',
  },
  amountValue: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    justifyContent: 'center',
  },
  shareButton: {
    borderRadius: 30,
    flex: 1,
    maxWidth: 150,
  },
  exitButton: {
    borderRadius: 30,
    flex: 1,
    maxWidth: 150,
  },
  buttonContent: {
    paddingVertical: spacing.md,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  exitButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SuccessScreen;
