import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Platform, SafeAreaView, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import colors from '../../theme/colors';

const PaymentWebViewScreen = ({ route, navigation }) => {
    const { order, razorpayKey, verifyEndpoint, token, backendUrl, title } = route.params || {};
    const { getDoctorsData } = useContext(AppContext);
    const [verifying, setVerifying] = useState(false);

    const checkoutHtml = useMemo(() => {
        const orderId = order?.id || '';
        const amount = order?.amount || 0;
        const currency = order?.currency || 'INR';
        const name = title || 'Hacksagon';

                return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Razorpay Checkout</title>
  <style>
    body { margin:0; display:flex; align-items:center; justify-content:center; height:100vh; background:#f8fafc; }
    .loading { font-family:Arial,sans-serif; color:#111827; text-align:center; }
    .error { color: #dc2626; font-family:Arial,sans-serif; text-align:center; padding: 20px; }
  </style>
</head>
<body>
  <div class="loading" id="status">Opening Razorpay...</div>

  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <script>
    function postMsg(obj) {
      try { window.ReactNativeWebView.postMessage(JSON.stringify(obj)); } catch(e) {}
    }

    function initRazorpay() {
      if (typeof Razorpay === 'undefined') {
        document.getElementById('status').innerHTML = '<div class="error">Failed to load payment gateway. Please check your internet connection and try again.</div>';
        postMsg({ event: 'error', payload: { description: 'Razorpay SDK failed to load' } });
        return;
      }
      try {
        var options = {
          key: "${razorpayKey}",
          amount: "${amount}",
          currency: "${currency}",
          name: "${name}",
          description: "Secure payment",
          order_id: "${orderId}",
          handler: function (response) {
            postMsg({ event: 'success', payload: response });
          },
          modal: {
            ondismiss: function () {
              postMsg({ event: 'dismiss' });
            },
            confirm_close: true,
            escape: false
          },
          theme: {
            color: "#0d9488"
          }
        };
        var rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response) {
          postMsg({
            event: 'failed',
            payload: response && response.error ? response.error : response
          });
        });
        rzp.open();
      } catch(e) {
        document.getElementById('status').innerHTML = '<div class="error">Payment initialization failed: ' + e.message + '</div>';
        postMsg({ event: 'error', payload: { description: e.message } });
      }
    }

    // Wait for Razorpay SDK to load
    if (document.readyState === 'complete') {
      initRazorpay();
    } else {
      window.addEventListener('load', initRazorpay);
    }
  </script>
</body>
</html>
        `;
    }, [order, razorpayKey, title]);

    useEffect(() => {
        if (Platform.OS === 'web') {
            Alert.alert('Not supported', 'Razorpay WebView is not supported on web. Please use the web app checkout.');
            navigation.goBack();
        }
    }, [navigation]);

    const handleVerify = async (payload) => {
        if (!verifyEndpoint) {
            Alert.alert('Error', 'Missing verification endpoint');
            return;
        }

        setVerifying(true);
        try {
            const { data } = await axios.post(
                `${backendUrl}${verifyEndpoint}`,
                {
                    razorpay_order_id: payload.razorpay_order_id,
                    razorpay_payment_id: payload.razorpay_payment_id,
                    razorpay_signature: payload.razorpay_signature,
                },
                { headers: { token } }
            );

            if (data.success) {
                // Refresh doctor slot data after successful payment
                getDoctorsData();
                Alert.alert('Payment Successful', data.message || 'Payment verified successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Payment Failed', data.message || 'Payment verification failed');
            }
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Payment verification failed';
            Alert.alert('Payment Failed', message);
        } finally {
            setVerifying(false);
        }
    };

    const onMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data || '{}');
            if (data.event === 'success') {
                handleVerify(data.payload || {});
                return;
            }
            if (data.event === 'failed') {
                const reason = data?.payload?.description || data?.payload?.reason || 'Payment failed in Razorpay.';
                Alert.alert('Payment Failed', reason, [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
                return;
            }
            if (data.event === 'dismiss') {
                navigation.goBack();
                return;
            }
            if (data.event === 'error') {
                const reason = data?.payload?.description || 'Payment gateway could not be loaded.';
                Alert.alert('Payment Error', reason, [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
                return;
            }
        } catch (err) {
            Alert.alert('Error', 'Unexpected payment response');
            navigation.goBack();
        }
    };

    // Handle navigation requests from the WebView (UPI intents, bank redirects)
    const handleShouldStartLoad = (request) => {
        const { url } = request;

        // Allow the initial HTML and Razorpay checkout URLs
        if (url.startsWith('about:') || url.startsWith('data:') ||
            url.includes('razorpay.com') || url.includes('api.razorpay.com')) {
            return true;
        }

        // Handle UPI deep links — open natively
        if (url.startsWith('upi://') || url.startsWith('intent://') ||
            url.startsWith('tez://') || url.startsWith('phonepe://') ||
            url.startsWith('paytmmp://') || url.startsWith('gpay://')) {
            Linking.openURL(url).catch(() => {
                Alert.alert('Error', 'Could not open payment app. Please try another payment method.');
            });
            return false;
        }

        // Allow HTTPS bank/payment redirects inside WebView
        if (url.startsWith('https://') || url.startsWith('http://')) {
            return true;
        }

        // Other deep links — try opening natively
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            }
        });
        return false;
    };

    if (!order?.id || !razorpayKey) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <Text style={styles.errorText}>Payment details are missing.</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {verifying && (
                <View style={styles.verifyingOverlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.verifyingText}>Verifying payment...</Text>
                </View>
            )}
            <WebView
                originWhitelist={['*']}
                source={{ html: checkoutHtml }}
                onMessage={onMessage}
                onShouldStartLoadWithRequest={handleShouldStartLoad}
                startInLoadingState
                javaScriptEnabled={true}
                domStorageEnabled={true}
                thirdPartyCookiesEnabled={true}
                setSupportMultipleWindows={false}
                mixedContentMode="compatibility"
                allowsInlineMediaPlayback={true}
                allowsBackForwardNavigationGestures={true}
                cacheEnabled={true}
                javaScriptCanOpenWindowsAutomatically={true}
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.log('WebView error:', nativeEvent);
                    Alert.alert('Error', 'Payment page failed to load. Please try again.', [
                        { text: 'OK', onPress: () => navigation.goBack() }
                    ]);
                }}
                onHttpError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.log('WebView HTTP error:', nativeEvent.statusCode);
                }}
                renderLoading={() => (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={{ marginTop: 12, color: colors.textSecondary }}>Loading payment gateway...</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: colors.textSecondary, fontSize: 14 },
    verifyingOverlay: {
        position: 'absolute',
        zIndex: 10,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifyingText: { marginTop: 12, color: colors.textPrimary, fontSize: 14 },
});

export default PaymentWebViewScreen;
