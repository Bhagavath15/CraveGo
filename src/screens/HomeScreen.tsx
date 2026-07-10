import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

import RestaurantListScreen from "./RestaurantListScreen";
import { getRestaurants } from "../utils/api";
import { toImageUri } from "../utils/imageUtils";
import { Restaurant } from "../data/restaurantData";
import { getToken } from "../utils/authStore";

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = await getToken();
        console.log("HomeScreen - token exists:", !!token);

        const res = await getRestaurants();
        console.log("HomeScreen - API response:", JSON.stringify(res).slice(0, 300));
        if (res.success && res.restaurants?.length > 0) {
          console.log("HomeScreen - full first restaurant:", JSON.stringify(res.restaurants[0]));
        }

        if (res.success) {
          console.log("HomeScreen - restaurants count:", res.restaurants?.length);
          if (res.restaurants?.length > 0) {
            console.log("HomeScreen - first restaurant image:", res.restaurants[0].image);
            console.log("HomeScreen - first restaurantId:", res.restaurants[0].restaurantId);
          }
          const mapped: Restaurant[] = res.restaurants.map((r: any) => ({
            id: r.restaurantId || r._id,
            name: r.name,
            image: toImageUri(r.image) || require("../assets/images/chickenBriyani.jpg"),
            description: r.description,
            category: r.category || [],
            cuisines: Array.isArray(r.cuisines) ? r.cuisines.join(" • ") : r.cuisines || "",
            address: r.address || "",
            rating: r.rating || 0,
            totalRatings: r.totalRatings?.toString() || "0",
            distance: r.distance || "",
            deliveryTime: r.deliveryTime || "",
            priceForOne: r.priceForOne || "",
            offer: r.offer,
            offerDescription: r.offerDescription,
            isVeg: r.isVeg ?? false,
            isFavorite: r.isFavorite ?? false,
            restaurantId: r.restaurantId || r._id,
            menu: [],
          }));
          console.log("HomeScreen - mapped restaurants:", mapped.length);
          setRestaurants(mapped);
        } else {
          setError(res.message || "Failed to load restaurants");
          console.warn("HomeScreen - API error:", res.message);
        }
      } catch (err) {
        console.warn("HomeScreen - fetch error:", err);
        setError("Network error. Check server connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.locationContent}>
          <MaterialCommunityIcons
            name="map-marker"
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
      <TouchableOpacity
        style={styles.searchContainer}
        onPress={() => navigation.navigate("SearchTab" as never)}
      >
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color="#E6732F"
          />

          <Text style={styles.input}>Restaurants, dishes or cuisines</Text>

          <TouchableOpacity>
            <MaterialCommunityIcons
              name="microphone-outline"
              size={22}
              color="#E6732F"
            />
          </TouchableOpacity>
        </TouchableOpacity>

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

      {loading ? (
        <ActivityIndicator size="large" color="#FF6B35" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={{ marginTop: 40, alignItems: "center" }}>
          <MaterialCommunityIcons name="cloud-off-outline" size={60} color="#CCC" />
          <Text style={{ marginTop: 12, fontSize: 16, color: "#888", fontWeight: "600" }}>
            {error}
          </Text>
        </View>
      ) : (
        <RestaurantListScreen restaurants={restaurants} />
      )}
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