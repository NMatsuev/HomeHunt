export const LANGUAGE_STORAGE_KEY = "app_language_preference";
export const THEME_STORAGE_KEY = "app_theme_preference";
export const NOTIFICATION_SETTINGS_STORAGE_KEY = "app_notification_settings";

export const CACHE_DB_NAME = "app_cache.db";
export const CACHE_TABLE_NAME = "cache";
export const CACHE_KEY = "kufar_ads";
export const CACHE_TTL = 3600000; // 1 час в миллисекундах

export const FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJ_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
export const COLLECTION_NAME = "offers";
