// src/components/OfferImage.js
import React, { useState } from "react";
import { View, Image, ActivityIndicator, StyleSheet } from "react-native";
import imageKitService from "../services/imageKitService";

const OfferImage = ({ imageUrl, style, optimized = true, width, height }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Нормализация URL изображения для разных источников
  const normalizeImageUrl = () => {
    if (!imageUrl) return null;

    // Если это уже строка URL
    if (typeof imageUrl === "string") {
      // Если URL уже полный (http:// или https://)
      if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        return imageUrl;
      }
      // Если это base64
      if (imageUrl.startsWith("data:image")) {
        return imageUrl;
      }
    }

    // Если это объект с URI (для локальных изображений)
    if (typeof imageUrl === "object" && imageUrl?.uri) {
      return imageUrl.uri;
    }

    return null;
  };

  const getImageUrl = () => {
    const normalizedUrl = normalizeImageUrl();

    if (!normalizedUrl) return null;

    // Проверяем, является ли URL изображением из ImageKit
    const isImageKitUrl = normalizedUrl.includes("ik.imagekit.io");

    if (optimized && isImageKitUrl && (width || height)) {
      return imageKitService.getOptimizedImageUrl(normalizedUrl, {
        width: width || 400,
        height: height || 300,
        quality: 80,
        format: "webp",
      });
    }

    return normalizedUrl;
  };

  const finalUrl = getImageUrl();

  if (!finalUrl) {
    return (
      <View style={[styles.placeholder, style]}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.placeholderImage}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      <Image
        source={{ uri: finalUrl }}
        style={[styles.image, style]}
        onLoadStart={() => {
          setLoading(true);
          setError(false);
        }}
        onLoadEnd={() => setLoading(false)}
        onError={(e) => {
          console.error(
            "Image load error:",
            e.nativeEvent.error,
            "URL:",
            finalUrl,
          );
          setError(true);
          setLoading(false);
        }}
      />
      {error && (
        <View style={styles.errorContainer}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.placeholderImage}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    zIndex: 1,
  },
  errorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  placeholderImage: {
    width: 50,
    height: 50,
    opacity: 0.5,
  },
});

export default OfferImage;
