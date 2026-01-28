import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  clearNotifications,
  getNotifications,
  Notification,
} from "../../utils/storage";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, []),
  );

  const loadNotifications = async () => {
    const notifs = await getNotifications();
    setNotifications(notifs);
  };

  const handleClear = async () => {
    await clearNotifications();
    setNotifications([]);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <View style={styles.headerRow}>
        <Text style={styles.title}>Vos notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearText}>Effacer tout</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.list}>
        {notifications.length === 0 ? (
          <Text style={styles.emptyText}>Aucune notification</Text>
        ) : (
          notifications.map((notif) => (
            <View key={notif.id} style={styles.notifCard}>
              <Text style={styles.notifText}>{notif.message}</Text>
              <Text style={styles.notifTime}>
                {formatTime(notif.timestamp)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F7",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    fontSize: 28,
    color: "#DB6130",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  clearText: {
    fontSize: 14,
    color: "#DB6130",
  },
  list: {
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 50,
  },
  notifCard: {
    backgroundColor: "#DB6130",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  notifText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 5,
  },
  notifTime: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
});
