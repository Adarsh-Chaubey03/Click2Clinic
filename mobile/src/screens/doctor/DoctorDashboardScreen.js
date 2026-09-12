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
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../theme/colors';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.100:4000';

const DoctorDashboardScreen = ({ navigation }) => {
    const [dashboardData, setDashboardData] = useState({
        earnings: 0,
        appointments: 0,
        patients: 0,
    });
    const [profileData, setProfileData] = useState(null);
    const [latestAppointments, setLatestAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboard = async () => {
        try {
            const token = await AsyncStorage.getItem('doctorToken');
            const { data } = await axios.get(`${BACKEND_URL}/api/doctor/dashboard`, {
                headers: { dtoken: token }
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

    const fetchProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('doctorToken');
            const { data } = await axios.get(`${BACKEND_URL}/api/doctor/profile`, {
                headers: { dtoken: token }
            });
            if (data.success) {
                setProfileData(data.profileData);
            }
        } catch (error) {
            console.log('Profile error:', error);
        }
    };

    useEffect(() => {
        fetchDashboard();
        fetchProfile();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('doctorToken');
        navigation.replace('DoctorLogin');
    };

    const statCards = [
        { title: 'Earnings', value: `₹${dashboardData.earnings || 0}`, icon: 'cash', color: colors.success },
        { title: 'Appointments', value: dashboardData.appointments, icon: 'calendar', color: colors.primary },
        { title: 'Patients', value: dashboardData.patients, icon: 'people', color: colors.pink },
    ];

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
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
                        colors={[colors.primary]}
                    />
                }
            >
                <View style={styles.header}>
                    <View style={styles.profileSection}>
                        <Image
                            source={{ uri: profileData?.image || 'https://via.placeholder.com/60' }}
                            style={styles.profileImage}
                        />
                        <View style={styles.welcomeText}>
                            <Text style={styles.greeting}>Welcome back,</Text>
                            <Text style={styles.doctorName}>Dr. {profileData?.name || 'Doctor'}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color={colors.error} />
                    </TouchableOpacity>
                </View>

                <View style={styles.statsRow}>
                    {statCards.map((stat, index) => (
                        <View key={index} style={[styles.statCard, { backgroundColor: stat.color + '15' }]}>
                            <Ionicons name={stat.icon} size={24} color={stat.color} />
                            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                            <Text style={styles.statTitle}>{stat.title}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.menuGrid}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => navigation.navigate('DoctorAppointments')}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name="calendar" size={24} color={colors.primary} />
                            </View>
                            <Text style={styles.menuText}>Appointments</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => navigation.navigate('DoctorProfile')}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: colors.secondary + '15' }]}>
                                <Ionicons name="person" size={24} color={colors.secondary} />
                            </View>
                            <Text style={styles.menuText}>My Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Today's Appointments</Text>
                    {latestAppointments.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>No appointments for today</Text>
                        </View>
                    ) : (
                        latestAppointments.slice(0, 5).map((apt, index) => (
                            <View key={index} style={styles.appointmentCard}>
                                <View style={styles.aptIcon}>
                                    <Ionicons name="person" size={20} color={colors.primary} />
                                </View>
                                <View style={styles.aptInfo}>
                                    <Text style={styles.aptPatient}>{apt.userData?.name || 'Patient'}</Text>
                                    <Text style={styles.aptTime}>{apt.slotDate?.replace(/_/g, '/')} at {apt.slotTime}</Text>
                                </View>
                                <View style={[styles.aptStatus, { backgroundColor: apt.cancelled ? colors.error + '20' : apt.isCompleted ? colors.success + '20' : colors.accent + '20' }]}>
                                    <Text style={[styles.aptStatusText, { color: apt.cancelled ? colors.error : apt.isCompleted ? colors.success : colors.accent }]}>
                                        {apt.cancelled ? 'Cancelled' : apt.isCompleted ? 'Done' : 'Pending'}
                                    </Text>
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
    profileSection: { flexDirection: 'row', alignItems: 'center' },
    profileImage: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.tealLight },
    welcomeText: { marginLeft: 12 },
    greeting: { fontSize: 13, color: colors.textSecondary },
    doctorName: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
    logoutButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.error + '15', justifyContent: 'center', alignItems: 'center' },
    statsRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 20, gap: 10 },
    statCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: 'bold', marginTop: 8 },
    statTitle: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
    menuSection: { paddingHorizontal: 20, marginTop: 24 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 14 },
    menuGrid: { flexDirection: 'row', gap: 12 },
    menuItem: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 16, alignItems: 'center', elevation: 2 },
    menuIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    menuText: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
    section: { paddingHorizontal: 20, marginTop: 24 },
    emptyCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 20, alignItems: 'center' },
    emptyText: { fontSize: 14, color: colors.textSecondary },
    appointmentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
    aptIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.tealLight, justifyContent: 'center', alignItems: 'center' },
    aptInfo: { flex: 1, marginLeft: 12 },
    aptPatient: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
    aptTime: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    aptStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    aptStatusText: { fontSize: 11, fontWeight: '600' },
});

export default DoctorDashboardScreen;
