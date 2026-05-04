import { useState, useCallback } from "react";
import { Alert } from "react-native";
import imageKitService from "../services/imageKitService";

const useOfferFormViewModel = (
  initialOffer = null,
  isEditing = false,
  onSubmit,
  onCancel,
  t,
) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Начальные значения формы
  const getInitialValues = useCallback(() => {
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
        image: initialOffer.image || "",
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
      image: "",
    };
  }, [initialOffer]);

  // Выбор изображения из галереи
  const pickFromGallery = useCallback(async () => {
    try {
      const result = await imageKitService.pickImage();
      if (result) {
        setSelectedImage(result);
        setImageError(false);
      }
      return result;
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert(t("form.error"), error.message);
      return null;
    }
  }, [t]);

  // Съемка фото на камеру
  const takePhoto = useCallback(async () => {
    try {
      const result = await imageKitService.takePhoto();
      if (result) {
        setSelectedImage(result);
        setImageError(false);
      }
      return result;
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert(t("form.error"), error.message);
      return null;
    }
  }, [t]);

  // Обработчик выбора изображения
  const handleImagePick = useCallback(() => {
    Alert.alert(
      t("form.addPhoto"),
      t("form.choosePhotoSource"),
      [
        { text: t("form.cancel"), style: "cancel" },
        { text: t("form.gallery"), onPress: pickFromGallery },
        { text: t("form.camera"), onPress: takePhoto },
      ],
      { cancelable: true },
    );
  }, [t, pickFromGallery, takePhoto]);

  // Загрузка изображения на сервер
  const uploadImage = useCallback(async () => {
    if (!selectedImage) return null;

    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      const result = await imageKitService.uploadToImageKit(
        selectedImage.uri,
        selectedImage.fileName,
        selectedImage.base64,
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
  }, [selectedImage, t]);

  // Удаление выбранного изображения
  const removeImage = useCallback(() => {
    setSelectedImage(null);
    setImageError(false);
  }, []);

  // Основной обработчик отправки формы
  const handleSubmit = useCallback(
    async (values, { setSubmitting }) => {
      try {
        setImageError(false);

        // Проверка наличия изображения для нового объявления
        if (!isEditing && !selectedImage && !values.image) {
          setImageError(true);
          Alert.alert(t("form.error"), t("form.imageRequired"), [
            { text: "OK" },
          ]);
          setSubmitting(false);
          return;
        }

        // Загружаем изображение, если оно выбрано
        let imageUrl = values.image;

        if (selectedImage) {
          const uploadedUrl = await uploadImage();
          if (uploadedUrl) {
            imageUrl = uploadedUrl;
          } else if (!isEditing) {
            setImageError(true);
            Alert.alert(t("form.error"), t("form.uploadFailed"));
            setSubmitting(false);
            return;
          }
        }

        // Формируем данные объявления
        const offerData = {
          ...values,
          rooms: parseInt(values.rooms) || 1,
          area: parseFloat(values.area) || 0,
          floorCount: parseInt(values.floorCount) || 1,
          image: imageUrl,
        };

        // Вызов переданного обработчика
        if (isEditing && initialOffer) {
          await onSubmit({ ...initialOffer, ...offerData });
        } else {
          await onSubmit(offerData);
        }

        // Сброс после успешной отправки
        setSelectedImage(null);
      } catch (error) {
        console.error("Submit error:", error);
        Alert.alert(t("form.error"), error.message);
      } finally {
        setSubmitting(false);
      }
    },
    [isEditing, selectedImage, initialOffer, onSubmit, uploadImage, t],
  );

  return {
    // Состояния
    selectedImage,
    uploading,
    uploadProgress,
    imageError,

    // Методы
    getInitialValues,
    handleImagePick,
    handleSubmit,
    removeImage,
    setImageError,
  };
};

export default useOfferFormViewModel;
