export type RootStackParamList = {
  OnBoarding: undefined;
  Login: undefined;
  Home: undefined;
  RestaurantDetail: {
    restaurantId: string;
  };
  CartCheckout: { restaurantId: string };
  OrderSuccess: { itemCount: number };
  TrackMyOrder: undefined;
};

export interface CustomizationOption {
    id: string;
    name: string;
    price: number;
}

export interface CustomizationGroup {
    id: string;
    title: string;
    options: CustomizationOption[];
    maxSelect?: number;
}