import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
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
import { getRestaurants } from "../api/restaurant";
import { getBanners, Banner } from "../api/banner";
import { setPendingCoupon } from "../utils/bannerCouponStore";
import { toImageUri } from "../utils/imageUtils";
import { Restaurant } from "../types/types";
import { useCart } from "../context/CartContext";
import Skeleton from "../components/Skeleton";
import { colors, spacing, typography, radius, shadows, sizes } from "../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_HEIGHT = 250;

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const cart = useCart();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = async () => {
    try {
      const [restRes, bannerRes] = await Promise.all([
        getRestaurants(),
        getBanners(),
      ]);

      if (bannerRes.success && bannerRes.data?.length) {
        setBanners(bannerRes.data);
      }

      if (restRes.success && restRes.restaurants?.length) {
        const mapped: Restaurant[] = restRes.restaurants.map((r: any) => ({
          id: r.restaurantId || r._id,
          name: r.name,
          image: toImageUri(r.image),
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
          menuItemNames: r.menuItemNames || [],
        }));
        setRestaurants(mapped);
      } else {
        setError(restRes.message || "Failed to load restaurants");
      }
    } catch (err) {
      setError("Network error. Check server connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length]);

  useEffect(() => {
    if (!scrollRef.current || banners.length <= 1) return;
    const offset = activeBannerIndex * (SCREEN_WIDTH - spacing.xl);
    scrollRef.current.scrollTo({ x: offset, animated: true });
  }, [activeBannerIndex, banners.length]);

  const handleBannerDot = (index: number) => {
    setActiveBannerIndex(index);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setActiveBannerIndex((prev) => (prev + 1) % banners.length);
      }, 4000);
    }
  };

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
            color={colors.primary}
          />
          <Text>Location</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("CartCheckout", { restaurantId: cart.restaurantId })}
          disabled={!cart.restaurantId || cart.itemCount === 0}
          style={styles.cartBtn}
        >
          <MaterialCommunityIcons
            name="cart-outline"
            size={26}
            color={!cart.restaurantId || cart.itemCount === 0 ? colors.inactive : colors.primary}
          />
          {cart.itemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.contentPadding}>
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() => navigation.navigate("SearchTab")}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color={colors.primary}
          />
          <Text style={styles.input}>Restaurants, dishes or cuisines</Text>
          <TouchableOpacity>
            <MaterialCommunityIcons
              name="microphone-outline"
              size={22}
              color={colors.primary}
            />
          </TouchableOpacity>
        </TouchableOpacity>

        {loading ? (
          <View style={[styles.bannerSkeleton, { width: SCREEN_WIDTH - spacing.xl }]}>
            <Skeleton width="100%" height={BANNER_HEIGHT} borderRadius={18} />
          </View>
        ) : banners.length > 0 ? (
          <View>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - spacing.xl));
                setActiveBannerIndex(idx);
              }}
            >
              {banners.map((banner, idx) => (
                <ImageBackground
                  key={banner._id}
                  source={
                    banner.image
                      ? { uri: banner.image }
                      : require("../assets/images/chickenBriyani.jpg")
                  }
                  style={[styles.banner, { width: SCREEN_WIDTH - spacing.xl }]}
                  imageStyle={styles.bannerImage}
                >
                  <View style={styles.bannerOverlay}>
                    {banner.badgeText ? (
                      <View style={styles.offerBadge}>
                        <Text style={styles.offerText}>{banner.badgeText}</Text>
                      </View>
                    ) : null}

                    {[banner.titleLine1, banner.titleLine2, banner.titleLine3].filter(Boolean).map((line, i) => (
                      <Text key={i} style={styles.bannerTitle}>{line}</Text>
                    ))}

                  {banner.buttonText ? (
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => {
                        if (banner.couponCode) setPendingCoupon(banner.couponCode);
                        navigation.navigate("SearchTab");
                      }}
                    >
                      <Text style={styles.buttonText}>{banner.buttonText}</Text>
                    </TouchableOpacity>
                  ) : null}
                  </View>
                </ImageBackground>
              ))}
            </ScrollView>

            {banners.length > 1 && (
              <View style={styles.dotsRow}>
                {banners.map((_, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleBannerDot(idx)}
                    style={[
                      styles.dot,
                      idx === activeBannerIndex && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : null}

        {error ? (
          <View style={{ marginTop: spacing.xl + spacing.sm, alignItems: "center" }}>
            <MaterialCommunityIcons name="cloud-off-outline" size={60} color={colors.inactive} />
            <Text style={{ marginTop: spacing.sm + spacing.xs, fontSize: typography.fontSize.lg, color: colors.textLight, fontWeight: typography.fontWeight.semibold }}>
              {error}
            </Text>
            <TouchableOpacity
              style={{ marginTop: spacing.md, backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: 10, borderRadius: radius.full }}
              onPress={() => { setLoading(true); setError(""); fetchData(); }}
            >
              <Text style={{ color: colors.white, fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.md }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <RestaurantListScreen restaurants={restaurants} loading={loading} />
        )}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm + spacing.xs,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  locationContent: {
    flexDirection: "row",
    gap: 5,
    flex: 1,
    alignItems: "center",
  },
  contentPadding: {
    padding: spacing.md,
  },

  searchContainer: {
    height: 55,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    ...shadows.medium,
  },

  input: {
    flex: 1,
    marginHorizontal: 10,
    color: colors.textPrimary,
  },

  banner: {
    marginTop: 18,
    height: BANNER_HEIGHT,
    padding: 18,
    justifyContent: "center",
  },

  bannerSkeleton: {
    marginTop: 18,
    alignSelf: "center",
  },

  bannerImage: {
    borderRadius: 18,
  },

  bannerOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.overlay,
    borderRadius: 18,
    padding: 18,
    margin: -18,
  },

  offerBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.success,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: spacing.xs,
    marginBottom: 10,
  },

  offerText: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.xs,
  },

  bannerTitle: {
    color: colors.white,
    fontWeight: typography.fontWeight.extrabold,
    fontSize: 28,
    lineHeight: 34,
  },

  button: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 15,
  },

  buttonText: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },

  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.sm + spacing.xs,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.xs,
    backgroundColor: colors.inactive,
  },

  dotActive: {
    backgroundColor: colors.primary,
    width: spacing.lg,
    borderRadius: radius.xs,
  },
  cartBtn: {
    position: "relative",
    padding: spacing.xs,
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xs,
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
});
