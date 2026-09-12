import React, { useState, useContext, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';

// Consistent 12-hour time format matching web browser output (e.g. "10:00 AM", "01:30 PM")
const formatTime12h = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hourStr = hours.toString().padStart(2, '0');
    const minuteStr = minutes.toString().padStart(2, '0');
    return `${hourStr}:${minuteStr} ${ampm}`;
};

const BookAppointmentScreen = ({ route, navigation }) => {
    const { doctor } = route.params;
    const { backendUrl, token, getDoctorsData } = useContext(AppContext);
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [selectedTime, setSelectedTime] = useState(null);
    const [loading, setLoading] = useState(false);
    const [docSlots, setDocSlots] = useState([]);

    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    // Generate available time slots matching frontend logic (10AM-9PM, 30-min intervals)
    useEffect(() => {
        if (!doctor) return;
        const slots = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            let currDate = new Date(today);
            currDate.setDate(today.getDate() + i);
            let endTime = new Date(today);
            endTime.setDate(today.getDate() + i);
            endTime.setHours(21, 0, 0, 0);

            if (today.getDate() === currDate.getDate()) {
                currDate.setHours(currDate.getHours() > 10 ? currDate.getHours() + 1 : 10);
                currDate.setMinutes(currDate.getMinutes() > 30 ? 30 : 0);
            } else {
                currDate.setHours(10);
                currDate.setMinutes(0);
            }

            let timeSlots = [];
            while (currDate < endTime) {
                let formattedTime = formatTime12h(currDate);
                let day = currDate.getDate();
                let month = currDate.getMonth() + 1;
                let year = currDate.getFullYear();
                const slotDate = `${day}_${month}_${year}`;

                // Check if slot is already booked
                const isSlotAvail = !(doctor.slot_booked?.[slotDate]?.includes(formattedTime));

                if (isSlotAvail) {
                    timeSlots.push({
                        datetime: new Date(currDate),
                        time: formattedTime,
                    });
                }
                currDate.setMinutes(currDate.getMinutes() + 30);
            }

            slots.push({
                date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + i),
                day: daysOfWeek[new Date(today.getFullYear(), today.getMonth(), today.getDate() + i).getDay()],
                dateNum: new Date(today.getFullYear(), today.getMonth(), today.getDate() + i).getDate(),
                month: new Date(today.getFullYear(), today.getMonth(), today.getDate() + i).toLocaleDateString('en-US', { month: 'short' }),
                fullDate: `${new Date(today.getFullYear(), today.getMonth(), today.getDate() + i).getDate()}_${new Date(today.getFullYear(), today.getMonth(), today.getDate() + i).getMonth() + 1}_${new Date(today.getFullYear(), today.getMonth(), today.getDate() + i).getFullYear()}`,
                timeSlots,
            });
        }
        setDocSlots(slots);
    }, [doctor]);

    const handleBookAppointment = async () => {
        if (!selectedTime) { Alert.alert('Error', 'Please select a time slot'); return; }
        setLoading(true);
        try {
            const slotData = docSlots[selectedDateIndex]?.fullDate;
            const { data } = await axios.post(`${backendUrl}/api/user/book-appointment`, { docId: doctor._id, slotData, slotTime: selectedTime }, { headers: { token } });
            if (data.success) { Alert.alert('Success', 'Appointment booked!', [{ text: 'OK', onPress: () => { getDoctorsData(); navigation.navigate('MyAppointments'); } }]); }
            else { Alert.alert('Error', data.message); }
        } catch (error) { Alert.alert('Error', 'Something went wrong'); }
        finally { setLoading(false); }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Ionicons name="arrow-back" size={24} color="#1f2937" /></TouchableOpacity>
                    <Text style={styles.headerTitle}>Book Appointment</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>{doctor.name}</Text>
                    <Text style={styles.degree}>{doctor.degree} - {doctor.speciality}</Text>
                    <Text style={styles.fee}>Fee: ₹{doctor.fees}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Date</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {docSlots.map((item, index) => (
                            <TouchableOpacity key={index} style={[styles.dateCard, selectedDateIndex === index && styles.dateCardActive]} onPress={() => { setSelectedDateIndex(index); setSelectedTime(null); }}>
                                <Text style={[styles.dayText, selectedDateIndex === index && styles.textActive]}>{item.day}</Text>
                                <Text style={[styles.dateNum, selectedDateIndex === index && styles.textActive]}>{item.dateNum}</Text>
                                <Text style={[styles.monthText, selectedDateIndex === index && styles.textActive]}>{item.month}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Time</Text>
                    {docSlots[selectedDateIndex]?.timeSlots?.length > 0 ? (
                        <View style={styles.timeGrid}>
                            {docSlots[selectedDateIndex].timeSlots.map((slot, index) => (
                                <TouchableOpacity key={index} style={[styles.timeSlot, selectedTime === slot.time && styles.timeSlotActive]} onPress={() => setSelectedTime(slot.time)}>
                                    <Text style={[styles.timeText, selectedTime === slot.time && styles.textActive]}>{slot.time.toLowerCase()}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.noSlotsText}>No available slots for this date</Text>
                    )}
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.bottomBar}>
                <TouchableOpacity style={[styles.bookButton, (loading || !selectedTime) && styles.buttonDisabled]} onPress={handleBookAppointment} disabled={loading || !selectedTime}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.bookButtonText}>Confirm Booking</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
    backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
    doctorInfo: { backgroundColor: '#0d9488', marginHorizontal: 20, padding: 20, borderRadius: 16, marginTop: 10 },
    doctorName: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    degree: { fontSize: 13, color: '#ccfbf1', marginTop: 4 },
    fee: { fontSize: 14, color: '#fff', marginTop: 8 },
    section: { paddingHorizontal: 20, marginTop: 24 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
    dateCard: { width: 70, padding: 12, borderRadius: 12, backgroundColor: '#fff', marginRight: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
    dateCardActive: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
    dayText: { fontSize: 12, color: '#6b7280' },
    dateNum: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginVertical: 4 },
    monthText: { fontSize: 11, color: '#6b7280' },
    textActive: { color: '#fff' },
    timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    timeSlot: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
    timeSlotActive: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
    timeText: { fontSize: 13, color: '#6b7280' },
    noSlotsText: { fontSize: 14, color: '#9ca3af', textAlign: 'center', paddingVertical: 20 },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
    bookButton: { backgroundColor: '#0d9488', padding: 16, borderRadius: 12, alignItems: 'center' },
    buttonDisabled: { opacity: 0.7 },
    bookButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default BookAppointmentScreen;
