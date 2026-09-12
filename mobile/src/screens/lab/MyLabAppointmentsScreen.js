import React, { useState, useContext, useEffect } from 'react';
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
import { AppContext } from '../../context/AppContext';
import colors from '../../theme/colors';

const MyLabAppointmentsScreen = ({ navigation }) => {
    const { backendUrl, token } = useContext(AppContext);
    const razorpayKey = process.env.EXPO_PUBLIC_RAZORPAY_ID;
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [paymentLoadingId, setPaymentLoadingId] = useState(null);

    const fetchAppointments = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/lab-appointments`, {
                headers: { token }
            });
            if (data.success) {
                setAppointments(data.appointments?.reverse() || []);
            }
        } catch (error) {
            console.log('Error fetching lab appointments:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleCancel = async (appointmentId) => {
        Alert.alert(
            'Cancel Appointment',
            'Are you sure you want to cancel this lab appointment?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { data } = await axios.post(
                                `${backendUrl}/api/user/cancellab-appointment`,
                                { labId: appointmentId },
                                { headers: { token } }
                            );
                            if (data.success) {
                                fetchAppointments();
                                Alert.alert('Success', 'Lab appointment cancelled');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to cancel');
                        }
                    }
                }
            ]
        );
    };

    const handlePayment = async (labId) => {
        if (!token) {
            Alert.alert('Login Required', 'Please log in to continue with payment.');
            return;
        }

        setPaymentLoadingId(labId);
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/paymentlab-razorpay`,
                { labId },
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
                    verifyEndpoint: '/api/user/verifylab-razorpay',
                    token,
                    backendUrl,
                    title: 'Lab Appointment Payment',
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
        if (status === 'sample_collected') return colors.secondary;
        return colors.accent;
    };

    const renderAppointment = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.testIconContainer}>
                    <Ionicons name="flask" size={24} color={colors.pink} />
                </View>
                <View style={styles.testInfo}>
                    <Text style={styles.testName} numberOfLines={1} ellipsizeMode="tail">
                        {item.labData?.testname || 'Lab Test'}
                    </Text>
                    <Text style={styles.testCategory} numberOfLines={1} ellipsizeMode="tail">
                        {item.labData?.category || 'General'}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.cancelled ? 'cancelled' : item.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.cancelled ? 'cancelled' : item.status) }]}>
                            {item.cancelled ? 'Cancelled' : item.status || 'Pending'}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.infoText}>
                        {item.date ? new Date(item.date).toLocaleDateString() : 'Date pending'}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.infoText}>₹{item.amount || item.labData?.price}</Text>
                </View>
            </View>

            {!item.cancelled && item.status !== 'completed' && (
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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.pink} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Lab Appointments</Text>
                <View style={{ width: 40 }} />
            </View>

            {appointments.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="flask-outline" size={80} color={colors.border} />
                    <Text style={styles.emptyText}>No lab appointments yet</Text>
                    <TouchableOpacity
                        style={styles.bookButton}
                        onPress={() => navigation.navigate('Lab')}
                    >
                        <Text style={styles.bookButtonText}>Book Lab Test</Text>
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
                            colors={[colors.pink]}
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
    listContainer: { paddingHorizontal: 20, paddingBottom: 96 },
    card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3 },
    cardHeader: { flexDirection: 'row', marginBottom: 16 },
    testIconContainer: { width: 52, height: 52, borderRadius: 14, backgroundColor: colors.pink + '15', justifyContent: 'center', alignItems: 'center' },
    testInfo: { flex: 1, marginLeft: 12, minWidth: 0 },
    testName: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    testCategory: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 6 },
    statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
    cardBody: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    infoText: { fontSize: 14, color: colors.textSecondary, marginLeft: 8 },
    cardActions: { flexDirection: 'row', marginTop: 16, gap: 12 },
    payButton: { flex: 1, backgroundColor: colors.pink, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    payButtonDisabled: { opacity: 0.7 },
    payButtonText: { color: colors.textWhite, fontWeight: 'bold', fontSize: 14 },
    cancelButton: { flex: 1, backgroundColor: colors.error + '15', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    cancelButtonText: { color: colors.error, fontWeight: 'bold', fontSize: 14 },
    paidBadge: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.success + '15', paddingVertical: 12, borderRadius: 10 },
    paidText: { color: colors.success, fontWeight: 'bold', fontSize: 14, marginLeft: 6 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 16, color: colors.textSecondary, marginTop: 16, marginBottom: 24 },
    bookButton: { backgroundColor: colors.pink, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
    bookButtonText: { color: colors.textWhite, fontWeight: 'bold', fontSize: 16 },
});

export default MyLabAppointmentsScreen;
