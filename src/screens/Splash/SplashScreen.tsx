import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

const SplashScreen = ({ navigation }: any) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace('OnBoarding');
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/images/splash_logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />
        </View>
    );
};

export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    logo: {
        width: 200,
        height: 200,
    },
});
