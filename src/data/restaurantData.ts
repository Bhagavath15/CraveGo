import { CustomizationGroup } from "../types/types";

export interface FoodFilter {
    id: string;
    label: string;
    image: any;
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
}

export const foodFilters: FoodFilter[] = [
    {
        id: "1",
        label: "All",
        image: require("../assets/images/allFood.png"),
    },
    {
        id: "2",
        label: "Briyani",
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

export const restaurantList: Restaurant[] = [
    {
        id: "1",
        name: "Madurai Meals",
        image: require("../assets/images/chickenBriyani.jpg"),
        description: "Authentic South Indian & Biryani",
        category: ["South Indian", "Briyani"],
        cuisines: "South Indian, Biryani",
        address: "Anna Nagar, Madurai",
        rating: 4.7,
        totalRatings: "12K+",
        distance: "2.3 km",
        deliveryTime: "25 mins",
        priceForOne: "₹250 for one",
        offer: "50% OFF up to ₹100",
        offerDescription: "Use CRAVE100 | Above ₹299",
        isVeg: false,
        isFavorite: false,
        menu: [
            {
                id: "1",
                title: "Recommended",
                items: [
                    {
                        id: "101",
                        name: "Chicken Biryani",
                        description: "Serves 1 • Dum cooked chicken biryani with aromatic spices",
                        price: 249,
                        image: require("../assets/images/chickenBriyani.jpg"),
                        isVeg: false,
                        isBestseller: true,
                        customizable: true,
                    },
                    {
                        id: "102",
                        name: "Mutton Biryani",
                        description: "Authentic Seeraga Samba biryani with tender mutton",
                        price: 329,
                        image: require("../assets/images/chickenBriyani.jpg"),
                        isVeg: false,
                        isBestseller: true,
                    },
                    {
                        id: "103",
                        name: "South Indian Meals",
                        description: "Unlimited meals with 14 varieties including sambar, rasam & more",
                        price: 180,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                    },
                    {
                        id: "104",
                        name: "Mini Meals",
                        description: "Rice, Sambar, Rasam & Poriyal — perfect light lunch",
                        price: 120,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                    },
                ],
            },
            {
                id: "2",
                title: "Breakfast Specials",
                items: [
                    {
                        id: "201",
                        name: "Ghee Roast Dosa",
                        description: "Ultra-thin crispy crepe roasted with pure cow ghee. Served with aromatic sambar.",
                        price: 120,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                        isBestseller: true,
                        customizable: true,
                    },
                    {
                        id: "202",
                        name: "Medu Vada (2 Pcs)",
                        description: "Crispy deep-fried savory lentil donuts with a soft center. Tempered with peppercorns.",
                        price: 90,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                    },
                    {
                        id: "203",
                        name: "Mini Tiffin Combo",
                        description: "Mini Idli (6), Mini Dosa, Vada, and Sweet Pongal.",
                        price: 180,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                    },
                    {
                        id: "204",
                        name: "Mysore Masala Dosa",
                        description: "Spicy red garlic chutney spread inside with potato mash filling.",
                        price: 145,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                    },
                ],
            },
            {
                id: "3",
                title: "Rice Varieties",
                items: [
                    {
                        id: "301",
                        name: "Curd Rice",
                        description: "Classic comfort food tempered with mustard and chillies.",
                        price: 110,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                    },
                    {
                        id: "302",
                        name: "Bisi Bele Bath",
                        description: "Traditional Karnataka style hot lentil rice.",
                        price: 140,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                    },
                    {
                        id: "303",
                        name: "Lemon Rice",
                        description: "Tangy tempered rice with peanuts, curry leaves & turmeric.",
                        price: 100,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                    },
                ],
            },
            {
                id: "4",
                title: "Starters",
                items: [
                    {
                        id: "401",
                        name: "Chicken 65",
                        description: "Spicy deep-fried chicken with curry leaves & raita dip.",
                        price: 220,
                        image: require("../assets/images/chickenBriyani.jpg"),
                        isVeg: false,
                        isBestseller: true,
                    },
                    {
                        id: "402",
                        name: "Gobi Manchurian",
                        description: "Crispy cauliflower tossed in spicy soy-garlic sauce.",
                        price: 160,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                    },
                ],
            },
        ],
    },

    {
        id: "2",
        name: "Pizza Hub",
        image: require("../assets/images/pizza.png"),
        description: "Italian Pizza & Garlic Bread",
        category: ["Pizza"],
        cuisines: "Pizza, Italian",
        address: "KK Nagar, Madurai",
        rating: 4.5,
        totalRatings: "8K+",
        distance: "1.8 km",
        deliveryTime: "30 mins",
        priceForOne: "₹350 for one",
        offer: "Free Delivery",
        offerDescription: "No delivery charges",
        isVeg: true,
        isFavorite: true,
        menu: [
            {
                id: "1",
                title: "Recommended",
                items: [
                    {
                        id: "201",
                        name: "Margherita Pizza",
                        description: "Classic cheese pizza with mozzarella and basil on thin crust.",
                        price: 249,
                        image: require("../assets/images/pizza.png"),
                        isVeg: true,
                        isBestseller: true,
                        customizable: true,
                    },
                    {
                        id: "202",
                        name: "Farmhouse Pizza",
                        description: "Loaded with bell peppers, onions, sweet corn & olives.",
                        price: 399,
                        image: require("../assets/images/pizza.png"),
                        isVeg: true,
                    },
                    {
                        id: "203",
                        name: "Pepperoni Pizza",
                        description: "Classic pepperoni with melted mozzarella cheese.",
                        price: 349,
                        image: require("../assets/images/pizza.png"),
                        isVeg: false,
                        isBestseller: true,
                    },
                    {
                        id: "204",
                        name: "BBQ Chicken Pizza",
                        description: "Tangy BBQ sauce base with grilled chicken chunks.",
                        price: 429,
                        image: require("../assets/images/pizza.png"),
                        isVeg: false,
                    },
                ],
            },
            {
                id: "2",
                title: "Garlic Bread",
                items: [
                    {
                        id: "205",
                        name: "Cheese Garlic Bread",
                        description: "Freshly baked baguette stuffed with mozzarella cheese.",
                        price: 179,
                        image: require("../assets/images/pizza.png"),
                        isVeg: true,
                        isBestseller: true,
                    },
                    {
                        id: "206",
                        name: "Garlic Breadsticks (4 Pcs)",
                        description: "Crispy breadsticks brushed with herbed garlic butter.",
                        price: 139,
                        image: require("../assets/images/pizza.png"),
                        isVeg: true,
                    },
                    {
                        id: "207",
                        name: "Chicken Garlic Bread",
                        description: "Loaded with shredded chicken and cheese.",
                        price: 219,
                        image: require("../assets/images/pizza.png"),
                        isVeg: false,
                    },
                ],
            },
            {
                id: "3",
                title: "Pasta",
                items: [
                    {
                        id: "208",
                        name: "White Sauce Pasta",
                        description: "Creamy Alfredo pasta with mixed vegetables.",
                        price: 229,
                        image: require("../assets/images/pizza.png"),
                        isVeg: true,
                    },
                    {
                        id: "209",
                        name: "Red Sauce Pasta",
                        description: "Tangy Arrabbiata pasta with basil & garlic.",
                        price: 219,
                        image: require("../assets/images/pizza.png"),
                        isVeg: true,
                    },
                ],
            },
            {
                id: "4",
                title: "Beverages",
                items: [
                    {
                        id: "210",
                        name: "Pepsi (500ml)",
                        description: "Chilled Pepsi — the perfect pizza partner.",
                        price: 49,
                        image: require("../assets/images/pizza.png"),
                        isVeg: true,
                    },
                    {
                        id: "211",
                        name: "Blueberry Lemonade",
                        description: "Refreshing blueberry lemonade with mint.",
                        price: 99,
                        image: require("../assets/images/pizza.png"),
                        isVeg: true,
                    },
                ],
            },
        ],
    },

    {
        id: "3",
        name: "A2B",
        image: require("../assets/images/southIndian.png"),
        description: "South Indian Breakfast & Meals",
        category: ["South Indian"],
        cuisines: "South Indian",
        address: "Bypass Road, Madurai",
        rating: 4.6,
        totalRatings: "15K+",
        distance: "1.2 km",
        deliveryTime: "20 mins",
        priceForOne: "₹180 for one",
        offer: "20% OFF",
        offerDescription: "Applicable on selected items",
        isVeg: true,
        isFavorite: false,
        menu: [
            {
                id: "1",
                title: "Recommended",
                items: [
                    {
                        id: "301",
                        name: "Masala Dosa",
                        description: "Crispy golden dosa with spiced potato filling & sambar.",
                        price: 95,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                        isBestseller: true,
                        customizable: true,
                    },
                    {
                        id: "302",
                        name: "Idli (4 Pcs)",
                        description: "Soft steamed rice idlis served with sambar & chutney.",
                        price: 50,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                    },
                    {
                        id: "303",
                        name: "Medu Vada (3 Pcs)",
                        description: "Crispy lentil donuts with a soft fluffy center.",
                        price: 65,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                        isBestseller: true,
                    },
                ],
            },
            {
                id: "2",
                title: "Tiffin Specials",
                items: [
                    {
                        id: "304",
                        name: "Mini Tiffin Combo",
                        description: "Mini Idli (6), Mini Dosa, Vada & Sweet Pongal.",
                        price: 180,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                    },
                    {
                        id: "305",
                        name: "Rava Dosa",
                        description: "Crispy semolina dosa with onions & green chillies.",
                        price: 110,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                    },
                    {
                        id: "306",
                        name: "Paper Dosa",
                        description: "Extra large, ultra-thin crispy dosa.",
                        price: 130,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                        isBestseller: true,
                    },
                    {
                        id: "307",
                        name: "Uttapam",
                        description: "Thick rice pancake topped with onions, tomatoes & chillies.",
                        price: 85,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                    },
                ],
            },
            {
                id: "3",
                title: "Rice Items",
                items: [
                    {
                        id: "308",
                        name: "South Indian Meals",
                        description: "Unlimited rice with sambar, rasam, poriyal, kootu & curd.",
                        price: 180,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                        isBestseller: true,
                    },
                    {
                        id: "309",
                        name: "Lemon Rice",
                        description: "Tangy tempered rice with peanuts & curry leaves.",
                        price: 90,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                    },
                    {
                        id: "310",
                        name: "Curd Rice",
                        description: "Classic comfort rice tempered with mustard & green chillies.",
                        price: 80,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                    },
                    {
                        id: "311",
                        name: "Bisi Bele Bath",
                        description: "Traditional Karnataka style hot lentil rice with vegetables.",
                        price: 120,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                    },
                ],
            },
            {
                id: "4",
                title: "Sweets",
                items: [
                    {
                        id: "312",
                        name: "Gulab Jamun (2 Pcs)",
                        description: "Soft milk dumplings soaked in rose sugar syrup.",
                        price: 45,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                    },
                    {
                        id: "313",
                        name: "Rava Kesari",
                        description: "Rich semolina dessert with saffron & dry fruits.",
                        price: 55,
                        image: require("../assets/images/southIndian.png"),
                        isVeg: true,
                    },
                ],
            },
        ],
    },

    {
        id: "4",
        name: "Delhi Darbar",
        image: require("../assets/images/northIndian.png"),
        description: "North Indian, Mughlai & Tandoori",
        category: ["North Indian"],
        cuisines: "North Indian, Mughlai",
        address: "Mattuthavani, Madurai",
        rating: 4.8,
        totalRatings: "10K+",
        distance: "3 km",
        deliveryTime: "32 mins",
        priceForOne: "₹300 for one",
        offer: "₹125 OFF",
        offerDescription: "Use SAVE125",
        isVeg: false,
        isFavorite: true,
        menu: [
            {
                id: "1",
                title: "Recommended",
                items: [
                    {
                        id: "401",
                        name: "Butter Chicken",
                        description: "Tender chicken in rich creamy tomato gravy with butter finish.",
                        price: 320,
                        image: require("../assets/images/northIndian.png"),
                        isVeg: false,
                        isBestseller: true,
                        customizable: true,
                    },
                    {
                        id: "402",
                        name: "Chicken Biryani",
                        description: "Aromatic dum cooked biryani with tender chicken & saffron.",
                        price: 280,
                        image: require("../assets/images/northIndian.png"),
                        isVeg: false,
                        isBestseller: true,
                    },
                    {
                        id: "403",
                        name: "Dal Makhani",
                        description: "Slow-cooked black lentils in rich buttery gravy.",
                        price: 210,
                        image: require("../assets/images/northIndian.png"),
                        isVeg: true,
                    },
                    {
                        id: "404",
                        name: "Paneer Butter Masala",
                        description: "Soft paneer cubes in rich creamy tomato gravy.",
                        price: 240,
                        image: require("../assets/images/northIndian.png"),
                        isVeg: true,
                    },
                ],
            },
            {
                id: "2",
                title: "Tandoori Specials",
                items: [
                    {
                        id: "405",
                        name: "Tandoori Chicken (Half)",
                        description: "Chicken marinated in yogurt & spices, cooked in clay oven.",
                        price: 260,
                        image: require("../assets/images/northIndian.png"),
                        isVeg: false,
                        isBestseller: true,
                    },
                    {
                        id: "406",
                        name: "Seekh Kebab (6 Pcs)",
                        description: "Minced lamb skewers with herbs & spices.",
                        price: 290,
                        image: require("../assets/images/northIndian.png"),
                        isVeg: false,
                    },
                    {
                        id: "407",
                        name: "Paneer Tikka",
                        description: "Chargrilled paneer with bell peppers & onion.",
                        price: 220,
                        image: require("../assets/images/northIndian.png"),
                        isVeg: true,
                    },
                ],
            },
            {
                id: "3",
                title: "Breads",
                items: [
                    {
                        id: "408",
                        name: "Butter Naan",
                        description: "Soft leavened bread brushed with melted butter.",
                        price: 45,
                        image: require("../assets/images/northIndian.png"),
                        isVeg: true,
                    },
                    {
                        id: "409",
                        name: "Garlic Naan",
                        description: "Naan topped with garlic, butter & coriander.",
                        price: 55,
                        image: require("../assets/images/northIndian.png"),
                        isVeg: true,
                    },
                    {
                        id: "410",
                        name: "Tandoori Roti",
                        description: "Whole wheat bread baked in tandoor.",
                        price: 35,
                        image: require("../assets/images/northIndian.png"),
                        isVeg: true,
                    },
                    {
                        id: "411",
                        name: "Lachha Paratha",
                        description: "Flaky multi-layer whole wheat paratha.",
                        price: 50,
                        image: require("../assets/images/northIndian.png"),
                        isVeg: true,
                    },
                ],
            },
            {
                id: "4",
                title: "Beverages",
                items: [
                    {
                        id: "412",
                        name: "Masala Chai",
                        description: "Spiced Indian tea brewed with ginger & cardamom.",
                        price: 35,
                        image: require("../assets/images/northIndian.png"),
                        isVeg: true,
                    },
                    {
                        id: "413",
                        name: "Sweet Lassi",
                        description: "Thick chilled yogurt drink with cardamom.",
                        price: 75,
                        image: require("../assets/images/northIndian.png"),
                        isVeg: true,
                    },
                    {
                        id: "414",
                        name: "Mango Lassi",
                        description: "Creamy yogurt blended with Alphonso mango pulp.",
                        price: 95,
                        image: require("../assets/images/northIndian.png"),
                        isVeg: true,
                        isBestseller: true,
                    },
                ],
            },
        ],
    },
];

