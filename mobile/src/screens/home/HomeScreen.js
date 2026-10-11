import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../../context/AppContext';

const HomeScreen = ({ navigation }) => {
    const { userData, doctors } = useContext(AppContext);

    const quickActions = [
        { id: 1, title: 'Find Doctors', icon: 'medical', color: '#0d9488', onPress: () => navigation.getParent()?.navigate('Doctors') },
        { id: 2, title: 'Order Medicines', icon: 'cart', color: '#6366f1', onPress: () => navigation.getParent()?.navigate('Store') },
        { id: 3, title: 'Book Lab Test', icon: 'flask', color: '#ec4899', onPress: () => navigation.getParent()?.navigate('Lab') },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello, {userData?.name || 'User'} 👋</Text>
                        <Text style={styles.subtitle}>How are you feeling today?</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickActionsGrid}>
                        {quickActions.map((action) => (
                            <TouchableOpacity key={action.id} style={styles.quickActionCard} onPress={action.onPress}>
                                <View style={[styles.iconCircle, { backgroundColor: `${action.color}20` }]}>
                                    <Ionicons name={action.icon} size={28} color={action.color} />
                                </View>
                                <Text style={styles.quickActionText}>{action.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Top Doctors</Text>
                        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Doctors')}>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {doctors.slice(0, 5).map((doctor) => (
                            <TouchableOpacity key={doctor._id} style={styles.doctorCard} onPress={() => navigation.getParent()?.navigate('Doctors', { screen: 'DoctorDetail', params: { doctor } })}>
                                <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
                                <View style={styles.doctorInfo}>
                                    <Text style={styles.doctorName} numberOfLines={1}>{doctor.name}</Text>
                                    <Text style={styles.doctorSpeciality}>{doctor.speciality}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <TouchableOpacity style={styles.banner} onPress={() => navigation.navigate('Chatbot')}>
                    <View style={styles.bannerContent}>
                        <Text style={styles.bannerTitle}>Need Help?</Text>
                        <Text style={styles.bannerText}>Chat with our AI assistant</Text>
                    </View>
                    <Text style={styles.bannerEmoji}>🤖</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
    greeting: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
    subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
    section: { paddingHorizontal: 20, marginBottom: 24 },
    scrollContent: { paddingBottom: 96 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
    seeAll: { fontSize: 14, color: '#0d9488', fontWeight: '600' },
    quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    quickActionCard: { width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center', elevation: 2 },
    iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    quickActionText: { fontSize: 14, fontWeight: '600', color: '#1f2937', textAlign: 'center' },
    doctorCard: { width: 140, backgroundColor: '#fff', borderRadius: 16, marginRight: 12, overflow: 'hidden', elevation: 2 },
    doctorImage: { width: '100%', height: 100, backgroundColor: '#e0f2f1' },
    doctorInfo: { padding: 12 },
    doctorName: { fontSize: 14, fontWeight: 'bold', color: '#1f2937' },
    doctorSpeciality: { fontSize: 12, color: '#6b7280', marginTop: 2 },
    banner: { flexDirection: 'row', backgroundColor: '#0d9488', marginHorizontal: 20, borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 20 },
    bannerContent: { flex: 1 },
    bannerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    bannerText: { fontSize: 13, color: '#ccfbf1' },
    bannerEmoji: { fontSize: 50 },
});

export default HomeScreen;
