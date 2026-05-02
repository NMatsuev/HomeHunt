import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  register,
  login,
  logout,
  resetPassword,
  initAuth,
} from "../redux/actions/authActions";

const useAuthViewModel = () => {
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);

  const user = authState?.user || null;
  const isAuthenticated = authState?.isAuthenticated || false;
  const isLoading = authState?.isLoading || false;
  const error = authState?.error || null;

  // Инициализация при монтировании
  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);

  // Регистрация
  const registerUser = useCallback(
    async (email, password, displayName) => {
      const result = await dispatch(register(email, password, displayName));
      return result;
    },
    [dispatch],
  );

  // Вход
  const loginUser = useCallback(
    async (email, password) => {
      const result = await dispatch(login(email, password));
      return result;
    },
    [dispatch],
  );

  // Выход
  const logoutUser = useCallback(async () => {
    const result = await dispatch(logout());
    return result;
  }, [dispatch]);

  // Сброс пароля
  const resetUserPassword = useCallback(
    async (email) => {
      const result = await dispatch(resetPassword(email));
      return result;
    },
    [dispatch],
  );

  return {
    // Данные
    user,
    isAuthenticated,
    isLoading,
    error,

    // Методы
    registerUser,
    loginUser,
    logoutUser,
    resetUserPassword,
  };
};

export default useAuthViewModel;
