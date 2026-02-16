import {useDispatch} from 'react-redux';
import {logout} from '../redux/slices/authSlice';
import {clearCart} from '../redux/slices/cartSlice';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // If using storage

const useLogout = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const performLogout = async () => {
    try {
      // 1. Clear Token from Redux
      dispatch(logout());

      // 2. Clear Cart from Redux (Prevents order leaks)
      dispatch(clearCart());

      // 3. Clear Storage (if you saved the token there)
      await AsyncStorage.removeItem('userToken');

      // 4. Redirect to Login
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return performLogout;
};

export default useLogout;
