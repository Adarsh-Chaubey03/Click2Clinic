import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { useCart } from '../../context/CartContext';
import colors from '../../theme/colors';

const CheckoutScreen = ({ navigation }) => {
    const { backendUrl, token, userData } = useContext(AppContext);
    const { cart, getCartTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState({
        fullName: userData?.name || '',
        phone: userData?.phone || '',
        street: '',
        city: '',
        state: '',
        pincode: '',
    });

    const getCurrentDateTime = () => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}`;
    };

    const handlePlaceOrder = async () => {
        if (!address.street || !address.city || !address.pincode) {
            Alert.alert('Error', 'Please fill in all address fields');
            return;
        }

        if (!address.phone || address.phone.length < 10) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return;
        }

        setLoading(true);
        try {
            const fullAddress = `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`;
            const orderDate = getCurrentDateTime();

            // Create orders for each item in cart (matching frontend behavior)
            const orderPromises = cart.map((item) => {
                const orderData = {
                    mg: item.category === 'tablet' || item.category === 'capsule' ? item.quantity : 0,
                    ml: item.category === 'syrup' ? item.quantity : 0,
                    quantity: item.quantity,
                    address: fullAddress,
                    phone: Number(address.phone),
                    medData: {
                        _id: item._id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        category: item.category,
                        available: item.available,
                    },
                    orderDate,
                };

                return axios.post(
                    `${backendUrl}/api/user/order`,
                    orderData,
                    { headers: { token, 'Content-Type': 'application/json' } }
                );
            });

            const results = await Promise.all(orderPromises);
            const successfulOrders = results.filter(r => r.data.success);
            const failedOrders = results.filter(r => !r.data.success);

            if (successfulOrders.length > 0) {
                clearCart();
                if (failedOrders.length > 0) {
                    Alert.alert(
                        'Partial Success',
                        `${successfulOrders.length} orders placed, ${failedOrders.length} failed.`,
                        [{ text: 'OK', onPress: () => navigation.navigate('MyOrders') }]
                    );
                } else {
                    Alert.alert(
                        'Order Placed!',
                        'All orders have been placed successfully',
                        [{ text: 'OK', onPress: () => navigation.navigate('MyOrders') }]
                    );
                }
            } else {
                Alert.alert('Error', 'Failed to place orders. Please try again.');
            }
        } catch (error) {
            console.log('Order error:', error);
            Alert.alert('Error', 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Address</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            value={address.fullName}
                            onChangeText={(text) => setAddress({ ...address, fullName: text })}
                            placeholder="Enter full name"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            value={address.phone}
                            onChangeText={(text) => setAddress({ ...address, phone: text })}
                            placeholder="Enter phone number"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Street Address</Text>
                        <TextInput
                            style={styles.input}
                            value={address.street}
                            onChangeText={(text) => setAddress({ ...address, street: text })}
                            placeholder="House no, Building, Street"
                            multiline
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                            <Text style={styles.label}>City</Text>
                            <TextInput
                                style={styles.input}
                                value={address.city}
                                onChangeText={(text) => setAddress({ ...address, city: text })}
                                placeholder="City"
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Pincode</Text>
                            <TextInput
                                style={styles.input}
                                value={address.pincode}
                                onChangeText={(text) => setAddress({ ...address, pincode: text })}
                                placeholder="Pincode"
                                keyboardType="number-pad"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>State</Text>
                        <TextInput
                            style={styles.input}
                            value={address.state}
                            onChangeText={(text) => setAddress({ ...address, state: text })}
                            placeholder="State"
                        />
                    </View>
                </View>

                <View style={styles.orderSummary}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    {cart.map((item) => (
                        <View key={item._id} style={styles.orderItem}>
                            <Text style={styles.orderItemName}>{item.name} x{item.quantity}</Text>
                            <Text style={styles.orderItemPrice}>₹{item.price * item.quantity}</Text>
                        </View>
                    ))}
                    <View style={styles.divider} />
                    <View style={styles.orderItem}>
                        <Text style={styles.orderItemName}>Subtotal</Text>
                        <Text style={styles.orderItemPrice}>₹{getCartTotal()}</Text>
                    </View>
                    <View style={styles.orderItem}>
                        <Text style={styles.orderItemName}>Delivery Fee</Text>
                        <Text style={styles.orderItemPrice}>₹50</Text>
                    </View>
                    <View style={[styles.orderItem, styles.totalItem]}>
                        <Text style={styles.totalText}>Total</Text>
                        <Text style={styles.totalPrice}>₹{getCartTotal() + 50}</Text>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.placeOrderButton, loading && styles.buttonDisabled]}
                    onPress={handlePlaceOrder}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.textWhite} />
                    ) : (
                        <>
                            <Text style={styles.placeOrderText}>Place Order</Text>
                            <Text style={styles.orderAmount}>₹{getCartTotal() + 50}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
    backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary },
    section: { paddingHorizontal: 20, marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 16 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
    input: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
    row: { flexDirection: 'row' },
    orderSummary: { backgroundColor: colors.surface, marginHorizontal: 20, borderRadius: 16, padding: 20 },
    orderItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    orderItemName: { fontSize: 14, color: colors.textSecondary },
    orderItemPrice: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
    totalItem: { marginTop: 8 },
    totalText: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    totalPrice: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface, padding: 20, borderTopWidth: 1, borderTopColor: colors.border },
    placeOrderButton: { flexDirection: 'row', backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    buttonDisabled: { opacity: 0.7 },
    placeOrderText: { color: colors.textWhite, fontSize: 16, fontWeight: 'bold' },
    orderAmount: { color: colors.textWhite, fontSize: 16, fontWeight: 'bold', marginLeft: 10, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.3)' },
});

export default CheckoutScreen;
