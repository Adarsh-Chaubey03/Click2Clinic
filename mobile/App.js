import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { AppContextProvider, AppContext } from './src/context/AppContext';
import { CartContextProvider } from './src/context/CartContext';

// Auth Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';

// Navigation
import UserTabs from './src/navigation/UserTabs';

// Admin Screens
import AdminLoginScreen from './src/screens/admin/AdminLoginScreen';
import AdminTabs from './src/navigation/AdminTabs';

// Doctor Screens
import DoctorLoginScreen from './src/screens/doctor/DoctorLoginScreen';
import DoctorTabs from './src/navigation/DoctorTabs';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
    <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
    <Stack.Screen name="DoctorLogin" component={DoctorLoginScreen} />
    <Stack.Screen name="AdminTabs" component={AdminTabs} />
    <Stack.Screen name="DoctorTabs" component={DoctorTabs} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { token, isLoading } = useContext(AppContext);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? <UserTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AppContextProvider>
      <CartContextProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </CartContextProvider>
    </AppContextProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
});
