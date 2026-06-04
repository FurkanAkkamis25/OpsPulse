import admin from 'firebase-admin';
import path from 'path';

function getApp(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0]!;
  const serviceAccountPath = path.resolve(__dirname, '../../firebase-service-account.json');
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
}

export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string
): Promise<void> {
  try {
    const app = getApp();
    await app.messaging().send({
      token: fcmToken,
      notification: { title, body },
      android: { priority: 'high' },
    });
  } catch (err) {
    console.error('FCM send error:', err);
  }
}
