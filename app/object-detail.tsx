import * as Notifications from "expo-notifications";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { BleManager, Device } from "react-native-ble-plx";
import {
  addNotification,
  deleteObject,
  getObjects,
  SavedObject,
} from "../utils/storage";

const manager = new BleManager();
const SERVICE_UUID = "12345678-1234-1234-1234-1234567890ab";
const CHARACTERISTIC_UUID = "abcdefab-1234-5678-1234-abcdefabcdef";

// Configuration des notifications push
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function ObjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const [object, setObject] = useState<SavedObject | null>(null);
  const [status, setStatus] = useState("Connexion...");
  const [device, setDevice] = useState<Device | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [rssi, setRssi] = useState<number | null>(null);
  const [distance, setDistance] = useState("");
  const [distanceLevel, setDistanceLevel] = useState("close");
  const lastAlertState = useRef(false);

  useEffect(() => {
    loadObject();
    requestNotificationPermissions();
  }, []);

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission notifications refusée");
    }
  };

  const sendPushNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        sound: true,
      },
      trigger: null,
    });
  };

  const loadObject = async () => {
    const objects = await getObjects();
    const found = objects.find((o) => o.id === id);
    if (found) {
      setObject(found);
      connectToDevice();
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    }
  };

  const getDistanceInfo = (rssiValue: number) => {
    if (rssiValue > -50) return { text: "Très proche (< 1m)", level: "close" };
    if (rssiValue > -70) return { text: "Proche (1-3m)", level: "near" };
    if (rssiValue > -85) return { text: "Moyen (3-5m)", level: "medium" };
    return { text: "Loin (> 5m)", level: "far" };
  };

  const connectToDevice = async () => {
    await requestPermissions();
    setStatus("Recherche...");

    // Arrête tout scan précédent
    manager.stopDeviceScan();

    setTimeout(() => {
      manager.startDeviceScan(null, null, async (error, scannedDevice) => {
        if (error) {
          setStatus("Erreur scan: " + error.message);
          return;
        }

        if (scannedDevice?.name === "Guardify") {
          manager.stopDeviceScan();
          setStatus("Guardify trouvé, connexion...");

          try {
            // Déconnecte si déjà connecté
            const isAlreadyConnected = await scannedDevice.isConnected();
            if (isAlreadyConnected) {
              await scannedDevice.cancelConnection();
            }

            // Connecte
            const connectedDevice = await scannedDevice.connect();
            setStatus("Découverte des services...");

            await connectedDevice.discoverAllServicesAndCharacteristics();

            setDevice(connectedDevice);
            setIsConnected(true);
            setStatus("Connecté ✅");
          } catch (e: any) {
            setStatus("Erreur connexion: " + e.message);
          }
        }
      });
    }, 500);

    setTimeout(() => {
      manager.stopDeviceScan();
    }, 15000);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (device && isConnected && object) {
      interval = setInterval(async () => {
        try {
          const updatedDevice = await device.readRSSI();
          if (updatedDevice.rssi) {
            setRssi(updatedDevice.rssi);
            const info = getDistanceInfo(updatedDevice.rssi);
            setDistance(info.text);
            setDistanceLevel(info.level);

            const isFar = info.level === "medium" || info.level === "far";

            if (isFar && !lastAlertState.current) {
              Vibration.vibrate([500, 500, 500]);
              await addNotification(
                `Attention ! Tu as oublié "${object.name}" !`,
              );
              await sendPushNotification(
                "⚠️ Guardify",
                `Tu t'éloignes de "${object.name}" !`,
              );
              Alert.alert("⚠️ Guardify", `Tu t'éloignes de "${object.name}" !`);
              setStatus("⚠️ Objet éloigné !");
              lastAlertState.current = true;
            } else if (!isFar && lastAlertState.current) {
              setStatus("Connecté ✅");
              lastAlertState.current = false;
            }
          }
        } catch (e) {
          console.log("Erreur RSSI");
        }
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [device, isConnected, object]);

  const sendCommand = async (command: string) => {
    if (!device) {
      Alert.alert("Erreur", "Appareil non connecté");
      return;
    }

    try {
      // Vérifie que l'appareil est toujours connecté
      const connected = await device.isConnected();
      if (!connected) {
        setStatus("Reconnexion...");
        const reconnected = await device.connect();
        await reconnected.discoverAllServicesAndCharacteristics();
        setDevice(reconnected);
        setStatus("Reconnecté ✅");
      }

      // Encode en base64
      const base64Command = btoa(command);

      console.log("Envoi commande:", command);
      console.log("Base64:", base64Command);
      console.log("Service UUID:", SERVICE_UUID);
      console.log("Characteristic UUID:", CHARACTERISTIC_UUID);

      await device.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        base64Command,
      );

      Alert.alert("Succès", `Commande "${command}" envoyée !`);
    } catch (e: any) {
      console.log("Erreur commande:", e.message);
      Alert.alert("Erreur", e.message);
    }
  };

  const handleDelete = async () => {
    Alert.alert("Supprimer", `Supprimer "${object?.name}" ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          if (object) {
            await deleteObject(object.id);
            router.back();
          }
        },
      },
    ]);
  };

  if (!object) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Image
          source={require("../assets/images/GUARDIFY-LOGO.png")}
          style={styles.logo}
        />
        <Image
          source={require("../assets/images/icon-facebook.png")}
          style={styles.avatar}
        />
      </View>

      <Text style={styles.title}>Mes objets</Text>

      <View style={styles.objectCard}>
        <View style={styles.objectIconContainer}>
          <Text style={styles.objectIcon}>{object.icon}</Text>
        </View>
        <View style={styles.objectInfo}>
          <Text style={styles.objectName}>{object.name}</Text>
          <Text style={styles.objectStatus}>
            {isConnected ? "En direct" : "Connexion..."}
          </Text>
          <View
            style={[
              styles.statusBadge,
              distanceLevel === "close" || distanceLevel === "near"
                ? styles.statusBadgeOk
                : styles.statusBadgeAlert,
            ]}
          >
            <Text style={styles.statusBadgeText}>
              {distanceLevel === "close" || distanceLevel === "near"
                ? "Avec vous"
                : "Pas avec vous"}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Localiser</Text>

      <View
        style={[
          styles.distanceCard,
          (distanceLevel === "medium" || distanceLevel === "far") &&
            styles.distanceCardAlert,
        ]}
      >
        <Text style={styles.distanceLabel}>Distance</Text>
        <Text
          style={[
            styles.distanceValue,
            (distanceLevel === "medium" || distanceLevel === "far") &&
              styles.distanceValueAlert,
          ]}
        >
          {distance || "Calcul..."}
        </Text>
        {rssi && <Text style={styles.rssiText}>Signal: {rssi} dBm</Text>}
        <Text style={styles.statusSmall}>{status}</Text>
      </View>

      <Text style={styles.sectionTitle}>Actions</Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Vibration.vibrate(500)}
        >
          <Text style={styles.actionButtonText}>Vibrer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonOrange]}
          onPress={() => sendCommand("ON")}
        >
          <Text style={styles.actionButtonText}>Sonner</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.stopButton}
        onPress={() => sendCommand("OFF")}
      >
        <Text style={styles.stopButtonText}>Arrêter le son</Text>
      </TouchableOpacity>

      <View style={styles.optionsContainer}>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.optionTextDanger}>Supprimer l'objet</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F7",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 100,
    textAlign: "center",
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    marginBottom: 20,
  },
  backText: {
    fontSize: 28,
    color: "#DB6130",
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#DB6130",
    marginBottom: 20,
  },
  objectCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    alignItems: "center",
  },
  objectIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#DB6130",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  objectIcon: {
    fontSize: 40,
  },
  objectInfo: {
    flex: 1,
  },
  objectName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  objectStatus: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  statusBadgeOk: {
    backgroundColor: "#34C759",
  },
  statusBadgeAlert: {
    backgroundColor: "#FF3B30",
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  distanceCard: {
    backgroundColor: "#e8f5e8",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 25,
  },
  distanceCardAlert: {
    backgroundColor: "#ffe5e5",
  },
  distanceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  distanceValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#34C759",
    marginBottom: 5,
  },
  distanceValueAlert: {
    color: "#FF3B30",
  },
  rssiText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5,
  },
  statusSmall: {
    fontSize: 12,
    color: "#666",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: "#DB6130",
    borderRadius: 25,
    paddingVertical: 15,
    width: "48%",
    alignItems: "center",
  },
  actionButtonOrange: {
    backgroundColor: "#CF6135",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  stopButton: {
    borderWidth: 1,
    borderColor: "#DB6130",
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 25,
  },
  stopButtonText: {
    color: "#DB6130",
    fontSize: 14,
  },
  optionsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 20,
  },
  optionTextDanger: {
    fontSize: 14,
    color: "#FF3B30",
  },
});
