import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import useThemeViewModel from "../../viewModels/themeViewModel";
import useLanguageViewModel from "../../viewModels/languageViewModel";
import imageKitService from "../../services/imageKitService";

const getValidationSchema = (t, isEditing, hasImage) => {
  return Yup.object().shape({
    title: Yup.string()
      .required(t("form.validation.titleRequired"))
      .min(5, t("form.validation.titleMin"))
      .max(50, t("form.validation.titleMax")),
    price: Yup.string()
      .required(t("form.validation.priceRequired"))
      .matches(/^\d[\d\s]*₽?$/, t("form.validation.priceFormat")),
    rooms: Yup.number()
      .typeError(t("form.validation.numberRequired"))
      .integer(t("form.validation.integerRequired"))
      .min(1, t("form.validation.roomsMin"))
      .max(10, t("form.validation.roomsMax")),
    area: Yup.number()
      .typeError(t("form.validation.numberRequired"))
      .positive(t("form.validation.areaPositive"))
      .max(1000, t("form.validation.areaMax")),
    floor: Yup.string(),
    floorCount: Yup.number()
      .typeError(t("form.validation.numberRequired"))
      .integer(t("form.validation.integerRequired"))
      .min(1, t("form.validation.floorCountMin"))
      .max(200, t("form.validation.floorCountMax")),
    address: Yup.string()
      .required(t("form.validation.addressRequired"))
      .min(10, t("form.validation.addressMin")),
    description: Yup.string().max(500, t("form.validation.descriptionMax")),
  });
};

export default function OfferForm({
  initialOffer = null,
  onSubmit,
  onCancel,
  isEditing = false,
}) {
  const { themeColors } = useThemeViewModel();
  const { t } = useLanguageViewModel();
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageError, setImageError] = useState(false);

  const getInitialValues = () => {
    if (initialOffer) {
      return {
        title: initialOffer.title || "",
        price: initialOffer.price || "",
        rooms: initialOffer.rooms?.toString() || "",
        area: initialOffer.area?.toString() || "",
        floor: initialOffer.floor || "",
        floorCount: initialOffer.floorCount?.toString() || "",
        address: initialOffer.address || "",
        description: initialOffer.description || "",
        imageUrl: initialOffer.imageUrl || initialOffer.image || "",
      };
    }
    return {
      title: "",
      price: "",
      rooms: "",
      area: "",
      floor: "",
      floorCount: "",
      address: "",
      description: "",
      imageUrl: "",
    };
  };

  const handleImagePick = () => {
    Alert.alert(
      t("form.addPhoto"),
      t("form.choosePhotoSource"),
      [
        { text: t("form.cancel"), style: "cancel" },
        { text: t("form.gallery"), onPress: () => pickFromGallery() },
        { text: t("form.camera"), onPress: () => takePhoto() },
      ],
      { cancelable: true },
    );
  };

  const pickFromGallery = async () => {
    try {
      const result = await imageKitService.pickImage();
      if (result) {
        setSelectedImage(result);
        setImageError(false);
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert(t("form.error"), error.message);
    }
  };

  const takePhoto = async () => {
    try {
      const result = await imageKitService.takePhoto();
      if (result) {
        setSelectedImage(result);
        setImageError(false);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert(t("form.error"), error.message);
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return null;

    setUploading(true);
    setUploadProgress(0);

    // Симуляция прогресса загрузки
    const interval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      // Используем base64 из selectedImage
      const result = await imageKitService.uploadToImageKit(
        selectedImage.uri,
        selectedImage.fileName,
        selectedImage.base64, // Передаем base64, который уже есть
      );

      clearInterval(interval);
      setUploadProgress(100);

      if (result.success) {
        return result.url;
      } else {
        Alert.alert(t("form.error"), result.error || t("form.uploadFailed"));
        return null;
      }
    } catch (error) {
      clearInterval(interval);
      console.error("Upload error:", error);
      Alert.alert(t("form.error"), error.message);
      return null;
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setImageError(false);

      // Проверка наличия изображения для нового объявления
      if (!isEditing && !selectedImage && !values.imageUrl) {
        setImageError(true);
        Alert.alert(t("form.error"), t("form.imageRequired"), [{ text: "OK" }]);
        setSubmitting(false);
        return;
      }

      // Загружаем изображение, если оно выбрано
      let imageUrl = values.imageUrl;

      if (selectedImage) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else if (!isEditing) {
          // Если загрузка не удалась и это новое объявление, показываем ошибку
          setImageError(true);
          Alert.alert(t("form.error"), t("form.uploadFailed"));
          setSubmitting(false);
          return;
        }
      }

      const offerData = {
        ...values,
        rooms: parseInt(values.rooms) || 1,
        area: parseInt(values.area) || 0,
        floorCount: parseInt(values.floorCount) || 1,
        imageUrl: imageUrl,
        image: imageUrl, // Для обратной совместимости
      };

      if (isEditing && initialOffer) {
        const updatedOffer = {
          ...initialOffer,
          ...offerData,
        };
        await onSubmit(updatedOffer);
      } else {
        await onSubmit(offerData);
      }

      // Сбрасываем выбранное изображение после успешной отправки
      setSelectedImage(null);
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert(t("form.error"), error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageError(false);
  };

  const styles = createStyles(themeColors);

  return (
    <Formik
      initialValues={getInitialValues()}
      validationSchema={getValidationSchema(
        t,
        isEditing,
        !!selectedImage || !!initialOffer?.imageUrl,
      )}
      onSubmit={handleSubmit}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        touched,
        isSubmitting,
      }) => (
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.form}>
            {/* Блок загрузки изображения */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>
                {t("form.photo")}{" "}
                {!isEditing && <Text style={styles.required}>*</Text>}
              </Text>

              {(selectedImage || values.imageUrl) && !uploading ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: selectedImage?.uri || values.imageUrl }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={removeImage}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.imagePicker,
                    {
                      borderColor: imageError
                        ? themeColors.error
                        : themeColors.border,
                    },
                  ]}
                  onPress={handleImagePick}
                  disabled={uploading}
                >
                  <Text
                    style={[
                      styles.imagePickerText,
                      { color: themeColors.primary },
                    ]}
                  >
                    📷 {t("form.addPhoto")}
                  </Text>
                  {imageError && (
                    <Text
                      style={[
                        styles.imageErrorText,
                        { color: themeColors.error },
                      ]}
                    >
                      {t("form.imageRequired")}
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              {uploading && (
                <View style={styles.uploadProgressContainer}>
                  <ActivityIndicator color={themeColors.primary} />
                  <Text
                    style={[
                      styles.uploadProgressText,
                      { color: themeColors.text },
                    ]}
                  >
                    {t("form.uploading")} {uploadProgress}%
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${uploadProgress}%`,
                          backgroundColor: themeColors.primary,
                        },
                      ]}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Остальные поля формы */}
            {/* Поле Название */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>
                {t("form.title")} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.inputBackground,
                    color: themeColors.text,
                    borderColor:
                      errors.title && touched.title
                        ? themeColors.error
                        : themeColors.border,
                  },
                ]}
                placeholder={t("form.titlePlaceholder")}
                placeholderTextColor={themeColors.placeholder}
                value={values.title}
                onChangeText={handleChange("title")}
                onBlur={handleBlur("title")}
              />
              {errors.title && touched.title && (
                <Text style={[styles.errorText, { color: themeColors.error }]}>
                  {errors.title}
                </Text>
              )}
            </View>

            {/* Поле Цена */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>
                {t("form.price")} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.inputBackground,
                    color: themeColors.text,
                    borderColor:
                      errors.price && touched.price
                        ? themeColors.error
                        : themeColors.border,
                  },
                ]}
                placeholder={t("form.pricePlaceholder")}
                placeholderTextColor={themeColors.placeholder}
                value={values.price}
                onChangeText={handleChange("price")}
                onBlur={handleBlur("price")}
              />
              {errors.price && touched.price && (
                <Text style={[styles.errorText, { color: themeColors.error }]}>
                  {errors.price}
                </Text>
              )}
            </View>

            {/* Ряд с комнатами и площадью */}
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={[styles.label, { color: themeColors.text }]}>
                  {t("form.rooms")}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: themeColors.inputBackground,
                      color: themeColors.text,
                      borderColor:
                        errors.rooms && touched.rooms
                          ? themeColors.error
                          : themeColors.border,
                    },
                  ]}
                  placeholder={t("form.roomsPlaceholder")}
                  placeholderTextColor={themeColors.placeholder}
                  keyboardType="numeric"
                  value={values.rooms}
                  onChangeText={handleChange("rooms")}
                  onBlur={handleBlur("rooms")}
                />
                {errors.rooms && touched.rooms && (
                  <Text
                    style={[styles.errorText, { color: themeColors.error }]}
                  >
                    {errors.rooms}
                  </Text>
                )}
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={[styles.label, { color: themeColors.text }]}>
                  {t("form.area")}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: themeColors.inputBackground,
                      color: themeColors.text,
                      borderColor:
                        errors.area && touched.area
                          ? themeColors.error
                          : themeColors.border,
                    },
                  ]}
                  placeholder={t("form.areaPlaceholder")}
                  placeholderTextColor={themeColors.placeholder}
                  keyboardType="numeric"
                  value={values.area}
                  onChangeText={handleChange("area")}
                  onBlur={handleBlur("area")}
                />
                {errors.area && touched.area && (
                  <Text
                    style={[styles.errorText, { color: themeColors.error }]}
                  >
                    {errors.area}
                  </Text>
                )}
              </View>
            </View>

            {/* Ряд с этажами */}
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={[styles.label, { color: themeColors.text }]}>
                  {t("form.floor")}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: themeColors.inputBackground,
                      color: themeColors.text,
                      borderColor:
                        errors.floor && touched.floor
                          ? themeColors.error
                          : themeColors.border,
                    },
                  ]}
                  placeholder={t("form.floorPlaceholder")}
                  placeholderTextColor={themeColors.placeholder}
                  value={values.floor}
                  onChangeText={handleChange("floor")}
                  onBlur={handleBlur("floor")}
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={[styles.label, { color: themeColors.text }]}>
                  {t("form.floorCount")}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: themeColors.inputBackground,
                      color: themeColors.text,
                      borderColor:
                        errors.floorCount && touched.floorCount
                          ? themeColors.error
                          : themeColors.border,
                    },
                  ]}
                  placeholder={t("form.floorCountPlaceholder")}
                  placeholderTextColor={themeColors.placeholder}
                  keyboardType="numeric"
                  value={values.floorCount}
                  onChangeText={handleChange("floorCount")}
                  onBlur={handleBlur("floorCount")}
                />
                {errors.floorCount && touched.floorCount && (
                  <Text
                    style={[styles.errorText, { color: themeColors.error }]}
                  >
                    {errors.floorCount}
                  </Text>
                )}
              </View>
            </View>

            {/* Поле Адрес */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>
                {t("form.address")} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.inputBackground,
                    color: themeColors.text,
                    borderColor:
                      errors.address && touched.address
                        ? themeColors.error
                        : themeColors.border,
                  },
                ]}
                placeholder={t("form.addressPlaceholder")}
                placeholderTextColor={themeColors.placeholder}
                value={values.address}
                onChangeText={handleChange("address")}
                onBlur={handleBlur("address")}
              />
              {errors.address && touched.address && (
                <Text style={[styles.errorText, { color: themeColors.error }]}>
                  {errors.address}
                </Text>
              )}
            </View>

            {/* Поле Описание */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>
                {t("form.description")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: themeColors.inputBackground,
                    color: themeColors.text,
                    borderColor:
                      errors.description && touched.description
                        ? themeColors.error
                        : themeColors.border,
                  },
                ]}
                placeholder={t("form.descriptionPlaceholder")}
                placeholderTextColor={themeColors.placeholder}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                value={values.description}
                onChangeText={handleChange("description")}
                onBlur={handleBlur("description")}
              />
              {errors.description && touched.description && (
                <Text style={[styles.errorText, { color: themeColors.error }]}>
                  {errors.description}
                </Text>
              )}
            </View>

            {/* Кнопки */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelButton,
                  {
                    backgroundColor: themeColors.inputBackground,
                    borderColor: themeColors.border,
                  },
                ]}
                onPress={onCancel}
                disabled={isSubmitting || uploading}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  {t("form.cancel")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.submitButton,
                  { backgroundColor: themeColors.primary },
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting || uploading}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting || uploading
                    ? isEditing
                      ? t("form.saving")
                      : t("form.adding")
                    : isEditing
                      ? t("form.save")
                      : t("form.add")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </Formik>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      flexGrow: 1,
    },
    form: {
      padding: 20,
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontFamily: "mt-bold",
      marginBottom: 6,
    },
    required: {
      color: colors.error,
    },
    input: {
      height: 48,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 14,
      fontFamily: "mt-light",
    },
    textArea: {
      height: 100,
      paddingTop: 12,
      paddingBottom: 12,
      textAlignVertical: "top",
    },
    rowInputs: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    halfWidth: {
      width: "48%",
    },
    errorText: {
      fontSize: 12,
      fontFamily: "mt-light",
      marginTop: 4,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
      marginBottom: 40,
    },
    button: {
      flex: 1,
      height: 48,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 4,
    },
    cancelButton: {
      borderWidth: 1,
    },
    buttonText: {
      fontSize: 16,
      fontFamily: "mt-bold",
    },
    submitButton: {
      elevation: 3,
    },
    submitButtonText: {
      color: "#fff",
      fontSize: 16,
      fontFamily: "mt-bold",
    },
    imagePicker: {
      height: 120,
      borderWidth: 1,
      borderRadius: 8,
      borderStyle: "dashed",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent",
    },
    imagePickerText: {
      fontSize: 16,
      fontFamily: "mt-medium",
    },
    imageErrorText: {
      fontSize: 12,
      fontFamily: "mt-light",
      marginTop: 8,
    },
    imagePreviewContainer: {
      position: "relative",
      borderRadius: 8,
      overflow: "hidden",
    },
    imagePreview: {
      width: "100%",
      height: 200,
      borderRadius: 8,
    },
    removeImageButton: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: "rgba(0,0,0,0.6)",
      borderRadius: 15,
      width: 30,
      height: 30,
      justifyContent: "center",
      alignItems: "center",
    },
    removeImageText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
    },
    uploadProgressContainer: {
      marginTop: 12,
      alignItems: "center",
    },
    uploadProgressText: {
      marginTop: 8,
      fontSize: 12,
      fontFamily: "mt-light",
    },
    progressBar: {
      width: "100%",
      height: 4,
      backgroundColor: "#e0e0e0",
      borderRadius: 2,
      marginTop: 8,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 2,
    },
  });
