import {
  NOTIFICATION_LOADING,
  NOTIFICATION_LOADED,
  NOTIFICATION_ERROR,
  NOTIFICATION_ENABLED,
  NOTIFICATION_DISABLED,
  NOTIFICATION_TIME_SET,
  NOTIFICATION_FREQUENCY_SET,
  NOTIFICATION_PERMISSION_GRANTED,
  NOTIFICATION_PERMISSION_DENIED,
} from "../actions/notificationActions";

const initialState = {
  enabled: false,
  time: new Date(),
  frequency: "daily",
  hasPermission: false,
  isLoading: false,
  error: null,
};

const notificationReducer = (state = initialState, action) => {
  console.log("Notification reducer action:", action.type);

  switch (action.type) {
    case NOTIFICATION_LOADING:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case NOTIFICATION_LOADED:
      return {
        ...state,
        enabled: action.payload.enabled,
        time: action.payload.time,
        frequency: action.payload.frequency,
        isLoading: false,
        error: null,
      };

    case NOTIFICATION_ENABLED:
      return {
        ...state,
        enabled: true,
        isLoading: false,
        error: null,
      };

    case NOTIFICATION_DISABLED:
      return {
        ...state,
        enabled: false,
        isLoading: false,
        error: null,
      };

    case NOTIFICATION_TIME_SET:
      return {
        ...state,
        time: action.payload,
        isLoading: false,
      };

    case NOTIFICATION_FREQUENCY_SET:
      return {
        ...state,
        frequency: action.payload,
        isLoading: false,
      };

    case NOTIFICATION_PERMISSION_GRANTED:
      return {
        ...state,
        hasPermission: true,
      };

    case NOTIFICATION_PERMISSION_DENIED:
      return {
        ...state,
        hasPermission: false,
      };

    case NOTIFICATION_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default notificationReducer;
