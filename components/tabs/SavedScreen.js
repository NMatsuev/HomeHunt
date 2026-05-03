import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { gStyle } from "../../styles/style";
import useThemeViewModel from "../../viewModels/themeViewModel";
import useLanguageViewModel from "../../viewModels/languageViewModel";
import useOffersViewModel from "../../viewModels/offersViewModel";
import useSavedViewModel from "../../viewModels/savedViewModel";
import { OfferCard } from "../OfferCard";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

export default function SavedScreen() {
  const navigation = useNavigation();
  const { themeColors } = useThemeViewModel();
  const { t } = useLanguageViewModel();
  const { offers, isLoading: offersLoading, loadOffers } = useOffersViewModel();
  const {
    savedIds,
    isLoading: savedLoading,
    getSavedOffers,
    loadSavedIds,
  } = useSavedViewModel();

  const [refreshing, setRefreshing] = useState(false);
  const [savedOffers, setSavedOffers] = useState([]);

  // Загрузка данных при фокусе на экране
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    // Загружаем сохраненные ID
    await loadSavedIds();
    // Загружаем объявления, если их нет
    if (offers.length === 0) {
      await loadOffers();
    }
  };

  useEffect(() => {
    // Обновляем список сохраненных объявлений когда меняются offers или savedIds
    if (offers.length > 0 && savedIds.length > 0) {
      const saved = getSavedOffers(offers);
      setSavedOffers(saved);
    } else if (offers.length > 0 && savedIds.length === 0) {
      setSavedOffers([]);
    }
  }, [offers, savedIds, getSavedOffers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const isLoading = offersLoading || savedLoading;

  const styles = createStyles(themeColors);

  if (isLoading && savedOffers.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[gStyle.title, { color: themeColors.text }]}>
          {t("savedScreen.title")}
        </Text>
      </View>

      {savedOffers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text
            style={[styles.emptyText, { color: themeColors.textSecondary }]}
          >
            {t("savedScreen.noSavedOffers")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedOffers}
          renderItem={({ item }) => (
            <OfferCard
              item={item}
              isLocalOffer={true}
              onPress={() =>
                navigation.navigate("OfferDetails", {
                  offer: item,
                  activeTab: "local",
                })
              }
              themeColors={themeColors}
              t={t}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => (
            <View
              style={[
                styles.separator,
                { backgroundColor: themeColors.border },
              ]}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[themeColors.primary]}
              tintColor={themeColors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.headerBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    listContainer: {
      padding: 16,
    },
    separator: {
      height: 12,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 50,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: "mt-light",
      textAlign: "center",
    },
  });
