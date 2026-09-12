import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.100:4000';

const DoctorLoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${BACKEND_URL}/api/doctor/login`, {
                email,
                password,
            });

            if (data.success) {
                await AsyncStorage.setItem('doctorToken', data.token);
                navigation.replace('DoctorTabs');
            } else {
                Alert.alert('Error', data.message || 'Login failed');
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="medical" size={50} color={colors.primary} />
                        </View>
                        <Text style={styles.title}>Doctor Portal</Text>
                        <Text style={styles.subtitle}>Login to manage your appointments</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email"
                                    placeholderTextColor={colors.textLight}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter password"
                                    placeholderTextColor={colors.textLight}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.textWhite} />
                            ) : (
                                <Text style={styles.buttonText}>Login as Doctor</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.adminLink}
                        onPress={() => navigation.navigate('AdminLogin')}
                    >
                        <Text style={styles.linkText}>
                            Are you an admin? <Text style={styles.linkHighlight}>Login here</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    keyboardView: { flex: 1 },
    content: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
    backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    header: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
    iconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.tealLight, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: colors.primary },
    subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 8 },
    form: { backgroundColor: colors.surface, borderRadius: 24, padding: 24, elevation: 5 },
    inputContainer: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border },
    input: { flex: 1, paddingVertical: 16, marginLeft: 10, fontSize: 15, color: colors.textPrimary },
    button: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: colors.textWhite, fontSize: 16, fontWeight: 'bold' },
    adminLink: { marginTop: 30, alignItems: 'center' },
    linkText: { fontSize: 14, color: colors.textSecondary },
    linkHighlight: { color: colors.secondary, fontWeight: 'bold' },
});

export default DoctorLoginScreen;
