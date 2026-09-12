import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Image,
    Switch,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../theme/colors';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.100:4000';

const DoctorsListScreen = ({ navigation }) => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDoctors = async () => {
        try {
            const token = await AsyncStorage.getItem('adminToken');
            const { data } = await axios.post(`${BACKEND_URL}/api/admin/all-doctors`, {}, {
                headers: { atoken: token }
            });
            if (data.success) {
                setDoctors(data.doctors || []);
            }
        } catch (error) {
            console.log('Error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const toggleAvailability = async (docId, currentStatus) => {
        try {
            const token = await AsyncStorage.getItem('adminToken');
            const { data } = await axios.post(`${BACKEND_URL}/api/admin/change-availability`,
                { docId },
                { headers: { atoken: token } }
            );
            if (data.success) {
                setDoctors(doctors.map(doc =>
                    doc._id === docId ? { ...doc, available: !currentStatus } : doc
                ));
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update availability');
        }
    };

    const renderDoctor = ({ item }) => {
        // Ensure available is always boolean (backend may send string)
        const isAvailable = item.available === true || item.available === 'true';

        return (
            <View style={styles.doctorCard}>
                <Image
                    source={{ uri: item.image || 'https://via.placeholder.com/60' }}
                    style={styles.doctorImage}
                />
                <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>{item.name}</Text>
                    <Text style={styles.speciality}>{item.speciality}</Text>
                    <Text style={styles.experience}>{item.experience} exp</Text>
                </View>
                <View style={styles.doctorActions}>
                    <Text style={[styles.statusText, { color: isAvailable ? colors.success : colors.error }]}>
                        {isAvailable ? 'Available' : 'Unavailable'}
                    </Text>
                    <Switch
                        value={isAvailable}
                        onValueChange={() => toggleAvailability(item._id, item.available)}
                        trackColor={{ false: colors.border, true: colors.primary + '50' }}
                        thumbColor={isAvailable ? colors.primary : colors.textLight}
                    />
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>All Doctors ({doctors.length})</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddDoctor')}
                >
                    <Ionicons name="add" size={24} color={colors.textWhite} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={doctors}
                keyExtractor={(item) => item._id}
                renderItem={renderDoctor}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); fetchDoctors(); }}
                        colors={[colors.secondary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="medical-outline" size={60} color={colors.border} />
                        <Text style={styles.emptyText}>No doctors found</Text>
                    </View>
                }
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
    addButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
    listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
    doctorCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 12, elevation: 2 },
    doctorImage: { width: 60, height: 60, borderRadius: 12, backgroundColor: colors.tealLight },
    doctorInfo: { flex: 1, marginLeft: 12 },
    doctorName: { fontSize: 15, fontWeight: 'bold', color: colors.textPrimary },
    speciality: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    experience: { fontSize: 12, color: colors.primary, marginTop: 4 },
    doctorActions: { alignItems: 'flex-end', justifyContent: 'center' },
    statusText: { fontSize: 11, fontWeight: '600', marginBottom: 6 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
    emptyText: { fontSize: 16, color: colors.textSecondary, marginTop: 16 },
});

export default DoctorsListScreen;
