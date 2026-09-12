import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DoctorDetailScreen = ({ route, navigation }) => {
    const { doctor } = route.params;
    // Ensure available is always boolean (backend may send string)
    const isAvailable = doctor.available === true || doctor.available === 'true';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#1f2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Doctor Details</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.doctorCard}>
                    <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.doctorName}>{doctor.name}</Text>
                    <Text style={styles.degree}>{doctor.degree} - {doctor.speciality}</Text>
                    <Text style={styles.experience}>{doctor.experience} experience</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.aboutText}>{doctor.about}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Fee</Text>
                    <Text style={styles.fee}>₹{doctor.fees} per consultation</Text>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={[styles.bookButton, !isAvailable && styles.bookButtonDisabled]}
                    onPress={() => isAvailable && navigation.navigate('BookAppointment', { doctor })}
                    disabled={!isAvailable}
                >
                    <Text style={styles.bookButtonText}>{isAvailable ? 'Book Appointment' : 'Not Available'}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
    backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
    doctorCard: { alignItems: 'center', marginTop: 10 },
    doctorImage: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#e0f2f1' },
    infoSection: { alignItems: 'center', paddingHorizontal: 20, marginTop: 16 },
    doctorName: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
    degree: { fontSize: 14, color: '#6b7280', marginTop: 4 },
    experience: { fontSize: 12, color: '#0d9488', marginTop: 8, backgroundColor: '#e0f2f1', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    section: { paddingHorizontal: 20, marginTop: 24 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
    aboutText: { fontSize: 14, color: '#6b7280', lineHeight: 22 },
    fee: { fontSize: 18, fontWeight: 'bold', color: '#0d9488' },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
    bookButton: { backgroundColor: '#0d9488', padding: 16, borderRadius: 12, alignItems: 'center' },
    bookButtonDisabled: { backgroundColor: '#9ca3af' },
    bookButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default DoctorDetailScreen;
