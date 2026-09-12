import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Image,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import colors from '../../theme/colors';

const MyAppointmentsScreen = ({ navigation }) => {
    const { backendUrl, token, doctors, getDoctorsData } = useContext(AppContext);
    const razorpayKey = process.env.EXPO_PUBLIC_RAZORPAY_ID;
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [paymentLoadingId, setPaymentLoadingId] = useState(null);

    const fetchAppointments = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
                headers: { token }
            });
            if (data.success) {
                setAppointments(data.appointments.reverse());
            }
        } catch (error) {
            console.log('Error fetching appointments:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Re-fetch appointments every time screen gains focus (e.g. after payment)
    useFocusEffect(
        useCallback(() => {
            if (token) {
                fetchAppointments();
                getDoctorsData();
            }
        }, [token])
    );

    const handleCancel = async (appointmentId) => {
        Alert.alert(
            'Cancel Appointment',
            'Are you sure you want to cancel this appointment?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { data } = await axios.post(
                                `${backendUrl}/api/user/cancel-appointment`,
                                { appointmentId },
                                { headers: { token } }
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
            ]
        );
    };

    const handlePayment = async (appointmentId) => {
        if (!token) {
            Alert.alert('Login Required', 'Please log in to continue with payment.');
            return;
        }

        setPaymentLoadingId(appointmentId);
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/payment-razorpay`,
                { appointmentId },
                { headers: { token } }
            );

            if (data.success) {
                if (!razorpayKey) {
                    Alert.alert('Payment Error', 'Missing Razorpay key. Set EXPO_PUBLIC_RAZORPAY_ID in your app env.');
                    return;
                }
                navigation.navigate('PaymentWebView', {
                    order: data.order,
                    razorpayKey,
                    verifyEndpoint: '/api/user/verify-razorpay',
                    token,
                    backendUrl,
                    title: 'Appointment Payment',
                });
            } else {
                Alert.alert('Error', data.message || 'Failed to initiate payment');
            }
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Failed to initiate payment';
            Alert.alert('Error', message);
        } finally {
            setPaymentLoadingId(null);
        }
    };

    const getStatusColor = (status) => {
        if (status === 'cancelled') return colors.error;
        if (status === 'completed') return colors.success;
        return colors.accent;
    };

    const renderAppointment = ({ item }) => {
        const docInfo = doctors.find(d => d._id === item.docId) || item.docData || {};

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Image
                        source={{ uri: docInfo.image || 'https://via.placeholder.com/60' }}
                        style={styles.doctorImage}
                    />
                    <View style={styles.doctorInfo}>
                        <Text style={styles.doctorName}>{docInfo.name || 'Doctor'}</Text>
                        <Text style={styles.speciality}>{docInfo.speciality}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.cancelled ? 'cancelled' : item.isCompleted ? 'completed' : 'pending') + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(item.cancelled ? 'cancelled' : item.isCompleted ? 'completed' : 'pending') }]}>
                                {item.cancelled ? 'Cancelled' : item.isCompleted ? 'Completed' : 'Pending'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.infoText}>{item.slotData?.replace(/_/g, '/')}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.infoText}>{item.slotTime}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.infoText}>₹{item.amount || docInfo.fees}</Text>
                    </View>
                </View>

                {!item.cancelled && !item.isCompleted && (
                    <View style={styles.cardActions}>
                        {!item.payment && (
                            <TouchableOpacity
                                style={[styles.payButton, paymentLoadingId === item._id && styles.payButtonDisabled]}
                                onPress={() => handlePayment(item._id)}
                                disabled={paymentLoadingId === item._id}
                            >
                                {paymentLoadingId === item._id ? (
                                    <ActivityIndicator color={colors.textWhite} />
                                ) : (
                                    <Text style={styles.payButtonText}>Pay Online</Text>
                                )}
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => handleCancel(item._id)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Appointments</Text>
                <View style={{ width: 40 }} />
            </View>

            {appointments.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="calendar-outline" size={80} color={colors.border} />
                    <Text style={styles.emptyText}>No appointments yet</Text>
                    <TouchableOpacity
                        style={styles.bookButton}
                        onPress={() => navigation.navigate('Doctors')}
                    >
                        <Text style={styles.bookButtonText}>Book Now</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={appointments}
                    keyExtractor={(item) => item._id}
                    renderItem={renderAppointment}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); fetchAppointments(); }}
                            colors={[colors.primary]}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
    backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary },
    listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
    card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3 },
    cardHeader: { flexDirection: 'row', marginBottom: 16 },
    doctorImage: { width: 60, height: 60, borderRadius: 12, backgroundColor: colors.tealLight },
    doctorInfo: { flex: 1, marginLeft: 12 },
    doctorName: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    speciality: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 6 },
    statusText: { fontSize: 12, fontWeight: '600' },
    cardBody: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    infoText: { fontSize: 14, color: colors.textSecondary, marginLeft: 8 },
    cardActions: { flexDirection: 'row', marginTop: 16, gap: 12 },
    payButton: { flex: 1, backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    payButtonDisabled: { opacity: 0.7 },
    payButtonText: { color: colors.textWhite, fontWeight: 'bold', fontSize: 14 },
    cancelButton: { flex: 1, backgroundColor: colors.error + '15', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    cancelButtonText: { color: colors.error, fontWeight: 'bold', fontSize: 14 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 16, color: colors.textSecondary, marginTop: 16, marginBottom: 24 },
    bookButton: { backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
    bookButtonText: { color: colors.textWhite, fontWeight: 'bold', fontSize: 16 },
});

export default MyAppointmentsScreen;
