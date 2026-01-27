import { useEffect, useRef, useState } from "react";
import {
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

export default function HomeScreen() {
  const [status, setStatus] = useState("Appuie sur Scanner");
  const [device, setDevice] = useState<Device | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [rssi, setRssi] = useState<number | null>(null);
  const [distance, setDistance] = useState("");
  const [isFar, setIsFar] = useState(false);
  const lastAlertState = useRef(false);

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    }
    return true;
  };

  const getDistance = (rssiValue: number) => {
    if (rssiValue > -50) return "close";
    if (rssiValue > -70) return "near";
    if (rssiValue > -85) return "medium";
    return "far";
  };

  const getDistanceText = (level: string) => {
    if (level === "close") return "📍 Très proche (< 1m)";
    if (level === "near") return "📍 Proche (1-3m)";
    if (level === "medium") return "📍 Moyen (3-5m)";
    return "📍 Loin (> 5m)";
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
      console.log(`Commande "${command}" envoyée`);
    } catch (e: any) {
      console.log("Erreur envoi commande:", e.message);
    }
  };

  const scanDevices = async () => {
    await requestPermissions();
    setStatus("Scan en cours...");

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
          setStatus("Connecté à Guardify !");
        } catch (e: any) {
          setStatus("Erreur connexion: " + e.message);
        }
      }
    });

    setTimeout(() => {
      manager.stopDeviceScan();
    }, 10000);
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

            const isNowFar = level === "medium" || level === "far";

            // S'éloigne → buzzer ON
            if (isNowFar && !lastAlertState.current) {
              sendCommand("ON");
              Vibration.vibrate(500);
              setStatus("⚠️ Attention ! Objet éloigné !");
              lastAlertState.current = true;
            }
            // Revient proche → buzzer OFF
            else if (!isNowFar && lastAlertState.current) {
              sendCommand("OFF");
              setStatus("✅ Objet récupéré !");
              lastAlertState.current = false;
            }

            setIsFar(isNowFar);
          }
        } catch (e) {
          console.log("Erreur RSSI");
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [device, isConnected]);

  const disconnect = async () => {
    if (device) {
      sendCommand("OFF");
      await device.cancelConnection();
      setDevice(null);
      setIsConnected(false);
      setRssi(null);
      setDistance("");
      setIsFar(false);
      lastAlertState.current = false;
      setStatus("Déconnecté");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Guardify</Text>
      <Text style={styles.status}>{status}</Text>

      {isConnected && rssi && (
        <View
          style={[styles.rssiContainer, isFar && styles.rssiContainerAlert]}
        >
          <Text style={styles.rssiText}>Signal: {rssi} dBm</Text>
          <Text
            style={[styles.distanceText, isFar && styles.distanceTextAlert]}
          >
            {distance}
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.buttonScan} onPress={scanDevices}>
        <Text style={styles.buttonText}>🔍 Scanner</Text>
      </TouchableOpacity>

      {isConnected && (
        <>
          <TouchableOpacity
            style={styles.buttonOn}
            onPress={() => sendCommand("ON")}
          >
            <Text style={styles.buttonText}>🔔 Buzzer ON</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonOff}
            onPress={() => sendCommand("OFF")}
          >
            <Text style={styles.buttonText}>🔕 Buzzer OFF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonDisconnect}
            onPress={disconnect}
          >
            <Text style={styles.buttonText}>❌ Déconnecter</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
  },
  status: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  rssiContainer: {
    backgroundColor: "#e8f4fd",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  rssiContainerAlert: {
    backgroundColor: "#ffe5e5",
  },
  rssiText: {
    fontSize: 14,
    color: "#666",
  },
  distanceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
    marginTop: 5,
  },
  distanceTextAlert: {
    color: "#FF3B30",
  },
  buttonScan: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    width: 200,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonOn: {
    backgroundColor: "#34C759",
    padding: 15,
    borderRadius: 10,
    width: 200,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonOff: {
    backgroundColor: "#FF9500",
    padding: 15,
    borderRadius: 10,
    width: 200,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonDisconnect: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 10,
    width: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
