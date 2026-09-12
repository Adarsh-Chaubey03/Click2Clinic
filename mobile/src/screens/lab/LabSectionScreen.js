import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
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
import colors from '../../theme/colors';

const LabSectionScreen = ({ navigation }) => {
    const { backendUrl, token } = useContext(AppContext);
    const [labTests, setLabTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [visibleTests, setVisibleTests] = useState(6);

    const categories = ['All', 'Hematology', 'Endocrinology', 'Cardiology', 'Nephrology', 'Hepatology', 'Diabetology', 'Pathology', 'Infectious Diseases', 'Immunology'];

    // Fetch lab tests independently (same as frontend)
    useEffect(() => {
        const fetchLabTests = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${backendUrl}/api/user/lab-data`);
                if (data.success) {
                    setLabTests(Array.isArray(data.labData) ? data.labData : []);
                }
            } catch (error) {
                console.log('Error fetching lab tests:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLabTests();
    }, []);

    const filteredTests = (labTests || []).filter(test => {
        const matchesSearch = test.testname?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || test.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const displayedTests = filteredTests.slice(0, visibleTests);
    const hasMore = filteredTests.length > visibleTests;

    const handleBookTest = async (test) => {
        if (!token) {
            Alert.alert('Login Required', 'Please login to book a lab test');
            return;
        }

        Alert.alert(
            'Book Lab Test',
            `Do you want to book ${test.testname} for ₹${test.price}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Book Now',
                    onPress: async () => {
                        try {
                            const { data } = await axios.post(
                                `${backendUrl}/api/user/bookLab-appointment`,
                                { labId: test._id },
                                { headers: { token } }
                            );
                            if (data.success) {
                                Alert.alert('Success', 'Lab appointment booked successfully!');
                            } else {
                                Alert.alert('Error', data.message);
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to book appointment');
                        }
                    }
                }
            ]
        );
    };

    const renderTest = ({ item }) => (
        <View style={styles.testCard}>
            <View style={styles.testIcon}>
                <Ionicons name="flask" size={28} color={colors.pink} />
            </View>
            <View style={styles.testInfo}>
                <Text style={styles.testName} numberOfLines={1} ellipsizeMode="tail">{item.testname}</Text>
                <Text style={styles.testCategory} numberOfLines={1} ellipsizeMode="tail">{item.category}</Text>
                <View style={styles.testMeta}>
                    <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.metaText} numberOfLines={1} ellipsizeMode="tail">{item.resultAt || '24 hours'}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.metaText} numberOfLines={1} ellipsizeMode="tail">{item.address || 'Lab'}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.testAction}>
                <Text style={styles.testPrice}>₹{item.price}</Text>
                <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => handleBookTest(item)}
                >
                    <Text style={styles.bookButtonText}>Book</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Lab Tests</Text>
                    <Text style={styles.headerSubtitle}>Book tests with home collection</Text>
                </View>
                <TouchableOpacity
                    style={styles.appointmentsButton}
                    onPress={() => navigation.navigate('MyLabAppointments')}
                >
                    <Ionicons name="calendar" size={24} color={colors.pink} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search lab tests..."
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
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                selectedCategory === item && styles.categoryChipActive
                            ]}
                            onPress={() => setSelectedCategory(item)}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === item && styles.categoryTextActive
                            ]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.categoriesList}
                />
            </View>

            <TouchableOpacity
                style={styles.myAppointmentsLink}
                onPress={() => navigation.navigate('MyLabAppointments')}
            >
                <Ionicons name="flask-outline" size={20} color={colors.pink} />
                <Text style={styles.myAppointmentsText}>My Lab Appointments</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.pink} />
            </TouchableOpacity>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.pink} />
                    <Text style={styles.loadingText}>Loading lab tests...</Text>
                </View>
            ) : filteredTests.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="flask-outline" size={60} color={colors.border} />
                    <Text style={styles.emptyText}>No lab tests available</Text>
                    <Text style={styles.emptySubText}>Try adjusting your search or filters</Text>
                </View>
            ) : (
                <FlatList
                    data={displayedTests}
                    keyExtractor={(item) => item._id}
                    renderItem={renderTest}
                    contentContainerStyle={styles.listContainer}
                    ListFooterComponent={hasMore ? (
                        <TouchableOpacity
                            style={styles.loadMoreButton}
                            onPress={() => setVisibleTests(prev => prev + 6)}
                        >
                            <Text style={styles.loadMoreText}>Load More Tests</Text>
                            <Text style={styles.loadMoreCount}>
                                Showing {displayedTests.length} of {filteredTests.length}
                            </Text>
                        </TouchableOpacity>
                    ) : null}
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
    appointmentsButton: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.pink + '15', justifyContent: 'center', alignItems: 'center' },
    searchContainer: { paddingHorizontal: 20, marginVertical: 12 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: colors.textPrimary },
    categoriesContainer: { marginBottom: 8 },
    categoriesList: { paddingHorizontal: 20 },
    categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surface, marginRight: 10, borderWidth: 1, borderColor: colors.border },
    categoryChipActive: { backgroundColor: colors.pink, borderColor: colors.pink },
    categoryText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
    categoryTextActive: { color: colors.textWhite },
    myAppointmentsLink: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.pink + '10', marginHorizontal: 20, padding: 14, borderRadius: 12, marginBottom: 12 },
    myAppointmentsText: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '600', color: colors.pink },
    listContainer: { paddingHorizontal: 20, paddingBottom: 96 },
    testCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
    testIcon: { width: 52, height: 52, borderRadius: 14, backgroundColor: colors.pink + '15', justifyContent: 'center', alignItems: 'center' },
    testInfo: { flex: 1, marginLeft: 14, minWidth: 0 },
    testName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
    testCategory: { fontSize: 11, color: colors.primary, fontWeight: '500', marginTop: 2 },
    testMeta: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, rowGap: 4, columnGap: 12 },
    metaItem: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, maxWidth: '100%' },
    metaText: { fontSize: 11, color: colors.textSecondary, marginLeft: 4, flexShrink: 1 },
    testAction: { alignItems: 'flex-end', justifyContent: 'space-between', marginLeft: 10, flexShrink: 0 },
    testPrice: { fontSize: 16, fontWeight: 'bold', color: colors.pink },
    bookButton: { backgroundColor: colors.pink, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 8 },
    bookButtonText: { color: colors.textWhite, fontWeight: '600', fontSize: 13 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 16, color: colors.textSecondary, marginTop: 16 },
    emptySubText: { fontSize: 13, color: colors.textLight, marginTop: 4 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: 14, color: colors.textSecondary, marginTop: 12 },
    loadMoreButton: { alignItems: 'center', paddingVertical: 16, marginTop: 8 },
    loadMoreText: { fontSize: 15, fontWeight: '600', color: colors.pink },
    loadMoreCount: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
});

export default LabSectionScreen;
