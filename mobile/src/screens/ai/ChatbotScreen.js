import React, { useState, useContext, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import colors from '../../theme/colors';

const ChatbotScreen = ({ navigation }) => {
    const { backendUrl } = useContext(AppContext);
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: "Hello! I'm your health assistant. How can I help you today? You can ask me about symptoms, medications, or general health advice.",
            isBot: true,
            timestamp: new Date(),
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef(null);

    const quickQuestions = [
        "What are symptoms of fever?",
        "How to reduce headache?",
        "Tips for better sleep",
        "When to see a doctor?",
    ];

    const sendMessage = async (text = inputText) => {
        if (!text.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            text: text.trim(),
            isBot: false,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setLoading(true);

        try {
            const { data } = await axios.post(`${backendUrl}/api/user/chatbot-response`, {
                message: text.trim()
            });

            let responseText;
            if (data.response && typeof data.response === 'object') {
                const r = data.response;
                responseText = `🩺 Disease: ${r.disease || 'Unknown'}\n\n⚠️ Precautions:\n${(r.precaution || []).map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n💊 Treatment:\n${(r.cure || []).map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n👨‍⚕️ Recommended Doctor: ${r.recommendedDoctor || 'General Physician'}`;
            } else {
                responseText = data.response || data.message || "I apologize, but I couldn't process your request. Please try again.";
            }

            const botMessage = {
                id: (Date.now() + 1).toString(),
                text: responseText,
                isBot: true,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.log('Chatbot error:', error);
            // Fallback response
            const botMessage = {
                id: (Date.now() + 1).toString(),
                text: "I'm here to help with your health questions. For accurate medical advice, please consult with a healthcare professional. Would you like me to help you find a doctor?",
                isBot: true,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, botMessage]);
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = ({ item }) => (
        <View style={[styles.messageContainer, item.isBot ? styles.botMessage : styles.userMessage]}>
            {item.isBot && (
                <View style={styles.botAvatar}>
                    <Ionicons name="medical" size={16} color={colors.primary} />
                </View>
            )}
            <View style={[styles.messageBubble, item.isBot ? styles.botBubble : styles.userBubble]}>
                <Text style={[styles.messageText, item.isBot ? styles.botText : styles.userText]}>
                    {item.text}
                </Text>
                <Text style={[styles.timestamp, item.isBot ? styles.botTimestamp : styles.userTimestamp]}>
                    {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>Health Assistant</Text>
                    <View style={styles.onlineIndicator}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.onlineText}>Online</Text>
                    </View>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                ListFooterComponent={
                    loading ? (
                        <View style={styles.typingIndicator}>
                            <View style={styles.botAvatar}>
                                <Ionicons name="medical" size={16} color={colors.primary} />
                            </View>
                            <View style={styles.typingDots}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Text style={styles.typingText}>Typing...</Text>
                            </View>
                        </View>
                    ) : null
                }
            />

            {messages.length <= 2 && (
                <View style={styles.quickQuestions}>
                    <Text style={styles.quickTitle}>Quick Questions</Text>
                    <View style={styles.quickGrid}>
                        {quickQuestions.map((q, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.quickButton}
                                onPress={() => sendMessage(q)}
                            >
                                <Text style={styles.quickButtonText}>{q}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={90}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type your health question..."
                        placeholderTextColor={colors.textLight}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                        onPress={() => sendMessage()}
                        disabled={!inputText.trim() || loading}
                    >
                        <Ionicons name="send" size={20} color={colors.textWhite} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
    backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
    headerInfo: { flex: 1, marginLeft: 12 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
    onlineIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
    onlineText: { fontSize: 12, color: colors.success, marginLeft: 6 },
    messagesList: { padding: 20 },
    messageContainer: { flexDirection: 'row', marginBottom: 16, maxWidth: '85%' },
    botMessage: { alignSelf: 'flex-start' },
    userMessage: { alignSelf: 'flex-end' },
    botAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.tealLight, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    messageBubble: { borderRadius: 16, padding: 12, maxWidth: '100%' },
    botBubble: { backgroundColor: colors.surface, borderTopLeftRadius: 4 },
    userBubble: { backgroundColor: colors.primary, borderTopRightRadius: 4 },
    messageText: { fontSize: 15, lineHeight: 22 },
    botText: { color: colors.textPrimary },
    userText: { color: colors.textWhite },
    timestamp: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
    botTimestamp: { color: colors.textLight },
    userTimestamp: { color: 'rgba(255,255,255,0.7)' },
    typingIndicator: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 16 },
    typingDots: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16 },
    typingText: { marginLeft: 8, fontSize: 13, color: colors.textSecondary },
    quickQuestions: { paddingHorizontal: 20, paddingBottom: 10 },
    quickTitle: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 10 },
    quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    quickButton: { backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
    quickButtonText: { fontSize: 13, color: colors.primary, fontWeight: '500' },
    inputContainer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
    input: { flex: 1, backgroundColor: colors.background, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12, fontSize: 15, color: colors.textPrimary, maxHeight: 100, borderWidth: 1, borderColor: colors.border },
    sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
    sendButtonDisabled: { backgroundColor: colors.textLight },
});

export default ChatbotScreen;
