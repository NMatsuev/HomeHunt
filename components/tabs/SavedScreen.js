import { StyleSheet, View, Text } from "react-native";
import { gStyle } from "../../styles/style";
import { useTheme } from "../../theme/ThemeContext";

export default function SavedScreen() {
  const { themeColors } = useTheme();

  const styles = createStyles(themeColors);

  return (
    <View style={styles.container}>
      <Text style={[gStyle.title, { color: themeColors.text }]}>Сохранено</Text>
      <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
        Здесь будут отображаться сохраненные объявления
      </Text>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
      padding: 20,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: "mt-light",
      textAlign: "center",
      marginTop: 10,
    },
  });
