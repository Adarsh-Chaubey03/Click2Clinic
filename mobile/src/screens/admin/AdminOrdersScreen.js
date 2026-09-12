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

const AdminOrdersScreen = ({ navigation }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async () => {
        try {
            const atoken = await AsyncStorage.getItem('adminToken');
            const { data } = await axios.get(`${BACKEND_URL}/api/order/all-order`, {
                headers: { atoken }
            });
            if (data.success) {
                setOrders(data.orders?.reverse() || []);
            }
        } catch (error) {
            console.log('Error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return colors.success;
            case 'Shipped': return colors.secondary;
            case 'Processing': return colors.accent;
            case 'Cancelled': return colors.error;
            default: return colors.textSecondary;
        }
    };

    const renderOrder = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.orderId}>#{item._id?.slice(-8).toUpperCase()}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.orderDelivered ? 'Delivered' : !item.orderPlaced ? 'Cancelled' : 'Processing') + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.orderDelivered ? 'Delivered' : !item.orderPlaced ? 'Cancelled' : 'Processing') }]}>
                        {item.orderDelivered ? 'Delivered' : !item.orderPlaced ? 'Cancelled' : item.paymentStatus ? 'Paid' : 'Pending'}
                    </Text>
                </View>
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.customerName}>{item.userData?.name || 'Customer'}</Text>
                <Text style={styles.itemCount}>{item.medData?.name || 'Medicine'} x{item.quantity || 1}</Text>
            </View>
            <View style={styles.cardFooter}>
                <Text style={styles.amount}>₹{item.totalPrice || item.medData?.price}</Text>
                <Text style={styles.date}>
                    {item.orderDate || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A')}
                </Text>
            </View>
        </View>
    );

    if (loading) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.secondary} /></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>All Orders</Text>
            </View>
            <FlatList
                data={orders}
                keyExtractor={(item) => item._id}
                renderItem={renderOrder}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} colors={[colors.secondary]} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="receipt-outline" size={60} color={colors.border} />
                        <Text style={styles.emptyText}>No orders yet</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary },
    listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
    card: { backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderId: { fontSize: 14, fontWeight: 'bold', color: colors.textPrimary },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: '600' },
    cardBody: { marginTop: 12 },
    customerName: { fontSize: 14, color: colors.textPrimary },
    itemCount: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
    amount: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
    date: { fontSize: 12, color: colors.textSecondary },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
    emptyText: { fontSize: 16, color: colors.textSecondary, marginTop: 16 },
});

export default AdminOrdersScreen;
