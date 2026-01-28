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

const FAKE_USERS = [
  { id: "1", name: "Moi", role: "Propriétaire", avatar: "👤" },
  { id: "2", name: "Maman", role: "Membre", avatar: "👩" },
  { id: "3", name: "Papa", role: "Membre", avatar: "👨" },
];

const SHARED_OBJECTS = [
  { id: "1", name: "Clés maison", icon: "🔑", sharedWith: ["Maman", "Papa"] },
  { id: "2", name: "Télécommande", icon: "📱", sharedWith: ["Maman"] },
];

export default function MultiUsersScreen() {
  const [users, setUsers] = useState(FAKE_USERS);

  const handleInvite = () => {
    Alert.alert(
      "Inviter un membre",
      "Un lien d'invitation sera envoyé par email",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Envoyer",
          onPress: () => Alert.alert("Succès", "Invitation envoyée !"),
        },
      ],
    );
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
        <View style={styles.avatarPlaceholder} />
      </View>

      <Text style={styles.title}>Multi-utilisateurs</Text>
      <Text style={styles.subtitle}>
        Partagez vos objets avec votre famille
      </Text>

      {/* Illustration */}
      <View style={styles.illustration}>
        <View style={styles.illustrationCircle}>
          <Text style={styles.illustrationEmoji}>👨‍👩‍👧‍👦</Text>
        </View>
        <Text style={styles.illustrationText}>
          Gérez votre famille et partagez l'accès à vos objets connectés
        </Text>
      </View>

      {/* Membres */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Membres ({users.length})</Text>
          <TouchableOpacity onPress={handleInvite}>
            <Text style={styles.inviteText}>+ Inviter</Text>
          </TouchableOpacity>
        </View>

        {users.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{user.avatar}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userRole}>{user.role}</Text>
            </View>
            {user.role !== "Propriétaire" && (
              <TouchableOpacity style={styles.removeButton}>
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Objets partagés */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Objets partagés</Text>

        {SHARED_OBJECTS.map((obj) => (
          <View key={obj.id} style={styles.sharedObjectCard}>
            <View style={styles.sharedObjectIcon}>
              <Text style={styles.sharedObjectEmoji}>{obj.icon}</Text>
            </View>
            <View style={styles.sharedObjectInfo}>
              <Text style={styles.sharedObjectName}>{obj.name}</Text>
              <Text style={styles.sharedObjectUsers}>
                Partagé avec: {obj.sharedWith.join(", ")}
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.editText}>✏️</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          Les membres invités pourront localiser et faire sonner les objets
          partagés, mais ne pourront pas les supprimer.
        </Text>
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
  avatarPlaceholder: {
    width: 45,
    height: 45,
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
    marginBottom: 25,
  },
  illustration: {
    backgroundColor: "#f0e6e0",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginBottom: 25,
  },
  illustrationCircle: {
    width: 100,
    height: 100,
    backgroundColor: "#DB6130",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  illustrationEmoji: {
    fontSize: 50,
  },
  illustrationText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  section: {
    marginBottom: 25,
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
  inviteText: {
    fontSize: 14,
    color: "#DB6130",
    fontWeight: "600",
  },
  userCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
  },
  userAvatar: {
    width: 50,
    height: 50,
    backgroundColor: "#f0e6e0",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 3,
  },
  userRole: {
    fontSize: 12,
    color: "#666",
  },
  removeButton: {
    width: 30,
    height: 30,
    backgroundColor: "#ffe5e5",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    fontSize: 20,
    color: "#FF3B30",
  },
  sharedObjectCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
  },
  sharedObjectIcon: {
    width: 45,
    height: 45,
    backgroundColor: "#DB6130",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sharedObjectEmoji: {
    fontSize: 22,
  },
  sharedObjectInfo: {
    flex: 1,
  },
  sharedObjectName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 3,
  },
  sharedObjectUsers: {
    fontSize: 12,
    color: "#666",
  },
  editText: {
    fontSize: 18,
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
