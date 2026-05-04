import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

export const FilterPanel = ({
  sortBy,
  onSortChange,
  priceRange,
  onPriceRangePress,
  roomsFilter,
  onRoomsPress,
  onReset,
  sortOptions,
  currentSortLabel,
  authorFilter,
  onAuthorFilterChange,
  AUTHOR_FILTERS,
  myOffersCount,
  othersOffersCount,
  activeTab,
  t,
  themeColors,
}) => {
  const styles = createStyles(themeColors);

  // Показываем фильтр по автору только для локальных объявлений
  const showAuthorFilter = activeTab === "local";

  return (
    <View style={styles.filtersPanel}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity style={styles.filterChip} onPress={onSortChange}>
          <Text style={styles.filterChipText}>📊 {currentSortLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterChip} onPress={onPriceRangePress}>
          <Text style={styles.filterChipText}>
            💰 {priceRange.min || t("mainScreen.from")} -{" "}
            {priceRange.max || t("mainScreen.to")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterChip} onPress={onRoomsPress}>
          <Text style={styles.filterChipText}>
            🚪 {roomsFilter ? roomsFilter : t("mainScreen.allRooms")}
          </Text>
        </TouchableOpacity>

        {showAuthorFilter && (
          <>
            <TouchableOpacity
              style={[
                styles.filterChip,
                authorFilter === AUTHOR_FILTERS.MY && styles.activeFilterChip,
              ]}
              onPress={() => onAuthorFilterChange(AUTHOR_FILTERS.MY)}
            >
              <Text style={styles.filterChipText}>
                👤 {t("mainScreen.myOffers")} ({myOffersCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                authorFilter === AUTHOR_FILTERS.OTHERS &&
                  styles.activeFilterChip,
              ]}
              onPress={() => onAuthorFilterChange(AUTHOR_FILTERS.OTHERS)}
            >
              <Text style={styles.filterChipText}>
                👥 {t("mainScreen.othersOffers")} ({othersOffersCount})
              </Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[styles.filterChip, styles.resetChip]}
          onPress={onReset}
        >
          <Text style={styles.filterChipText}>🔄 {t("mainScreen.reset")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    filtersPanel: {
      marginTop: 8,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.card,
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.inputBackground,
      marginHorizontal: 4,
    },
    activeFilterChip: {
      backgroundColor: colors.primary + "30",
      borderWidth: 1,
      borderColor: colors.primary,
    },
    resetChip: {
      backgroundColor: colors.error + "20",
    },
    filterChipText: {
      fontSize: 12,
      fontFamily: "mt-medium",
      color: colors.text,
    },
  });
