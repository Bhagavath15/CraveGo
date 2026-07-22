
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
import { Restaurant } from "../types/types";
import { imageSource } from "../utils/imageUtils";
import { useFavouriteIds, toggleFavourite } from "../context/FavoritesStore";
import Skeleton from "../components/Skeleton";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  restaurants?: Restaurant[];
  loading?: boolean;
}

const RestaurantListScreen = ({ restaurants, loading }: Props) => {
  const navigation = useNavigation<NavigationProp>();
  const { favouriteIds } = useFavouriteIds();

  const handleNavigate = (id: string) => {
    navigation.navigate("RestaurantDetail", { restaurantId: id });
  };

  const renderSkeleton = () => (
    <View style={styles.container}>
      <Text style={styles.heading}>What's on your mind?</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={styles.itemContainer}>
            <Skeleton width={72} height={72} borderRadius={36} />
            <Skeleton width={50} height={14} style={{ marginTop: 8 }} />
          </View>
        ))}
      </ScrollView>

      <View style={styles.restaurantHeader}>
        <Skeleton width="40%" height={22} />
        <Skeleton width={50} height={16} />
      </View>

      {Array.from({ length: 3 }).map((_, i) => (
        <View key={i} style={styles.restaurantCard}>
          <Skeleton width="100%" height={180} borderRadius={14} />
          <View style={styles.restaurantContent}>
            <Skeleton width="60%" height={20} />
            <Skeleton width="90%" height={14} style={{ marginTop: 8 }} />
            <View style={styles.restaurantFooter}>
              <Skeleton width="30%" height={14} />
              <Skeleton width="25%" height={14} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  if (loading) return renderSkeleton();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>What's on your mind?</Text>

      <View style={styles.restaurantHeader}>
        <Text style={styles.restaurantHeading}>
          Popular Near You
        </Text>

        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      {restaurants && restaurants.length > 0 ? (
        restaurants.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            style={styles.restaurantCard}
            onPress={() => handleNavigate(item.id)}
          >
            <View style={styles.imageWrapper}>
              <Image
                source={imageSource(item.image)}
                style={styles.restaurantImage}
              />

              <TouchableOpacity
                style={styles.favBtn}
                onPress={() => toggleFavourite(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons
                  name={favouriteIds.has(item.id) ? "heart" : "heart-outline"}
                  size={22}
                  color={favouriteIds.has(item.id) ? "#FF6B35" : "#FFF"}
                />
              </TouchableOpacity>

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
                    name="map-marker"
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
    width: 60,
    height: 60,
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

  favBtn: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
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