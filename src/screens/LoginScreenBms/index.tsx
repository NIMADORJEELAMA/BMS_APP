import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {Text, Div} from '../../components/common/UI';
import {authService} from '../../services/authService';
import {setToken, setUser} from '../../redux/slices/authSlice';
import {useDispatch} from 'react-redux';
import {saveToken, saveUser} from '../../utils/storage';
import EyeOpen from '../../assets/Icons/eye_open.svg';

import EyeClosed from '../../assets/Icons/eye_closed.svg';

const LoginScreenBms = () => {
  const [email, setEmail] = useState('Nima@test.com');
  const [password, setPassword] = useState('123123');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Info', 'Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({email, password});
      const token = response?.access_token;
      const userData = response?.user;
      console.log('response >>', response);
      if (token) {
        await saveToken(token);
        await saveUser(userData);
        dispatch(setToken(token));
        dispatch(setUser(userData));
      } else {
        Alert.alert('Login Error', "We couldn't verify your session.");
      }
    } catch (error: any) {
      // Custom error messaging based on status code
      const status = error.response?.status;
      if (status === 401) {
        Alert.alert('Access Denied', 'Invalid email or password.');
      } else {
        Alert.alert('Network Error', 'Server is currently unreachable.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <Div style={styles.inner}>
          {/* Top Brand Section */}
          <Div style={styles.header}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🌴</Text>
            </View>
            <Text style={styles.title}>Minizeo</Text>
            <Text style={styles.subtitle}>RESORT TERMINAL</Text>
          </Div>

          {/* Login Card */}
          <Div style={styles.formCard}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>
              Sign in to manage your floor
            </Text>

            <Div style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="name@resort.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </Div>

            <Div style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.input, {flex: 1, borderWidth: 0}]}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}>
                  {showPassword ? (
                    <EyeOpen width={20} height={20} fill="#94A3B8" />
                  ) : (
                    <EyeClosed width={20} height={20} fill="#94A3B8" />
                  )}
                </TouchableOpacity>
              </View>
            </Div>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </Div>

          <Text style={styles.footerText}>
            Build v2.0.4 •{' '}
            <Text style={styles.statusOnline}>System Active</Text>
          </Text>
        </Div>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8FAFC'},
  flex: {flex: 1},
  inner: {flex: 1, padding: 24, justifyContent: 'center'},
  header: {alignItems: 'center', marginBottom: 32},
  logoCircle: {
    width: 80,
    height: 80,
    backgroundColor: '#FFF',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  logoEmoji: {fontSize: 40},
  title: {fontSize: 32, fontWeight: '900', color: '#1E293B'},
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    letterSpacing: 3,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  formTitle: {fontSize: 22, fontWeight: '800', color: '#1E293B'},
  formSubtitle: {fontSize: 14, color: '#64748B', marginBottom: 24},
  inputGroup: {marginBottom: 16},
  label: {fontSize: 10, fontWeight: '800', color: '#94A3B8', marginBottom: 8},
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  eyeBtn: {paddingHorizontal: 16},
  loginButton: {
    backgroundColor: '#FC8019', // Swiggy Orange
    paddingVertical: 18,
    borderRadius: 12,
    marginTop: 24,
    alignItems: 'center',
    shadowColor: '#FC8019',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  loginButtonText: {color: '#FFF', fontSize: 16, fontWeight: '800'},
  disabledButton: {opacity: 0.6},
  footerText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 32,
  },
  statusOnline: {color: '#10B981', fontWeight: '800'},
});

export default LoginScreenBms;
