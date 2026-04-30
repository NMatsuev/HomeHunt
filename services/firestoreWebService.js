import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBtUruqvbJFNV6JTlK_vZfeDh4LVF7HYu8",
  authDomain: "homehunt-5ea6d.firebaseapp.com",
  projectId: "homehunt-5ea6d",
  storageBucket: "homehunt-5ea6d.firebasestorage.app",
  messagingSenderId: "683729833174",
  appId: "1:683729833174:web:f4564134d62538cb760d77",
  measurementId: "G-R8QTGM2THX",
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const COLLECTION_NAME = "offers";

class FirestoreWebService {
  async initDatabase() {
    try {
      console.log("Firestore initialized successfully");
      // Проверяем соединение
      await this.ensureCollectionExists();
      return true;
    } catch (error) {
      console.error("Firestore init error:", error);
      throw error;
    }
  }

  async ensureCollectionExists() {
    try {
      // Вместо проверки, сразу пытаемся создать тестовый документ
      console.log("Attempting to create test document...");

      const testOffer = {
        title: "Test Offer - Will be deleted",
        price: "$0",
        address: "Test Address",
        description: "This is a test offer that will be automatically removed",
        isTest: true,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
        userId: this.currentUser?.uid || "system",
      };

      // Пытаемся добавить документ напрямую
      const docRef = await addDoc(collection(db, COLLECTION_NAME), testOffer);
      console.log("Test document created with ID:", docRef.id);

      // Удаляем тестовый документ
      await deleteDoc(docRef);
      console.log("Test document deleted successfully");
    } catch (error) {
      console.error("Error creating test document:", error);
      // Если ошибка связана с правами, пробуем альтернативный метод
      if (error.code === "permission-denied") {
        console.log("Permission denied, trying alternative method...");
        await this.createCollectionViaSetDoc();
      } else {
        throw error;
      }
    }
  }

  async createCollectionViaSetDoc() {
    try {
      // Используем setDoc с конкретным ID
      const testId = `temp_${Date.now()}`;
      const testDocRef = doc(db, COLLECTION_NAME, testId);

      await setDoc(testDocRef, {
        _temp: true,
        _created: Timestamp.now(),
        message: "Temporary document to create collection",
      });

      console.log("Collection created via setDoc");

      // Удаляем тестовый документ
      await deleteDoc(testDocRef);
      console.log("Temp document deleted");
    } catch (error) {
      console.error("Alternative method also failed:", error);
      throw error;
    }
  }

  async getOffers() {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy("created_at", "desc"),
      );
      const querySnapshot = await getDocs(q);

      const offers = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        offers.push({
          id: doc.id,
          ...data,
          // Конвертируем Timestamp в число для совместимости
          created_at: data.created_at?.toMillis() || Date.now(),
          updated_at: data.updated_at?.toMillis() || Date.now(),
        });
      });

      console.log(`Loaded ${offers.length} offers from Firestore`);
      return offers;
    } catch (error) {
      console.error("Error loading offers:", error);
      return [];
    }
  }

  async addOffer(offer) {
    try {
      const { id, ...offerData } = offer;

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...offerData,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });

      console.log("Offer added with ID:", docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding offer:", error);
      throw error;
    }
  }

  async updateOffer(offer) {
    try {
      const offerRef = doc(db, COLLECTION_NAME, offer.id);
      const { id, ...updateData } = offer;

      await updateDoc(offerRef, {
        ...updateData,
        updated_at: Timestamp.now(),
      });

      console.log("Offer updated:", offer.id);
      return { success: true };
    } catch (error) {
      console.error("Error updating offer:", error);
      throw error;
    }
  }

  async deleteOffer(offerId) {
    try {
      const offerRef = doc(db, COLLECTION_NAME, offerId);
      await deleteDoc(offerRef);
      console.log("Offer deleted:", offerId);
      return { success: true };
    } catch (error) {
      console.error("Error deleting offer:", error);
      throw error;
    }
  }

  async getOfferById(offerId) {
    try {
      const offerRef = doc(db, COLLECTION_NAME, offerId);
      const docSnap = await getDoc(offerRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          created_at: data.created_at?.toMillis() || Date.now(),
          updated_at: data.updated_at?.toMillis() || Date.now(),
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting offer by id:", error);
      throw error;
    }
  }

  async getOffersCount() {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const count = querySnapshot.size;
      console.log("Total offers count:", count);
      return count;
    } catch (error) {
      console.error("Error getting offers count:", error);
      return 0;
    }
  }
}

export default new FirestoreWebService();
