
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import RestaurantListScreen from "./RestaurantListScreen";

const HomeScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.locationContent}>
          <MaterialCommunityIcons
            name="map-pin"
            size={20}
            color="#de782a"
          />
          <Text>Location</Text>
        </View>
        <MaterialCommunityIcons
          name="bell-outline"
          size={26}
          color="#de782a"
        />
      </View>

      <View style={styles.contentPadding}>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color="#E6732F"
          />

          <TextInput
            style={styles.input}
            placeholder="Restaurants, dishes or cuisines"
            placeholderTextColor="#A5A5A5"
          />

          <TouchableOpacity>
            <MaterialCommunityIcons
              name="microphone-outline"
              size={22}
              color="#E6732F"
            />
          </TouchableOpacity>
        </View>

      {/* Banner */}
      <ImageBackground
        source={require("../assets/images/chickenBriyani.jpg")}
        style={styles.banner}
        imageStyle={styles.bannerImage}
      >
        <View style={styles.offerBadge}>
          <Text style={styles.offerText}>LIMITED OFFER</Text>
        </View>

        <Text style={styles.bannerTitle}>Flat 50% OFF</Text>
        <Text style={styles.bannerTitle}>on your first</Text>
        <Text style={styles.bannerTitle}>order!</Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Order Now</Text>
        </TouchableOpacity>
      </ImageBackground>

      <RestaurantListScreen />
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  locationContent: {
    flexDirection: "row",
    gap: 5,
  },
  contentPadding: {
    padding: 16,
  },

  searchContainer: {
    height: 55,
    backgroundColor: "#FFF",
    borderRadius: 14,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
  },

  input: {
    flex: 1,
    marginHorizontal: 10,
    color: "#222",
  },

  banner: {
    marginTop: 18,
    height: 250,
    padding: 18,
    justifyContent: "center",
  },

  bannerImage: {
    borderRadius: 18,
  },

  offerBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#48C774",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },

  offerText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 10,
  },

  bannerTitle: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 28,
    lineHeight: 34,
  },

  button: {
    alignSelf: "flex-start",
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 15,
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "700",
  },
});