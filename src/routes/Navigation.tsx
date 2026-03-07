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
import HomeScreen from '../screens/TableSelectionScreen';
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
import {clearAuthData, getToken, getUser} from '../utils/storage';
import {logout, setToken, setUser} from '../redux/slices/authSlice';
import LoginScreenBms from '../screens/LoginScreenBms';
import OrderPage from '../screens/OrderPage';
import CartScreen from '../screens/CartScreen';
import RoomSelectionScreen from '../screens/RoomSelectionScreen';
import SplashScreen from '../screens/SplashScreen';
import HomeIcon from '../assets/Icons/home-icon-silhouette-svgrepo-com.svg';
import KitchenIcon from '../assets/Icons/kitchen-room.svg';

import ProfileIcon from '../assets/Icons/profile.svg';
import ProfileScreenBms from '../screens/ProfileScreenBms';
import KitchenDashboard from '../screens/KitchenDashboard';

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
  OrderPage: undefined;
  CartScreen: undefined;
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

  KitchenSelection: undefined;

  ProfileScreenBms: undefined;
  Profile: undefined;
};
export type TabBarButtonList = {
  TouchableOpacity: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const TabNavigator: React.FC = () => {
  const user = useSelector((state: any) => state.auth.user);
  console.log('user', user);
  const role = user?.role;
  const initialRoute = role === 'KITCHEN' ? 'KitchenSelection' : 'HomeScreen';

  return (
    <Tab.Navigator
      initialRouteName={initialRoute}
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
      {role !== 'KITCHEN' && (
        <Tab.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{
            headerShown: false,
            tabBarButton: (props: any) => {
              // Check if the tab is currently selected
              const isSelected = props?.accessibilityState?.selected;

              return (
                <AnimatedTabButton
                  {...props}
                  label="Home"
                  icon={
                    <HomeIcon
                      height={20}
                      width={20}
                      fill={isSelected ? '#000000' : 'gray'}
                      stroke={isSelected ? '#000000' : 'gray'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  }
                />
              );
            },
          }}
        />
      )}
      {role == 'KITCHEN' && (
        <Tab.Screen
          name="KitchenSelection"
          component={KitchenDashboard}
          options={{
            headerShown: false,
            tabBarButton: (props: any) => {
              // Check if the tab is currently selected
              const isSelected = props?.accessibilityState?.selected;

              return (
                <AnimatedTabButton
                  {...props}
                  label="Kitchen"
                  icon={
                    <KitchenIcon
                      height={22}
                      width={22}
                      fill={isSelected ? '#000000' : 'gray'}
                      stroke={isSelected ? '#000000' : 'gray'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  }
                />
              );
            },
          }}
        />
      )}
      {/* <Tab.Screen
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
      /> */}
      <Tab.Screen
        name="ProfileScreenBms"
        component={ProfileScreenBms}
        options={{
          headerShown: false,
          tabBarButton: (props: any) => {
            // Check if the tab is currently selected
            const isSelected = props?.accessibilityState?.selected;

            return (
              <AnimatedTabButton
                {...props}
                label="Profile"
                icon={
                  <ProfileIcon
                    width={24}
                    height={24}
                    fill={isSelected ? '#000000' : '#808080'} // Use a hex for gray to be safe
                  />
                }
              />
            );
          },
        }}
      />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  const dispatch = useDispatch();

  // 1. Pull everything from Redux Auth Slice
  const {isAuthenticated, isLoading} = useSelector((state: any) => state.auth);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Pull from your storage utilities
        const storedToken = await getToken();
        const storedUser = await getUser();

        // 2. Strict validation
        if (storedToken && storedUser) {
          dispatch(setToken(storedToken));
          dispatch(setUser(storedUser));
        } else {
          // If data is partial or missing, ensure storage is 100% clean
          await clearAuthData();
          dispatch(logout());
        }
      } catch (e) {
        console.error('Auth Restore Failed', e);
        dispatch(logout());
      } finally {
        // If your slice has a setLoading, call it here
        // dispatch(setLoading(false));
      }
    };
    initAuth();
  }, [dispatch]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {isAuthenticated ? (
        // APP STACK (Authenticated users)
        <Stack.Group>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="OrderPage" component={OrderPage} />
          <Stack.Screen name="CartScreen" component={CartScreen} />
          {/* Settings and other inner screens should be here */}
          <Stack.Screen name="Preferences" component={Preferences} />
          <Stack.Screen name="PhoneNumber" component={PhoneNumber} />
          <Stack.Screen name="Email" component={Email} />
          <Stack.Screen name="Location" component={Location} />
          <Stack.Screen name="HelpCenter" component={HelpCenter} />
          <Stack.Screen
            name="NotificationSettings"
            component={NotificationSettings}
          />
        </Stack.Group>
      ) : (
        // AUTH STACK (Unauthenticated users)
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreenBms} />
          <Stack.Screen name="Intro" component={IntroScreen} />
          <Stack.Screen name="AuthScreen" component={AuthScreen} />
          <Stack.Screen name="Name" component={Name} />
          <Stack.Screen name="DateBirth" component={DateBirth} />
          <Stack.Screen name="GenderSelect" component={GenderSelection} />
          <Stack.Screen name="HeightPicker" component={HeightPicker} />
          <Stack.Screen name="Relation" component={RelationStatus} />
          <Stack.Screen name="AddPhotoList" component={AddPhoto} />
        </Stack.Group>
      )}
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
