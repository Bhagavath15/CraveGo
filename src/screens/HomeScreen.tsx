import { Text, View } from "react-native"

const HomeScreen = () => {
    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Text style={{ textAlign: "center", color: 'black' }}>Home Screen</Text>
        </View>
    )
}

export default HomeScreen