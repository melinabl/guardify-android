import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    Image,
    PermissionsAndroid,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { BleManager } from "react-native-ble-plx";
import { SavedObject, saveObject } from "../utils/storage";

const manager = new BleManager();

const OBJECT_TYPES = [
  { id: "keys", name: "Clés", icon: "🔑" },
  { id: "wallet", name: "Portefeuille", icon: "👛" },
  { id: "bag", name: "Sac", icon: "👜" },
  { id: "meds", name: "Médicaments", icon: "💊" },
  { id: "phone", name: "Téléphone", icon: "📱" },
  { id: "other", name: "Autre", icon: "📦" },
];

export default function AddObjectScreen() {
  const [status, setStatus] = useState("En attente");
  const [deviceFound, setDeviceFound] = useState(false);
  const [objectName, setObjectName] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [scanning, setScanning] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // Reset quand on arrive sur la page
      setStatus("En attente");
      setDeviceFound(false);
      setScanning(false);
      setObjectName("");
      setSelectedType("");

      return () => {
        // Arrête le scan quand on quitte la page
        manager.stopDeviceScan();
      };
    }, []),
  );

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    }
  };

  const searchDevice = async () => {
    await requestPermissions();
    setStatus("Recherche...");
    setScanning(true);
    setDeviceFound(false);

    // Arrête tout scan précédent
    manager.stopDeviceScan();

    // Petit délai avant de relancer
    setTimeout(() => {
      manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          setStatus("Erreur: " + error.message);
          setScanning(false);
          return;
        }
        if (device?.name === "Guardify") {
          manager.stopDeviceScan();
          setStatus("Guardify trouvé !");
          setDeviceFound(true);
          setScanning(false);
        }
      });
    }, 500);

    setTimeout(() => {
      manager.stopDeviceScan();
      setScanning(false);
    }, 10000);
  };

  const handleAdd = async () => {
    if (!objectName) {
      Alert.alert("Erreur", "Donne un nom à ton objet");
      return;
    }
    if (!selectedType) {
      Alert.alert("Erreur", "Choisis un type d'objet");
      return;
    }
    if (!deviceFound) {
      Alert.alert("Erreur", "Connecte d'abord un périphérique");
      return;
    }

    const typeInfo = OBJECT_TYPES.find((t) => t.id === selectedType);

    const newObject: SavedObject = {
      id: Date.now().toString(),
      name: objectName,
      type: selectedType,
      icon: typeInfo?.icon || "📦",
      createdAt: Date.now(),
    };

    await saveObject(newObject);
    Alert.alert("Succès", `Objet "${objectName}" ajouté !`, [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

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

      <Text style={styles.title}>Ajouter un objet</Text>
      <Text style={styles.statusText}>
        STATUT :{" "}
        <Text style={[styles.statusValue, deviceFound && styles.statusOk]}>
          {status}
        </Text>
      </Text>

      <TouchableOpacity
        style={[styles.searchButton, scanning && styles.searchButtonActive]}
        onPress={searchDevice}
        disabled={scanning}
      >
        <Text style={styles.searchButtonText}>
          {scanning ? "Recherche en cours..." : "Rechercher le périphérique"}
        </Text>
      </TouchableOpacity>

      {deviceFound && (
        <View style={styles.deviceFoundCard}>
          <Text style={styles.deviceFoundText}>
            ✅ Périphérique Guardify connecté
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Informations objet</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputIcon}>🏷️</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom de l'objet (ex: Mes clés)"
          placeholderTextColor="#999"
          value={objectName}
          onChangeText={setObjectName}
        />
      </View>

      <Text style={styles.sectionTitle}>Type d'objet</Text>

      <View style={styles.typesContainer}>
        {OBJECT_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeButton,
              selectedType === type.id && styles.typeButtonSelected,
            ]}
            onPress={() => setSelectedType(type.id)}
          >
            <Text style={styles.typeIcon}>{type.icon}</Text>
            <Text
              style={[
                styles.typeLabel,
                selectedType === type.id && styles.typeLabelSelected,
              ]}
            >
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addButtonText}>AJOUTER</Text>
      </TouchableOpacity>

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
    marginBottom: 5,
  },
  statusText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 20,
  },
  statusValue: {
    color: "#999",
  },
  statusOk: {
    color: "#34C759",
  },
  searchButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  searchButtonActive: {
    backgroundColor: "#f0f0f0",
  },
  searchButtonText: {
    fontSize: 15,
    color: "#333",
  },
  deviceFoundCard: {
    backgroundColor: "#e8f5e8",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    alignItems: "center",
  },
  deviceFoundText: {
    color: "#34C759",
    fontSize: 14,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  typesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 30,
  },
  typeButton: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginRight: 10,
    marginBottom: 10,
    width: "30%",
  },
  typeButtonSelected: {
    backgroundColor: "#DB6130",
  },
  typeIcon: {
    fontSize: 28,
    marginBottom: 5,
  },
  typeLabel: {
    fontSize: 11,
    color: "#333",
  },
  typeLabelSelected: {
    color: "#fff",
  },
  addButton: {
    backgroundColor: "#DB6130",
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
