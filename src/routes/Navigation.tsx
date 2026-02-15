import React, {useEffect, useRef, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';

import {
  ActivityIndicator,
  Animated,
  GestureResponderEvent,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Div, Flex, Text} from '../components/common/UI';
import Svg, {Circle, Path} from 'react-native-svg';
import HomeScreen from '../screens/homeScreen';
import LoginScreen from '../screens/LoginScreen';
import IntroScreen from '../screens/IntroScreen';
import DateBirth from '../screens/DateBirth';
import HeightPicker from '../screens/HeightPicker';
import AuthScreen from '../screens/AuthScreen/AuthScreen';
import GenderSelection from '../screens/GenderSelect';
import Name from '../screens/Name';
import RelationStatus from '../screens/RelationStatus';
import AddPhoto from '../screens/AddPhoto';
import AnimatedTabButton from '../components/common/AnimatedTabButton';
import Notification from '../screens/notifications/Index';
import ProfileScreen from '../screens/ProfileScreen';
import Settings from '../screens/Settings';
import Preferences from '../screens/Preferences';
import HelpCenter from '../screens/HelpCenter';
import NotificationSettings from '../screens/NotificationSettings';
import PhoneNumber from '../screens/Settings/PhoneNumber';
import Email from '../screens/Settings/Email';
import Location from '../screens/Settings/Location';
import {useDispatch, useSelector} from 'react-redux';
import {getToken} from '../utils/storage';
import {setToken} from '../redux/slices/authSlice';
import LoginScreenBms from '../screens/LoginScreenBms';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  otpVerification: undefined;
  UserDetails: undefined;
  Main: undefined;
  ViewDetails: undefined;
  BookingDetails: undefined;
  Intro: undefined;
  DateBirth: undefined;
  HeightPicker: undefined;
  AuthScreen: undefined;
  GenderSelect: undefined;
  Name: undefined;
  Relation: undefined;
  AddPhotoList: undefined;
  Settings: undefined;
  Preferences: undefined;
  PhoneNumber: undefined;
  Email: undefined;
  Location: undefined;
  HelpCenter: undefined;
  NotificationSettings: undefined;
};

export type BottomTabParamList = {
  HomeScreen: undefined;
  MoreScreen: undefined;
  Notifications: undefined;

  Message: undefined;

  Profile: undefined;
};
export type TabBarButtonList = {
  TouchableOpacity: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const TabNavigator: React.FC = () => (
  <Tab.Navigator
    initialRouteName="HomeScreen"
    screenOptions={{
      tabBarShowLabel: false,
      tabBarStyle: {
        overflow: 'hidden',
        backgroundColor: '#FAFAFA',
        // height: Platform.OS === 'ios' ? 100 : 60,
        borderTopWidth: 1,
        width: '100%',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      tabBarItemStyle: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
      tabBarActiveTintColor: '#fff',
      tabBarInactiveTintColor: '#fed4d7',
    }}>
    <Tab.Screen
      name="HomeScreen"
      component={HomeScreen}
      options={{
        headerShown: false,
        tabBarButton: (props: any) => (
          <AnimatedTabButton
            {...props}
            label="Home"
            icon={
              <Svg width="22" height="22" viewBox="0 0 20 22" fill="none">
                <Path
                  d="M14 21V17C14 14.7909 12.2091 13 10 13C7.79086 13 6 14.7909 6 17C6 17 6 17 6 17C6 17 6 19.4379 6 21M19 9.15033V16.9668C19 19.1943 17.2091 21 15 21H10H5C2.79086 21 1 19.1943 1 16.9668V9.15033C1 7.93937 1.53964 6.7925 2.46986 6.02652L7.46986 1.90935C8.9423 0.696886 11.0577 0.696883 12.5301 1.90935L17.5301 6.02652C18.4604 6.7925 19 7.93937 19 9.15033Z"
                  stroke={
                    props?.accessibilityState?.selected ? '#fa2c37' : 'gray'
                  }
                  strokeWidth="1.5"
                />
              </Svg>
            }
          />
        ),
      }}
    />

    <Tab.Screen
      name="Notifications"
      component={Notification}
      options={{
        headerShown: false,
        tabBarButton: (props: any) => (
          <AnimatedTabButton
            {...props}
            label="Notifications"
            icon={
              <Svg width="20" height="22" viewBox="0 0 18 22" fill="none">
                <Path
                  d="M1.00001 13.8851H0.250006H1.00001ZM3.73292 17.0834L3.83593 16.3405H3.83593L3.73292 17.0834ZM13.9193 17.0834L13.8163 16.3405H13.8163L13.9193 17.0834ZM1.46647 12.1872L0.822321 11.8031L1.46647 12.1872ZM3.48914 7.08696C3.48914 4.13944 5.87858 1.75 8.8261 1.75V0.25C5.05015 0.25 1.98914 3.31101 1.98914 7.08696H3.48914ZM3.48914 9.17949V7.08696H1.98914V9.17949H3.48914ZM1.75001 13.8851C1.75001 13.4037 1.88171 12.9552 2.11062 12.5714L0.822321 11.8031C0.458706 12.4128 0.250006 13.1257 0.250006 13.8851H1.75001ZM3.83593 16.3405C2.63629 16.1742 1.75001 15.1313 1.75001 13.8851H0.250006C0.250006 15.8448 1.65412 17.5524 3.62991 17.8263L3.83593 16.3405ZM8.82609 16.772C7.33411 16.772 5.40652 16.5583 3.83593 16.3405L3.62991 17.8263C5.21268 18.0458 7.22538 18.272 8.82609 18.272V16.772ZM13.8163 16.3405C12.2457 16.5583 10.3181 16.772 8.82609 16.772V18.272C10.4268 18.272 12.4395 18.0458 14.0223 17.8263L13.8163 16.3405ZM15.9022 13.8851C15.9022 15.1313 15.0159 16.1742 13.8163 16.3405L14.0223 17.8263C15.9981 17.5524 17.4022 15.8448 17.4022 13.8851H15.9022ZM15.5416 12.5714C15.7705 12.9552 15.9022 13.4037 15.9022 13.8851H17.4022C17.4022 13.1257 17.1935 12.4128 16.8299 11.8031L15.5416 12.5714ZM14.1631 7.08696V9.17951H15.6631V7.08696H14.1631ZM8.8261 1.75C11.7736 1.75 14.1631 4.13944 14.1631 7.08696H15.6631C15.6631 3.31101 12.602 0.25 8.8261 0.25V1.75ZM16.8299 11.8031C16.521 11.2851 16.2404 10.8701 16.0091 10.4066C15.7876 9.96289 15.6631 9.567 15.6631 9.17951H14.1631C14.1631 9.89235 14.3931 10.5278 14.667 11.0766C14.9311 11.6056 15.2869 12.1443 15.5416 12.5714L16.8299 11.8031ZM1.98914 9.17949C1.98914 9.56698 1.86462 9.96287 1.64311 10.4066C1.41177 10.8701 1.13122 11.2851 0.822321 11.8031L2.11062 12.5714C2.36532 12.1443 2.7211 11.6056 2.9852 11.0766C3.25912 10.5278 3.48914 9.89234 3.48914 9.17949H1.98914Z"
                  fill={
                    props?.accessibilityState?.selected ? '#fa2c37' : 'gray'
                  }
                />
                <Path
                  d="M11 19.834C10.5326 20.5369 9.73346 21.0002 8.82608 21.0002C7.91871 21.0002 7.11953 20.5369 6.65217 19.834"
                  stroke={
                    props?.accessibilityState?.selected ? '#fa2c37' : 'gray'
                  }
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </Svg>
            }
          />
        ),
      }}
    />

    <Tab.Screen
      name="Message"
      component={HomeScreen}
      options={{
        headerShown: false,
        tabBarButton: (props: any) => (
          <AnimatedTabButton
            {...props}
            label="Message"
            icon={
              <Svg width="22" height="20" viewBox="0 0 22 20" fill="none">
                <Path
                  d="M16.3726 6.17276C19.0986 7.39695 21 10.1611 21 13.375V16.75C21 17.9926 20.0051 19 18.7778 19H12.1111C9.2084 19 6.73898 17.1217 5.82379 14.5M16.3726 6.17276C15.6711 3.20566 13.0344 1 9.88889 1H8.77778C4.48223 1 1 4.52576 1 8.875V12.25C1 13.4926 1.99492 14.5 3.22222 14.5H5.82379M16.3726 6.17276C16.4922 6.67875 16.5556 7.20688 16.5556 7.75C16.5556 11.4779 13.5708 14.5 9.88889 14.5H5.82379"
                  stroke={
                    props?.accessibilityState?.selected ? '#fa2c37' : 'gray'
                  }
                  stroke-width="1.5"
                  stroke-linejoin="round"
                />
              </Svg>
            }
          />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        headerShown: false,
        tabBarButton: (props: any) => (
          <AnimatedTabButton
            {...props}
            label="Profile"
            icon={
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                  stroke={
                    props?.accessibilityState?.selected ? '#fa2c37' : 'gray'
                  }
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22"
                  stroke={
                    props?.accessibilityState?.selected ? '#fa2c37' : 'gray'
                  }
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            }
          />
        ),
      }}
    />
  </Tab.Navigator>
);

const Navigation = () => {
  const [appLoading, setAppLoading] = useState(true);
  const userToken = useSelector((state: any) => state.auth.token);
  console.log('Current Token in Redux:', userToken);

  const dispatch = useDispatch();
  console.log('Current Token in Redux:', userToken);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = await getToken();
      if (storedToken) {
        dispatch(setToken(storedToken));
      }
      setAppLoading(false);
    };
    initAuth();
  }, []);
  if (appLoading) return <ActivityIndicator />;
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {userToken ? (
        <Stack.Screen name="Main" component={TabNavigator} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreenBms} />
      )}
      {/* <Stack.Screen name="Main" component={TabNavigator} /> */}

      <Stack.Screen name="AuthScreen" component={AuthScreen} />

      {/* <Stack.Screen name="Login" component={LoginScreen} /> */}
      <Stack.Screen name="Name" component={Name} />

      <Stack.Screen name="GenderSelect" component={GenderSelection} />
      <Stack.Screen name="Relation" component={RelationStatus} />

      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="DateBirth" component={DateBirth} />
      <Stack.Screen name="HeightPicker" component={HeightPicker} />
      <Stack.Screen name="AddPhotoList" component={AddPhoto} />

      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="Preferences" component={Preferences} />
      <Stack.Screen name="PhoneNumber" component={PhoneNumber} />
      <Stack.Screen name="Email" component={Email} />
      <Stack.Screen name="Location" component={Location} />

      <Stack.Screen name="HelpCenter" component={HelpCenter} />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettings}
      />

      {/* <Stack.Screen name="Main" component={TabNavigator} /> */}
      {/* <Stack.Screen name="otpVerification" component={OtpVerification} /> */}
      {/* <Stack.Screen name="UserDetails" component={UserDetails} />
   
    <Stack.Screen name="ViewDetails" component={ViewDetails} />
    <Stack.Screen name="BookingDetails" component={BookingDetails} />   */}
    </Stack.Navigator>
  );
};

export default Navigation;

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
