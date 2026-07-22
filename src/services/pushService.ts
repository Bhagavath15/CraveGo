import { Platform, PermissionsAndroid } from 'react-native';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import {
  getMessaging,
  requestPermission,
  getToken,
  onTokenRefresh,
  onNotificationOpenedApp,
  onMessage,
  setBackgroundMessageHandler,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import { api } from '../api/client';

const CHANNEL_ID = 'cravego_otp';

type NavigateFn = (screen: string, params?: any) => void;
let _navigate: NavigateFn = () => {};

export function setNavigate(fn: NavigateFn) {
  _navigate = fn;
}

function navigateByNotification(data: any) {
  if (!data) return;
  const type = (data.type || '') as string;
  const orderId = (data.orderId || '') as string;
  if ((type === 'ORDER' || type === 'PAYMENT') && orderId) {
    _navigate('TrackMyOrder', { orderId });
  } else if (type === 'COUPON') {
    _navigate('Home');
  } else {
    _navigate('Home');
  }
}

let _initialNotifeeNavigationDone = false;

notifee.onForegroundEvent(({ type, detail }) => {
  if (type === EventType.PRESS) {
    navigateByNotification(detail.notification?.data);
  }
});

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    navigateByNotification(detail.notification?.data);
  }
});

async function ensureChannel() {
  try {
    await notifee.requestPermission();
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'CraveGo Notifications',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });
  } catch {}
}

async function showDeviceNotification(remoteMessage: any) {
  const notif = remoteMessage.notification || {};
  const data = remoteMessage.data || {};
  const title = notif.title || data.title || 'CraveGo';
  const body = notif.body || data.body || '';
  const orderId = data.orderId || '';
  const type = data.type || '';
  const id = orderId ? `${type}_${orderId}` : `fallback_${Date.now()}`;

  try {
    await notifee.displayNotification({
      id,
      title,
      body,
      android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        smallIcon: 'ic_notification',
        pressAction: { id: 'default', launchActivity: 'default' },
      },
      data: {
        type,
        orderId,
      },
    });
  } catch {}
}

const _messaging = getMessaging();

setBackgroundMessageHandler(_messaging, async (remoteMessage: any) => {
  await showDeviceNotification(remoteMessage);
});

class PushService {
  async init(token: string) {
    try {
      await ensureChannel();

      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      }

      const authStatus = await requestPermission(_messaging);
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (!enabled) return;

      const fcmToken = await getToken(_messaging);
      if (fcmToken) {
        await this.registerToken(token, fcmToken);
      }

      onTokenRefresh(_messaging, async (newToken: string) => {
        await this.registerToken(token, newToken);
      });

      if (!_initialNotifeeNavigationDone) {
        _initialNotifeeNavigationDone = true;
        const initialNotifee = await notifee.getInitialNotification();
        if (initialNotifee) {
          navigateByNotification(initialNotifee.notification?.data);
        }
      }

      onNotificationOpenedApp(_messaging, (remoteMessage: any) => {
        navigateByNotification(remoteMessage.data);
      });

      onMessage(_messaging, async (remoteMessage: any) => {
        await showDeviceNotification(remoteMessage);
      });
    } catch {}
  }

  private async registerToken(authToken: string, fcmToken: string) {
    try {
      await api.post('/notification/register-token', { fcmToken });
    } catch {}
  }

  async unregister() {
  }
}

export const pushService = new PushService();
