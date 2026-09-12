import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const AppContext = createContext();

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.100:3000';

export const AppContextProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [userData, setUserData] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [labTests, setLabTests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const backendUrl = BACKEND_URL;

    // Load token from storage on app start
    useEffect(() => {
        const loadToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                if (storedToken) {
                    setToken(storedToken);
                }
            } catch (error) {
                console.log('Error loading token:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadToken();
    }, []);

    // Save token to storage when it changes
    useEffect(() => {
        const saveToken = async () => {
            try {
                if (token) {
                    await AsyncStorage.setItem('token', token);
                } else {
                    await AsyncStorage.removeItem('token');
                }
            } catch (error) {
                console.log('Error saving token:', error);
            }
        };
        saveToken();
    }, [token]);

    // Get user profile
    const getUserProfile = async () => {
        if (!token) return;
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, {
                headers: { token }
            });
            if (data.success) {
                setUserData(data.userData);
            }
        } catch (error) {
            console.log('Error fetching profile:', error);
        }
    };

    // Get doctors
    const getDoctorsData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
            if (data.success) {
                setDoctors(data.doctors);
            }
        } catch (error) {
            console.log('Error fetching doctors:', error);
        }
    };

    // Get medicines (no auth needed - fetch on mount like frontend)
    const getMedicineData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/medicine-list`);
            if (data.success) {
                setMedicines(Array.isArray(data.medicines) ? data.medicines : []);
            }
        } catch (error) {
            console.log('Error fetching medicines:', error);
        }
    };

    // Get lab tests
    const getLabData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/lab-data`);
            if (data.success) {
                setLabTests(Array.isArray(data.labData) ? data.labData : []);
            }
        } catch (error) {
            console.log('Error fetching lab tests:', error);
        }
    };

    // Logout
    const logout = async () => {
        setToken(null);
        setUserData(null);
        await AsyncStorage.removeItem('token');
    };

    // Fetch public data on mount (no auth needed)
    useEffect(() => {
        getDoctorsData();
        getMedicineData();
        getLabData();
    }, []);

    // Load auth-dependent data when token is available
    useEffect(() => {
        if (token) {
            getUserProfile();
        }
    }, [token]);

    const value = {
        token,
        setToken,
        userData,
        setUserData,
        doctors,
        medicines,
        labTests,
        backendUrl,
        isLoading,
        logout,
        getUserProfile,
        getDoctorsData,
        getMedicineData,
        getLabData,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
