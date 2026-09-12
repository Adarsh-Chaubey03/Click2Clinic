import React, { useState, useContext } from 'react';
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
import { AppContext } from '../../context/AppContext';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { setToken, backendUrl } = useContext(AppContext);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/login`, {
                email,
                password,
            });

            if (data.success) {
                setToken(data.token);
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
                    <View style={styles.header}>
                        <Text style={styles.logo}>🏥</Text>
                        <Text style={styles.title}>Hacksagon</Text>
                        <Text style={styles.subtitle}>Your Health, Our Priority</Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.welcomeText}>Welcome Back</Text>
                        <Text style={styles.loginText}>Login to your account</Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="#9ca3af"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor="#9ca3af"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Login</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.signupLink}
                            onPress={() => navigation.navigate('SignUp')}
                        >
                            <Text style={styles.signupText}>
                                Don't have an account?{' '}
                                <Text style={styles.signupHighlight}>Sign Up</Text>
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.roleButtons}>
                            <TouchableOpacity
                                style={styles.roleButton}
                                onPress={() => navigation.navigate('AdminLogin')}
                            >
                                <Text style={styles.roleButtonText}>Admin Login</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.roleButton, styles.roleButtonSecondary]}
                                onPress={() => navigation.navigate('DoctorLogin')}
                            >
                                <Text style={[styles.roleButtonText, styles.roleButtonSecondaryText]}>Doctor Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0fdfa' },
    keyboardView: { flex: 1 },
    content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
    header: { alignItems: 'center', marginBottom: 40 },
    logo: { fontSize: 60, marginBottom: 12 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#0d9488' },
    subtitle: { fontSize: 16, color: '#6b7280', marginTop: 4 },
    form: { backgroundColor: '#fff', borderRadius: 24, padding: 24, elevation: 5 },
    welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
    loginText: { fontSize: 14, color: '#6b7280', marginBottom: 24 },
    inputContainer: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    input: { backgroundColor: '#f3f4f6', borderRadius: 12, padding: 16, fontSize: 16, color: '#1f2937', borderWidth: 1, borderColor: '#e5e7eb' },
    button: { backgroundColor: '#0d9488', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    signupLink: { marginTop: 20, alignItems: 'center' },
    signupText: { fontSize: 14, color: '#6b7280' },
    signupHighlight: { color: '#0d9488', fontWeight: 'bold' },
    roleButtons: { marginTop: 24, flexDirection: 'row', justifyContent: 'space-between' },
    roleButton: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#0d9488', alignItems: 'center', marginHorizontal: 4 },
    roleButtonSecondary: { backgroundColor: '#0d9488', borderColor: '#0d9488' },
    roleButtonText: { color: '#0d9488', fontWeight: 'bold' },
    roleButtonSecondaryText: { color: '#fff' },
});

export default LoginScreen;
