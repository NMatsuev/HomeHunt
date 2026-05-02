import { useState, useCallback } from "react";
import { Animated } from "react-native";

export const useNetworkBanner = () => {
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [showOnlineBanner, setShowOnlineBanner] = useState(false);
  const bannerAnim = useState(new Animated.Value(0))[0];

  const showBanner = useCallback(
    (type) => {
      const setShowFunction =
        type === "offline" ? setShowOfflineBanner : setShowOnlineBanner;
      setShowFunction(true);

      Animated.sequence([
        Animated.timing(bannerAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(bannerAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowFunction(false);
      });
    },
    [bannerAnim],
  );

  return {
    showOfflineBanner,
    showOnlineBanner,
    bannerAnim,
    showBanner,
  };
};
