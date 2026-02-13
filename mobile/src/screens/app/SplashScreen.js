import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, borderRadius, spacing } from '../../theme/colors';

const SplashScreen = ({ onFinish }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Animate logo entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-navigate after delay
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Decorative blurred circle */}
      <View style={styles.backgroundCircle} />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoBg}>
          <Image
            source={require('../../../assets/logoflashy.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      <Animated.Text
        style={[
          styles.appName,
          { opacity: fadeAnim },
        ]}
      >
        Flashy
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  backgroundCircle: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: colors.backgroundLight,
    opacity: 0.4,
    top: -150,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 24,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 35,
    elevation: 10,
  },
  logo: {
    width: 150,
    height: 150,
  },
  appName: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 20,
    letterSpacing: 1,
  },
});

export default SplashScreen;
