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

const MyOrdersScreen = ({ navigation }) => {
    const { backendUrl, token } = useContext(AppContext);
    const razorpayKey = process.env.EXPO_PUBLIC_RAZORPAY_ID;
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [paymentLoadingId, setPaymentLoadingId] = useState(null);

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/userOrder`, {
                headers: { token }
            });
            if (data.success) {
                // Backend returns data.order (not data.orders)
                const sorted = (data.order || data.orders || []).sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
                setOrders(sorted);
            }
        } catch (error) {
            console.log('Error fetching orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCancelOrder = async (orderId) => {
        Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { data } = await axios.post(
                                `${backendUrl}/api/user/cancel-order`,
                                { orderId },
                                { headers: { token } }
                            );
                            if (data.success) {
                                fetchOrders();
                                Alert.alert('Success', 'Order cancelled');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to cancel order');
                        }
                    }
                }
            ]
        );
    };

    const handlePayOrder = async (orderId) => {
        if (!token) {
            Alert.alert('Login Required', 'Please log in to continue with payment.');
            return;
        }

        setPaymentLoadingId(orderId);
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/payment-orderRazorpay`,
                { orderId },
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
                    verifyEndpoint: '/api/user/verify-medOrderRazorpay',
                    token,
                    backendUrl,
                    title: 'Order Payment',
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

    const getStatusColor = (item) => {
        if (!item.orderPlaced) return colors.error;
        if (item.orderDelivered) return colors.success;
        if (item.paymentStatus) return colors.secondary;
        return colors.accent;
    };

    const getStatusLabel = (item) => {
        if (!item.orderPlaced) return 'Cancelled';
        if (item.orderDelivered) return 'Delivered';
        if (item.paymentStatus) return 'Paid';
        return 'Pending';
    };

    const getStatusIcon = (item) => {
        if (!item.orderPlaced) return 'close-circle';
        if (item.orderDelivered) return 'checkmark-circle';
        if (item.paymentStatus) return 'card';
        return 'timer';
    };

    const renderOrder = ({ item }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.orderItemName} numberOfLines={1}>
                        {item.medData?.name || 'Medicine'}
                    </Text>
                    <Text style={styles.orderDate}>
                        {item.orderDate || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                        }) : 'N/A')}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item) + '20' }]}>
                    <Ionicons name={getStatusIcon(item)} size={14} color={getStatusColor(item)} />
                    <Text style={[styles.statusText, { color: getStatusColor(item) }]}>
                        {getStatusLabel(item)}
                    </Text>
                </View>
            </View>

            <View style={styles.orderDetails}>
                <Text style={styles.orderDetailText}>
                    ₹{item.medData?.price} × {item.quantity || 1} = ₹{item.totalPrice || item.medData?.price}
                </Text>
                <Text style={styles.orderAddress} numberOfLines={1}>{item.address}</Text>
            </View>

            <View style={styles.orderFooter}>
                <Text style={styles.totalAmount}>₹{item.totalPrice || item.medData?.price}</Text>
                <View style={styles.actionRow}>
                    {item.orderPlaced && !item.paymentStatus && !item.orderDelivered && (
                        <TouchableOpacity
                            style={[styles.payButton, paymentLoadingId === item._id && styles.payButtonDisabled]}
                            onPress={() => handlePayOrder(item._id)}
                            disabled={paymentLoadingId === item._id}
                        >
                            {paymentLoadingId === item._id ? (
                                <ActivityIndicator color={colors.textWhite} />
                            ) : (
                                <Text style={styles.payButtonText}>Pay Online</Text>
                            )}
                        </TouchableOpacity>
                    )}
                    {item.orderPlaced && !item.orderDelivered && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => handleCancelOrder(item._id)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );

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
                <Text style={styles.headerTitle}>My Orders</Text>
                <View style={{ width: 40 }} />
            </View>

            {orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="receipt-outline" size={80} color={colors.border} />
                    <Text style={styles.emptyText}>No orders yet</Text>
                    <TouchableOpacity
                        style={styles.shopButton}
                        onPress={() => navigation.navigate('StoreMain')}
                    >
                        <Text style={styles.shopButtonText}>Start Shopping</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id}
                    renderItem={renderOrder}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); fetchOrders(); }}
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
    orderCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 14, elevation: 2 },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    orderItemName: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    orderDate: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
    orderDetails: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginBottom: 12 },
    orderDetailText: { fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
    orderAddress: { fontSize: 13, color: colors.textLight },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalAmount: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
    actionRow: { flexDirection: 'row', gap: 8 },
    payButton: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    payButtonDisabled: { opacity: 0.7 },
    payButtonText: { color: colors.textWhite, fontWeight: '600', fontSize: 13 },
    cancelButton: { backgroundColor: colors.error + '15', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    cancelButtonText: { color: colors.error, fontWeight: '600', fontSize: 13 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 16, color: colors.textSecondary, marginTop: 16, marginBottom: 24 },
    shopButton: { backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
    shopButtonText: { color: colors.textWhite, fontWeight: 'bold', fontSize: 16 },
});

export default MyOrdersScreen;
