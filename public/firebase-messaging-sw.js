importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "placeholder",
  authDomain: "oit-chat.firebaseapp.com",
  projectId: "oit-chat",
  storageBucket: "oit-chat.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'Pesan Baru di Oit';
  const notificationOptions = {
    body: payload.notification?.body || 'Anda menerima pesan baru.',
    icon: '/icon-192.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
