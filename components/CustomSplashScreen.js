import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing, Image } from "react-native";

export default function CustomSplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
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

  return (
    <View style={[styles.container]}>
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
          source={require("../assets/1.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title]}>HomeHunt</Text>
        <View style={styles.loaderContainer}>
          <View style={[styles.loader]}>
            <Animated.View style={[styles.loaderProgress]} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: "mt-bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "mt-light",
    marginBottom: 40,
  },
  loaderContainer: {
    width: 200,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  loader: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  loaderProgress: {
    width: "100%",
    height: "100%",
    opacity: 0.3,
  },
});
