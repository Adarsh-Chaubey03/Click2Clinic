import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../theme/colors';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.100:4000';

const AdminAppointmentsScreen = ({ navigation }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAppointments = async () => {
        try {
            const token = await AsyncStorage.getItem('adminToken');
            const { data } = await axios.get(`${BACKEND_URL}/api/admin/appointments`, {
                headers: { atoken: token }
            });
            if (data.success) {
                setAppointments(data.appointments?.reverse() || []);
            }
        } catch (error) {
            console.log('Error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleCancel = async (appointmentId) => {
        Alert.alert('Cancel', 'Cancel this appointment?', [
            { text: 'No', style: 'cancel' },
            {
                text: 'Yes',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem('adminToken');
                        const { data } = await axios.post(`${BACKEND_URL}/api/admin/cancel-appointment`,
                            { appointmentId },
                            { headers: { atoken: token } }
                        );
                        if (data.success) {
                            fetchAppointments();
                            Alert.alert('Success', 'Appointment cancelled');
                        }
                    } catch (error) {
                        Alert.alert('Error', 'Failed to cancel');
                    }
                }
            }
        ]);
    };

    const renderAppointment = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{item.userData?.name || 'Patient'}</Text>
                    <Text style={styles.doctorName}>Dr. {item.docData?.name}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.cancelled ? colors.error + '20' : item.isCompleted ? colors.success + '20' : colors.accent + '20' }]}>
                    <Text style={[styles.statusText, { color: item.cancelled ? colors.error : item.isCompleted ? colors.success : colors.accent }]}>
                        {item.cancelled ? 'Cancelled' : item.isCompleted ? 'Completed' : 'Pending'}
                    </Text>
                </View>
            </View>
            <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>{item.slotDate?.replace(/_/g, '/')}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>{item.slotTime}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>₹{item.amount}</Text>
                </View>
            </View>
            {!item.cancelled && !item.isCompleted && (
                <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item._id)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.secondary} /></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>All Appointments</Text>
                <View style={{ width: 40 }} />
            </View>
            <FlatList
                data={appointments}
                keyExtractor={(item) => item._id}
                renderItem={renderAppointment}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAppointments(); }} colors={[colors.secondary]} />}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
    backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
    listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
    card: { backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    patientInfo: {},
    patientName: { fontSize: 15, fontWeight: 'bold', color: colors.textPrimary },
    doctorName: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: '600' },
    cardMeta: { flexDirection: 'row', marginTop: 14, gap: 16 },
    metaItem: { flexDirection: 'row', alignItems: 'center' },
    metaText: { fontSize: 12, color: colors.textSecondary, marginLeft: 4 },
    cancelBtn: { marginTop: 14, alignSelf: 'flex-end', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.error + '15', borderRadius: 8 },
    cancelText: { fontSize: 13, fontWeight: '600', color: colors.error },
});

export default AdminAppointmentsScreen;
