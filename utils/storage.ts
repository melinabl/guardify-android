import AsyncStorage from "@react-native-async-storage/async-storage";

export type SavedObject = {
  id: string;
  name: string;
  type: string;
  icon: string;
  createdAt: number;
};

export type Notification = {
  id: string;
  message: string;
  timestamp: number;
};

const OBJECTS_KEY = "guardify_objects";
const NOTIFICATIONS_KEY = "guardify_notifications";

// ===== OBJETS =====
export const getObjects = async (): Promise<SavedObject[]> => {
  try {
    const data = await AsyncStorage.getItem(OBJECTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveObject = async (obj: SavedObject): Promise<void> => {
  try {
    const objects = await getObjects();
    objects.push(obj);
    await AsyncStorage.setItem(OBJECTS_KEY, JSON.stringify(objects));
  } catch (e) {
    console.log("Erreur sauvegarde:", e);
  }
};

export const deleteObject = async (id: string): Promise<void> => {
  try {
    const objects = await getObjects();
    const filtered = objects.filter((o) => o.id !== id);
    await AsyncStorage.setItem(OBJECTS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.log("Erreur suppression:", e);
  }
};

// ===== NOTIFICATIONS =====
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addNotification = async (message: string): Promise<void> => {
  try {
    const notifications = await getNotifications();
    notifications.unshift({
      id: Date.now().toString(),
      message,
      timestamp: Date.now(),
    });
    await AsyncStorage.setItem(
      NOTIFICATIONS_KEY,
      JSON.stringify(notifications),
    );
  } catch (e) {
    console.log("Erreur notification:", e);
  }
};

export const clearNotifications = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
  } catch (e) {
    console.log("Erreur clear:", e);
  }
};
