import {useEffect} from 'react';
import {Platform, PermissionsAndroid} from 'react-native';
import {getApp} from '@react-native-firebase/app';
import {
  getMessaging,
  getToken,
  requestPermission,
  onMessage,
  onNotificationOpenedApp,
} from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';
import {navigationRef} from '../utils/navigationRef';

export const useNotifications = () => {
  useEffect(() => {
    // 1. Initialize messaging using the new modular pattern
    const app = getApp();
    const messaging = getMessaging(app);

    const setupNotifications = async () => {
      try {
        // Handle Android 13+ Notification Permission
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
        }

        // 2. Request Permission (Modular style)
        const authStatus = await requestPermission(messaging);
        const enabled =
          authStatus === 1 || // Authorized
          authStatus === 2; // Provisional

        if (enabled) {
          // 3. Get Token (Modular style)
          const token = await getToken(messaging);
          console.log('✅ FCM Device Token:', token);
          // TODO: api.patch('/user/fcm-token', { token });
        }
      } catch (error) {
        console.error('Push Notification Setup Error:', error);
      }
    };

    setupNotifications();

    // 4. Listen for messages in Foreground
    const unsubscribe = onMessage(messaging, async remoteMessage => {
      console.log('Received in foreground:', remoteMessage);
      Toast.show({
        type: 'success',
        text1: remoteMessage.notification?.title || 'Order Update',
        text2: remoteMessage.notification?.body || 'New update from kitchen!',
        position: 'top',
        topOffset: 60,
      });
    });

    onNotificationOpenedApp(messaging, remoteMessage => {
      if (remoteMessage.data?.orderId) {
        // Navigate to the order details or highlight the table
        console.log('first');
        // navigationRef.navigate('OrderDetails', { orderId: remoteMessage.data.orderId });
      }
    });

    return unsubscribe;
  }, []);
};
