import React, {useEffect, useRef} from 'react';
import {
  StyleSheet,
  Animated,
  View,
  Dimensions,
  ImageBackground,
  StatusBar,
} from 'react-native';
import {Text} from '../components/common/UI';

const {width, height} = Dimensions.get('window');

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground
        source={require('../assets/images/resort.jpg')} // Path to your background image
        style={styles.background}
        resizeMode="cover">
        {/* Dark Overlay to make text pop */}
        <View style={styles.overlay} />

        <Animated.View
          style={[
            styles.content,
            {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
          ]}>
          {/* Circular Logo */}
          <View style={styles.logoCircle}>
            {/* Replace the emoji with <Image source={...} /> for your real logo */}
            <Text style={styles.logoEmoji}>🏨</Text>
          </View>

          <Text style={styles.brandName}>Hill Top Resort</Text>
          <View style={styles.divider} />
          <Text style={styles.tagline}>POS TERMINAL</Text>
        </Animated.View>

        <View style={styles.footer}></View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)', // Adjust darkness here
  },
  content: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    backgroundColor: '#FFF',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    // Android Shadow
    elevation: 12,
  },
  logoEmoji: {
    fontSize: 60,
  },
  brandName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: '#FC8019', // Swiggy Orange Accent
    marginVertical: 12,
    borderRadius: 2,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  poweredBy: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default SplashScreen;
