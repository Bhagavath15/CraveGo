export type RootStackParamList = {
  OnBoarding: undefined;
  Login: undefined;
  SignUp: undefined;
  EmailOTPVerification: { email: string };
  ForgotPassword: undefined;
  ForgotPasswordOTP: { email: string };
  ResetPassword: { resetToken: string };
  Home: { screen?: string } | undefined;
  RestaurantDetail: { restaurantId: string; editItemId?: string };
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
  ProfileSetup: {
    fullName: string;
    email: string;
    phone: string;
  };
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