import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Notifications from "expo-notifications";
import {
  initializeNotifications,
  toggleNotifications,
  setNotificationTime,
  setNotificationFrequency,
  requestNotificationPermission,
} from "../redux/actions/notificationActions";

const useNotificationViewModel = () => {
  const dispatch = useDispatch();

  const notificationState = useSelector((state) => state.notifications);

  const enabled = notificationState?.enabled || false;
  const time = notificationState?.time || new Date();
  const frequency = notificationState?.frequency || "daily";
  const hasPermission = notificationState?.hasPermission || false;
  const isLoading = notificationState?.isLoading || false;
  const error = notificationState?.error || null;

  // Инициализация при первом запуске
  useEffect(() => {
    dispatch(initializeNotifications());

    // Подписка на получение уведомлений
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received in foreground:", notification);
      },
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
      });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, [dispatch]);

  // Включение/выключение уведомлений
  const toggleNotificationsEnabled = useCallback(
    async (value) => {
      const result = await dispatch(toggleNotifications(value));
      return result.success;
    },
    [dispatch],
  );

  // Установка времени
  const updateNotificationTime = useCallback(
    async (newTime) => {
      await dispatch(setNotificationTime(newTime));
    },
    [dispatch],
  );

  // Установка периодичности
  const updateNotificationFrequency = useCallback(
    async (newFrequency) => {
      await dispatch(setNotificationFrequency(newFrequency));
    },
    [dispatch],
  );

  // Запрос разрешений
  const requestPermission = useCallback(async () => {
    return await dispatch(requestNotificationPermission());
  }, [dispatch]);

  // Форматирование времени для отображения
  const formatTime = useCallback((date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, []);

  // Получение текста периодичности
  const getFrequencyLabel = useCallback((freqKey, t) => {
    const labels = {
      daily: t("settings.notifications.frequencyOptions.daily"),
      weekly: t("settings.notifications.frequencyOptions.weekly"),
      monthly: t("settings.notifications.frequencyOptions.monthly"),
    };
    return labels[freqKey] || freqKey;
  }, []);

  return {
    // Данные
    enabled,
    time,
    frequency,
    hasPermission,
    isLoading,
    error,

    // Методы
    toggleNotificationsEnabled,
    updateNotificationTime,
    updateNotificationFrequency,
    requestPermission,
    formatTime,
    getFrequencyLabel,
  };
};

export default useNotificationViewModel;
