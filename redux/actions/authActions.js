import authService from "../../services/authService";

export const AUTH_LOADING = "AUTH_LOADING";
export const AUTH_SUCCESS = "AUTH_SUCCESS";
export const AUTH_ERROR = "AUTH_ERROR";
export const AUTH_LOGOUT = "AUTH_LOGOUT";
export const AUTH_SET_USER = "AUTH_SET_USER";

// Регистрация
export const register = (email, password, displayName) => async (dispatch) => {
  try {
    dispatch({ type: AUTH_LOADING });

    const result = await authService.register(email, password, displayName);

    if (result.success) {
      dispatch({
        type: AUTH_SUCCESS,
        payload: result.user,
      });
      return { success: true };
    } else {
      dispatch({ type: AUTH_ERROR, payload: result.error });
      return { success: false, error: result.error };
    }
  } catch (error) {
    dispatch({ type: AUTH_ERROR, payload: error.message });
    return { success: false, error: error.message };
  }
};

// Вход
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: AUTH_LOADING });

    const result = await authService.login(email, password);

    if (result.success) {
      dispatch({
        type: AUTH_SUCCESS,
        payload: result.user,
      });
      return { success: true };
    } else {
      dispatch({ type: AUTH_ERROR, payload: result.error });
      return { success: false, error: result.error };
    }
  } catch (error) {
    dispatch({ type: AUTH_ERROR, payload: error.message });
    return { success: false, error: error.message };
  }
};

// Выход
export const logout = () => async (dispatch) => {
  try {
    const result = await authService.logout();
    if (result.success) {
      dispatch({ type: AUTH_LOGOUT });
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Сброс пароля
export const resetPassword = (email) => async () => {
  return await authService.resetPassword(email);
};

// Инициализация аутентификации (проверка текущего пользователя)
export const initAuth = () => (dispatch) => {
  authService.onAuthStateChanged((authState) => {
    if (authState.isAuthenticated) {
      dispatch({
        type: AUTH_SET_USER,
        payload: authState.user,
      });
    } else {
      dispatch({ type: AUTH_LOGOUT });
    }
  });
};
