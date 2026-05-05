import axios from 'axios';

const FCM_URL = 'https://fcm.googleapis.com/fcm/send';

export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string
): Promise<void> {
  if (!process.env.FCM_SERVER_KEY) return;

  await axios.post(
    FCM_URL,
    { to: fcmToken, notification: { title, body } },
    { headers: { Authorization: `key=${process.env.FCM_SERVER_KEY}` } }
  );
}
