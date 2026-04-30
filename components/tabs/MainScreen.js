import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  TextInput,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { gStyle } from "../../styles/style";
import useOffersViewModel from "../../viewModels/offersViewModel";
import useThemeViewModel from "../../viewModels/themeViewModel";
import useLanguageViewModel from "../../viewModels/languageViewModel";
import kufarCacheViewModel from "../../viewModels/kufarCacheViewModel";
import OfferForm from "../../components/forms/OfferForm";
import OfferImage from "../../components/OfferImage";
import networkService from "../../services/networkService";

// Функция нечеткого поиска (Levenshtein distance)
const fuzzySearch = (text, query) => {
  if (!query || query.length === 0) return true;

  text = text.toLowerCase();
  query = query.toLowerCase();

  // Прямое вхождение
  if (text.includes(query)) return true;

  // Проверка по словам
  const textWords = text.split(/\s+/);
  const queryWords = query.split(/\s+/);

  for (const qWord of queryWords) {
    for (const tWord of textWords) {
      // Проверка на схожесть (расстояние Левенштейна)
      if (levenshteinDistance(tWord, qWord) <= 2) {
        return true;
      }
      // Проверка начала слова
      if (tWord.startsWith(qWord) || qWord.startsWith(tWord)) {
        return true;
      }
    }
  }

  return false;
};

// Алгоритм Левенштейна для расчета расстояния между строками
const levenshteinDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[b.length][a.length];
};

export default function MainScreen() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("local");
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [showOnlineBanner, setShowOnlineBanner] = useState(false);

  // Состояния для фильтрации и сортировки
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("date_desc");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [roomsFilter, setRoomsFilter] = useState("");
  const [priceRangeModal, setPriceRangeModal] = useState(false);
  const [roomsModal, setRoomsModal] = useState(false);

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

  const {
    ads: kufarAds,
    isLoading: kufarLoading,
    loadAds,
    refreshAds,
  } = kufarCacheViewModel();

  const { themeColors } = useThemeViewModel();
  const { t } = useLanguageViewModel();

  // Функция фильтрации и поиска
  const filterAndSearchOffers = useCallback(
    (items) => {
      if (!items || items.length === 0) return [];

      let filtered = [...items];

      // Нечеткий поиск по заголовку, адресу и описанию
      if (searchQuery.trim()) {
        filtered = filtered.filter(
          (item) =>
            fuzzySearch(item.title || "", searchQuery) ||
            fuzzySearch(item.address || "", searchQuery) ||
            fuzzySearch(item.description || "", searchQuery),
        );
      }

      // Фильтр по цене
      if (priceRange.min) {
        const minPrice = parseInt(priceRange.min);
        filtered = filtered.filter((item) => {
          const price = parseInt(item.price?.replace(/[^\d]/g, "")) || 0;
          return price >= minPrice;
        });
      }

      if (priceRange.max) {
        const maxPrice = parseInt(priceRange.max);
        filtered = filtered.filter((item) => {
          const price = parseInt(item.price?.replace(/[^\d]/g, "")) || 0;
          return price <= maxPrice;
        });
      }

      // Фильтр по комнатам
      if (roomsFilter) {
        filtered = filtered.filter(
          (item) => item.rooms === parseInt(roomsFilter),
        );
      }

      return filtered;
    },
    [searchQuery, priceRange.min, priceRange.max, roomsFilter],
  );

  // Функция сортировки
  const sortOffers = useCallback(
    (items) => {
      const sorted = [...items];

      switch (sortBy) {
        case "price_asc":
          sorted.sort((a, b) => {
            const priceA = parseInt(a.price?.replace(/[^\d]/g, "")) || 0;
            const priceB = parseInt(b.price?.replace(/[^\d]/g, "")) || 0;
            return priceA - priceB;
          });
          break;
        case "price_desc":
          sorted.sort((a, b) => {
            const priceA = parseInt(a.price?.replace(/[^\d]/g, "")) || 0;
            const priceB = parseInt(b.price?.replace(/[^\d]/g, "")) || 0;
            return priceB - priceA;
          });
          break;
        case "rooms_asc":
          sorted.sort((a, b) => (a.rooms || 0) - (b.rooms || 0));
          break;
        case "rooms_desc":
          sorted.sort((a, b) => (b.rooms || 0) - (a.rooms || 0));
          break;
        case "area_asc":
          sorted.sort((a, b) => (a.area || 0) - (b.area || 0));
          break;
        case "area_desc":
          sorted.sort((a, b) => (b.area || 0) - (a.area || 0));
          break;
        case "date_desc":
        default:
          sorted.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
          break;
      }

      return sorted;
    },
    [sortBy],
  );

  // Получение отфильтрованных и отсортированных данных
  const getProcessedData = useCallback(() => {
    const sourceData = activeTab === "local" ? offers : kufarAds;
    const filtered = filterAndSearchOffers(sourceData);
    const sorted = sortOffers(filtered);
    return sorted;
  }, [activeTab, offers, kufarAds, filterAndSearchOffers, sortOffers]);

  const processedData = getProcessedData();
  const totalCount = processedData.length;

  // Сброс фильтров
  const resetFilters = () => {
    setSearchQuery("");
    setPriceRange({ min: "", max: "" });
    setRoomsFilter("");
    setSortBy("date_desc");
    setShowFilters(false);
  };

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

      if (!connected && wasConnected) {
        showBanner("offline", setShowOfflineBanner);
      }

      if (connected && !wasConnected) {
        showBanner("online", setShowOnlineBanner);
        if (activeTab === "kufar") {
          loadAds({ limit: 10 }, true);
        }
      }
    });

    return unsubscribe;
  }, [isOnline, activeTab]);

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

  const renderOffer = ({ item }) => {
    const isLocalOffer = activeTab === "local";
    return (
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
          {isLocalOffer ? (
            <OfferImage
              imageUrl={typeof item.image === "string" ? item.image : null}
              style={styles.image}
              width={100}
              height={130}
              optimized={true}
            />
          ) : (
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="cover"
              onError={(e) =>
                console.log("Kufar image error:", e.nativeEvent.error)
              }
            />
          )}
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
  };

  const isLoading = activeTab === "local" ? localLoading : kufarLoading;
  const data = processedData;

  const styles = createStyles(themeColors);

  const sortOptions = [
    { key: "date_desc", label: t("mainScreen.sort.dateDesc"), icon: "📅↓" },
    { key: "price_asc", label: t("mainScreen.sort.priceAsc"), icon: "💰↑" },
    { key: "price_desc", label: t("mainScreen.sort.priceDesc"), icon: "💰↓" },
    { key: "rooms_asc", label: t("mainScreen.sort.roomsAsc"), icon: "🚪↑" },
    { key: "rooms_desc", label: t("mainScreen.sort.roomsDesc"), icon: "🚪↓" },
    { key: "area_asc", label: t("mainScreen.sort.areaAsc"), icon: "📐↑" },
    { key: "area_desc", label: t("mainScreen.sort.areaDesc"), icon: "📐↓" },
  ];

  const currentSortLabel =
    sortOptions.find((opt) => opt.key === sortBy)?.label ||
    t("mainScreen.sort.dateDesc");

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
          <View
            style={[styles.filtersPanel, { backgroundColor: themeColors.card }]}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {/* Сортировка */}
              <TouchableOpacity
                style={styles.filterChip}
                onPress={() => {
                  const currentIndex = sortOptions.findIndex(
                    (opt) => opt.key === sortBy,
                  );
                  const nextIndex = (currentIndex + 1) % sortOptions.length;
                  setSortBy(sortOptions[nextIndex].key);
                }}
              >
                <Text style={styles.filterChipText}>📊 {currentSortLabel}</Text>
              </TouchableOpacity>

              {/* Цена от */}
              <TouchableOpacity
                style={styles.filterChip}
                onPress={() => setPriceRangeModal(true)}
              >
                <Text style={styles.filterChipText}>
                  💰 {priceRange.min || "от"} - {priceRange.max || "до"}
                </Text>
              </TouchableOpacity>

              {/* Комнаты */}
              <TouchableOpacity
                style={styles.filterChip}
                onPress={() => setRoomsModal(true)}
              >
                <Text style={styles.filterChipText}>
                  🚪 {roomsFilter ? `${roomsFilter}` : t("mainScreen.allRooms")}
                </Text>
              </TouchableOpacity>

              {/* Сброс */}
              <TouchableOpacity
                style={[styles.filterChip, styles.resetChip]}
                onPress={resetFilters}
              >
                <Text style={styles.filterChipText}>
                  🔄 {t("mainScreen.reset")}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
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

        {/* Индикатор статуса соединения */}
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

      {/* Модальное окно выбора цены */}
      <Modal
        visible={priceRangeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPriceRangeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.priceModal, { backgroundColor: themeColors.card }]}
          >
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              {t("mainScreen.priceRange")}
            </Text>
            <TextInput
              style={[
                styles.priceInput,
                {
                  backgroundColor: themeColors.inputBackground,
                  color: themeColors.text,
                  borderColor: themeColors.border,
                },
              ]}
              placeholder={t("mainScreen.from")}
              placeholderTextColor={themeColors.placeholder}
              keyboardType="numeric"
              value={priceRange.min}
              onChangeText={(text) =>
                setPriceRange({ ...priceRange, min: text })
              }
            />
            <TextInput
              style={[
                styles.priceInput,
                {
                  backgroundColor: themeColors.inputBackground,
                  color: themeColors.text,
                  borderColor: themeColors.border,
                },
              ]}
              placeholder={t("mainScreen.to")}
              placeholderTextColor={themeColors.placeholder}
              keyboardType="numeric"
              value={priceRange.max}
              onChangeText={(text) =>
                setPriceRange({ ...priceRange, max: text })
              }
            />
            <TouchableOpacity
              style={[
                styles.applyButton,
                { backgroundColor: themeColors.primary },
              ]}
              onPress={() => setPriceRangeModal(false)}
            >
              <Text style={styles.applyButtonText}>
                {t("mainScreen.apply")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Модальное окно выбора комнат */}
      <Modal
        visible={roomsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRoomsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.roomsModal, { backgroundColor: themeColors.card }]}
          >
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>
              {t("mainScreen.selectRooms")}
            </Text>
            {[1, 2, 3, 4, 5].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.roomOption,
                  roomsFilter === num.toString() && styles.roomOptionActive,
                ]}
                onPress={() => {
                  setRoomsFilter(
                    roomsFilter === num.toString() ? "" : num.toString(),
                  );
                  setRoomsModal(false);
                }}
              >
                <Text
                  style={[
                    styles.roomOptionText,
                    { color: themeColors.text },
                    roomsFilter === num.toString() && {
                      color: themeColors.primary,
                    },
                  ]}
                >
                  {t("mainScreen.roomsCount", { count: num })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

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
    searchContainer: {
      flexDirection: "row",
      marginTop: 12,
      gap: 8,
    },
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
    filterButtonText: {
      fontSize: 20,
    },
    filtersPanel: {
      marginTop: 8,
      paddingVertical: 8,
      borderRadius: 8,
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.inputBackground,
      marginHorizontal: 4,
    },
    resetChip: {
      backgroundColor: colors.error + "20",
    },
    filterChipText: {
      fontSize: 12,
      fontFamily: "mt-medium",
      color: colors.text,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    priceModal: {
      width: "80%",
      padding: 20,
      borderRadius: 12,
      gap: 12,
    },
    roomsModal: {
      width: "80%",
      padding: 20,
      borderRadius: 12,
      gap: 8,
    },
    priceInput: {
      height: 40,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 14,
      fontFamily: "mt-light",
    },
    roomOption: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    roomOptionActive: {
      backgroundColor: colors.primary + "20",
    },
    roomOptionText: {
      fontSize: 16,
      fontFamily: "mt-bold",
      textAlign: "center",
    },
    applyButton: {
      height: 40,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 8,
    },
    applyButtonText: {
      color: "#fff",
      fontSize: 14,
      fontFamily: "mt-bold",
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
