import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export async function requestNotificationPermission() {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn('Firebase Messaging is not supported in this browser environment.');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const messaging = getMessaging(app);
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      const token = await getToken(messaging, { vapidKey });
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
}

export async function listenToMessages(callback: (payload: unknown) => void) {
  try {
    const supported = await isSupported();
    if (!supported) return;
    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      callback(payload);
    });
  } catch (error) {
    console.error('Error listening to messages:', error);
  }
}
