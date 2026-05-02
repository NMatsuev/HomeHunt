import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Animated,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { gStyle } from "../styles/style";
import useOffersViewModel from "./offersViewModel";
import useThemeViewModel from "./themeViewModel";
import useLanguageViewModel from "./languageViewModel";
import kufarCacheViewModel from "./kufarCacheViewModel";
import OfferForm from "../components/forms/OfferForm";
import networkService from "../services/networkService";
import { useFilterAndSort } from "../hooks/useFilterAndSort";
import { useNetworkBanner } from "../hooks/useNetworkBanner";
import { FilterPanel } from "../components/FilterPanel";
import { PriceRangeModal, RoomsModal } from "../components/FilterModals";
import { OfferCard } from "../components/OfferCard";
import { sortOptions } from "../config/SortOptions";

export default function MainScreen() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("local");
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRangeModal, setPriceRangeModal] = useState(false);
  const [roomsModal, setRoomsModal] = useState(false);

  const { showOfflineBanner, showOnlineBanner, bannerAnim, showBanner } =
    useNetworkBanner();

  // Сначала получаем данные
  const { offers, isLoading: localLoading, addOffer } = useOffersViewModel();
  const {
    ads: kufarAds,
    isLoading: kufarLoading,
    loadAds,
    refreshAds,
  } = kufarCacheViewModel();

  const { themeColors } = useThemeViewModel();
  const { t } = useLanguageViewModel();

  // Затем используем хук фильтрации с актуальными данными
  const currentData = activeTab === "local" ? offers : kufarAds;

  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    priceRange,
    setPriceRange,
    roomsFilter,
    setRoomsFilter,
    processedData,
    resetFilters,
  } = useFilterAndSort(currentData, activeTab);

  const sortOptionsList = sortOptions(t);
  const currentSortLabel =
    sortOptionsList.find((opt) => opt.key === sortBy)?.label ||
    t("mainScreen.sort.dateDesc");

  // Инициализация
  useEffect(() => {
    const init = async () => {
      const isConnected = await networkService.checkConnection();
      setIsOnline(isConnected);
      await loadAds({ limit: 10 }, isConnected);
    };
    init();
  }, []);

  useEffect(() => {
    const unsubscribe = networkService.addListener((connected) => {
      const wasConnected = isOnline;
      setIsOnline(connected);
      if (!connected && wasConnected) showBanner("offline");
      if (connected && !wasConnected) {
        showBanner("online");
        if (activeTab === "kufar") loadAds({ limit: 10 }, true);
      }
    });
    return unsubscribe;
  }, [isOnline, activeTab, loadAds, showBanner]);

  useEffect(() => {
    if (activeTab === "kufar" && kufarAds.length === 0) {
      loadAds({ limit: 10 }, isOnline);
    }
  }, [activeTab, kufarAds.length, loadAds, isOnline]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === "kufar" && isOnline) {
      await refreshAds({ limit: 10 }, true);
    } else if (activeTab === "kufar") {
      Alert.alert(t("common.offline"), t("mainScreen.cantRefreshOffline"));
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

  const handleSortChange = () => {
    const currentIndex = sortOptionsList.findIndex((opt) => opt.key === sortBy);
    const nextIndex = (currentIndex + 1) % sortOptionsList.length;
    setSortBy(sortOptionsList[nextIndex].key);
  };

  const isLoading = activeTab === "local" ? localLoading : kufarLoading;
  const totalCount = processedData?.length || 0;

  const styles = createStyles(themeColors);

  return (
    <View style={styles.container}>
      {/* Баннеры */}
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

        {/* Поиск */}
        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: themeColors.inputBackground,
                color: themeColors.text,
                borderColor: themeColors.border,
              },
            ]}
            placeholder={t("mainScreen.search")}
            placeholderTextColor={themeColors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: themeColors.primary },
            ]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Панель фильтров */}
        {showFilters && (
          <FilterPanel
            sortBy={sortBy}
            onSortChange={handleSortChange}
            priceRange={priceRange}
            onPriceRangePress={() => setPriceRangeModal(true)}
            roomsFilter={roomsFilter}
            onRoomsPress={() => setRoomsModal(true)}
            onReset={resetFilters}
            sortOptions={sortOptionsList}
            currentSortLabel={currentSortLabel}
            t={t}
            themeColors={themeColors}
          />
        )}

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

      {/* Модальные окна */}
      <PriceRangeModal
        visible={priceRangeModal}
        priceRange={priceRange}
        onMinChange={(text) => setPriceRange({ ...priceRange, min: text })}
        onMaxChange={(text) => setPriceRange({ ...priceRange, max: text })}
        onClose={() => setPriceRangeModal(false)}
        onApply={() => setPriceRangeModal(false)}
        t={t}
        themeColors={themeColors}
      />

      <RoomsModal
        visible={roomsModal}
        roomsFilter={roomsFilter}
        onRoomSelect={(num) => {
          setRoomsFilter(roomsFilter === num.toString() ? "" : num.toString());
          setRoomsModal(false);
        }}
        onClose={() => setRoomsModal(false)}
        t={t}
        themeColors={themeColors}
      />

      {/* Список объявлений */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : (
        <FlatList
          data={processedData}
          renderItem={({ item }) => (
            <OfferCard
              item={item}
              isLocalOffer={activeTab === "local"}
              onPress={() =>
                navigation.navigate("OfferDetails", { offer: item, activeTab })
              }
              themeColors={themeColors}
              t={t}
            />
          )}
          keyExtractor={(item) =>
            item?.id?.toString() || Math.random().toString()
          }
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
                {searchQuery || priceRange.min || priceRange.max || roomsFilter
                  ? t("mainScreen.noResults")
                  : activeTab === "local"
                    ? t("mainScreen.noOffers")
                    : !isOnline && kufarAds.length === 0
                      ? t("mainScreen.offlineNoData")
                      : t("mainScreen.noKufarOffers")}
              </Text>
            </View>
          }
        />
      )}

      {/* Модальное окно добавления объявления */}
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
    container: { flex: 1, backgroundColor: colors.background },
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
    offlineBanner: { backgroundColor: "#f44336" },
    onlineBanner: { backgroundColor: "#4CAF50" },
    bannerText: {
      color: "#fff",
      fontSize: 14,
      fontFamily: "mt-bold",
      textAlign: "center",
    },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
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
    addButtonText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
    searchContainer: { flexDirection: "row", marginTop: 12, gap: 8 },
    searchInput: {
      flex: 1,
      height: 40,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 14,
      fontFamily: "mt-light",
    },
    filterButton: {
      width: 40,
      height: 40,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    filterButtonText: { fontSize: 20 },
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
    activeTabButton: { backgroundColor: colors.card },
    tabButtonText: { fontSize: 14, fontFamily: "mt-bold" },
    counter: { fontSize: 14, marginTop: 8, fontFamily: "mt-light" },
    statusIndicator: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      gap: 6,
    },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { fontSize: 11, fontFamily: "mt-light" },
    listContainer: { padding: 16 },
    separator: { height: 12 },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 50,
    },
    emptyText: { fontSize: 16, fontFamily: "mt-light" },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    modalBackButton: { padding: 8 },
    modalBackText: { fontSize: 16, fontFamily: "mt-bold" },
    modalTitle: { fontSize: 18, fontFamily: "mt-bold" },
    modalPlaceholder: { width: 50 },
  });
