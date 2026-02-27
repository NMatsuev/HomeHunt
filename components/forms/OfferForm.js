// components/forms/OfferForm.js
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTheme } from "../../theme/ThemeContext";

// Схема валидации
const OfferSchema = Yup.object().shape({
  title: Yup.string()
    .required("Название обязательно")
    .min(5, "Название должно быть минимум 5 символов")
    .max(50, "Название слишком длинное"),
  price: Yup.string()
    .required("Цена обязательна")
    .matches(
      /^\d[\d\s]*₽?$/,
      "Введите корректную цену (например: 5 000 000 ₽)",
    ),
  rooms: Yup.number()
    .typeError("Должно быть число")
    .integer("Должно быть целое число")
    .min(1, "Минимум 1 комната")
    .max(10, "Максимум 10 комнат"),
  area: Yup.number()
    .typeError("Должно быть число")
    .positive("Площадь должна быть положительной")
    .max(1000, "Максимальная площадь 1000 м²"),
  floor: Yup.string(),
  floorCount: Yup.number()
    .typeError("Должно быть число")
    .integer("Должно быть целое число")
    .min(1, "Минимум 1 этаж")
    .max(200, "Максимум 200 этажей"),
  address: Yup.string()
    .required("Адрес обязателен")
    .min(10, "Адрес должен быть минимум 10 символов"),
  description: Yup.string().max(
    500,
    "Описание слишком длинное (максимум 500 символов)",
  ),
});

export default function OfferForm({
  initialOffer = null,
  onSubmit,
  onCancel,
  isEditing = false,
}) {
  const { themeColors } = useTheme();

  // Подготавливаем начальные значения
  const getInitialValues = () => {
    if (initialOffer) {
      // Режим редактирования
      return {
        title: initialOffer.title || "",
        price: initialOffer.price || "",
        rooms: initialOffer.rooms?.toString() || "",
        area: initialOffer.area?.toString() || "",
        floor: initialOffer.floor || "",
        floorCount: initialOffer.floorCount?.toString() || "",
        address: initialOffer.address || "",
        description: initialOffer.description || "",
      };
    }
    // Режим добавления
    return {
      title: "",
      price: "",
      rooms: "",
      area: "",
      floor: "",
      floorCount: "",
      address: "",
      description: "",
    };
  };

  const handleSubmit = (values, { setSubmitting }) => {
    if (isEditing && initialOffer) {
      // Режим редактирования - сохраняем ID и изображение
      const updatedOffer = {
        ...initialOffer,
        ...values,
        rooms: parseInt(values.rooms) || 1,
        area: parseInt(values.area) || 0,
        floorCount: parseInt(values.floorCount) || 1,
      };
      onSubmit(updatedOffer);
    } else {
      // Режим добавления - генерируем ID и изображение
      const colors = ["ff6b6b", "4ecdc4", "ffd93d", "6c5ce7", "e17055"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newOffer = {
        ...values,
        id: Date.now().toString(),
        rooms: parseInt(values.rooms) || 1,
        area: parseInt(values.area) || 0,
        floorCount: parseInt(values.floorCount) || 1,
        image: `https://via.placeholder.com/100x100/${randomColor}/ffffff?text=🏠`,
      };
      onSubmit(newOffer);
    }
    setSubmitting(false);
  };

  const styles = createStyles(themeColors);

  return (
    <Formik
      initialValues={getInitialValues()}
      validationSchema={OfferSchema}
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
            {/* Поле Название */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeColors.text }]}>
                Название <Text style={styles.required}>*</Text>
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
                placeholder="Введите название"
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
                Цена <Text style={styles.required}>*</Text>
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
                placeholder="Например: 5 000 000 ₽"
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
                  Комнат
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
                  placeholder="Кол-во"
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
                  Площадь (м²)
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
                  placeholder="Площадь"
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
                  Этаж
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
                  placeholder="Этаж"
                  placeholderTextColor={themeColors.placeholder}
                  value={values.floor}
                  onChangeText={handleChange("floor")}
                  onBlur={handleBlur("floor")}
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={[styles.label, { color: themeColors.text }]}>
                  Всего этажей
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
                  placeholder="Этажей"
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
                Адрес <Text style={styles.required}>*</Text>
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
                placeholder="Введите адрес"
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
                Описание
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
                placeholder="Введите описание"
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
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  Отмена
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.submitButton,
                  { backgroundColor: themeColors.primary },
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting
                    ? isEditing
                      ? "Сохранение..."
                      : "Добавление..."
                    : isEditing
                      ? "Сохранить"
                      : "Добавить"}
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
  });
