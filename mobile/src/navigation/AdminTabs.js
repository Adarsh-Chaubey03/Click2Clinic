import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import DoctorsListScreen from '../screens/admin/DoctorsListScreen';
import AdminAppointmentsScreen from '../screens/admin/AdminAppointmentsScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';
import AddDoctorScreen from '../screens/admin/AddDoctorScreen';
import AddMedicineScreen from '../screens/admin/AddMedicineScreen';
import AddLabScreen from '../screens/admin/AddLabScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DashboardStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="DashboardMain" component={AdminDashboardScreen} />
        <Stack.Screen name="AddDoctor" component={AddDoctorScreen} />
        <Stack.Screen name="AddMedicine" component={AddMedicineScreen} />
        <Stack.Screen name="AddLab" component={AddLabScreen} />
    </Stack.Navigator>
);

const DoctorsAdminStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="DoctorsListMain" component={DoctorsListScreen} />
        <Stack.Screen name="AddDoctor" component={AddDoctorScreen} />
    </Stack.Navigator>
);

const AdminTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    switch (route.name) {
                        case 'Dashboard':
                            iconName = focused ? 'grid' : 'grid-outline';
                            break;
                        case 'Doctors':
                            iconName = focused ? 'medical' : 'medical-outline';
                            break;
                        case 'Appointments':
                            iconName = focused ? 'calendar' : 'calendar-outline';
                            break;
                        case 'Orders':
                            iconName = focused ? 'receipt' : 'receipt-outline';
                            break;
                        default:
                            iconName = 'ellipse';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.secondary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    paddingTop: 8,
                    paddingBottom: 8,
                    height: 65,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 4,
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardStack} />
            <Tab.Screen name="Doctors" component={DoctorsAdminStack} />
            <Tab.Screen name="Appointments" component={AdminAppointmentsScreen} />
            <Tab.Screen name="Orders" component={AdminOrdersScreen} />
        </Tab.Navigator>
    );
};

export default AdminTabs;
