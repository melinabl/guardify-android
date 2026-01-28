import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../firebaseConfig";

export default function ProfileScreen() {
  const [modeAccessible, setModeAccessible] = useState(false);
  const [notifSourdine, setNotifSourdine] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <View style={styles.avatarContainer}>
        <Image
          source={require("../../assets/images/icon-facebook.png")}
          style={styles.avatar}
        />
        <View style={styles.cameraIcon}>
          <Text>📷</Text>
        </View>
      </View>
      <Text style={styles.userName}>Profil</Text>

      {/* Section 1 */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>👤 Infos personnelles</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>✉️ E-mail</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>🔒 Mot de passe</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Section 2 */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>ℹ️ A propos de nous</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>🔔 Personnaliser les alertes</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Section 3 */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>🌐 Changer de langue</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
        <View style={styles.row}>
          <Text style={styles.rowText}>👁️ Mode malvoyant / sourd</Text>
          <Switch
            value={modeAccessible}
            onValueChange={setModeAccessible}
            trackColor={{ false: "#ddd", true: "#DB6130" }}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowText}>🔕 Notification sourdine</Text>
          <Switch
            value={notifSourdine}
            onValueChange={setNotifSourdine}
            trackColor={{ false: "#ddd", true: "#DB6130" }}
          />
        </View>
        <TouchableOpacity style={styles.row} onPress={handleLogout}>
          <Text style={[styles.rowText, { color: "#DB6130" }]}>
            🚪 Déconnexion
          </Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity>
        <Text style={styles.manageAccounts}>GÉRER LES COMPTES</Text>
      </TouchableOpacity>
    </ScrollView>
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
    fontSize: 24,
    color: "#DB6130",
  },
  avatarContainer: {
    alignSelf: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 5,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rowText: {
    fontSize: 15,
    color: "#333",
  },
  arrow: {
    fontSize: 18,
    color: "#999",
  },
  manageAccounts: {
    color: "#DB6130",
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
});
