import { Share } from "react-native";
import * as FileSystem from "expo-file-system";

class ShareService {
  // Поделиться текстовой информацией об объявлении
  async shareOffer(offer, t) {
    try {
      // Формируем текст для публикации
      const shareText = this.formatShareText(offer, t);

      const result = await Share.share({
        message: shareText,
        title: offer.title,
        url: offer.image,
      });

      if (result.action === Share.sharedAction) {
        console.log("Shared successfully");
        return { success: true };
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed");
        return { success: false, dismissed: true };
      }
    } catch (error) {
      console.log("Share error:", error);
      return { success: false, error: error.message };
    }
  }

  // Форматирование текста для публикации
  formatShareText(offer, t) {
    const lines = [
      `🏠 ${offer.title}`,
      ``,
      `${t("share.price")}: ${offer.price}`,
      `${t("share.address")}: ${offer.address}`,
    ];

    if (offer.rooms) {
      lines.push(`${t("share.rooms")}: ${offer.rooms}`);
    }

    if (offer.area) {
      lines.push(`${t("share.area")}: ${offer.area} м²`);
    }

    if (offer.floor && offer.floorCount) {
      lines.push(`${t("share.floor")}: ${offer.floor}/${offer.floorCount}`);
    }

    if (offer.description) {
      lines.push(``);
      lines.push(
        `${t("share.description")}: ${offer.description.substring(0, 100)}${offer.description.length > 100 ? "..." : ""}`,
      );
    }

    // Добавляем информацию об авторе
    if (offer.authorName) {
      lines.push(``);
      lines.push(`👤 ${t("share.author")}: ${offer.authorName}`);
    }

    if (offer.authorEmail) {
      lines.push(`📧 ${t("share.email")}: ${offer.authorEmail}`);
    }

    lines.push(``);
    lines.push(`${t("share.viewInApp")}`);

    return lines.join("\n");
  }

  // Поделиться только изображением
  async shareImage(imageUrl, title) {
    try {
      // Скачиваем изображение во временную папку
      const fileUri = FileSystem.documentDirectory + "temp_image.jpg";
      await FileSystem.downloadAsync(imageUrl, fileUri);

      const result = await Share.share({
        title: title,
        url: fileUri,
        message: title,
      });

      // Удаляем временный файл
      await FileSystem.deleteAsync(fileUri);

      return { success: true };
    } catch (error) {
      console.log("Share image error:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new ShareService();
