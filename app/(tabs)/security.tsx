import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const FAKE_ZONES = [
  {
    id: "1",
    name: "Maison",
    address: "15 Rue Verte, 21000 Dijon",
    radius: 50,
    active: true,
  },
  {
    id: "2",
    name: "Bureau",
    address: "8 Avenue Jean Jaurès, 21000 Dijon",
    radius: 30,
    active: true,
  },
];

export default function SecurityScreen() {
  const [zones, setZones] = useState(FAKE_ZONES);

  const toggleZone = (id: string) => {
    setZones(zones.map((z) => (z.id === id ? { ...z, active: !z.active } : z)));
  };

  const handleAddZone = () => {
    Alert.alert(
      "Nouvelle zone",
      "Cette fonctionnalité nécessite l'accès GPS. Voulez-vous créer une zone à votre position actuelle ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Créer",
          onPress: () => {
            const newZone = {
              id: Date.now().toString(),
              name: "Nouvelle zone",
              address: "Position actuelle",
              radius: 50,
              active: true,
            };
            setZones([...zones, newZone]);
            Alert.alert("Succès", "Zone créée !");
          },
        },
      ],
    );
  };

  const handleDeleteZone = (id: string, name: string) => {
    Alert.alert("Supprimer", `Supprimer la zone "${name}" ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => setZones(zones.filter((z) => z.id !== id)),
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Image
          source={require("../../assets/images/GUARDIFY-LOGO-SOLO.png")}
          style={styles.logo}
        />
        <Image
          source={require("../../assets/images/GUARDIFY-ICON.png")}
          style={styles.avatar}
        />
      </View>

      <Text style={styles.title}>Zones sécurisées</Text>
      <Text style={styles.subtitle}>
        Recevez une alerte quand vous quittez une zone avec vos objets
      </Text>

      {/* Map placeholder */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapIcon}>🗺️</Text>
        <Text style={styles.mapText}>Carte des zones</Text>
        <View style={styles.mapOverlay}>
          {zones
            .filter((z) => z.active)
            .map((zone, index) => (
              <View
                key={zone.id}
                style={[styles.mapPin, { left: 50 + index * 80 }]}
              >
                <Text>📍</Text>
                <Text style={styles.mapPinLabel}>{zone.name}</Text>
              </View>
            ))}
        </View>
      </View>

      {/* Zones list */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes zones ({zones.length})</Text>
          <TouchableOpacity onPress={handleAddZone}>
            <Text style={styles.addText}>+ Ajouter</Text>
          </TouchableOpacity>
        </View>

        {zones.map((zone) => (
          <TouchableOpacity
            key={zone.id}
            style={styles.zoneCard}
            onLongPress={() => handleDeleteZone(zone.id, zone.name)}
          >
            <View style={styles.zoneIcon}>
              <Text style={styles.zoneEmoji}>
                {zone.name === "Maison"
                  ? "🏠"
                  : zone.name === "Bureau"
                    ? "🏢"
                    : "📍"}
              </Text>
            </View>
            <View style={styles.zoneInfo}>
              <Text style={styles.zoneName}>{zone.name}</Text>
              <Text style={styles.zoneAddress}>{zone.address}</Text>
              <Text style={styles.zoneRadius}>Rayon: {zone.radius}m</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.zoneToggle,
                zone.active && styles.zoneToggleActive,
              ]}
              onPress={() => toggleZone(zone.id)}
            >
              <View
                style={[
                  styles.toggleDot,
                  zone.active && styles.toggleDotActive,
                ]}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          Maintenez appuyé sur une zone pour la supprimer. Les alertes se
          déclenchent quand vous quittez une zone active avec un objet connecté.
        </Text>
      </View>

      <View style={{ height: 100 }} />
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
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  mapPlaceholder: {
    backgroundColor: "#e8e8e8",
    borderRadius: 20,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    position: "relative",
    overflow: "hidden",
  },
  mapIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  mapText: {
    fontSize: 14,
    color: "#999",
  },
  mapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mapPin: {
    position: "absolute",
    top: 60,
    alignItems: "center",
  },
  mapPinLabel: {
    fontSize: 10,
    color: "#333",
    backgroundColor: "#fff",
    paddingHorizontal: 5,
    borderRadius: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  addText: {
    fontSize: 14,
    color: "#DB6130",
    fontWeight: "600",
  },
  zoneCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
  },
  zoneIcon: {
    width: 50,
    height: 50,
    backgroundColor: "#f0e6e0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  zoneEmoji: {
    fontSize: 24,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 3,
  },
  zoneAddress: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  zoneRadius: {
    fontSize: 11,
    color: "#999",
  },
  zoneToggle: {
    width: 50,
    height: 28,
    backgroundColor: "#ddd",
    borderRadius: 14,
    padding: 2,
  },
  zoneToggleActive: {
    backgroundColor: "#34C759",
  },
  toggleDot: {
    width: 24,
    height: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  toggleDotActive: {
    marginLeft: 22,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#fff8e8",
    borderRadius: 15,
    padding: 15,
    alignItems: "flex-start",
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
});
