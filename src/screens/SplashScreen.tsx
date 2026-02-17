// src/screens/SplashScreen.tsx
import React, {useEffect, useRef} from 'react';
import {StyleSheet, Animated, View, Dimensions, Image} from 'react-native';
import {Text} from '../components/common/UI';
import swiggyColors from '../assets/Color/swiggyColor';

const {width} = Dimensions.get('window');

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
        ]}>
        {/* Replace with your actual Logo Image */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🍽️</Text>
        </View>
        <Text style={styles.brandName}>MINIZEO POS</Text>
        <Text style={styles.tagline}>Smart Resort Management</Text>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.poweredBy}>v1.0.2 • Powered by Minizeo</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: swiggyColors.primary, // #FC8019
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    backgroundColor: '#FFF',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  logoEmoji: {
    fontSize: 50,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  poweredBy: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default SplashScreen;
