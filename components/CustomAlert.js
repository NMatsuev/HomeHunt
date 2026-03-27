import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import useThemeViewModel from "../viewModels/themeViewModel";

export default function CustomAlert({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  cancelText = "Отмена",
  confirmText = "Удалить",
  confirmStyle = "destructive",
}) {
  const { themeColors } = useThemeViewModel();

  const styles = createStyles(themeColors);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View
          style={[styles.alertContainer, { backgroundColor: themeColors.card }]}
        >
          <Text style={[styles.title, { color: themeColors.text }]}>
            {title}
          </Text>
          <Text style={[styles.message, { color: themeColors.textSecondary }]}>
            {message}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                { borderColor: themeColors.border },
              ]}
              onPress={onCancel}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: themeColors.textSecondary },
                ]}
              >
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                {
                  backgroundColor:
                    confirmStyle === "destructive"
                      ? themeColors.error
                      : themeColors.primary,
                },
              ]}
              onPress={onConfirm}
            >
              <Text style={[styles.buttonText, { color: "#fff" }]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    alertContainer: {
      width: "80%",
      borderRadius: 12,
      padding: 20,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    title: {
      fontSize: 18,
      fontFamily: "mt-bold",
      marginBottom: 8,
      textAlign: "center",
    },
    message: {
      fontSize: 14,
      fontFamily: "mt-light",
      marginBottom: 20,
      textAlign: "center",
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    button: {
      flex: 1,
      height: 44,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 4,
    },
    cancelButton: {
      borderWidth: 1,
      backgroundColor: "transparent",
    },
    confirmButton: {
      elevation: 3,
    },
    buttonText: {
      fontSize: 14,
      fontFamily: "mt-bold",
    },
  });
