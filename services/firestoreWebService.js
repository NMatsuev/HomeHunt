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
import { getAuth } from "firebase/auth";
import { FIREBASE_CONFIG, COLLECTION_NAME } from "../config/StorageConfig";

// Инициализация Firebase
export const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);
const auth = getAuth(app);

class FirestoreWebService {
  // Получение текущего пользователя
  getCurrentUser() {
    const user = auth.currentUser;
    if (user) {
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split("@")[0] || "Аноним",
      };
    }
    return null;
  }

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
      const currentUser = this.getCurrentUser();

      // Добавляем информацию об авторе
      const offerWithAuthor = {
        ...offerData,
        authorId: currentUser?.uid || "anonymous",
        authorName: currentUser?.displayName || "Гость",
        authorEmail: currentUser?.email || "guest@example.com",
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      };

      const docRef = await addDoc(
        collection(db, COLLECTION_NAME),
        offerWithAuthor,
      );

      console.log(
        "Offer added with ID:",
        docRef.id,
        "by author:",
        currentUser?.email,
      );
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding offer:", error.message);
      return { success: false, error: error.message };
    }
  }

  async updateOffer(offer) {
    try {
      const offerRef = doc(db, COLLECTION_NAME, offer.id);
      const {
        id,
        created_at,
        updated_at,
        authorId,
        authorName,
        authorEmail,
        ...updateData
      } = offer;

      // Не обновляем поля автора при редактировании
      const processedData = {
        ...updateData,
        rooms: Number(updateData.rooms) || 1,
        area: Number(updateData.area) || 0,
        floorCount: Number(updateData.floorCount) || 1,
        updated_at: Timestamp.now(),
      };

      await updateDoc(offerRef, processedData);

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

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const offers = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
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

    return unsubscribe;
  }

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
