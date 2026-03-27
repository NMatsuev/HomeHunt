import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing, Image } from "react-native";
import useThemeViewModel from "../viewModels/themeViewModel";

export default function CustomSplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const { themeColors, isDark } = useThemeViewModel();

  useEffect(() => {
    // Параллельная анимация появления
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Таймер для скрытия сплеш-экрана
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const styles = createStyles(themeColors, isDark);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>HomeHunt</Text>
      </Animated.View>
    </View>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    content: {
      alignItems: "center",
      padding: 10,
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: 20,
    },
    title: {
      fontSize: 32,
      fontFamily: "mt-bold",
      color: colors.primary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: "mt-light",
      color: colors.textSecondary,
      textAlign: "center",
    },
  });
