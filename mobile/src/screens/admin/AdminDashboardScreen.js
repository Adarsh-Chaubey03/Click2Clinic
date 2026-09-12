import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../theme/colors';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.100:4000';

const AdminDashboardScreen = ({ navigation }) => {
    const [dashboardData, setDashboardData] = useState({
        doctors: 0,
        patients: 0,
        appointments: 0,
        earnings: 0,
    });
    const [latestAppointments, setLatestAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboard = async () => {
        try {
            const token = await AsyncStorage.getItem('adminToken');
            const { data } = await axios.get(`${BACKEND_URL}/api/admin/dashboard`, {
                headers: { atoken: token }
            });
            if (data.success) {
                setDashboardData(data.dashData || {});
                setLatestAppointments(data.latestAppointments || []);
            }
        } catch (error) {
            console.log('Dashboard error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('adminToken');
        navigation.replace('AdminLogin');
    };

    const statCards = [
        { title: 'Doctors', value: dashboardData.doctors, icon: 'medical', color: colors.primary },
        { title: 'Patients', value: dashboardData.patients, icon: 'people', color: colors.secondary },
        { title: 'Appointments', value: dashboardData.appointments, icon: 'calendar', color: colors.pink },
        { title: 'Earnings', value: `₹${dashboardData.earnings || 0}`, icon: 'cash', color: colors.success },
    ];

    const menuItems = [
        { title: 'Manage Doctors', icon: 'medical-outline', screen: 'DoctorsList', color: colors.primary },
        { title: 'Add Doctor', icon: 'person-add-outline', screen: 'AddDoctor', color: colors.success },
        { title: 'Appointments', icon: 'calendar-outline', screen: 'AdminAppointments', color: colors.pink },
        { title: 'Add Medicine', icon: 'medkit-outline', screen: 'AddMedicine', color: colors.accent },
        { title: 'Orders', icon: 'receipt-outline', screen: 'AdminOrders', color: colors.secondary },
        { title: 'Add Lab Test', icon: 'flask-outline', screen: 'AddLab', color: colors.pink },
    ];

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); fetchDashboard(); }}
                        colors={[colors.secondary]}
                    />
                }
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>Admin Dashboard</Text>
                        <Text style={styles.subtitle}>Manage your platform</Text>
                    </View>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color={colors.error} />
                    </TouchableOpacity>
                </View>

                <View style={styles.statsGrid}>
                    {statCards.map((stat, index) => (
                        <View key={index} style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                                <Ionicons name={stat.icon} size={24} color={stat.color} />
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statTitle}>{stat.title}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.menuGrid}>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.menuItem}
                                onPress={() => navigation.navigate(item.screen)}
                            >
                                <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                                    <Ionicons name={item.icon} size={24} color={item.color} />
                                </View>
                                <Text style={styles.menuText}>{item.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Latest Appointments</Text>
                    {latestAppointments.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>No recent appointments</Text>
                        </View>
                    ) : (
                        latestAppointments.slice(0, 5).map((apt, index) => (
                            <View key={index} style={styles.appointmentCard}>
                                <View style={styles.aptInfo}>
                                    <Text style={styles.aptPatient}>{apt.userData?.name || 'Patient'}</Text>
                                    <Text style={styles.aptDoctor}>with Dr. {apt.docData?.name}</Text>
                                </View>
                                <View style={styles.aptMeta}>
                                    <Text style={styles.aptDate}>{apt.slotDate}</Text>
                                    <Text style={styles.aptTime}>{apt.slotTime}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
    welcomeText: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary },
    subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
    logoutButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.error + '15', justifyContent: 'center', alignItems: 'center' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, marginTop: 16 },
    statCard: { width: '46%', backgroundColor: colors.surface, borderRadius: 16, padding: 16, margin: '2%', elevation: 3, alignItems: 'center' },
    statIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    statValue: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary },
    statTitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
    section: { paddingHorizontal: 20, marginTop: 24 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 16 },
    menuGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
    menuItem: { width: '31%', backgroundColor: colors.surface, borderRadius: 14, padding: 14, margin: '1%', elevation: 2, alignItems: 'center' },
    menuIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    menuText: { fontSize: 11, fontWeight: '600', color: colors.textPrimary, textAlign: 'center' },
    emptyCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 24, alignItems: 'center' },
    emptyText: { fontSize: 14, color: colors.textSecondary },
    appointmentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
    aptInfo: { flex: 1 },
    aptPatient: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
    aptDoctor: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    aptMeta: { alignItems: 'flex-end' },
    aptDate: { fontSize: 12, color: colors.primary, fontWeight: '500' },
    aptTime: { fontSize: 11, color: colors.textSecondary },
});

export default AdminDashboardScreen;
