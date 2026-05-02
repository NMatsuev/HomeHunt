import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import useThemeViewModel from "../viewModels/themeViewModel";
import useLanguageViewModel from "../viewModels/languageViewModel";
import useAuthViewModel from "../viewModels/authViewModel";

export default function AuthScreen({ onAuthSuccess }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const { themeColors } = useThemeViewModel();
  const { t } = useLanguageViewModel();
  const { registerUser, loginUser, resetUserPassword, isLoading, error } =
    useAuthViewModel();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert(t("auth.error"), t("auth.fillAllFields"));
      return;
    }

    if (!isLoginMode && !displayName) {
      Alert.alert(t("auth.error"), t("auth.enterName"));
      return;
    }

    let result;
    if (isLoginMode) {
      result = await loginUser(email, password);
    } else {
      result = await registerUser(email, password, displayName);
    }

    if (result.success) {
      Alert.alert(
        t("auth.success"),
        isLoginMode ? t("auth.loginSuccess") : t("auth.registerSuccess"),
      );
      if (onAuthSuccess) {
        onAuthSuccess();
      }
    } else {
      Alert.alert(t("auth.error"), result.error || error);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      Alert.alert(t("auth.error"), t("auth.enterEmail"));
      return;
    }

    const result = await resetUserPassword(resetEmail);
    if (result.success) {
      Alert.alert(t("auth.success"), t("auth.resetEmailSent"));
      setShowResetPassword(false);
      setResetEmail("");
    } else {
      Alert.alert(t("auth.error"), result.error);
    }
  };

  const styles = createStyles(themeColors);

  if (showResetPassword) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: themeColors.text }]}>
            {t("auth.resetPassword")}
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: themeColors.inputBackground,
                color: themeColors.text,
                borderColor: themeColors.border,
              },
            ]}
            placeholder={t("auth.email")}
            placeholderTextColor={themeColors.placeholder}
            value={resetEmail}
            onChangeText={setResetEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: themeColors.primary }]}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t("auth.sendResetLink")}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => setShowResetPassword(false)}
          >
            <Text style={[styles.linkText, { color: themeColors.primary }]}>
              {t("auth.backToLogin")}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: themeColors.text }]}>
            {isLoginMode ? t("auth.welcomeBack") : t("auth.createAccount")}
          </Text>

          {!isLoginMode && (
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: themeColors.inputBackground,
                  color: themeColors.text,
                  borderColor: themeColors.border,
                },
              ]}
              placeholder={t("auth.name")}
              placeholderTextColor={themeColors.placeholder}
              value={displayName}
              onChangeText={setDisplayName}
            />
          )}

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: themeColors.inputBackground,
                color: themeColors.text,
                borderColor: themeColors.border,
              },
            ]}
            placeholder={t("auth.email")}
            placeholderTextColor={themeColors.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: themeColors.inputBackground,
                color: themeColors.text,
                borderColor: themeColors.border,
              },
            ]}
            placeholder={t("auth.password")}
            placeholderTextColor={themeColors.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {isLoginMode && (
            <TouchableOpacity
              style={styles.forgotButton}
              onPress={() => setShowResetPassword(true)}
            >
              <Text style={[styles.forgotText, { color: themeColors.primary }]}>
                {t("auth.forgotPassword")}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: themeColors.primary }]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isLoginMode ? t("auth.login") : t("auth.register")}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              setIsLoginMode(!isLoginMode);
              setEmail("");
              setPassword("");
              setDisplayName("");
            }}
          >
            <Text style={[styles.linkText, { color: themeColors.primary }]}>
              {isLoginMode ? t("auth.noAccount") : t("auth.haveAccount")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: "center",
      padding: 20,
    },
    formContainer: {
      padding: 20,
      borderRadius: 12,
      backgroundColor: colors.card,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    title: {
      fontSize: 28,
      fontFamily: "mt-bold",
      marginBottom: 24,
      textAlign: "center",
    },
    input: {
      height: 50,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 16,
      fontFamily: "mt-light",
      marginBottom: 12,
    },
    button: {
      height: 50,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 12,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontFamily: "mt-bold",
    },
    linkButton: {
      marginTop: 16,
      alignItems: "center",
    },
    linkText: {
      fontSize: 14,
      fontFamily: "mt-medium",
    },
    forgotButton: {
      alignSelf: "flex-end",
      marginBottom: 12,
    },
    forgotText: {
      fontSize: 12,
      fontFamily: "mt-light",
    },
  });
