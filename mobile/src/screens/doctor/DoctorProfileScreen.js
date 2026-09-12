import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Image,
    Switch,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../theme/colors';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.100:4000';

const DoctorProfileScreen = ({ navigation }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [available, setAvailable] = useState(false);

    const fetchProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('doctorToken');
            const { data } = await axios.get(`${BACKEND_URL}/api/doctor/profile`, {
                headers: { dtoken: token }
            });
            if (data.success) {
                setProfile(data.profileData);
                // Ensure available is always boolean (backend may send string)
                const isAvailable = data.profileData?.available === true || data.profileData?.available === 'true';
                setAvailable(isAvailable);
            }
        } catch (error) {
            console.log('Profile error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const toggleAvailability = async () => {
        try {
            const token = await AsyncStorage.getItem('doctorToken');
            const { data } = await axios.post(`${BACKEND_URL}/api/doctor/change-availability`, {}, {
                headers: { dtoken: token }
            });
            if (data.success) {
                setAvailable(!available);
                Alert.alert('Success', `You are now ${!available ? 'available' : 'unavailable'}`);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update availability');
        }
    };

    if (loading) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Profile</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.profileCard}>
                    <Image
                        source={{ uri: profile?.image || 'https://via.placeholder.com/100' }}
                        style={styles.profileImage}
                    />
                    <Text style={styles.doctorName}>Dr. {profile?.name}</Text>
                    <Text style={styles.speciality}>{profile?.speciality}</Text>

                    <View style={styles.availabilityRow}>
                        <Text style={styles.availabilityLabel}>Available for Appointments</Text>
                        <Switch
                            value={available}
                            onValueChange={toggleAvailability}
                            trackColor={{ false: colors.border, true: colors.success + '50' }}
                            thumbColor={available ? colors.success : colors.textLight}
                        />
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Profile Information</Text>

                    <View style={styles.infoItem}>
                        <Ionicons name="mail-outline" size={20} color={colors.primary} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue}>{profile?.email}</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="school-outline" size={20} color={colors.secondary} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Degree</Text>
                            <Text style={styles.infoValue}>{profile?.degree}</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="time-outline" size={20} color={colors.accent} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Experience</Text>
                            <Text style={styles.infoValue}>{profile?.experience}</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="cash-outline" size={20} color={colors.success} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Consultation Fee</Text>
                            <Text style={styles.infoValue}>₹{profile?.fees}</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="location-outline" size={20} color={colors.pink} />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Address</Text>
                            <Text style={styles.infoValue}>{profile?.address?.line1}, {profile?.address?.line2}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.aboutSection}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.aboutText}>{profile?.about || 'No description available'}</Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
    backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
    profileCard: { alignItems: 'center', backgroundColor: colors.surface, marginHorizontal: 20, borderRadius: 20, padding: 24, elevation: 3 },
    profileImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.tealLight },
    doctorName: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary, marginTop: 16 },
    speciality: { fontSize: 14, color: colors.primary, marginTop: 4 },
    availabilityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: colors.border },
    availabilityLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
    infoSection: { marginTop: 24, paddingHorizontal: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 16 },
    infoItem: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 10 },
    infoContent: { flex: 1, marginLeft: 12 },
    infoLabel: { fontSize: 12, color: colors.textSecondary },
    infoValue: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, marginTop: 2 },
    aboutSection: { marginTop: 24, paddingHorizontal: 20 },
    aboutText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, backgroundColor: colors.surface, borderRadius: 12, padding: 16 },
});

export default DoctorProfileScreen;
