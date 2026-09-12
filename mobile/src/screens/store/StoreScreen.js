import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Image,
    TextInput,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../../context/AppContext';
import { useCart } from '../../context/CartContext';
import colors from '../../theme/colors';

const StoreScreen = ({ navigation }) => {
    const { medicines } = useContext(AppContext) || {};
    const { addToCart, getCartCount } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = [
        { id: 'All', name: 'All', icon: 'storefront-outline' },
        { id: 'tablet', name: 'Tablets', icon: 'tablet-portrait-outline' },
        { id: 'syrup', name: 'Syrups', icon: 'water-outline' },
        { id: 'capsule', name: 'Capsules', icon: 'ellipse-outline' },
        { id: 'ointment', name: 'Ointments', icon: 'color-fill-outline' },
        { id: 'injection', name: 'Injections', icon: 'fitness-outline' },
        { id: 'dressing', name: 'Dressings', icon: 'bandage-outline' },
    ];

    const filteredMedicines = (medicines || []).filter(med => {
        const matchesSearch = med.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || med.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const [itemQuantities, setItemQuantities] = useState({});

    const handleQuantityChange = (itemId, delta) => {
        setItemQuantities(prev => ({
            ...prev,
            [itemId]: Math.max(1, (prev[itemId] || 1) + delta)
        }));
    };

    const handleAddToCart = async (medicine) => {
        const quantity = itemQuantities[medicine._id] || 1;
        const success = await addToCart(medicine, quantity);
        if (success) {
            Alert.alert('Added!', `${quantity} × ${medicine.name} added to cart`);
            setItemQuantities(prev => ({ ...prev, [medicine._id]: 1 }));
        }
    };

    const renderMedicine = ({ item }) => (
        <TouchableOpacity style={styles.medicineCard} activeOpacity={0.8}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.image || 'https://via.placeholder.com/100' }}
                    style={styles.medicineImage}
                />
                <View style={[styles.stockBadge, item.available ? styles.inStock : styles.outOfStock]}>
                    <Text style={[styles.stockText, item.available ? styles.inStockText : styles.outOfStockText]}>
                        {item.available ? 'In Stock' : 'Out of Stock'}
                    </Text>
                </View>
            </View>
            <View style={styles.medicineInfo}>
                <Text style={styles.medicineCategory}>{(item.category || 'General').toUpperCase()}</Text>
                <Text style={styles.medicineName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.price}>₹{item.price}</Text>
                <View style={styles.cartRow}>
                    <View style={styles.quantitySelector}>
                        <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => handleQuantityChange(item._id, -1)}
                            disabled={!item.available || (itemQuantities[item._id] || 1) <= 1}
                        >
                            <Text style={styles.qtyBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyValue}>{itemQuantities[item._id] || 1}</Text>
                        <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => handleQuantityChange(item._id, 1)}
                            disabled={!item.available}
                        >
                            <Text style={styles.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={[styles.addButton, !item.available && styles.addButtonDisabled]}
                        onPress={() => handleAddToCart(item)}
                        disabled={!item.available}
                    >
                        <Ionicons name="cart-outline" size={16} color={colors.textWhite} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Medicine Store</Text>
                    <Text style={styles.headerSubtitle}>Order medicines online</Text>
                </View>
                <TouchableOpacity
                    style={styles.cartButton}
                    onPress={() => navigation.navigate('Cart')}
                >
                    <Ionicons name="cart" size={24} color={colors.primary} />
                    {getCartCount() > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{getCartCount()}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search medicines..."
                        placeholderTextColor={colors.textLight}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <View style={styles.categoriesContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={categories}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                selectedCategory === item.id && styles.categoryChipActive
                            ]}
                            onPress={() => setSelectedCategory(item.id)}
                        >
                            <Ionicons
                                name={item.icon}
                                size={16}
                                color={selectedCategory === item.id ? colors.textWhite : colors.textSecondary}
                                style={{ marginRight: 6 }}
                            />
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === item.id && styles.categoryTextActive
                            ]}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.categoriesList}
                />
            </View>

            <View style={styles.ordersLink}>
                <TouchableOpacity
                    style={styles.myOrdersButton}
                    onPress={() => navigation.navigate('MyOrders')}
                >
                    <Ionicons name="receipt-outline" size={20} color={colors.primary} />
                    <Text style={styles.myOrdersText}>My Orders</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {filteredMedicines.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="medical-outline" size={60} color={colors.border} />
                    <Text style={styles.emptyText}>No medicines found</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredMedicines}
                    keyExtractor={(item) => item._id}
                    renderItem={renderMedicine}
                    numColumns={2}
                    contentContainerStyle={styles.listContainer}
                    columnWrapperStyle={styles.row}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary },
    headerSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
    cartButton: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', elevation: 3 },
    cartBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: colors.error, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    cartBadgeText: { color: colors.textWhite, fontSize: 11, fontWeight: 'bold' },
    searchContainer: { paddingHorizontal: 20, marginVertical: 12 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: colors.textPrimary },
    categoriesContainer: { marginBottom: 8 },
    categoriesList: { paddingHorizontal: 20 },
    categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surface, marginRight: 10, borderWidth: 1, borderColor: colors.border },
    categoryChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    categoryText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
    categoryTextActive: { color: colors.textWhite },
    ordersLink: { paddingHorizontal: 20, marginBottom: 12 },
    myOrdersButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.tealLight, padding: 14, borderRadius: 12 },
    myOrdersText: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '600', color: colors.primary },
    listContainer: { paddingHorizontal: 14, paddingBottom: 20 },
    row: { justifyContent: 'space-between' },
    medicineCard: { width: '48%', backgroundColor: colors.surface, borderRadius: 16, marginBottom: 14, elevation: 2, overflow: 'hidden' },
    imageContainer: { position: 'relative', backgroundColor: '#f3f4f6', padding: 8, height: 120 },
    medicineImage: { width: '100%', height: '100%', resizeMode: 'contain' },
    stockBadge: { position: 'absolute', top: 6, right: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
    inStock: { backgroundColor: '#dcfce7' },
    outOfStock: { backgroundColor: '#fee2e2' },
    stockText: { fontSize: 10, fontWeight: '600' },
    inStockText: { color: '#15803d' },
    outOfStockText: { color: '#b91c1c' },
    medicineInfo: { padding: 12 },
    medicineCategory: { fontSize: 10, fontWeight: '600', color: colors.primary, letterSpacing: 0.5, marginBottom: 4 },
    medicineName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 6, minHeight: 36 },
    price: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 8 },
    cartRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    quantitySelector: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden' },
    qtyBtn: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
    qtyBtnText: { fontSize: 16, color: colors.textSecondary, fontWeight: '600' },
    qtyValue: { width: 26, textAlign: 'center', fontSize: 13, fontWeight: '600', color: colors.textPrimary },
    addButton: { flex: 1, height: 28, borderRadius: 8, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
    addButtonDisabled: { backgroundColor: '#d1d5db' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 16, color: colors.textSecondary, marginTop: 16 },
});

export default StoreScreen;
