import { useEffect, useRef, useState } from "react";
import {
    Image,
    PermissionsAndroid,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from "react-native";
import { BleManager, Device } from "react-native-ble-plx";

const manager = new BleManager();
const SERVICE_UUID = "12345678-1234-1234-1234-1234567890ab";
const CHARACTERISTIC_UUID = "abcdefab-1234-5678-1234-abcdefabcdef";

export default function LocateScreen() {
  const [status, setStatus] = useState("Appuie sur Rechercher");
  const [device, setDevice] = useState<Device | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [rssi, setRssi] = useState<number | null>(null);
  const [distance, setDistance] = useState("");
  const [isNear, setIsNear] = useState(true);
  const lastAlertState = useRef(false);

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    }
  };

  const getDistance = (rssiValue: number) => {
    if (rssiValue > -50) return "close";
    if (rssiValue > -70) return "near";
    if (rssiValue > -85) return "medium";
    return "far";
  };

  const getDistanceText = (level: string) => {
    if (level === "close") return "Très proche (< 1m)";
    if (level === "near") return "Proche (1-3m)";
    if (level === "medium") return "Moyen (3-5m)";
    return "Loin (> 5m)";
  };

  const sendCommand = async (command: string) => {
    if (!device) return;
    try {
      const base64Command = btoa(command);
      await device.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        base64Command,
      );
    } catch (e: any) {
      console.log("Erreur:", e.message);
    }
  };

  const scanDevices = async () => {
    await requestPermissions();
    setStatus("Recherche en cours...");

    manager.startDeviceScan(null, null, async (error, scannedDevice) => {
      if (error) {
        setStatus("Erreur: " + error.message);
        return;
      }

      if (scannedDevice?.name === "Guardify") {
        manager.stopDeviceScan();
        setStatus("Guardify trouvé ! Connexion...");

        try {
          const connectedDevice = await scannedDevice.connect();
          await connectedDevice.discoverAllServicesAndCharacteristics();
          setDevice(connectedDevice);
          setIsConnected(true);
          setStatus("Connecté !");
        } catch (e: any) {
          setStatus("Erreur: " + e.message);
        }
      }
    });

    setTimeout(() => manager.stopDeviceScan(), 10000);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (device && isConnected) {
      interval = setInterval(async () => {
        try {
          const updatedDevice = await device.readRSSI();
          if (updatedDevice.rssi) {
            setRssi(updatedDevice.rssi);
            const level = getDistance(updatedDevice.rssi);
            setDistance(getDistanceText(level));

            const nowFar = level === "medium" || level === "far";
            setIsNear(!nowFar);

            // Notification si éloigné
            if (nowFar && !lastAlertState.current) {
              Vibration.vibrate(500);
              setStatus("⚠️ Tu t'éloignes de ton objet !");
              lastAlertState.current = true;
            } else if (!nowFar && lastAlertState.current) {
              setStatus("✅ Objet à proximité");
              lastAlertState.current = false;
            }
          }
        } catch (e) {
          console.log("Erreur RSSI");
        }
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [device, isConnected]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/GUARDIFY-LOGO.png")}
          style={styles.logo}
        />
        <Image
          source={require("../../assets/images/icon-facebook.png")}
          style={styles.avatar}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Localiser</Text>
        <Text style={styles.status}>{status}</Text>

        {isConnected && rssi && (
          <View
            style={[styles.distanceCard, !isNear && styles.distanceCardAlert]}
          >
            <Text style={styles.distanceLabel}>Distance</Text>
            <Text
              style={[
                styles.distanceValue,
                !isNear && styles.distanceValueAlert,
              ]}
            >
              {distance}
            </Text>
            <Text style={styles.rssiText}>Signal: {rssi} dBm</Text>
          </View>
        )}

        {!isConnected ? (
          <TouchableOpacity style={styles.button} onPress={scanDevices}>
            <Text style={styles.buttonText}>Rechercher le périphérique</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionsContainer}>
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
        )}

        {isConnected && (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={() => sendCommand("OFF")}
          >
            <Text style={styles.stopButtonText}>Arrêter le son</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
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
  content: {
    flex: 1,
    padding: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#DB6130",
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
  },
  distanceCard: {
    backgroundColor: "#e8f4e8",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginBottom: 30,
  },
  distanceCardAlert: {
    backgroundColor: "#ffe5e5",
  },
  distanceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  distanceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#34C759",
    marginBottom: 10,
  },
  distanceValueAlert: {
    color: "#FF3B30",
  },
  rssiText: {
    fontSize: 12,
    color: "#999",
  },
  button: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    color: "#333",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#DB6130",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
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
  },
  stopButtonText: {
    color: "#DB6130",
    fontSize: 14,
  },
});
