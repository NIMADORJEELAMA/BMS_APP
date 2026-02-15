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
} from 'react-native';
import {Text, Div, Flex} from '../../components/common/UI'; // Adjust paths based on your folder structure

import {authService} from '../../services/authService';

import {setToken} from '../../redux/slices/authSlice';
import {useDispatch} from 'react-redux';

import {saveToken} from '../../utils/storage';

const LoginScreenBms = ({navigation}: any) => {
  const [email, setEmail] = useState('Nima@test.com'); // Default for testing as per your API
  const [password, setPassword] = useState('123123');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await authService.login({email, password});
      console.log('response 111', response);
      // Access the token from the nested 'data' object you showed earlier
      const token = response?.access_token;
      console.log('token', token);

      if (token) {
        await saveToken(token); // Physical storage
        dispatch(setToken(token)); // Redux update (triggers Navigator switch)
      } else {
        Alert.alert('Error', 'Token not found in response');
      }
    } catch (error) {
      console.log('Login call failed', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <Div style={styles.inner}>
          {/* Header Section */}
          <Div style={styles.header}>
            <Text style={styles.logoEmoji}>🌴</Text>
            <Text style={styles.title}>Resort Orders</Text>
            <Text style={styles.subtitle}>Staff Terminal v2.0</Text>
          </Div>

          {/* Form Section */}
          <Div style={styles.formCard}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="name@resort.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Security Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </Div>

          {/* Footer Info */}
          <Text style={styles.footerText}>
            System Status: <Text style={styles.statusOnline}>Online</Text>
          </Text>
        </Div>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreenBms;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F8', // Modern clean gray
  },
  flex: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#121212',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000',
  },
  loginButton: {
    backgroundColor: '#fa2c37', // Using your primary red from Navigation
    paddingVertical: 18,
    borderRadius: 12,
    marginTop: 30,
    alignItems: 'center',
    shadowColor: '#fa2c37',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 30,
  },
  statusOnline: {
    color: '#2ECC71',
    fontWeight: 'bold',
  },
});
