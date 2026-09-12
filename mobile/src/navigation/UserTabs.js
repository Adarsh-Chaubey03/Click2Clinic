import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

// User Screens
import HomeScreen from '../screens/home/HomeScreen';
import DoctorsScreen from '../screens/doctors/DoctorsScreen';
import DoctorDetailScreen from '../screens/doctors/DoctorDetailScreen';
import BookAppointmentScreen from '../screens/doctors/BookAppointmentScreen';
import StoreScreen from '../screens/store/StoreScreen';
import CartScreen from '../screens/store/CartScreen';
import CheckoutScreen from '../screens/store/CheckoutScreen';
import MyOrdersScreen from '../screens/store/MyOrdersScreen';
import LabSectionScreen from '../screens/lab/LabSectionScreen';
import MyLabAppointmentsScreen from '../screens/lab/MyLabAppointmentsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import MyAppointmentsScreen from '../screens/user/MyAppointmentsScreen';
import AiDetectionScreen from '../screens/ai/AiDetectionScreen';
import ChatbotScreen from '../screens/ai/ChatbotScreen';
import PaymentWebViewScreen from '../screens/payments/PaymentWebViewScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Home Stack
const HomeStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeMain" component={HomeScreen} />
        <Stack.Screen name="Chatbot" component={ChatbotScreen} />
        <Stack.Screen name="AiDetection" component={AiDetectionScreen} />
        <Stack.Screen name="PaymentWebView" component={PaymentWebViewScreen} />
    </Stack.Navigator>
);

// Doctors Stack
const DoctorsStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="DoctorsList" component={DoctorsScreen} />
        <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} />
        <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
        <Stack.Screen name="MyAppointments" component={MyAppointmentsScreen} />
        <Stack.Screen name="PaymentWebView" component={PaymentWebViewScreen} />
    </Stack.Navigator>
);

// Store Stack
const StoreStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="StoreMain" component={StoreScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
        <Stack.Screen name="PaymentWebView" component={PaymentWebViewScreen} />
    </Stack.Navigator>
);

// Lab Stack
const LabStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LabMain" component={LabSectionScreen} />
        <Stack.Screen name="MyLabAppointments" component={MyLabAppointmentsScreen} />
        <Stack.Screen name="PaymentWebView" component={PaymentWebViewScreen} />
    </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProfileMain" component={ProfileScreen} />
        <Stack.Screen name="MyAppointments" component={MyAppointmentsScreen} />
        <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
        <Stack.Screen name="MyLabAppointments" component={MyLabAppointmentsScreen} />
        <Stack.Screen name="AiDetection" component={AiDetectionScreen} />
        <Stack.Screen name="Chatbot" component={ChatbotScreen} />
        <Stack.Screen name="PaymentWebView" component={PaymentWebViewScreen} />
    </Stack.Navigator>
);

const UserTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarHideOnKeyboard: true,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    switch (route.name) {
                        case 'Home':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'Doctors':
                            iconName = focused ? 'medical' : 'medical-outline';
                            break;
                        case 'Store':
                            iconName = focused ? 'cart' : 'cart-outline';
                            break;
                        case 'Lab':
                            iconName = focused ? 'flask' : 'flask-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        default:
                            iconName = 'ellipse';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    paddingTop: 8,
                    paddingBottom: 22,
                    height: 84,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 4,
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeStack} />
            <Tab.Screen name="Doctors" component={DoctorsStack} />
            <Tab.Screen name="Store" component={StoreStack} />
            <Tab.Screen name="Lab" component={LabStack} />
            <Tab.Screen name="Profile" component={ProfileStack} />
        </Tab.Navigator>
    );
};

export default UserTabs;
