import axios from "axios";
import sqliteCacheService from "./sqliteCacheService";

const CACHE_KEY = "kufar_ads";

class KufarService {
  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_URL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });
    sqliteCacheService.initDatabase();
  }

  async searchAds(params = {}) {
    const { forceRefresh = false, isOnline = true, ...searchParams } = params;

    // Если нет интернета - берем из кэша
    if (!isOnline) {
      const cached = await sqliteCacheService.get(CACHE_KEY);
      if (cached && cached.length > 0) {
        console.log(`Offline mode: using cache (${cached.length} ads)`);
        return {
          success: true,
          data: cached,
          fromCache: true,
          offline: true,
          total: cached.length,
        };
      }
      return { success: false, error: "Нет интернета и нет кэша", data: [] };
    }

    // Если есть интернет - всегда берем свежие данные
    // (forceRefresh или обычный запрос - все равно идем в API)
    try {
      const queryParams = {
        login: process.env.EXPO_PUBLIC_EMAIL,
        token: process.env.EXPO_PUBLIC_API_KEY,
        category_id: searchParams.category_id || "1000",
        limit: searchParams.limit || 20,
      };

      console.log("Fetching fresh data from Kufar API...");
      const response = await this.client.get("/ads", { params: queryParams });

      if (response.data?.status === "ok") {
        const transformedData = (response.data.data || []).map((ad) =>
          this.transformToAppFormat(ad),
        );

        // Сохраняем в кэш
        await sqliteCacheService.set(CACHE_KEY, transformedData, 86400);
        console.log(`Saved ${transformedData.length} ads to cache`);

        return {
          success: true,
          data: transformedData,
          fromCache: false,
          total: transformedData.length,
        };
      }

      return { success: false, error: "API error", data: [] };
    } catch (error) {
      console.error("Kufar API error:", error);

      // При ошибке API пробуем кэш
      const cached = await sqliteCacheService.get(CACHE_KEY);
      if (cached && cached.length > 0) {
        console.log(`API error, using cached data (${cached.length} ads)`);
        return {
          success: true,
          data: cached,
          fromCache: true,
          error: error.message,
          total: cached.length,
        };
      }

      return { success: false, error: error.message, data: [] };
    }
  }

  // Принудительное обновление (для pull-to-refresh)
  async refreshAds(params = {}) {
    return this.searchAds({ ...params, forceRefresh: true });
  }

  // Очистка кэша
  async clearCache() {
    return sqliteCacheService.delete(CACHE_KEY);
  }

  // Проверка наличия кэша
  async hasCache() {
    const cached = await sqliteCacheService.get(CACHE_KEY);
    return cached && cached.length > 0;
  }

  transformToAppFormat(kufarAd) {
    const getParam = (params, paramName, defaultValue = "") => {
      const param = params?.find((p) => p.p === paramName);
      return param?.v || defaultValue;
    };

    const getArrayParam = (params, paramName, defaultValue = []) => {
      const param = params?.find((p) => p.p === paramName);
      return param?.v || defaultValue;
    };

    const rooms = getParam(kufarAd.ad_parameters, "rooms", "0");
    const area = getParam(kufarAd.ad_parameters, "size", "0");
    const floor = getParam(kufarAd.ad_parameters, "floor", "0");
    const floorCount = getParam(kufarAd.ad_parameters, "re_number_floors", "0");
    const address = getParam(
      kufarAd.account_parameters,
      "address",
      kufarAd.subject,
    );
    const coordinates = getArrayParam(
      kufarAd.ad_parameters,
      "coordinates",
      [0, 0],
    );

    const getImageUrl = (image) => {
      if (!image?.path) return null;
      if (image.path.startsWith("http")) return image.path;
      const cleanPath = image.path.replace(/^\/+/, "");
      return process.env.EXPO_PUBLIC_IMAGE_URL + `/${cleanPath}`;
    };

    const firstImage = kufarAd.images?.[0];
    const imageUrl = firstImage ? getImageUrl(firstImage) : null;

    const currency =
      kufarAd.currency === "USD" ? "$" : kufarAd.currency === "EUR" ? "€" : "₽";

    let priceText = "-";
    if (kufarAd.price_usd && kufarAd.price_usd !== "hidden_in_demo") {
      priceText = `${kufarAd.price_usd} ${currency}`;
    } else if (kufarAd.price_byn && kufarAd.price_byn !== "hidden_in_demo") {
      priceText = `${kufarAd.price_byn} ₽`;
    }

    const adType = kufarAd.type === "sell" ? "Продажа" : "Аренда";

    return {
      id: kufarAd.list_id?.toString() || kufarAd.ad_id,
      title: kufarAd.subject,
      price: priceText,
      rooms: parseInt(rooms) || 0,
      area: parseFloat(area) || 0,
      floor: floor.toString(),
      floorCount: parseInt(floorCount) || 1,
      address: address,
      description: kufarAd.body || "",
      image: imageUrl ? { uri: imageUrl } : require("../assets/logo.png"),
      coordinates: { lat: coordinates[1] || 0, lng: coordinates[0] || 0 },
      type: adType,
      isCompanyAd: kufarAd.company_ad || false,
      phone: kufarAd.phone?.[0] || null,
      currency: kufarAd.currency,
      listTime: kufarAd.list_time,
      raw: kufarAd,
    };
  }
}

export default new KufarService();
