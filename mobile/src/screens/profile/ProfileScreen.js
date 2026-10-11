import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Image,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import colors from '../../theme/colors';

const ProfileScreen = ({ navigation }) => {
    const { userData, setUserData, backendUrl, token, logout, getUserProfile } = useContext(AppContext);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        gender: 'Not Selected',
        dob: '',
    });
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || '',
                phone: userData.phone || '',
                address: userData.address?.line1 || '',
                gender: userData.gender || 'Not Selected',
                dob: userData.dob || '',
            });
        }
    }, [userData]);

    const handleImagePick = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('address', JSON.stringify({ line1: formData.address }));
            formDataToSend.append('gender', formData.gender);
            formDataToSend.append('dob', formData.dob);

            if (selectedImage) {
                formDataToSend.append('image', {
                    uri: selectedImage,
                    type: 'image/jpeg',
                    name: 'profile.jpg',
                });
            }

            const { data } = await axios.post(
                `${backendUrl}/api/user/update-profile`,
                formDataToSend,
                { headers: { token, 'Content-Type': 'multipart/form-data' } }
            );

            if (data.success) {
                Alert.alert('Success', 'Profile updated successfully');
                getUserProfile();
                setIsEditing(false);
                setSelectedImage(null);
            } else {
                Alert.alert('Error', data.message);
            }
        } catch (error) {
            console.log('Update error:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout }
            ]
        );
    };

    const menuItems = [
        { icon: 'calendar', title: 'My Appointments', screen: 'MyAppointments', color: colors.primary },
        { icon: 'receipt', title: 'My Orders', screen: 'MyOrders', color: colors.secondary },
        { icon: 'flask', title: 'Lab Appointments', screen: 'MyLabAppointments', color: colors.pink },
        { icon: 'chatbubbles', title: 'Health Chatbot', screen: 'Chatbot', color: colors.success },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Profile</Text>
                    <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                        <Text style={styles.editText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.profileSection}>
                    <TouchableOpacity onPress={handleImagePick} style={styles.imageContainer}>
                        <Image
                            source={{ uri: selectedImage || userData?.image || 'https://via.placeholder.com/100' }}
                            style={styles.profileImage}
                        />
                        <View style={styles.cameraIcon}>
                            <Ionicons name="camera" size={16} color={colors.textWhite} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.userName}>{userData?.name || 'User'}</Text>
                    <Text style={styles.userEmail}>{userData?.email}</Text>
                </View>

                {isEditing ? (
                    <View style={styles.formSection}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="Enter your name"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.phone}
                                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                placeholder="Enter phone number"
                                keyboardType="phone-pad"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Address</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.address}
                                onChangeText={(text) => setFormData({ ...formData, address: text })}
                                placeholder="Enter your address"
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Gender</Text>
                            <View style={styles.genderRow}>
                                {['Male', 'Female', 'Other'].map((g) => (
                                    <TouchableOpacity
                                        key={g}
                                        style={[styles.genderOption, formData.gender === g && styles.genderActive]}
                                        onPress={() => setFormData({ ...formData, gender: g })}
                                    >
                                        <Text style={[styles.genderText, formData.gender === g && styles.genderTextActive]}>{g}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Date of Birth</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.dob}
                                onChangeText={(text) => setFormData({ ...formData, dob: text })}
                                placeholder="DD-MM-YYYY"
                            />
                        </View>
                        <TouchableOpacity
                            style={[styles.saveButton, loading && styles.buttonDisabled]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.textWhite} />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.menuSection}>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.menuItem}
                                onPress={() => navigation.navigate(item.screen)}
                            >
                                <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                                    <Ionicons name={item.icon} size={22} color={item.color} />
                                </View>
                                <Text style={styles.menuText}>{item.title}</Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color={colors.error} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary },
    editText: { fontSize: 16, color: colors.primary, fontWeight: '600' },
    profileSection: { alignItems: 'center', paddingVertical: 24 },
    imageContainer: { position: 'relative' },
    profileImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.tealLight },
    cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: colors.background },
    userName: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary, marginTop: 12 },
    userEmail: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
    formSection: { paddingHorizontal: 20 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
    input: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
    genderRow: { flexDirection: 'row', gap: 12 },
    genderOption: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: colors.surface, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    genderActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    genderText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
    genderTextActive: { color: colors.textWhite },
    saveButton: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    buttonDisabled: { opacity: 0.7 },
    saveButtonText: { color: colors.textWhite, fontSize: 16, fontWeight: 'bold' },
    menuSection: { paddingHorizontal: 20, marginTop: 10 },
    menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 14, marginBottom: 12, elevation: 2 },
    menuIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    menuText: { flex: 1, marginLeft: 14, fontSize: 15, fontWeight: '600', color: colors.textPrimary },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginTop: 20, paddingVertical: 16, borderRadius: 12, backgroundColor: colors.error + '10' },
    logoutText: { marginLeft: 10, fontSize: 16, fontWeight: '600', color: colors.error },
});

export default ProfileScreen;
