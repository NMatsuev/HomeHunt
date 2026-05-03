import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import { FIREBASE_CONFIG, COLLECTION_NAME } from "../config/StorageConfig";

// Инициализация Firebase
export const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);

class FirestoreWebService {
  async initDatabase() {
    try {
      console.log("Firestore initializing...");
      const testQuery = query(
        collection(db, COLLECTION_NAME),
        orderBy("created_at", "desc"),
      );
      await getDocs(testQuery);
      console.log("Firestore initialized successfully");
      return true;
    } catch (error) {
      console.error("Firestore init error:", error.message);
      return true;
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
          created_at: data.created_at?.toMillis() || Date.now(),
          updated_at: data.updated_at?.toMillis() || Date.now(),
        });
      });

      console.log(`Loaded ${offers.length} offers from Firestore`);
      return offers;
    } catch (error) {
      console.error("Error loading offers:", error.message);
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
      console.error("Error adding offer:", error.message);
      return { success: false, error: error.message };
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
      console.error("Error updating offer:", error.message);
      return { success: false, error: error.message };
    }
  }

  async deleteOffer(offerId) {
    try {
      const offerRef = doc(db, COLLECTION_NAME, offerId);
      await deleteDoc(offerRef);
      console.log("Offer deleted:", offerId);
      return { success: true };
    } catch (error) {
      console.error("Error deleting offer:", error.message);
      return { success: false, error: error.message };
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
      console.error("Error getting offer by id:", error.message);
      return null;
    }
  }

  async getOffersCount() {
    try {
      const offers = await this.getOffers();
      return offers.length;
    } catch (error) {
      console.error("Error getting offers count:", error.message);
      return 0;
    }
  }

  // Подписка на изменения в реальном времени
  subscribeToOffers(callback, errorCallback) {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("created_at", "desc"),
    );

    // Создаем подписку
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const offers = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Пропускаем тестовые документы
          if (data.isTest || data._temp) return;

          offers.push({
            id: doc.id,
            ...data,
            created_at: data.created_at?.toMillis() || Date.now(),
            updated_at: data.updated_at?.toMillis() || Date.now(),
          });
        });

        console.log(`Real-time update: ${offers.length} offers received`);
        if (callback) callback(offers);
      },
      (error) => {
        console.error("Snapshot error:", error);
        if (errorCallback) errorCallback(error);
      },
    );

    // Возвращаем функцию отписки
    return unsubscribe;
  }

  // Подписка на изменения конкретного объявления
  subscribeToOffer(offerId, callback, errorCallback) {
    const offerRef = doc(db, COLLECTION_NAME, offerId);

    const unsubscribe = onSnapshot(
      offerRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const offer = {
            id: docSnapshot.id,
            ...data,
            created_at: data.created_at?.toMillis() || Date.now(),
            updated_at: data.updated_at?.toMillis() || Date.now(),
          };
          if (callback) callback(offer);
        } else {
          if (callback) callback(null);
        }
      },
      (error) => {
        console.error("Offer snapshot error:", error);
        if (errorCallback) errorCallback(error);
      },
    );

    return unsubscribe;
  }
}

export default new FirestoreWebService();
