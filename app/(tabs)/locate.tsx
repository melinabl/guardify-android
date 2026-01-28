import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
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
  const [status, setStatus] = useState("Appuie pour rechercher");
  const [device, setDevice] = useState<Device | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [rssi, setRssi] = useState<number | null>(null);
  const [distance, setDistance] = useState("");
  const [distanceLevel, setDistanceLevel] = useState("searching");
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const lastAlertState = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const deviceRef = useRef<Device | null>(null);

  // Reset et cleanup quand on entre/quitte la page
  useFocusEffect(
    useCallback(() => {
      // Reset des états
      setStatus("Appuie pour rechercher");
      setDevice(null);
      setIsConnected(false);
      setRssi(null);
      setDistance("");
      setDistanceLevel("searching");
      lastAlertState.current = false;
      deviceRef.current = null;

      // Cleanup quand on quitte la page
      return () => {
        console.log("Nettoyage BLE locate...");
        manager.stopDeviceScan();

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        if (deviceRef.current) {
          deviceRef.current.cancelConnection().catch(() => {});
          deviceRef.current = null;
        }
      };
    }, []),
  );

  // Animation de pulsation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

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
    if (rssiValue > -50) return { text: "< 1m", level: "close" };
    if (rssiValue > -70) return { text: "1-3m", level: "near" };
    if (rssiValue > -85) return { text: "3-5m", level: "medium" };
    return { text: "> 5m", level: "far" };
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
    setDistanceLevel("searching");

    manager.stopDeviceScan();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    manager.startDeviceScan(null, null, async (error, scannedDevice) => {
      if (error) {
        setStatus("Erreur: " + error.message);
        return;
      }

      if (scannedDevice?.name === "Guardify") {
        manager.stopDeviceScan();
        setStatus("Connexion...");

        try {
          // Déconnecte si déjà connecté
          try {
            const isAlreadyConnected = await scannedDevice.isConnected();
            if (isAlreadyConnected) {
              await scannedDevice.cancelConnection();
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          } catch (e) {}

          const connectedDevice = await scannedDevice.connect();
          await connectedDevice.discoverAllServicesAndCharacteristics();
          setDevice(connectedDevice);
          deviceRef.current = connectedDevice;
          setIsConnected(true);
          setStatus("Connecté");

          // Lance le monitoring RSSI
          startRssiMonitoring(connectedDevice);
        } catch (e: any) {
          setStatus("Erreur: " + e.message);
        }
      }
    });

    setTimeout(() => manager.stopDeviceScan(), 15000);
  };

  const startRssiMonitoring = (connectedDevice: Device) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(async () => {
      try {
        const isStillConnected = await connectedDevice.isConnected();
        if (!isStillConnected) {
          setStatus("Déconnecté");
          setIsConnected(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return;
        }

        const updatedDevice = await connectedDevice.readRSSI();
        if (updatedDevice.rssi) {
          setRssi(updatedDevice.rssi);
          const info = getDistance(updatedDevice.rssi);
          setDistance(info.text);
          setDistanceLevel(info.level);

          const nowFar = info.level === "medium" || info.level === "far";

          if (nowFar && !lastAlertState.current) {
            Vibration.vibrate(500);
            setStatus("Objet éloigné !");
            lastAlertState.current = true;
          } else if (!nowFar && lastAlertState.current) {
            setStatus("Connecté");
            lastAlertState.current = false;
          }
        }
      } catch (e) {
        console.log("Erreur RSSI");
      }
    }, 2000);
  };

  const getCircleColor = () => {
    switch (distanceLevel) {
      case "close":
        return "#34C759";
      case "near":
        return "#34C759";
      case "medium":
        return "#FF9500";
      case "far":
        return "#FF3B30";
      default:
        return "#DB6130";
    }
  };

  return (
    <View style={styles.container}>
      {/* Background map effect */}
      <View style={styles.mapBackground}>
        <View style={styles.mapLine} />
        <View style={[styles.mapLine, { top: 100 }]} />
        <View style={[styles.mapLine, { top: 200 }]} />
        <View style={[styles.mapLine, { top: 300 }]} />
        <View style={[styles.mapLine, { top: 400 }]} />
        <View style={[styles.mapLine, { top: 500 }]} />
        <View style={[styles.mapLineVertical, { left: 50 }]} />
        <View style={[styles.mapLineVertical, { left: 150 }]} />
        <View style={[styles.mapLineVertical, { left: 250 }]} />
        <View style={[styles.mapLineVertical, { left: 350 }]} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Cercle animé */}
        <Animated.View
          style={[
            styles.pulseOuter,
            {
              transform: [{ scale: pulseAnim }],
              borderColor: getCircleColor(),
            },
          ]}
        >
          <View style={[styles.pulseMiddle, { borderColor: getCircleColor() }]}>
            <View
              style={[styles.pulseInner, { backgroundColor: getCircleColor() }]}
            >
              {isConnected && distance ? (
                <Text style={styles.distanceText}>{distance}</Text>
              ) : (
                <Text style={styles.searchingText}>📍</Text>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Texte */}
        <Text style={styles.title}>
          {isConnected ? "Objet localisé" : "Nous localisons votre objet"}
        </Text>
        <Text style={styles.subtitle}>
          {isConnected
            ? `Signal: ${rssi} dBm • ${status}`
            : "Un peu de patience ! Tu seras rapidement informé sur la position exacte de ton objet."}
        </Text>

        {/* Boutons */}
        {!isConnected ? (
          <TouchableOpacity style={styles.searchButton} onPress={scanDevices}>
            <Text style={styles.searchButtonText}>Rechercher</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Vibration.vibrate(500)}
            >
              <Text style={styles.actionButtonText}>📳 Vibrer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonOrange]}
              onPress={() => sendCommand("ON")}
            >
              <Text style={styles.actionButtonText}>🔔 Sonner</Text>
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
  mapBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  mapLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#999",
  },
  mapLineVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#999",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  backText: {
    fontSize: 28,
    color: "#DB6130",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    marginTop: -50,
  },
  pulseOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(219, 97, 48, 0.05)",
  },
  pulseMiddle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(219, 97, 48, 0.1)",
  },
  pulseInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  distanceText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  searchingText: {
    fontSize: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 30,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  searchButton: {
    backgroundColor: "#DB6130",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 50,
    marginTop: 30,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  actionsContainer: {
    flexDirection: "row",
    marginTop: 30,
  },
  actionButton: {
    backgroundColor: "#DB6130",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginHorizontal: 10,
  },
  actionButtonOrange: {
    backgroundColor: "#CF6135",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  stopButton: {
    borderWidth: 1,
    borderColor: "#DB6130",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 15,
  },
  stopButtonText: {
    color: "#DB6130",
    fontSize: 14,
  },
});
