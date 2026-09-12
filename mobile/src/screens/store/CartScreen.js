import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import colors from '../../theme/colors';

const CartScreen = ({ navigation }) => {
    const { cart, updateQuantity, removeFromCart, getCartTotal, getCartCount } = useCart();

    const renderCartItem = ({ item }) => (
        <View style={styles.cartItem}>
            <Image
                source={{ uri: item.image || 'https://via.placeholder.com/80' }}
                style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
                <View style={styles.quantityRow}>
                    <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => updateQuantity(item._id, item.quantity - 1)}
                    >
                        <Ionicons name="remove" size={18} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                        <Ionicons name="add" size={18} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.itemActions}>
                <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
                <TouchableOpacity onPress={() => removeFromCart(item._id)}>
                    <Ionicons name="trash-outline" size={22} color={colors.error} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Cart ({getCartCount()})</Text>
                <View style={{ width: 40 }} />
            </View>

            {cart.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={80} color={colors.border} />
                    <Text style={styles.emptyText}>Your cart is empty</Text>
                    <TouchableOpacity
                        style={styles.shopButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.shopButtonText}>Browse Medicines</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={cart}
                        keyExtractor={(item) => item._id}
                        renderItem={renderCartItem}
                        contentContainerStyle={styles.listContainer}
                    />

                    <View style={styles.summarySection}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>₹{getCartTotal()}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery</Text>
                            <Text style={styles.summaryValue}>₹50</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>₹{getCartTotal() + 50}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.checkoutButton}
                            onPress={() => navigation.navigate('Checkout')}
                        >
                            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                            <Ionicons name="arrow-forward" size={20} color={colors.textWhite} />
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
    backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary },
    listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
    cartItem: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 14, padding: 12, marginBottom: 12, elevation: 2 },
    itemImage: { width: 80, height: 80, borderRadius: 10, backgroundColor: colors.borderLight },
    itemInfo: { flex: 1, marginLeft: 12 },
    itemName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
    itemPrice: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
    quantityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    qtyButton: { width: 30, height: 30, borderRadius: 8, backgroundColor: colors.borderLight, justifyContent: 'center', alignItems: 'center' },
    quantity: { marginHorizontal: 16, fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    itemActions: { alignItems: 'flex-end', justifyContent: 'space-between' },
    itemTotal: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
    summarySection: { backgroundColor: colors.surface, padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 10 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    summaryLabel: { fontSize: 14, color: colors.textSecondary },
    summaryValue: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
    totalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 4 },
    totalLabel: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
    totalValue: { fontSize: 20, fontWeight: 'bold', color: colors.primary },
    checkoutButton: { flexDirection: 'row', backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
    checkoutButtonText: { color: colors.textWhite, fontSize: 16, fontWeight: 'bold', marginRight: 8 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 16, color: colors.textSecondary, marginTop: 16, marginBottom: 24 },
    shopButton: { backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
    shopButtonText: { color: colors.textWhite, fontWeight: 'bold', fontSize: 16 },
});

export default CartScreen;
