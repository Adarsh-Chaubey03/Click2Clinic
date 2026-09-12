import React, { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Image, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../../context/AppContext';

const specialities = [
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatricians',
    'Neurologist',
    'Gastroenterologist',
];

const DoctorsScreen = ({ navigation, route }) => {
    const { doctors } = useContext(AppContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpeciality, setSelectedSpeciality] = useState(route?.params?.speciality || '');
    const [filteredDoctors, setFilteredDoctors] = useState(doctors);

    useEffect(() => {
        let filtered = doctors;
        if (selectedSpeciality) {
            filtered = filtered.filter(doc => doc.speciality === selectedSpeciality);
        }
        if (searchQuery) {
            filtered = filtered.filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        setFilteredDoctors(filtered);
    }, [doctors, searchQuery, selectedSpeciality]);

    // Update speciality if navigated with params
    useEffect(() => {
        if (route?.params?.speciality) {
            setSelectedSpeciality(route.params.speciality);
        }
    }, [route?.params?.speciality]);

    const renderDoctor = ({ item }) => (
        <TouchableOpacity style={styles.doctorCard} onPress={() => navigation.navigate('DoctorDetail', { doctor: item })}>
            <Image source={{ uri: item.image }} style={styles.doctorImage} />
            <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{item.name}</Text>
                <Text style={styles.doctorSpeciality}>{item.speciality}</Text>
                <Text style={styles.doctorDegree}>{item.degree} • {item.experience}</Text>
                <Text style={styles.fee}>₹{item.fees}</Text>
                <View style={[styles.availBadge, { backgroundColor: item.available ? '#dcfce7' : '#fee2e2' }]}>
                    <View style={[styles.availDot, { backgroundColor: item.available ? '#22c55e' : '#ef4444' }]} />
                    <Text style={[styles.availText, { color: item.available ? '#16a34a' : '#dc2626' }]}>
                        {item.available ? 'Available' : 'Unavailable'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}><Text style={styles.headerTitle}>Find Doctors</Text></View>
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#9ca3af" />
                    <TextInput style={styles.searchInput} placeholder="Search doctors..." value={searchQuery} onChangeText={setSearchQuery} />
                    {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            {/* Speciality Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer} contentContainerStyle={styles.filterContent}>
                <TouchableOpacity
                    style={[styles.filterChip, !selectedSpeciality && styles.filterChipActive]}
                    onPress={() => setSelectedSpeciality('')}
                >
                    <Text style={[styles.filterText, !selectedSpeciality && styles.filterTextActive]}>All</Text>
                </TouchableOpacity>
                {specialities.map((spec) => (
                    <TouchableOpacity
                        key={spec}
                        style={[styles.filterChip, selectedSpeciality === spec && styles.filterChipActive]}
                        onPress={() => setSelectedSpeciality(selectedSpeciality === spec ? '' : spec)}
                    >
                        <Text
                            style={[styles.filterText, selectedSpeciality === spec && styles.filterTextActive]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {spec}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <FlatList data={filteredDoctors} keyExtractor={(item) => item._id} renderItem={renderDoctor} contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="medical-outline" size={60} color="#d1d5db" />
                        <Text style={styles.emptyText}>No doctors found</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 10 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
    searchContainer: { paddingHorizontal: 20, marginBottom: 8 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1f2937' },
    filterContainer: { maxHeight: 64, marginBottom: 8 },
    filterContent: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
    filterChip: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', minHeight: 44, justifyContent: 'center' },
    filterChipActive: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
    filterText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
    filterTextActive: { color: '#fff' },
    listContainer: { paddingHorizontal: 20, paddingBottom: 96 },
    doctorCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 12, elevation: 2 },
    doctorImage: { width: 90, height: 90, borderRadius: 12, backgroundColor: '#e0f2f1' },
    doctorInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
    doctorName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
    doctorSpeciality: { fontSize: 13, color: '#6b7280', marginTop: 2 },
    doctorDegree: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
    fee: { fontSize: 14, fontWeight: 'bold', color: '#0d9488', marginTop: 4 },
    availBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginTop: 4 },
    availDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
    availText: { fontSize: 11, fontWeight: '600' },
    emptyContainer: { alignItems: 'center', paddingTop: 60 },
    emptyText: { fontSize: 16, color: '#9ca3af', marginTop: 12 },
});

export default DoctorsScreen;
