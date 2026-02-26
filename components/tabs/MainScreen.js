import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { gStyle } from "../../styles/style";
import { useLanguage } from "../../i18n/LanguageContext";
import { useTheme } from "../../theme/ThemeContext";

const INITIAL_OFFERS = [
  {
    id: "1",
    title: "Квартира в центре",
    price: "12 500 000 ₽",
    rooms: 3,
    area: 75,
    floor: "5",
    floorCount: 12,
    address: "ул. Тверская, 15, Москва",
    description:
      "Просторная квартира с панорамными окнами, отличный вариант для семьи. Рядом метро, парк и вся необходимая инфраструктура.",
    image: "https://via.placeholder.com/100x100/ff6b6b/ffffff?text=🏠",
  },
  {
    id: "2",
    title: "Студия в новостройке",
    price: "8 200 000 ₽",
    rooms: 1,
    area: 32,
    floor: "8",
    floorCount: 25,
    address: "ул. Ленина, 42, Москва",
    description:
      "Уютная студия с чистовой отделкой, подходит для инвестиций или проживания. Дом сдан, можно заезжать.",
    image: "https://via.placeholder.com/100x100/4ecdc4/ffffff?text=🏢",
  },
  {
    id: "3",
    title: "Двухуровневая квартира",
    price: "18 700 000 ₽",
    rooms: 4,
    area: 120,
    floor: "14-15",
    floorCount: 15,
    address: "пр. Мира, 87, Москва",
    description:
      "Эксклюзивное предложение - двухуровневая квартира с террасой и прекрасным видом на город.",
    image: "https://via.placeholder.com/100x100/ffd93d/ffffff?text=🏛️",
  },
  {
    id: "4",
    title: "Квартира у парка",
    price: "9 900 000 ₽",
    rooms: 2,
    area: 54,
    floor: "3",
    floorCount: 9,
    address: "ул. Парковая, 5, Москва",
    description:
      "Светлая квартира с выходом на парк. Хороший ремонт, встроенная кухня, кондиционер.",
    image: "https://via.placeholder.com/100x100/6c5ce7/ffffff?text=🌳",
  },
  {
    id: "5",
    title: "Пентхаус с террасой",
    price: "25 000 000 ₽",
    rooms: 5,
    area: 150,
    floor: "16",
    floorCount: 16,
    address: "наб. Тараса Шевченко, 3, Москва",
    description:
      "Роскошный пентхаус с собственной террасой 50 м², панорамным остеклением и видом на Москва-Сити.",
    image: "https://via.placeholder.com/100x100/e17055/ffffff?text=🏰",
  },
];

export default function MainScreen() {
  const { t } = useLanguage();
  const { themeColors } = useTheme();

  const renderOffer = ({ item }) => (
    <TouchableOpacity
      style={[styles.offerCard, { backgroundColor: themeColors.card }]}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.title, { color: themeColors.text }]}>
          {item.title}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: themeColors.primary }]}>
            {item.price}
          </Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: `${themeColors.primary}20` },
            ]}
          >
            <Text style={[styles.badgeText, { color: themeColors.primary }]}>
              {t("mainScreen.rooms", { count: item.rooms })}
            </Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>📐</Text>
            <Text
              style={[styles.detailText, { color: themeColors.textSecondary }]}
            >
              {t("mainScreen.area", { value: item.area })}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>📌</Text>
            <Text
              style={[styles.detailText, { color: themeColors.textSecondary }]}
            >
              {t("mainScreen.floor", {
                current: item.floor,
                total: item.floorCount,
              })}
            </Text>
          </View>
        </View>

        <View style={styles.addressContainer}>
          <Text style={styles.addressIcon}>📍</Text>
          <Text
            style={[styles.address, { color: themeColors.textSecondary }]}
            numberOfLines={1}
          >
            {t("mainScreen.address", { address: item.address })}
          </Text>
        </View>

        <Text
          style={[styles.description, { color: themeColors.textSecondary }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const styles = createStyles(themeColors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[gStyle.title, { color: themeColors.text }]}>
          {t("mainScreen.title")}
        </Text>
        <Text style={[styles.counter, { color: themeColors.textSecondary }]}>
          {t("mainScreen.found", { count: INITIAL_OFFERS.length })}
        </Text>
      </View>

      <FlatList
        data={INITIAL_OFFERS}
        renderItem={renderOffer}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => (
          <View
            style={[styles.separator, { backgroundColor: themeColors.border }]}
          />
        )}
      />
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      backgroundColor: colors.headerBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    counter: {
      fontSize: 14,
      marginTop: 4,
      fontFamily: "mt-light",
    },
    listContainer: {
      padding: 16,
    },
    separator: {
      height: 12,
    },
    offerCard: {
      flexDirection: "row",
      borderRadius: 12,
      padding: 12,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    imageContainer: {
      width: 100,
      height: 130,
      borderRadius: 8,
      overflow: "hidden",
      marginRight: 12,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    infoContainer: {
      flex: 1,
      justifyContent: "space-between",
    },
    title: {
      fontSize: 16,
      fontFamily: "mt-bold",
      marginBottom: 4,
    },
    priceContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    price: {
      fontSize: 18,
      fontFamily: "mt-bold",
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      fontSize: 12,
      fontFamily: "mt-bold",
    },
    detailsRow: {
      flexDirection: "row",
      marginBottom: 8,
    },
    detailItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
    },
    detailIcon: {
      fontSize: 14,
      marginRight: 4,
    },
    detailText: {
      fontSize: 13,
      fontFamily: "mt-light",
    },
    addressContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    addressIcon: {
      fontSize: 14,
      marginRight: 4,
    },
    address: {
      fontSize: 12,
      fontFamily: "mt-light",
      flex: 1,
    },
    description: {
      fontSize: 12,
      fontFamily: "mt-light",
      lineHeight: 16,
    },
  });
