import React from 'react';
import {SafeAreaView, StatusBar} from 'react-native';
import {Provider} from 'react-redux';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import store from './src/redux/store';
import Navigation from './src/routes/Navigation';
import {NavigationContainer} from '@react-navigation/native';

const MainApp = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <NavigationContainer>
        <StatusBar
          translucent={true}
          barStyle={'light-content'}
          backgroundColor={'transparent'}
        />
        <Navigation />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <MainApp />
    </Provider>
  );
};

export default App;
