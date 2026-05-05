import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "./firestoreWebService";

class AuthService {
  constructor() {
    ((this.auth = auth), (this.authListeners = []));
    this.translateFunction = null;
  }

  setTranslateFunction(translateFn) {
    this.translateFunction = translateFn;
  }

  getTranslation(key) {
    if (this.translateFunction) {
      return this.translateFunction(`auth.${key}`);
    }
    // Fallback на английский
    const fallbacks = {
      emailExists: "This email is already registered",
      emailInvalid: "Invalid email format",
      passwordWeak: "Password must be at least 6 characters",
      userNotFound: "User with this email not found",
      passwordWrong: "Incorrect password",
      tooManyRequests: "Too many attempts. Try again later",
      operationNotAllowed: "Email/password login is disabled",
    };
    return fallbacks[key] || "Error. Try again later";
  }

  // Регистрация нового пользователя
  async register(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password,
      );

      // Обновляем профиль пользователя
      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName: displayName,
        });
      }

      return {
        success: true,
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
        },
      };
    } catch (error) {
      console.log("Registration error:", error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }

  // Вход пользователя
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password,
      );

      return {
        success: true,
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
        },
      };
    } catch (error) {
      console.log("Login error:", error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }

  // Выход из аккаунта
  async logout() {
    try {
      await signOut(this.auth);
      return { success: true };
    } catch (error) {
      console.log("Logout error:", error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }

  // Сброс пароля
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return { success: true };
    } catch (error) {
      console.log("Reset password error:", error);
      return {
        success: false,
        error: this.getErrorMessage(error.code),
      };
    }
  }

  // Получение текущего пользователя
  getCurrentUser() {
    const user = this.auth.currentUser;
    if (user) {
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      };
    }
    return null;
  }

  // Подписка на изменения состояния аутентификации
  onAuthStateChanged(callback) {
    return onAuthStateChanged(this.auth, (user) => {
      if (user) {
        callback({
          isAuthenticated: true,
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          },
        });
      } else {
        callback({
          isAuthenticated: false,
          user: null,
        });
      }
    });
  }

  // Обработка ошибок Firebase
  getErrorMessage(errorCode) {
    const errors = {
      "auth/email-already-in-use": this.getTranslation("emailExists"),
      "auth/invalid-email": this.getTranslation("emailInvalid"),
      "auth/weak-password": this.getTranslation("passwordWeak"),
      "auth/user-not-found": this.getTranslation("userNotFound"),
      "auth/wrong-password": this.getTranslation("passwordWrong"),
      "auth/too-many-requests": this.getTranslation("tooManyRequests"),
      "auth/operation-not-allowed": this.getTranslation("operationNotAllowed"),
    };
    return errors[errorCode] || this.getTranslation("error");
  }
}

export default new AuthService();
