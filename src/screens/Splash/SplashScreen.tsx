import { useEffect } from 'react';
import { Text, View } from 'react-native';

const SplashScreen = ({ navigation }: any) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace('OnBoarding');
        }, 2000);

        return () => clearTimeout(timer);
    }, []);
    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Text style={{ fontFamily: 'Italian' }}>Splash screen</Text>
        </View>
    )
}

export default SplashScreen;
