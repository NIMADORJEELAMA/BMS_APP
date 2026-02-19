import {useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';
import {Alert, Platform} from 'react-native';

export const useNotifications = () => {
  useEffect(() => {
    // 1. Request Permission (Required for iOS)
    const requestPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        const token = await messaging().getToken();
        console.log('FCM Device Token:', token);
        // TODO: Send this token to your backend!
      }
    };

    requestPermission();

    // 2. Handle Foreground Messages (App is open)
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Toast.show({
        type: 'success',
        text1: remoteMessage.notification?.title || 'Order Update',
        text2: remoteMessage.notification?.body || 'Check the kitchen queue!',
        position: 'top',
        visibilityTime: 6000,
      });
    });

    // 3. Handle Background/Quit State Clicks
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background:',
        remoteMessage,
      );
    });

    return unsubscribe;
  }, []);
};
