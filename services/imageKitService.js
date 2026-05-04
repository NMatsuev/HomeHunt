// src/services/imageKitService.js
import axios from "axios";
import { Platform, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

class ImageKitService {
  setTranslateFunction(translateFn) {
    this.translateFunction = translateFn;
  }

  getTranslation(key) {
    if (this.translateFunction) {
      return this.translateFunction(`form.${key}`);
    }
    // Fallback на английский
    const fallbacks = {
      permissionNeeded: "Permission needed",
      grandCameraPermissions: "Please grant camera permissions to take photos",
      grandGalleryPermissions:
        "Please grant gallery permissions to select photos",
    };
    return fallbacks[key] || "Error. Try again later";
  }
  // Запрос разрешений для галереи
  async requestGalleryPermission() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        this.getTranslation("permissionNeeded"),
        this.getTranslation("grandGalleryPermissions"),
      );
      return false;
    }
    return true;
  }

  // Запрос разрешений для камеры
  async requestCameraPermission() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        this.getTranslation("permissionNeeded"),
        this.getTranslation("grandCameraPermissions"),
      );
      return false;
    }
    return true;
  }

  // Выбор изображения из галереи
  async pickImage() {
    try {
      const hasPermission = await this.requestGalleryPermission();
      if (!hasPermission) {
        throw new Error("Gallery permission denied");
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true, // Включаем base64 сразу в ImagePicker
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          fileName: asset.fileName || `image_${Date.now()}.jpg`,
          base64: asset.base64, // Используем base64 из ImagePicker
          type: asset.type || "image/jpeg",
          size: asset.fileSize || 0,
          width: asset.width,
          height: asset.height,
        };
      }
      throw new Error("No image selected");
    } catch (error) {
      console.log("Error picking image:", error);
    }
  }

  // Съемка фото на камеру
  async takePhoto() {
    try {
      const hasPermission = await this.requestCameraPermission();
      if (!hasPermission) {
        throw new Error("Camera permission denied");
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true, // Включаем base64 сразу в ImagePicker
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          fileName: asset.fileName || `photo_${Date.now()}.jpg`,
          base64: asset.base64, // Используем base64 из ImagePicker
          type: asset.type || "image/jpeg",
          size: asset.fileSize || 0,
          width: asset.width,
          height: asset.height,
        };
      }
      throw new Error("No photo taken");
    } catch (error) {
      console.log("Error taking photo:", error);
    }
  }

  // Загрузка изображения на ImageKit (современная версия)
  async uploadToImageKit(imageUri, fileName, base64Data) {
    try {
      console.log("Starting upload to ImageKit...");

      // Используем base64, который получили напрямую из ImagePicker
      let base64String = base64Data;

      // Если base64 не передан, пытаемся получить из URI через fetch
      if (!base64String) {
        console.log("No base64 provided, fetching from URI...");
        base64String = await this.convertUriToBase64(imageUri);
      }

      if (!base64String) {
        throw new Error("Failed to get image data");
      }

      // Определяем MIME тип
      const mimeType = fileName?.endsWith(".png") ? "image/png" : "image/jpeg";
      const finalFileName = fileName || `offer_${Date.now()}.jpg`;

      // Формируем данные для загрузки
      const formData = new FormData();
      formData.append("file", `data:${mimeType};base64,${base64String}`);
      formData.append("fileName", finalFileName);
      formData.append("useUniqueFileName", "true");
      formData.append("folder", "/offers");
      formData.append("tags", "real-estate,offer");

      console.log("Uploading to ImageKit...");

      // Загружаем на ImageKit
      const response = await axios.post(
        process.env.EXPO_PUBLIC_IMAGEKIT_URL,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Basic ${btoa(`${process.env.EXPO_PUBLIC_IMAGEKIT_PRIVATE_KEY}:`)}`,
          },
          timeout: 60000,
        },
      );

      console.log("ImageKit upload successful");

      if (response.data && response.data.url) {
        return {
          success: true,
          url: response.data.url,
          fileId: response.data.fileId,
          thumbnailUrl: response.data.thumbnailUrl,
          name: response.data.name,
          size: response.data.size,
        };
      } else {
        throw new Error("Upload failed - no URL in response");
      }
    } catch (error) {
      console.error("ImageKit upload error:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
      return {
        success: false,
        error: error.message || "Upload failed",
      };
    }
  }

  // Конвертация URI в Base64 через fetch (современный метод)
  async convertUriToBase64(uri) {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Получаем base64 без префикса data:image/...
          const base64String = reader.result.split(",")[1];
          resolve(base64String);
        };
        reader.onerror = (error) => {
          console.error("FileReader error:", error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting URI to base64:", error);
    }
  }

  // Удаление изображения из ImageKit
  async deleteFromImageKit(fileId) {
    try {
      await axios.delete(`https://api.imagekit.io/v1/files/${fileId}`, {
        headers: {
          Authorization: `Basic ${btoa(`${process.env.EXPO_PUBLIC_IMAGEKIT_PRIVATE_KEY}:`)}`,
        },
      });
      return { success: true };
    } catch (error) {
      console.error("Delete from ImageKit error:", error);
      return { success: false };
    }
  }

  // Получение оптимизированного URL изображения
  getOptimizedImageUrl(originalUrl, options = {}) {
    const { width, height, quality = 80, format = "webp" } = options;

    if (!originalUrl) {
      console.log("No original URL provided");
      return null;
    }

    console.log("Original URL:", originalUrl);

    // Если URL уже содержит параметры ImageKit
    if (originalUrl.includes("ik.imagekit.io")) {
      // Если нужно только качество и формат без изменения размера
      if (!width && !height) {
        const result = `${originalUrl}?tr=q-${quality},f-${format}`;
        console.log("Optimized URL (no resize):", result);
        return result;
      }

      // Формируем трансформацию для изменения размера
      const transformations = [];
      if (width) transformations.push(`w-${width}`);
      if (height) transformations.push(`h-${height}`);
      transformations.push(`q-${quality}`);
      transformations.push(`f-${format}`);

      const result = `${originalUrl}?tr=${transformations.join(",")}`;
      console.log("Optimized URL (with resize):", result);
      return result;
    }

    // Если URL не от ImageKit, возвращаем как есть
    console.log("Not an ImageKit URL, returning as is");
    return originalUrl;
  }

  // Получение миниатюры изображения
  getThumbnailUrl(originalUrl, size = 200) {
    return this.getOptimizedImageUrl(originalUrl, {
      width: size,
      height: size,
      quality: 70,
      format: "webp",
    });
  }
}

export default new ImageKitService();
