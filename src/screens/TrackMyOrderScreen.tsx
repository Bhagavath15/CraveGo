import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

type Restaurant = {
  id: string;
  name: string;
  rating: number;
  time: string;
  coords: [number, number];
};

const RESTAURANTS: Restaurant[] = [
  {
    id: "1",
    name: "Biryani House",
    rating: 4.5,
    time: "30-40 min",
    coords: [80.2707, 13.0827],
  },
  {
    id: "2",
    name: "Pizza Corner",
    rating: 4.2,
    time: "25-35 min",
    coords: [80.2810, 13.0750],
  },
  {
    id: "3",
    name: "Burger Spot",
    rating: 4.1,
    time: "20-30 min",
    coords: [80.2650, 13.0900],
  },
];

export default function TrackMyOrderScreen() {
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["30%", "60%"], []);

  const [selected, setSelected] = useState<Restaurant | null>(null);

  useEffect(() => {
    requestUserLocation();
  }, []);

  const requestUserLocation = async () => {
    if (Platform.OS !== "android") return;

    try {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
    } catch (e) {
      console.log(e);
    }
  };

  const selectRestaurant = (restaurant: Restaurant) => {
    setSelected(restaurant);

    mapRef.current?.animateToRegion(
      {
        latitude: restaurant.coords[1],
        longitude: restaurant.coords[0],
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      800
    );

    bottomSheetRef.current?.expand();
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        showsUserLocation
        showsMyLocationButton
        initialRegion={{
          latitude: 13.0827,
          longitude: 80.2707,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {RESTAURANTS.map((restaurant) => (
          <Marker
            key={restaurant.id}
            coordinate={{
              latitude: restaurant.coords[1],
              longitude: restaurant.coords[0],
            }}
            onPress={() => selectRestaurant(restaurant)}
          />
        ))}
      </MapView>

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.eta}>12 mins away</Text>
              <Text style={styles.statusText}>Arjun is picking up your order</Text>
            </View>
            <View style={styles.deliveryIcon}>
              <MaterialCommunityIcons name="motorbike" size={24} color="#ab3500" />
            </View>
          </View>

          <View style={styles.stepper}>
            <View style={styles.stepLine} />
            <View style={styles.step}>
              <View style={styles.stepDotActive}>
                <MaterialCommunityIcons name="check" size={16} color="#fff" />
              </View>
              <Text style={styles.stepLabel}>Confirmed</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepDotActive}>
                <MaterialCommunityIcons name="check" size={16} color="#fff" />
              </View>
              <Text style={styles.stepLabel}>Preparing</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepDotCurrent}>
                <View style={styles.stepPulse} />
              </View>
              <Text style={styles.stepLabelCurrent}>On the Way</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepDotInactive} />
              <Text style={styles.stepLabelInactive}>Delivered</Text>
            </View>
          </View>

          <View style={styles.riderCard}>
            <View style={styles.riderInfo}>
              <View style={styles.riderAvatar}>
                <MaterialCommunityIcons name="account-circle" size={32} color="#ab3500" />
              </View>
              <View>
                <Text style={styles.riderName}>Arjun K.</Text>
                <Text style={styles.riderRole}>Your delivery partner</Text>
              </View>
            </View>
            <View style={styles.riderActions}>
              <View style={styles.chatBtn}>
                <MaterialCommunityIcons name="message-text" size={20} color="#ab3500" />
              </View>
              <View style={styles.callBtn}>
                <MaterialCommunityIcons name="phone" size={20} color="#fff" />
              </View>
            </View>
          </View>

          <View style={styles.addressRow}>
            <View style={styles.addressIcon}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#ab3500" />
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>Delivery Address</Text>
              <Text style={styles.addressText}>Flat 402, Royal Residency, Indiranagar, Bangalore</Text>
            </View>
            <Text style={styles.editBtn}>Edit</Text>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  handleIndicator: {
    width: 48,
    height: 6,
    backgroundColor: '#e1bfb5',
    borderRadius: 3,
    opacity: 0.4,
  },

  sheetContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 48,
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },

  eta: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ff6b35',
    lineHeight: 32,
  },

  statusText: {
    fontSize: 14,
    color: '#594139',
    lineHeight: 20,
    marginTop: 2,
  },

  deliveryIcon: {
    backgroundColor: '#ff6b3510',
    padding: 12,
    borderRadius: 16,
  },

  stepper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    marginBottom: 40,
    position: 'relative',
  },

  stepLine: {
    position: 'absolute',
    top: 15,
    left: 16,
    right: 16,
    height: 4,
    backgroundColor: '#e5e2e1',
    borderRadius: 2,
  },

  step: {
    alignItems: 'center',
    gap: 8,
    zIndex: 1,
  },

  stepDotActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ab3500',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  stepDotCurrent: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ab3500',
    borderWidth: 4,
    borderColor: '#ffb59d',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  stepPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },

  stepDotInactive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e2e1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#594139',
    letterSpacing: 0.5,
    lineHeight: 16,
  },

  stepLabelCurrent: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ab3500',
    letterSpacing: 0.5,
    lineHeight: 16,
  },

  stepLabelInactive: {
    fontSize: 11,
    fontWeight: '500',
    color: '#594139',
    opacity: 0.5,
    letterSpacing: 0.5,
    lineHeight: 16,
  },

  riderCard: {
    backgroundColor: '#f6f3f2',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e1bfb515',
  },

  riderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  riderAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#ffdbd0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  riderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b1c1c',
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  riderRole: {
    fontSize: 14,
    color: '#594139',
    lineHeight: 20,
    marginTop: 2,
  },

  riderActions: {
    flexDirection: 'row',
    gap: 8,
  },

  chatBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1bfb510',
    alignItems: 'center',
    justifyContent: 'center',
  },

  callBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#ab3500',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },

  addressIcon: {
    backgroundColor: '#e5e2e1',
    padding: 8,
    borderRadius: 12,
    marginTop: 2,
  },

  addressInfo: {
    flex: 1,
  },

  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1b1c1c',
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  addressText: {
    fontSize: 14,
    color: '#594139',
    lineHeight: 20,
    marginTop: 2,
  },

  editBtn: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ab3500',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
});