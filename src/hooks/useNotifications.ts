// import {useEffect} from 'react';
// import {Platform, PermissionsAndroid} from 'react-native';
// import {getApp} from '@react-native-firebase/app';
// import {
//   getMessaging,
//   getToken,
//   requestPermission,
//   onMessage,
//   onNotificationOpenedApp,
//   onTokenRefresh,
//   getInitialNotification,
// } from '@react-native-firebase/messaging';
// import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
// import Toast from 'react-native-toast-message';
// import {userService} from '../services/userService';
// import {navigate} from '../utils/navigationRef';

// export const useNotifications = (isAuthenticated: boolean) => {
//   useEffect(() => {
//     const app = getApp();
//     const messaging = getMessaging(app);

//     // 1. Create Notification Channel (Android only)
//     const createChannel = async () => {
//       await notifee.createChannel({
//         id: 'kitchen_alerts',
//         name: 'Kitchen Order Alerts',
//         lights: true,
//         vibration: true,
//         importance: AndroidImportance.HIGH,
//         sound: 'notification', // Requires android/app/src/main/res/raw/notification.mp3
//       });
//     };

//     const syncTokenWithBackend = async (token: string) => {
//       try {
//         await userService.updateFcmToken(token);
//         console.log('🚀 FCM Token synced with backend');
//       } catch (e) {
//         console.error('❌ FCM sync failed', e);
//       }
//     };

//     const handleNotificationNavigation = (remoteMessage: any) => {
//       const orderId = remoteMessage?.data?.orderId;
//       if (orderId) {
//         navigate('OrderDetails', {orderId});
//       }
//     };

//     const setupNotifications = async () => {
//       try {
//         if (Platform.OS === 'android' && Platform.Version >= 33) {
//           await PermissionsAndroid.request(
//             PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
//           );
//         }

//         const authStatus = await requestPermission(messaging);
//         const enabled = authStatus === 1 || authStatus === 2;

//         if (enabled && isAuthenticated) {
//           const token = await getToken(messaging);
//           if (token) await syncTokenWithBackend(token);
//         }
//       } catch (error) {
//         console.error('Push Setup Error:', error);
//       }
//     };

//     // Initialize logic
//     createChannel();
//     setupNotifications();

//     // 2. Notifee Foreground Event Listener (Handles clicks on the custom sound alerts)
//     const unsubscribeNotifeeEvents = notifee.onForegroundEvent(
//       ({type, detail}) => {
//         if (type === EventType.PRESS) {
//           handleNotificationNavigation(detail.notification);
//         }
//       },
//     );

//     // 3. Firebase Foreground Listener (Trigger Notifee Display + Toast)
//     const unsubscribeOnMessage = onMessage(messaging, async remoteMessage => {
//       console.log('Foreground Message received:', remoteMessage);

//       // Display Notifee notification (this plays the sound)
//       await notifee.displayNotification({
//         title: remoteMessage.notification?.title || 'Order Update',
//         body: remoteMessage.notification?.body || 'New update from kitchen!',
//         data: remoteMessage.data, // Important for navigation later
//         android: {
//           channelId: 'kitchen_alerts',
//           importance: AndroidImportance.HIGH,
//           pressAction: {
//             id: 'default',
//           },
//         },
//       });

//       // Optional: Also show the Toast message
//       Toast.show({
//         type: 'success',
//         text1: remoteMessage.notification?.title || 'Order Update',
//         text2: remoteMessage.notification?.body || 'New update from kitchen!',
//         onPress: () => handleNotificationNavigation(remoteMessage),
//       });
//     });

//     // 4. Background click (App was running in background)
//     const unsubscribeNotificationOpen = onNotificationOpenedApp(
//       messaging,
//       remoteMessage => {
//         handleNotificationNavigation(remoteMessage);
//       },
//     );

//     // 5. Quit state click (App was completely closed)
//     getInitialNotification(messaging).then(remoteMessage => {
//       if (remoteMessage) {
//         setTimeout(() => {
//           handleNotificationNavigation(remoteMessage);
//         }, 1000); // Increased delay for slower cold-starts
//       }
//     });

//     const unsubscribeTokenRefresh = onTokenRefresh(messaging, token => {
//       if (isAuthenticated) syncTokenWithBackend(token);
//     });

//     return () => {
//       unsubscribeTokenRefresh();
//       unsubscribeOnMessage();
//       unsubscribeNotificationOpen();
//       unsubscribeNotifeeEvents();
//     };
//   }, [isAuthenticated]);
// };

import {useEffect, useRef} from 'react';
import {Platform, PermissionsAndroid} from 'react-native';
import {getApp} from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import Toast from 'react-native-toast-message';
import {userService} from '../services/userService';
import {navigate} from '../utils/navigationRef';

export const useNotifications = (isAuthenticated: boolean) => {
  // Use a ref to prevent multiple syncs or duplicate listeners
  const isInitialized = useRef(false);

  useEffect(() => {
    const firebaseMessaging = messaging();

    const syncTokenWithBackend = async (token: string) => {
      try {
        await userService.updateFcmToken(token);
        console.log('🚀 FCM Token synced');
      } catch (e) {
        console.error('❌ FCM sync failed', e);
      }
    };

    const handleNotificationNavigation = (data: any) => {
      if (data?.orderId) {
        navigate('OrderDetails', {orderId: data.orderId});
      }
    };

    const setup = async () => {
      // 1. Create Channel FIRST (Critical for sound consistency)
      await notifee.createChannel({
        id: 'kitchen_alerts',
        name: 'Kitchen Order Alerts',
        lights: true,
        vibration: true,
        importance: AndroidImportance.HIGH,
        sound: 'notification',
      });

      // 2. Request Permissions
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
      }

      const authStatus = await firebaseMessaging.requestPermission();
      const enabled = authStatus === 1 || authStatus === 2;

      if (enabled && isAuthenticated) {
        const token = await firebaseMessaging.getToken();
        if (token) await syncTokenWithBackend(token);
      }
    };

    if (!isInitialized.current) {
      setup();
      isInitialized.current = true;
    }

    // 3. Foreground Events (User Taps the Notifee Alert)
    const unsubscribeNotifeeEvents = notifee.onForegroundEvent(
      ({type, detail}) => {
        if (type === EventType.PRESS) {
          handleNotificationNavigation(detail.notification?.data);
        }
      },
    );

    // 4. Firebase Foreground Listener
    const unsubscribeOnMessage = firebaseMessaging.onMessage(
      async remoteMessage => {
        console.log('🔥 Message received in foreground');

        // OPTION A: Only use Notifee for Sound + Heads-up (Better for loud kitchens)
        await notifee.displayNotification({
          title: remoteMessage.notification?.title || 'Order Update',
          body: remoteMessage.notification?.body || 'New update from kitchen!',
          data: remoteMessage.data,
          android: {
            channelId: 'kitchen_alerts',
            importance: AndroidImportance.HIGH,
            pressAction: {id: 'default'},
          },
        });

        // REMOVED Toast.show here to prevent double notification.
        // If you prefer Toast, remove the notifee.displayNotification above.
      },
    );

    // 5. Background/Quit Listeners
    const unsubscribeNotificationOpen =
      firebaseMessaging.onNotificationOpenedApp(remoteMessage => {
        handleNotificationNavigation(remoteMessage.data);
      });

    firebaseMessaging.getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        setTimeout(
          () => handleNotificationNavigation(remoteMessage.data),
          1000,
        );
      }
    });

    const unsubscribeTokenRefresh = firebaseMessaging.onTokenRefresh(token => {
      if (isAuthenticated) syncTokenWithBackend(token);
    });

    return () => {
      unsubscribeTokenRefresh();
      unsubscribeOnMessage();
      unsubscribeNotificationOpen();
      unsubscribeNotifeeEvents();
    };
  }, [isAuthenticated]);
};
