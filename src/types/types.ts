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
  OrderSuccess: {
    itemCount: number;
    orderId: string;
    orderNumber: string;
    restaurantName: string;
    totalPrice: number;
    items: { id: string; name: string; quantity: number; price?: number; totalPrice?: number }[];
  };
  TrackMyOrder: {
    orderId: string;
    orderNumber: string;
    restaurantName: string;
    totalPrice: number;
    items: { id: string; name: string; quantity: number; price?: number; totalPrice?: number }[];
  };
  DeliveryCompleted: {
    orderId?: string;
    restaurantName?: string;
    items?: string;
    totalPrice?: number;
    deliveredTime?: string;
    riderName?: string;
  };
  ReviewRating: {
    restaurantName: string;
    orderId: string;
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
  AddAddress: { addressId?: string } | undefined;
  AddressBook: undefined;
  PaymentMethods: undefined;
  Favorites: undefined;
  Notifications: undefined;
  HelpSupport: undefined;
  Receipt: { orderId: string };
};

export interface CustomizationOption {
    id: string;
    name: string;
    price: number;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image: any;
    isVeg: boolean;
    isBestseller?: boolean;
    customizable?: boolean;
    customizations?: CustomizationGroup[];
}

export interface MenuCategory {
    id: string;
    title: string;
    items: MenuItem[];
}

export interface Restaurant {
    id: string;
    name: string;
    image: any;
    description: string;
    category: string[];
    cuisines: string;
    address: string;
    rating: number;
    totalRatings: string;
    distance: string;
    deliveryTime: string;
    priceForOne: string;
    offer?: string;
    offerDescription?: string;
    isVeg: boolean;
    isFavorite: boolean;
    menu: MenuCategory[];
    restaurantId?: string;
    menuItemNames?: string[];
}

export interface CustomizationGroup {
    id: string;
    title: string;
    options: CustomizationOption[];
    maxSelect?: number;
}