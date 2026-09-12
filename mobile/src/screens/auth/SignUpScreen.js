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
    ScrollView,
} from 'react-native';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';

const SignUpScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { setToken, backendUrl } = useContext(AppContext);

    const handleSignUp = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/register`, { name, email, password });
            if (data.success) {
                setToken(data.token);
            } else {
                Alert.alert('Error', data.message || 'Registration failed');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Text style={styles.logo}>🏥</Text>
                            <Text style={styles.title}>Hacksagon</Text>
                        </View>

                        <View style={styles.form}>
                            <Text style={styles.welcomeText}>Create Account</Text>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Full Name</Text>
                                <TextInput style={styles.input} placeholder="Enter your name" value={name} onChangeText={setName} />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput style={styles.input} placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Password</Text>
                                <TextInput style={styles.input} placeholder="Create a password" value={password} onChangeText={setPassword} secureTextEntry />
                            </View>

                            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSignUp} disabled={loading}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLinkText}>Already have an account? <Text style={styles.loginHighlight}>Login</Text></Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0fdfa' },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center' },
    content: { paddingHorizontal: 24, paddingVertical: 40 },
    header: { alignItems: 'center', marginBottom: 40 },
    logo: { fontSize: 60, marginBottom: 12 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#0d9488' },
    form: { backgroundColor: '#fff', borderRadius: 24, padding: 24, elevation: 5 },
    welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 24 },
    inputContainer: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    input: { backgroundColor: '#f3f4f6', borderRadius: 12, padding: 16, fontSize: 16, color: '#1f2937', borderWidth: 1, borderColor: '#e5e7eb' },
    button: { backgroundColor: '#0d9488', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    loginLink: { marginTop: 20, alignItems: 'center' },
    loginLinkText: { fontSize: 14, color: '#6b7280' },
    loginHighlight: { color: '#0d9488', fontWeight: 'bold' },
});

export default SignUpScreen;
