import * as Location from "expo-location";

class LocationService {
  // Запрос разрешения на определение местоположения
  async requestPermission() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  }

  // Получение текущего местоположения
  async getCurrentLocation() {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        throw new Error("Location permission denied");
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        success: true,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error("Error getting location:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Получение названия города по координатам (обратное геокодирование)
  async getCityFromCoordinates(latitude, longitude) {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        // Приоритет: city, subregion, region
        return address.city || address.subregion || address.region || null;
      }
      return null;
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      return null;
    }
  }

  // Получение текущего города одной операцией
  async getCurrentCity() {
    try {
      // Получаем координаты
      const locationResult = await this.getCurrentLocation();
      if (!locationResult.success) {
        return { success: false, error: locationResult.error };
      }

      // Получаем город по координатам
      const city = await this.getCityFromCoordinates(
        locationResult.latitude,
        locationResult.longitude,
      );

      if (city) {
        return { success: true, city };
      } else {
        return { success: false, error: "Could not determine city" };
      }
    } catch (error) {
      console.error("Error getting current city:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new LocationService();
