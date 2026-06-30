import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';

function App() {

  return (
    <SafeAreaProvider>
      <RootNavigator />;
    </SafeAreaProvider>
  );
}

export default App;
