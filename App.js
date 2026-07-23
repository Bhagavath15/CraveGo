import { useEffect } from 'react';
import { View, Text } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import RootNavigator, { navigationRef } from './src/navigation/RootNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CartProvider } from './src/context/CartContext';
import Toast, { BaseToast } from 'react-native-toast-message';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { PUBLISHABLE_KEY } from './src/config';
import { setNavigate } from './src/services/pushService';

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#FF6B35',
        borderLeftWidth: 4,
        borderRadius: 12,
        height: 64,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      leadingIconContainerStyle={{ paddingLeft: 4 }}
      leadingComponent={() => (
        <View style={{
          width: 40, height: 40, borderRadius: 20,
          backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center',
          marginLeft: 12,
        }}>
          <MaterialCommunityIcons name="check-circle" size={24} color="#2E7D32" />
        </View>
      )}
      text1Style={{ fontSize: 15, fontWeight: '700', color: '#1B1C1C' }}
      text2Style={{ fontSize: 13, fontWeight: '400', color: '#594139' }}
    />
  ),
  error: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#BA1A1A',
        borderLeftWidth: 4,
        borderRadius: 12,
        height: 64,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      leadingComponent={() => (
        <View style={{
          width: 40, height: 40, borderRadius: 20,
          backgroundColor: '#FFEBEE', justifyContent: 'center', alignItems: 'center',
          marginLeft: 12,
        }}>
          <MaterialCommunityIcons name="alert-circle" size={24} color="#BA1A1A" />
        </View>
      )}
      text1Style={{ fontSize: 15, fontWeight: '700', color: '#1B1C1C' }}
      text2Style={{ fontSize: 13, fontWeight: '400', color: '#594139' }}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#1B1C1C',
        borderLeftWidth: 4,
        borderRadius: 12,
        height: 64,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      leadingComponent={() => (
        <View style={{
          width: 40, height: 40, borderRadius: 20,
          backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center',
          marginLeft: 12,
        }}>
          <MaterialCommunityIcons name="information" size={24} color="#1B1C1C" />
        </View>
      )}
      text1Style={{ fontSize: 15, fontWeight: '700', color: '#1B1C1C' }}
      text2Style={{ fontSize: 13, fontWeight: '400', color: '#594139' }}
    />
  ),
};

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
              <RootNavigator />
            </CartProvider>
            <Toast config={toastConfig} visibilityTime={3000} />
        </StripeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
