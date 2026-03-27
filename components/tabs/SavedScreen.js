import { StyleSheet, View, Text } from "react-native";
import { gStyle } from "../../styles/style";
import useThemeViewModel from "../../viewModels/themeViewModel";
import useLanguageViewModel from "../../viewModels/languageViewModel";

export default function SavedScreen() {
  const { themeColors } = useThemeViewModel();
  const { t } = useLanguageViewModel();
  const styles = createStyles(themeColors);

  return (
    <View style={styles.container}>
      <Text style={[gStyle.title, { color: themeColors.text }]}>
        {t("savedScreen.title")}
      </Text>
      <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
        {t("savedScreen.text")}
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
