import { Toast } from "toastify-react-native";
import * as Haptics from "expo-haptics";

// Toast Success
export const notifySuccess = (message: string) => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  Toast.success(message);
};

// Toast Error
export const notifyError = (message: string) => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  Toast.error(message);
};
