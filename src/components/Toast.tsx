import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Animated, Text, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastType = 'success' | 'error' | 'info';

interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

const TOAST_COLORS: Record<ToastType, { bg: string; text: string }> = {
  success: { bg: '#1B5E20', text: '#FFFFFF' },
  error: { bg: '#B71C1C', text: '#FFFFFF' },
  info: { bg: '#1B1C1C', text: '#FFFFFF' },
};

const { width } = Dimensions.get('window');

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(({ message, type = 'info', duration = 2500 }: ToastConfig) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setToast({ message, type });
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    timerRef.current = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setToast(null));
    }, duration);
  }, [opacity]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: TOAST_COLORS[toast.type].bg,
              top: insets.top + 8,
              opacity,
              transform: [
                {
                  translateY: opacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <Text style={[styles.text, { color: TOAST_COLORS[toast.type].text }]}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'center',
  },
});
