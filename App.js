import { useEffect } from 'react';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import RootNavigator, { navigationRef } from './src/navigation/RootNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CartProvider } from './src/context/CartContext';
import { ToastProvider } from './src/components/Toast';
import { PUBLISHABLE_KEY } from './src/config';
import { setNavigate } from './src/services/pushService';

function App() {
  useEffect(() => {
    setNavigate((screen, params) => {
      if (navigationRef.isReady()) {
        navigationRef.navigate(screen, params);
      }
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StripeProvider publishableKey={PUBLISHABLE_KEY}>
          <CartProvider>
            <ToastProvider>
              <RootNavigator />
            </ToastProvider>
          </CartProvider>
        </StripeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
