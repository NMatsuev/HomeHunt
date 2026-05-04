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
  t,
  themeColors,
}) => {
  const styles = createStyles(themeColors);

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
    resetChip: {
      backgroundColor: colors.error + "20",
    },
    filterChipText: {
      fontSize: 12,
      fontFamily: "mt-medium",
      color: colors.text,
    },
  });
