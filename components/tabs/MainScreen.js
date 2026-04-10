import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { gStyle } from "../../styles/style";
import useOffersViewModel from "../../viewModels/offersViewModel";
import useThemeViewModel from "../../viewModels/themeViewModel";
import useLanguageViewModel from "../../viewModels/languageViewModel";
import kufarCacheViewModel from "../../viewModels/kufarCacheViewModel";
import OfferForm from "../../components/forms/OfferForm";
import networkService from "../../services/networkService";

export default function MainScreen() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("local"); // 'local' or 'kufar'
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [showOnlineBanner, setShowOnlineBanner] = useState(false);

  // Анимация для банера
  const bannerAnim = useState(new Animated.Value(0))[0];

  const showBanner = useCallback(
    (type) => {
      const setShowFunction =
        type === "offline" ? setShowOfflineBanner : setShowOnlineBanner;
      setShowFunction(true);

      Animated.sequence([
        Animated.timing(bannerAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(bannerAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowFunction(false);
      });
    },
    [bannerAnim],
  );

  const {
    offers,
    isLoading: localLoading,
    addOffer,
    totalCount: localCount,
  } = useOffersViewModel();

  // Объявления из Kufar с кэшированием
  const {
    ads: kufarAds,
    isLoading: kufarLoading,
    fromCache,
    lastUpdated,
    loadAds,
    refreshAds,
  } = kufarCacheViewModel();

  const { themeColors } = useThemeViewModel();
  const { t } = useLanguageViewModel();

  // Инициализация: загружаем при старте
  useEffect(() => {
    const init = async () => {
      const isConnected = await networkService.checkConnection();
      setIsOnline(isConnected);

      // Загружаем данные для Kufar (автоматически решит: кэш или API)
      await loadAds({ limit: 10 }, isConnected);
    };

    init();
  }, []);

  // Мониторинг интернет-соединения
  useEffect(() => {
    const unsubscribe = networkService.addListener((connected) => {
      const wasConnected = isOnline;
      setIsOnline(connected);

      if (!connected && wasConnected) {
        showBanner("offline", setShowOfflineBanner);
      }

      if (connected && !wasConnected) {
        showBanner("online", setShowOnlineBanner);

        // При восстановлении сети обновляем если на вкладке Kufar
        if (activeTab === "kufar") {
          loadAds({ limit: 10 }, true);
        }
      }
    });

    return unsubscribe;
  }, [isOnline, activeTab]);

  // При переключении на вкладку Kufar
  useEffect(() => {
    if (activeTab === "kufar" && kufarAds.length === 0) {
      loadAds({ limit: 10 }, isOnline);
    }
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);

    if (activeTab === "kufar") {
      if (isOnline) {
        await refreshAds({ limit: 10 }, true);
      } else {
        Alert.alert(t("common.offline"), t("mainScreen.cantRefreshOffline"));
      }
    }

    setRefreshing(false);
  };

  const handleAddOffer = async (newOffer) => {
    const result = await addOffer(newOffer);
    if (result.success) {
      setModalVisible(false);
      Alert.alert(t("common.success"), t("mainScreen.offerAdded"));
    } else {
      Alert.alert(
        t("common.error"),
        result.error || t("mainScreen.errorAddingOffer"),
      );
    }
  };

  const renderOffer = ({ item }) => (
    <TouchableOpacity
      style={[styles.offerCard, { backgroundColor: themeColors.card }]}
      activeOpacity={0.7}
      onPress={() =>
        navigation.navigate("OfferDetails", {
          offer: item,
          activeTab: activeTab,
        })
      }
    >
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
      </View>

      <View style={styles.infoContainer}>
        <Text
          style={[styles.title, { color: themeColors.text }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: themeColors.primary }]}>
            {item.price}
          </Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: `${themeColors.primary}20` },
            ]}
          >
            <Text style={[styles.badgeText, { color: themeColors.primary }]}>
              {item.type || t("mainScreen.rooms", { count: item.rooms })}
            </Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <Text
            style={[styles.detailText, { color: themeColors.textSecondary }]}
          >
            {item.area > 0 ? t("mainScreen.area", { value: item.area }) : "—"}
          </Text>
          <Text
            style={[styles.detailText, { color: themeColors.textSecondary }]}
          >
            {item.floor && item.floorCount
              ? t("mainScreen.floor", {
                  current: item.floor,
                  total: item.floorCount,
                })
              : "—"}
          </Text>
        </View>

        <View style={styles.addressContainer}>
          <Text
            style={[styles.address, { color: themeColors.textSecondary }]}
            numberOfLines={1}
          >
            {t("mainScreen.address", { address: item.address })}
          </Text>
        </View>

        <Text
          style={[styles.description, { color: themeColors.textSecondary }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const isLoading = activeTab === "local" ? localLoading : kufarLoading;
  const data = activeTab === "local" ? offers : kufarAds;
  const totalCount = activeTab === "local" ? localCount : kufarAds.length;

  const styles = createStyles(themeColors);

  return (
    <View style={styles.container}>
      {/* Баннеры уведомлений */}
      {showOfflineBanner && (
        <Animated.View
          style={[
            styles.banner,
            styles.offlineBanner,
            {
              transform: [
                {
                  translateY: bannerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.bannerText}>{t("mainScreen.offline")}</Text>
        </Animated.View>
      )}

      {showOnlineBanner && (
        <Animated.View
          style={[
            styles.banner,
            styles.onlineBanner,
            {
              transform: [
                {
                  translateY: bannerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.bannerText}>{t("mainScreen.online")}</Text>
        </Animated.View>
      )}

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[gStyle.title, { color: themeColors.text }]}>
            {t("mainScreen.title")}
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: themeColors.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Переключатель источников */}
        <View style={styles.tabSwitch}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "local" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("local")}
          >
            <Text
              style={[
                styles.tabButtonText,
                {
                  color:
                    activeTab === "local"
                      ? themeColors.primary
                      : themeColors.textSecondary,
                },
              ]}
            >
              {t("mainScreen.myOffers")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "kufar" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("kufar")}
          >
            <Text
              style={[
                styles.tabButtonText,
                {
                  color:
                    activeTab === "kufar"
                      ? themeColors.primary
                      : themeColors.textSecondary,
                },
              ]}
            >
              Kufar
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.counter, { color: themeColors.textSecondary }]}>
          {t("mainScreen.found", { count: totalCount })}
        </Text>

        {/* Индикатор статуса соединения (маленький) */}
        <View style={styles.statusIndicator}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isOnline ? "#4CAF50" : "#f44336" },
            ]}
          />
          <Text
            style={[styles.statusText, { color: themeColors.textSecondary }]}
          >
            {isOnline ? "Online" : "Offline"}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderOffer}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => (
            <View
              style={[
                styles.separator,
                { backgroundColor: themeColors.border },
              ]}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[themeColors.primary]}
              tintColor={themeColors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text
                style={[styles.emptyText, { color: themeColors.textSecondary }]}
              >
                {activeTab === "local"
                  ? "Нет сохраненных объявлений"
                  : !isOnline && kufarAds.length === 0
                    ? "Нет интернета и нет сохраненных объявлений"
                    : "Нет объявлений из Kufar"}
              </Text>
            </View>
          }
        />
      )}

      <Modal
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={[
            styles.modalHeader,
            {
              backgroundColor: themeColors.headerBackground,
              borderBottomColor: themeColors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.modalBackButton}
            onPress={() => setModalVisible(false)}
          >
            <Text
              style={[styles.modalBackText, { color: themeColors.primary }]}
            >
              ← {t("mainScreen.back")}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: themeColors.text }]}>
            {t("mainScreen.add")}
          </Text>
          <View style={styles.modalPlaceholder} />
        </View>
        <OfferForm
          onSubmit={handleAddOffer}
          onCancel={() => setModalVisible(false)}
          isEditing={false}
        />
      </Modal>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    banner: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    offlineBanner: {
      backgroundColor: "#f44336",
    },
    onlineBanner: {
      backgroundColor: "#4CAF50",
    },
    bannerText: {
      color: "#fff",
      fontSize: 14,
      fontFamily: "mt-bold",
      textAlign: "center",
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      backgroundColor: colors.headerBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    addButtonText: {
      color: "#fff",
      fontSize: 24,
      fontWeight: "bold",
    },
    tabSwitch: {
      flexDirection: "row",
      marginTop: 12,
      backgroundColor: colors.inputBackground,
      borderRadius: 8,
      padding: 4,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
      borderRadius: 6,
    },
    activeTabButton: {
      backgroundColor: colors.card,
    },
    tabButtonText: {
      fontSize: 14,
      fontFamily: "mt-bold",
    },
    counter: {
      fontSize: 14,
      marginTop: 8,
      fontFamily: "mt-light",
    },
    statusIndicator: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      gap: 6,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 11,
      fontFamily: "mt-light",
    },
    listContainer: {
      padding: 16,
    },
    separator: {
      height: 12,
    },
    offerCard: {
      flexDirection: "row",
      borderRadius: 12,
      padding: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    imageContainer: {
      width: 100,
      height: 130,
      borderRadius: 8,
      overflow: "hidden",
      marginRight: 12,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    infoContainer: {
      flex: 1,
      justifyContent: "space-between",
    },
    title: {
      fontSize: 16,
      fontFamily: "mt-bold",
      marginBottom: 4,
    },
    priceContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    price: {
      fontSize: 18,
      fontFamily: "mt-bold",
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      fontSize: 12,
      fontFamily: "mt-bold",
    },
    detailsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    detailText: {
      fontSize: 13,
      fontFamily: "mt-light",
    },
    addressContainer: {
      marginBottom: 6,
    },
    address: {
      fontSize: 12,
      fontFamily: "mt-light",
    },
    description: {
      fontSize: 12,
      fontFamily: "mt-light",
      lineHeight: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 50,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: "mt-light",
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    modalBackButton: {
      padding: 8,
    },
    modalBackText: {
      fontSize: 16,
      fontFamily: "mt-bold",
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: "mt-bold",
    },
    modalPlaceholder: {
      width: 50,
    },
  });
