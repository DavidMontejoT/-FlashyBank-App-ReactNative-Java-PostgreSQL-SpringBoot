import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

// Hook para animación de contador (de 0 a un valor)
export const useCountUp = (endValue, duration = 2000, delay = 300) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(animatedValue, {
        toValue: endValue,
        duration: duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [endValue]);

  return animatedValue;
};

// Hook para fade in con delay
export const useFadeIn = (delay = 0, duration = 600) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration,
        delay: delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: duration,
        delay: delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { opacity, translateY };
};

// Hook para scale in (pop effect)
export const useScaleIn = (delay = 0, duration = 400) => {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        delay: delay,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { scale, opacity };
};

// Hook para blur effect (simulado con opacity)
export const useBlurIn = (delay = 0, duration = 800) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const blur = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration,
        delay: delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { opacity };
};

// Hook para slide from bottom
export const useSlideUp = (delay = 0, duration = 500, distance = 30) => {
  const translateY = useRef(new Animated.Value(distance)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: duration,
        delay: delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration,
        delay: delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return { opacity, transform: [{ translateY }] };
};

// Hook para pulse animation
export const usePulse = (minScale = 1, maxScale = 1.05, duration = 1500) => {
  const scale = useRef(new Animated.Value(minScale)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: maxScale,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: minScale,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return scale;
};

// Stagger animation para listas
export const useStaggerAnimation = (itemCount, baseDelay = 100) => {
  const animations = useRef(
    Array.from({ length: itemCount }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(20),
    }))
  ).current;

  useEffect(() => {
    const animationsList = animations.map((anim, index) =>
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 400,
          delay: index * baseDelay,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: 400,
          delay: index * baseDelay,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(50, animationsList).start();
  }, []);

  return animations;
};
