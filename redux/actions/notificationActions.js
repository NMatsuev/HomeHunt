import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NOTIFICATION_SETTINGS_STORAGE_KEY } from "../../config/StorageConfig";

export const NOTIFICATION_LOADING = "NOTIFICATION_LOADING";
export const NOTIFICATION_LOADED = "NOTIFICATION_LOADED";
export const NOTIFICATION_ERROR = "NOTIFICATION_ERROR";
export const NOTIFICATION_ENABLED = "NOTIFICATION_ENABLED";
export const NOTIFICATION_DISABLED = "NOTIFICATION_DISABLED";
export const NOTIFICATION_TIME_SET = "NOTIFICATION_TIME_SET";
export const NOTIFICATION_FREQUENCY_SET = "NOTIFICATION_FREQUENCY_SET";
export const NOTIFICATION_PERMISSION_GRANTED =
  "NOTIFICATION_PERMISSION_GRANTED";
export const NOTIFICATION_PERMISSION_DENIED = "NOTIFICATION_PERMISSION_DENIED";

// Настройка обработчика уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Инициализация уведомлений
export const initializeNotifications = () => async (dispatch) => {
  try {
    dispatch({ type: NOTIFICATION_LOADING });

    // Настройка канала для Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    // Загрузка сохраненных настроек
    const savedSettings = await AsyncStorage.getItem(
      NOTIFICATION_SETTINGS_STORAGE_KEY,
    );

    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      dispatch({
        type: NOTIFICATION_LOADED,
        payload: {
          enabled: settings.enabled,
          time: new Date(settings.time),
          frequency: settings.frequency,
        },
      });

      // Если уведомления включены, восстанавливаем планирование
      if (settings.enabled) {
        await scheduleNotification(settings.time, settings.frequency);
      }
    } else {
      dispatch({
        type: NOTIFICATION_LOADED,
        payload: {
          enabled: false,
          time: new Date(),
          frequency: "daily",
        },
      });
    }
  } catch (error) {
    console.log("Error initializing notifications:", error);
    dispatch({ type: NOTIFICATION_ERROR, payload: error.message });
  }
};

// Запрос разрешений
export const requestNotificationPermission = () => async (dispatch) => {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus === "granted") {
      dispatch({ type: NOTIFICATION_PERMISSION_GRANTED });
      return true;
    } else {
      dispatch({ type: NOTIFICATION_PERMISSION_DENIED });
      return false;
    }
  } catch (error) {
    console.log("Error requesting permission:", error);
    dispatch({ type: NOTIFICATION_PERMISSION_DENIED });
    return false;
  }
};

// Планирование уведомления
const scheduleNotification = async (time, frequency) => {
  await cancelAllNotifications();

  const triggerTime = new Date(time);
  triggerTime.setSeconds(0);
  triggerTime.setMilliseconds(0);

  const now = new Date();
  if (triggerTime <= now) {
    triggerTime.setDate(triggerTime.getDate() + 1);
  }

  let trigger;
  switch (frequency) {
    case "daily":
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: triggerTime.getHours(),
        minute: triggerTime.getMinutes(),
      };
      break;
    case "weekly":
      let weekday = triggerTime.getDay();
      if (weekday === 0) weekday = 7;
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: weekday,
        hour: triggerTime.getHours(),
        minute: triggerTime.getMinutes(),
      };
      break;
    case "monthly":
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
        day: triggerTime.getDate(),
        hour: triggerTime.getHours(),
        minute: triggerTime.getMinutes(),
      };
      break;
    default:
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: triggerTime.getHours(),
        minute: triggerTime.getMinutes(),
      };
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Новые объявления! 🏠",
      body: "Появились свежие предложения, которые могут вас заинтересовать",
      data: { screen: "MainScreen", type: "new_offers" },
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: trigger,
  });
};

const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// Включение/выключение уведомлений
export const toggleNotifications = (enabled) => async (dispatch, getState) => {
  try {
    const state = getState().notifications;

    if (enabled && !state.hasPermission) {
      const granted = await dispatch(requestNotificationPermission());
      if (!granted) {
        dispatch({ type: NOTIFICATION_DISABLED });
        return { success: false };
      }
    }

    dispatch({ type: enabled ? NOTIFICATION_ENABLED : NOTIFICATION_DISABLED });

    const newState = getState().notifications;
    const settings = {
      enabled: newState.enabled,
      time: newState.time.toISOString(),
      frequency: newState.frequency,
    };

    await AsyncStorage.setItem(
      NOTIFICATION_SETTINGS_STORAGE_KEY,
      JSON.stringify(settings),
    );

    if (enabled) {
      await scheduleNotification(newState.time, newState.frequency);
    } else {
      await cancelAllNotifications();
    }

    return { success: true };
  } catch (error) {
    console.error("Error toggling notifications:", error);
    dispatch({ type: NOTIFICATION_ERROR, payload: error.message });
    return { success: false };
  }
};

// Установка времени уведомления
export const setNotificationTime = (time) => async (dispatch, getState) => {
  try {
    dispatch({ type: NOTIFICATION_TIME_SET, payload: time });

    const state = getState().notifications;
    if (state.enabled) {
      const settings = {
        enabled: state.enabled,
        time: time.toISOString(),
        frequency: state.frequency,
      };
      await AsyncStorage.setItem(
        NOTIFICATION_SETTINGS_STORAGE_KEY,
        JSON.stringify(settings),
      );
      await scheduleNotification(time, state.frequency);
    }
  } catch (error) {
    console.error("Error setting notification time:", error);
    dispatch({ type: NOTIFICATION_ERROR, payload: error.message });
  }
};

// Установка периодичности уведомлений
export const setNotificationFrequency =
  (frequency) => async (dispatch, getState) => {
    try {
      dispatch({ type: NOTIFICATION_FREQUENCY_SET, payload: frequency });

      const state = getState().notifications;
      if (state.enabled) {
        const settings = {
          enabled: state.enabled,
          time: state.time.toISOString(),
          frequency: frequency,
        };
        await AsyncStorage.setItem(
          NOTIFICATION_SETTINGS_STORAGE_KEY,
          JSON.stringify(settings),
        );
        await scheduleNotification(state.time, frequency);
      }
    } catch (error) {
      console.error("Error setting notification frequency:", error);
      dispatch({ type: NOTIFICATION_ERROR, payload: error.message });
    }
  };
