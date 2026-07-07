export type RootStackParamList = {
  OnBoarding: undefined;
  Login: undefined;
  Home: { screen?: string } | undefined;
  RestaurantDetail: {
    restaurantId: string;
  };
  CartCheckout: { restaurantId: string };
  OrderSuccess: { itemCount: number };
  TrackMyOrder: undefined;
  DeliveryCompleted: {
    restaurantName?: string;
    items?: string;
    totalPrice?: number;
    deliveredTime?: string;
    riderName?: string;
  };
  ReviewRating: {
    restaurantName: string;
    orderNumber: string;
    deliveredTime: string;
    items: { id: string; name: string; quantity: number }[];
    totalPrice: number;
  };
  SignUp: undefined;
  ProfileSetup: {
    fullName: string;
    email: string;
    phone: string;
  };
  ForgotPassword: undefined;
  EditProfile: undefined;
  AddressBook: undefined;
  PaymentMethods: undefined;
  Favorites: undefined;
  Notifications: undefined;
  HelpSupport: undefined;
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