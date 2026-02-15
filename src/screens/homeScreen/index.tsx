import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import color from '../../assets/Color/color';

const {width} = Dimensions.get('screen');
const IMAGE_SIZE = width / 3 - 20;
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../routes/navigation';

import ProfileHeader from '../../components/Profile/ProfileHeader';
import HomeHeader from '../../components/Home/HomeHeader';
import StoryViewer from '../../components/Home/StoryViewer';
import StoryCirclesExample from '../../components/Home/StoryCircles';
import SwipeCard from '../../components/Swipe/SwipeCard';
import ToggleButton from '../../components/Toggle/ToggleButton';

const HomeScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const yourStoriesArray = [
    {
      uri: 'https://as1.ftcdn.net/jpg/04/49/44/96/1000_F_449449660_HmB8Nw3ncDySx6f7WblM0n0C28fx2wzK.jpg',
      name: 'Georgina',
      age: '24',
      distance: '1',
      photos: [
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',

        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',

        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
      ],
    },
    {
      uri: 'https://th.bing.com/th/id/OIP.IAebAUaiHPWaVFdxpL_2WwHaJ2?w=1196&h=1592&rs=1&pid=ImgDetMain',
      name: 'Georgina',
      age: '24',
      distance: '2',
      photos: [
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
      ],
    },
    {
      uri: 'https://as1.ftcdn.net/jpg/04/49/44/96/1000_F_449449660_HmB8Nw3ncDySx6f7WblM0n0C28fx2wzK.jpg',
      name: 'Georgina',
      age: '24',
      distance: '3',
      photos: [
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',

        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',

        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
        'https://i.pinimg.com/originals/63/51/82/6351820cfbad19ff7c2adcf31be60663.jpg',
      ],
    },
    // {uri: '../../assets/Images_main/wallpaper_couple.jpg'},
    // {uri: '../../assets/Images_main/wallpaper_couple.jpg'},
  ];

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['#ffffff', '#ffffff', '#c2bff6']}
        locations={[0, 0.9, 1]}
        start={{x: 0, y: 2}}
        end={{x: 1.5, y: 0.1}}
        style={styles.gradient}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <HomeHeader
              name="Commune"
              isVerified={true}
              onPress={() => console.log('Notification pressed')}
            />
          </View>

          {/* Stories Section */}
          <View style={styles.storiesContainer}>
            <StoryCirclesExample />
          </View>
          <View style={{marginVertical: 0}}>
            <ToggleButton
              onToggle={isMakeFriends =>
                console.log(
                  isMakeFriends ? 'Make Friends Mode' : 'Search Friends Mode',
                )
              }
            />
          </View>
          <View style={styles.swipeContainer}>
            {yourStoriesArray.map(
              (profile, index) => (
                console.log('profile', profile),
                (
                  <SwipeCard
                    key={index}
                    profile={profile} // Replace with actual image
                    onSwipeLeft={() => console.log('Swiped left')}
                    onSwipeRight={() => console.log('Swiped right')}
                  />
                )
              ),
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    alignContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
    paddingTop: 38,
    paddingHorizontal: 16,
    zIndex: 1000,
  },
  storiesContainer: {
    width: '100%',
    paddingVertical: 10,
    zIndex: 999,
  },
  swipeContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    // backgroundColor: 'red',
  },
  actionButtonsContainer: {
    width: '100%',
    paddingBottom: 30,
    backgroundColor: 'transparent',
  },
});

export default HomeScreen;
