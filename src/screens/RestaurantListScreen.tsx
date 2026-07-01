import { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../types/types";
import { foodFilters, restaurantList } from "../data/restaurantData";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RestaurantListScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [selectedFilter, setSelectedFilter] = useState("All");

  const handleNavigate = (id: string) => {
    navigation.navigate("RestaurantDetail", {
      restaurantId: id,
    });
  };

  const filteredRestaurants = useMemo(() => {
    if (selectedFilter === "All") {
      return restaurantList;
    }

    return restaurantList.filter((restaurant) =>
      restaurant.category.includes(selectedFilter)
    );
  }, [selectedFilter]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>What's on your mind?</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {foodFilters.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            style={styles.itemContainer}
            onPress={() => setSelectedFilter(item.label)}
          >
            <View
              style={[
                styles.imageContainer,
                selectedFilter === item.label &&
                styles.activeImageContainer,
              ]}
            >
              <Image
                source={item.image}
                style={styles.categoryImage}
                resizeMode="contain"
              />
            </View>

            <Text
              style={[
                styles.label,
                selectedFilter === item.label &&
                styles.activeLabel,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.restaurantHeader}>
        <Text style={styles.restaurantHeading}>
          Popular Near You
        </Text>

        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {filteredRestaurants.length > 0 ? (
        filteredRestaurants.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            style={styles.restaurantCard}
            onPress={() => handleNavigate(item.id)}
          >
            <View style={styles.imageWrapper}>
              <Image
                source={item.image}
                style={styles.restaurantImage}
              />

              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>
                  ⭐ {item.rating}
                </Text>
              </View>
            </View>

            <View style={styles.restaurantContent}>
              <Text style={styles.restaurantName}>
                {item.name}
              </Text>

              <Text style={styles.restaurantDescription}>
                {item.description}
              </Text>

              <View style={styles.restaurantFooter}>
                <View style={styles.footerItem}>
                  <MaterialCommunityIcons
                    name="map-pin"
                    size={16}
                    color="#666"
                  />
                  <Text style={styles.footerText}>
                    {item.distance}
                  </Text>
                </View>

                <View style={styles.footerItem}>
                  <MaterialCommunityIcons
                    name="clock-time-four-outline"
                    size={16}
                    color="#666"
                  />
                  <Text style={styles.footerText}>
                    {item.deliveryTime}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="food-off"
            size={60}
            color="#CCC"
          />
          <Text style={styles.emptyText}>
            No restaurants found
          </Text>
        </View>
      )}
    </View>
  );
};

export default RestaurantListScreen;

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },

  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    marginBottom: 18,
  },

  imageContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F7F7F7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },

  activeImageContainer: {
    backgroundColor: "#FFF3EC",
    borderColor: "#FF6B35",
    borderWidth: 2,
    shadowColor: "#FF6B35",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 5,
  },

  itemContainer: {
    alignItems: "center",
    marginRight: 16,
  },

  label: {
    marginTop: 8,
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },

  activeLabel: {
    color: "#FF6B35",
    fontWeight: "700",
  },

  categoryImage: {
    width: 48,
    height: 48,
  },

  restaurantHeader: {
    marginTop: 30,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  restaurantHeading: {
    fontSize: 22,
    fontWeight: "700",
  },

  seeAll: {
    color: "#DE782A",
    fontWeight: "700",
  },

  restaurantCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    marginBottom: 18,
    overflow: "hidden",
    elevation: 3,
  },

  imageWrapper: {
    position: "relative",
  },

  restaurantImage: {
    width: "100%",
    height: 180,
  },

  ratingBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    elevation: 4,
  },

  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#222",
  },

  restaurantContent: {
    padding: 14,
  },

  restaurantName: {
    fontSize: 18,
    fontWeight: "700",
  },

  restaurantDescription: {
    color: "#666",
    marginTop: 5,
  },

  restaurantFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  footerItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  footerText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },

  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#888",
    fontWeight: "600",
  },
});