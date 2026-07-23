
import { useState } from "react";
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
import { colors, spacing, typography, radius, shadows, sizes } from "../theme";

interface FoodFilter {
  id: string;
  label: string;
  image: any;
}

const foodFilters: FoodFilter[] = [
  {
    id: "1",
    label: "All",
    image: require("../assets/images/allFood.png"),
  },
  {
    id: "2",
    label: "Biryani",
    image: require("../assets/images/briyani.png"),
  },
  {
    id: "3",
    label: "South Indian",
    image: require("../assets/images/southIndian.png"),
  },
  {
    id: "4",
    label: "North Indian",
    image: require("../assets/images/northIndian.png"),
  },
  {
    id: "5",
    label: "Pizza",
    image: require("../assets/images/pizza.png"),
  },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  restaurants?: Restaurant[];
  loading?: boolean;
}

const RestaurantListScreen = ({ restaurants, loading }: Props) => {
  const navigation = useNavigation<NavigationProp>();
  const { favouriteIds } = useFavouriteIds();
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredRestaurants =
    selectedFilter === "All"
      ? restaurants
      : restaurants?.filter((r) => {
          const filterLower = selectedFilter.toLowerCase();
          const matchesCategory = r.category.some(
            (c) => c.toLowerCase() === filterLower,
          );
          const matchesMenuItem = r.menuItemNames?.some((name) =>
            name.toLowerCase().includes(filterLower),
          );
          return matchesCategory || matchesMenuItem;
        });

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
            <Skeleton width={50} height={14} style={{ marginTop: spacing.sm }} />
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
            <Skeleton width="90%" height={14} style={{ marginTop: spacing.sm }} />
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

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {foodFilters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={styles.itemContainer}
            onPress={() => setSelectedFilter(filter.label)}
          >
            <View
              style={[
                styles.imageContainer,
                selectedFilter === filter.label && styles.activeImageContainer,
              ]}
            >
              <Image source={filter.image} style={styles.categoryImage} />
            </View>

            <Text
              style={[
                styles.label,
                selectedFilter === filter.label && styles.activeLabel,
              ]}
            >
              {filter.label}
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

      {filteredRestaurants && filteredRestaurants.length > 0 ? (
        filteredRestaurants.map((item) => (
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
                  color={favouriteIds.has(item.id) ? colors.primary : colors.white}
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
                    color={colors.textMuted}
                  />
                  <Text style={styles.footerText}>
                    {item.distance}
                  </Text>
                </View>

                <View style={styles.footerItem}>
                  <MaterialCommunityIcons
                    name="clock-time-four-outline"
                    size={16}
                    color={colors.textMuted}
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
            color={colors.inactive}
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
    marginTop: spacing.lg,
  },

  heading: {
    fontSize: 22,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 18,
  },

  imageContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.inputBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.outlineLight,
  },

  activeImageContainer: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderWidth: 2,
    ...shadows.medium,
  },

  itemContainer: {
    alignItems: "center",
    marginRight: spacing.md,
  },

  label: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: typography.fontWeight.medium,
  },

  activeLabel: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
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
    fontWeight: typography.fontWeight.bold,
  },

  seeAll: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },

  restaurantCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    marginBottom: 18,
    overflow: "hidden",
    ...shadows.card,
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
    top: spacing.sm + spacing.xs,
    left: spacing.sm + spacing.xs,
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
    top: spacing.sm + spacing.xs,
    right: spacing.sm + spacing.xs,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    paddingHorizontal: 10,
    paddingVertical: 5,
    ...shadows.medium,
  },

  ratingText: {
    fontSize: 13,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },

  restaurantContent: {
    padding: 14,
  },

  restaurantName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },

  restaurantDescription: {
    color: colors.textMuted,
    marginTop: 5,
  },

  restaurantFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm + spacing.xs,
  },

  footerItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  footerText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.md,
    color: colors.textMuted,
    fontWeight: typography.fontWeight.semibold,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },

  emptyText: {
    marginTop: spacing.sm + spacing.xs,
    fontSize: typography.fontSize.lg,
    color: colors.textLight,
    fontWeight: typography.fontWeight.semibold,
  },
});