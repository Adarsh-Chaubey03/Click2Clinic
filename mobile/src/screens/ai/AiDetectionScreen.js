import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Image,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import colors from '../../theme/colors';

const AiDetectionScreen = ({ navigation }) => {
    const { backendUrl } = useContext(AppContext);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const pickImage = async (useCamera = false) => {
        let result;

        if (useCamera) {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Camera permission is required');
                return;
            }
            result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });
        } else {
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });
        }

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setResult(null);
        }
    };

    const normalizeResult = (rawResult) => {
        if (!rawResult) return null;

        if (typeof rawResult === 'object') {
            const confidenceValue = Number.isFinite(rawResult.confidence)
                ? rawResult.confidence
                : 0;
            return {
                condition: rawResult.condition || 'Unknown',
                severity: rawResult.severity || 'moderate',
                confidenceValue,
                confidenceDisplay: Number.isFinite(rawResult.confidence)
                    ? `${rawResult.confidence}%`
                    : 'N/A',
                description: rawResult.description || 'AI analysis result based on the uploaded image.',
                recommendations: Array.isArray(rawResult.recommendations)
                    ? rawResult.recommendations
                    : ['Keep the area clean', 'Avoid scratching', 'Consult a dermatologist for advice'],
            };
        }

        const text = String(rawResult).trim();
        const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
        const lastLine = lines.length ? lines[lines.length - 1] : text;
        const match = lastLine.match(/^(.*)\s+\(([\d.]+)%\)\s*$/);
        const condition = match ? match[1].trim() : lastLine || 'Unknown';
        const confidence = match ? parseFloat(match[2]) : NaN;
        const confidenceValue = Number.isFinite(confidence) ? Math.min(Math.max(confidence, 0), 100) : 0;
        const severity = Number.isFinite(confidence)
            ? (confidence >= 80 ? 'mild' : confidence >= 50 ? 'moderate' : 'severe')
            : 'moderate';

        return {
            condition,
            severity,
            confidenceValue,
            confidenceDisplay: Number.isFinite(confidence) ? `${confidenceValue}%` : 'N/A',
            description: 'AI prediction based on the uploaded image. For accurate diagnosis, consult a dermatologist.',
            recommendations: ['Keep the area clean', 'Avoid scratching', 'Consult a dermatologist for advice'],
        };
    };

    const analyzeImage = async () => {
        if (!image) {
            Alert.alert('Error', 'Please select an image first');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();

            if (Platform.OS === 'web') {
                // On web, convert URI to a Blob/File for FormData
                let blob;
                if (image.startsWith('data:')) {
                    const base64String = image.split(',')[1];
                    const byteCharacters = atob(base64String);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    blob = new Blob([byteArray], { type: 'image/jpeg' });
                } else {
                    const response = await fetch(image);
                    blob = await response.blob();
                }
                formData.append('image', blob, 'skin_image.jpg');
            } else {
                formData.append('image', {
                    uri: image,
                    type: 'image/jpeg',
                    name: 'skin_image.jpg',
                });
            }

            const { data } = await axios.post(
                `${backendUrl}/api/user/analyze-image`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            if (data.success) {
                const normalized = normalizeResult(data.result);
                if (!normalized) {
                    Alert.alert('Error', 'No analysis result returned');
                    return;
                }
                setResult(normalized);
            } else {
                Alert.alert('Error', data.message || 'Analysis failed');
            }
        } catch (error) {
            console.log('Analysis error:', error);
            Alert.alert('Analysis Failed', 'Unable to analyze the image. Please try again or consult a dermatologist directly.');
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'mild': return colors.success;
            case 'moderate': return colors.accent;
            case 'severe': return colors.error;
            default: return colors.textSecondary;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>AI Skin Analysis</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.infoCard}>
                    <Ionicons name="scan" size={32} color={colors.accent} />
                    <View style={styles.infoContent}>
                        <Text style={styles.infoTitle}>AI-Powered Detection</Text>
                        <Text style={styles.infoText}>
                            Upload a clear image of your skin condition for AI analysis and recommendations.
                        </Text>
                    </View>
                </View>

                <View style={styles.imageSection}>
                    {image ? (
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: image }} style={styles.selectedImage} />
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => { setImage(null); setResult(null); }}
                            >
                                <Ionicons name="close" size={20} color={colors.textWhite} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <Ionicons name="image-outline" size={60} color={colors.border} />
                            <Text style={styles.placeholderText}>No image selected</Text>
                        </View>
                    )}

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.pickButton}
                            onPress={() => pickImage(false)}
                        >
                            <Ionicons name="images" size={20} color={colors.primary} />
                            <Text style={styles.pickButtonText}>Gallery</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.pickButton}
                            onPress={() => pickImage(true)}
                        >
                            <Ionicons name="camera" size={20} color={colors.primary} />
                            <Text style={styles.pickButtonText}>Camera</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.analyzeButton, (!image || loading) && styles.buttonDisabled]}
                        onPress={analyzeImage}
                        disabled={!image || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.textWhite} />
                        ) : (
                            <>
                                <Ionicons name="scan" size={20} color={colors.textWhite} />
                                <Text style={styles.analyzeButtonText}>Analyze Image</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {result && (
                    <View style={styles.resultSection}>
                        <Text style={styles.resultTitle}>Analysis Result</Text>

                        <View style={styles.resultCard}>
                            <View style={styles.conditionHeader}>
                                <Text style={styles.conditionName}>{result.condition}</Text>
                                <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(result.severity) + '20' }]}>
                                    <Text style={[styles.severityText, { color: getSeverityColor(result.severity) }]}>
                                        {result.severity?.toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.confidenceRow}>
                                <Text style={styles.confidenceLabel}>Confidence:</Text>
                                <View style={styles.confidenceBar}>
                                    <View style={[styles.confidenceFill, { width: `${result.confidenceValue}%` }]} />
                                </View>
                                <Text style={styles.confidenceValue}>{result.confidenceDisplay}</Text>
                            </View>

                            <Text style={styles.descriptionText}>{result.description}</Text>
                        </View>

                        <View style={styles.recommendationsCard}>
                            <Text style={styles.recommendationsTitle}>Recommendations</Text>
                            {result.recommendations?.map((rec, index) => (
                                <View key={index} style={styles.recommendationItem}>
                                    <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                                    <Text style={styles.recommendationText}>{rec}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.disclaimerCard}>
                            <Ionicons name="information-circle" size={20} color={colors.accent} />
                            <Text style={styles.disclaimerText}>
                                This AI analysis is for informational purposes only. Please consult a dermatologist for proper diagnosis and treatment.
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.consultButton}
                            onPress={() => navigation.getParent()?.navigate('Doctors', { screen: 'DoctorsList', params: { speciality: 'Dermatologist' } })}
                        >
                            <Ionicons name="medical" size={20} color={colors.textWhite} />
                            <Text style={styles.consultButtonText}>Consult a Dermatologist</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
    backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', elevation: 2 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary },
    infoCard: { flexDirection: 'row', backgroundColor: colors.accent + '15', marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 20 },
    infoContent: { flex: 1, marginLeft: 14 },
    infoTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
    infoText: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
    imageSection: { paddingHorizontal: 20 },
    placeholderContainer: { height: 200, backgroundColor: colors.surface, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border },
    placeholderText: { fontSize: 14, color: colors.textSecondary, marginTop: 12 },
    imageContainer: { position: 'relative' },
    selectedImage: { width: '100%', height: 280, borderRadius: 16 },
    removeButton: { position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.error, justifyContent: 'center', alignItems: 'center' },
    buttonRow: { flexDirection: 'row', marginTop: 16, gap: 12 },
    pickButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary + '15', paddingVertical: 14, borderRadius: 12 },
    pickButtonText: { marginLeft: 8, fontSize: 15, fontWeight: '600', color: colors.primary },
    analyzeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accent, paddingVertical: 16, borderRadius: 12, marginTop: 16 },
    buttonDisabled: { opacity: 0.6 },
    analyzeButtonText: { marginLeft: 8, fontSize: 16, fontWeight: 'bold', color: colors.textWhite },
    resultSection: { paddingHorizontal: 20, marginTop: 24 },
    resultTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 16 },
    resultCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2 },
    conditionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    conditionName: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
    severityBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
    severityText: { fontSize: 12, fontWeight: 'bold' },
    confidenceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    confidenceLabel: { fontSize: 13, color: colors.textSecondary, marginRight: 10 },
    confidenceBar: { flex: 1, height: 8, backgroundColor: colors.borderLight, borderRadius: 4, overflow: 'hidden' },
    confidenceFill: { height: '100%', backgroundColor: colors.success, borderRadius: 4 },
    confidenceValue: { marginLeft: 10, fontSize: 13, fontWeight: 'bold', color: colors.textPrimary },
    descriptionText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
    recommendationsCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2 },
    recommendationsTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 14 },
    recommendationItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    recommendationText: { flex: 1, marginLeft: 10, fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
    disclaimerCard: { flexDirection: 'row', backgroundColor: colors.accent + '10', padding: 16, borderRadius: 12, marginBottom: 16 },
    disclaimerText: { flex: 1, marginLeft: 10, fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
    consultButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12 },
    consultButtonText: { marginLeft: 8, fontSize: 16, fontWeight: 'bold', color: colors.textWhite },
});

export default AiDetectionScreen;
