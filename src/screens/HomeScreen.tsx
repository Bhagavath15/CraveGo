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
import { Restaurant } from "../data/restaurantData";
import Skeleton from "../components/Skeleton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_HEIGHT = 250;

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
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
    const offset = activeBannerIndex * (SCREEN_WIDTH - 32);
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
          onPress={() => navigation.navigate("SearchTab")}
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

        {loading ? (
          <View style={[styles.bannerSkeleton, { width: SCREEN_WIDTH - 32 }]}>
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
                const idx = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 32));
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
                  style={[styles.banner, { width: SCREEN_WIDTH - 32 }]}
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
          <View style={{ marginTop: 40, alignItems: "center" }}>
            <MaterialCommunityIcons name="cloud-off-outline" size={60} color="#CCC" />
            <Text style={{ marginTop: 12, fontSize: 16, color: "#888", fontWeight: "600" }}>
              {error}
            </Text>
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
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 18,
    padding: 18,
    margin: -18,
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

  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DDD",
  },

  dotActive: {
    backgroundColor: "#FF6B35",
    width: 24,
    borderRadius: 4,
  },
});
