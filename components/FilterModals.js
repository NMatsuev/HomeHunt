import React from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export const PriceRangeModal = ({
  visible,
  priceRange,
  onMinChange,
  onMaxChange,
  onClose,
  onApply,
  t,
  themeColors,
}) => {
  const styles = createStyles(themeColors);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.priceModal}>
          <Text style={styles.modalTitle}>{t("mainScreen.priceRange")}</Text>
          <TextInput
            style={styles.priceInput}
            placeholder={t("mainScreen.from")}
            placeholderTextColor={themeColors.placeholder}
            keyboardType="numeric"
            value={priceRange.min}
            onChangeText={onMinChange}
          />
          <TextInput
            style={styles.priceInput}
            placeholder={t("mainScreen.to")}
            placeholderTextColor={themeColors.placeholder}
            keyboardType="numeric"
            value={priceRange.max}
            onChangeText={onMaxChange}
          />
          <TouchableOpacity style={styles.applyButton} onPress={onApply}>
            <Text style={styles.applyButtonText}>{t("mainScreen.apply")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export const RoomsModal = ({
  visible,
  roomsFilter,
  onRoomSelect,
  onClose,
  t,
  themeColors,
}) => {
  const styles = createStyles(themeColors);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.roomsModal}>
          <Text style={styles.modalTitle}>{t("mainScreen.selectRooms")}</Text>
          {[1, 2, 3, 4, 5].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.roomOption,
                roomsFilter === num.toString() && styles.roomOptionActive,
              ]}
              onPress={() => onRoomSelect(num)}
            >
              <Text
                style={[
                  styles.roomOptionText,
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
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
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
      backgroundColor: colors.card,
    },
    roomsModal: {
      width: "80%",
      padding: 20,
      borderRadius: 12,
      gap: 8,
      backgroundColor: colors.card,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: "mt-bold",
      color: colors.text,
      marginBottom: 12,
    },
    priceInput: {
      height: 40,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 14,
      fontFamily: "mt-light",
      backgroundColor: colors.inputBackground,
      color: colors.text,
      borderColor: colors.border,
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
      color: colors.text,
    },
    applyButton: {
      height: 40,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 8,
      backgroundColor: colors.primary,
    },
    applyButtonText: {
      color: "#fff",
      fontSize: 14,
      fontFamily: "mt-bold",
    },
  });
