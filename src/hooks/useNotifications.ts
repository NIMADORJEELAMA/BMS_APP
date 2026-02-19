// import {useEffect} from 'react';
// import {Platform, PermissionsAndroid} from 'react-native';
// import {getApp} from '@react-native-firebase/app';
// import {
//   getMessaging,
//   getToken,
//   requestPermission,
//   onMessage,
//   onNotificationOpenedApp,
// } from '@react-native-firebase/messaging';
// import Toast from 'react-native-toast-message';
// import {navigationRef} from '../utils/navigationRef';

// export const useNotifications = () => {
//   useEffect(() => {
//     // 1. Initialize messaging using the new modular pattern
//     const app = getApp();
//     const messaging = getMessaging(app);

//     const setupNotifications = async () => {
//       try {
//         // Handle Android 13+ Notification Permission
//         if (Platform.OS === 'android' && Platform.Version >= 33) {
//           await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
//           );
//         }

//         // 2. Request Permission (Modular style)
//         const authStatus = await requestPermission(messaging);
//         const enabled =
//           authStatus === 1 || // Authorized
//           authStatus === 2; // Provisional

//         if (enabled) {
//           // 3. Get Token (Modular style)
//           const token = await getToken(messaging);
//           console.log('✅ FCM Device Token:', token);
//           // TODO: api.patch('/user/fcm-token', { token });
//         }
//       } catch (error) {
//         console.error('Push Notification Setup Error:', error);
//       }
//     };

//     setupNotifications();

//     // 4. Listen for messages in Foreground
//     const unsubscribe = onMessage(messaging, async remoteMessage => {
//       console.log('Received in foreground:', remoteMessage);
//       Toast.show({
//         type: 'success',
//         text1: remoteMessage.notification?.title || 'Order Update',
//         text2: remoteMessage.notification?.body || 'New update from kitchen!',
//         position: 'top',
//         topOffset: 60,
//       });
//     });

//     onNotificationOpenedApp(messaging, remoteMessage => {
//       if (remoteMessage.data?.orderId) {
//         // Navigate to the order details or highlight the table
//         console.log('first');
//         // navigationRef.navigate('OrderDetails', { orderId: remoteMessage.data.orderId });
//       }
//     });

//     return unsubscribe;
//   }, []);
// };

import {useEffect} from 'react';
import {Platform, PermissionsAndroid} from 'react-native';
import {getApp} from '@react-native-firebase/app';
import {
  getMessaging,
  getToken,
  requestPermission,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  getInitialNotification,
} from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';
import {userService} from '../services/userService';
import {navigate} from '../utils/navigationRef'; // Import your helper

export const useNotifications = (isAuthenticated: boolean) => {
  useEffect(() => {
    const app = getApp();
    const messaging = getMessaging(app);

    const syncTokenWithBackend = async (token: string) => {
      console.log('token', token);
      try {
        await userService.updateFcmToken(token);
        console.log('🚀 FCM Token synced');
      } catch (e) {
        console.error('❌ FCM sync failed', e);
      }
    };

    // Helper to handle navigation logic based on notification data
    const handleNotificationNavigation = (remoteMessage: any) => {
      const orderId = remoteMessage?.data?.orderId;
      if (orderId) {
        // Use your navigate helper
        navigate('OrderDetails', {orderId});
      }
    };

    const setupNotifications = async () => {
      try {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
        }

        const authStatus = await requestPermission(messaging);
        const enabled = authStatus === 1 || authStatus === 2;

        if (enabled && isAuthenticated) {
          const token = await getToken(messaging);
          console.log('token 123', token);
          if (token) await syncTokenWithBackend(token);
        }
      } catch (error) {
        console.error('Push Setup Error:', error);
      }
    };

    setupNotifications();

    // 1. Foreground messages (Show Toast)
    const unsubscribeOnMessage = onMessage(messaging, async remoteMessage => {
      Toast.show({
        type: 'success',
        text1: remoteMessage.notification?.title || 'Order Update',
        text2: remoteMessage.notification?.body || 'New update from kitchen!',
        onPress: () => handleNotificationNavigation(remoteMessage), // Navigate on toast click
      });
    });

    // 2. Background click (App was running in background)
    const unsubscribeNotificationOpen = onNotificationOpenedApp(
      messaging,
      remoteMessage => {
        handleNotificationNavigation(remoteMessage);
      },
    );

    // 3. Quit state click (App was closed)
    getInitialNotification(messaging).then(remoteMessage => {
      if (remoteMessage) {
        // Small delay to ensure the NavigationContainer has mounted
        setTimeout(() => {
          handleNotificationNavigation(remoteMessage);
        }, 500);
      }
    });

    const unsubscribeTokenRefresh = onTokenRefresh(messaging, token => {
      if (isAuthenticated) syncTokenWithBackend(token);
    });

    return () => {
      unsubscribeTokenRefresh();
      unsubscribeOnMessage();
      unsubscribeNotificationOpen();
    };
  }, [isAuthenticated]);
};
