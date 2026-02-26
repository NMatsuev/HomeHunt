import { StyleSheet, View, Text } from "react-native";
import { gStyle } from "../../styles/style";

export default function SavedScreen() {
  return (
    <View style={styles.container}>
      <Text style={gStyle.title}>Сохранено</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
