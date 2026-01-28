import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getObjects, SavedObject } from "../../utils/storage";

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("comptes");
  const [objects, setObjects] = useState<SavedObject[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadObjects();
    }, []),
  );

  const loadObjects = async () => {
    const savedObjects = await getObjects();
    setObjects(savedObjects);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "comptes":
        return (
          <View style={styles.cardsContainer}>
            <TouchableOpacity
              style={styles.cardOrange}
              onPress={() => router.push("/profile")}
            >
              <Text style={styles.cardTitle}>
                Informations{"\n"}personnelles
              </Text>
              <View style={styles.cardPlus}>
                <Text style={styles.plusText}>+</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardLight}>
              <Text style={styles.cardTitleDark}>
                Personnaliser{"\n"}les alertes
              </Text>
              <View style={styles.cardPlusLight}>
                <Text style={styles.plusTextLight}>+</Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      case "objets":
        return (
          <View style={styles.cardsContainer}>
            <TouchableOpacity
              style={styles.cardOrange}
              onPress={() => router.push("/locate")}
            >
              <Text style={styles.cardTitle}>Localiser mes{"\n"}objets</Text>
              <View style={styles.cardPlus}>
                <Text style={styles.plusText}>+</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cardLight}
              onPress={() => router.push("/add-object")}
            >
              <Text style={styles.cardTitleDark}>Ajouter un{"\n"}objet</Text>
              <View style={styles.cardPlusLight}>
                <Text style={styles.plusTextLight}>+</Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      case "zones":
        return (
          <View style={styles.cardsContainer}>
            <TouchableOpacity
              style={styles.cardOrange}
              onPress={() => router.push("/security")}
            >
              <Text style={styles.cardTitle}>
                Créer ma zone{"\n"}de sécurité
              </Text>
              <View style={styles.cardPlus}>
                <Text style={styles.plusText}>+</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardLight}>
              <Text style={styles.cardTitleDark}>Ajouter une{"\n"}zone</Text>
              <View style={styles.cardPlusLight}>
                <Text style={styles.plusTextLight}>+</Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/notifications")}>
          <Image
            source={require("../../assets/images/icon-facebook.png")}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
        <Image
          source={require("../../assets/images/GUARDIFY-LOGO-SOLO.png")}
          style={styles.logo}
        />
        <TouchableOpacity onPress={() => router.push("/profile")}>
          <Image
            source={require("../../assets/images/GUARDIFY-PROFIL.png")}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.greeting}>Tableau de bord</Text>
        <Text style={styles.subtitle}>Bonjour ! Vous allez bien ?</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setActiveTab("comptes")}>
            <Text
              style={[styles.tab, activeTab === "comptes" && styles.tabActive]}
            >
              Comptes
            </Text>
            {activeTab === "comptes" && <View style={styles.tabDot} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("objets")}>
            <Text
              style={[styles.tab, activeTab === "objets" && styles.tabActive]}
            >
              Objets
            </Text>
            {activeTab === "objets" && <View style={styles.tabDot} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab("zones")}>
            <Text
              style={[styles.tab, activeTab === "zones" && styles.tabActive]}
            >
              Zones sécurisées
            </Text>
            {activeTab === "zones" && <View style={styles.tabDot} />}
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Multi-utilisateurs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Multi-utilisateurs</Text>
            <Text style={styles.seeMore}>Voir plus &gt;</Text>
          </View>
          <View style={styles.multiUserCard}>
            <Image
              source={require("../../assets/images/MULTIUTILISATEUR-ICON.png")}
              style={styles.multiUserIcon}
            />
            <View style={styles.multiUserText}>
              <Text style={styles.multiUserTitle}>Gérer plusieurs comptes</Text>
              <Text style={styles.multiUserDesc}>
                Inviter des membres de votre famille pour partager certains
                objets.
              </Text>
            </View>
          </View>
        </View>

        {/* Objets enregistrés */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Objets enregistrés</Text>
            <TouchableOpacity onPress={() => router.push("/add-object")}>
              <Text style={styles.seeMore}>Ajouter un objet &gt;</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.objectsRow}>
            {objects.length === 0 ? (
              <Text style={styles.noObjects}>Aucun objet enregistré</Text>
            ) : (
              objects.map((obj) => (
                <TouchableOpacity
                  key={obj.id}
                  style={styles.objectItem}
                  onPress={() => router.push(`/object-detail?id=${obj.id}`)}
                >
                  <View style={styles.objectIcon}>
                    <Text style={styles.objectEmoji}>{obj.icon}</Text>
                  </View>
                  <Text style={styles.objectLabel}>{obj.name}</Text>
                </TouchableOpacity>
              ))
            )}
            <TouchableOpacity
              style={styles.objectItem}
              onPress={() => router.push("/add-object")}
            >
              <View style={styles.objectIconAdd}>
                <Text style={styles.objectAddText}>+</Text>
              </View>
              <Text style={styles.objectLabel}>Ajouter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
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
    paddingBottom: 20,
  },
  headerIcon: {
    width: 28,
    height: 28,
    tintColor: "#DB6130",
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
  },
  content: {
    backgroundColor: "#f0e6e0",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    minHeight: 600,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#DB6130",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    color: "#333",
    marginBottom: 25,
  },
  tabs: {
    flexDirection: "row",
    marginBottom: 20,
  },
  tab: {
    fontSize: 14,
    color: "#999",
    marginRight: 25,
  },
  tabActive: {
    color: "#333",
    fontWeight: "600",
  },
  tabDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#DB6130",
    alignSelf: "center",
    marginTop: 5,
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  cardOrange: {
    backgroundColor: "#DB6130",
    borderRadius: 15,
    padding: 20,
    width: "47%",
    height: 150,
    justifyContent: "space-between",
  },
  cardLight: {
    backgroundColor: "rgba(219, 97, 48, 0.3)",
    borderRadius: 15,
    padding: 20,
    width: "47%",
    height: 150,
    justifyContent: "space-between",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  cardTitleDark: {
    color: "#333",
    fontSize: 13.75,
    fontWeight: "600",
  },
  cardPlus: {
    backgroundColor: "rgba(255,255,255,0.3)",
    width: 35,
    height: 35,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cardPlusLight: {
    backgroundColor: "#DB6130",
    width: 35,
    height: 35,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  plusText: {
    color: "#fff",
    fontSize: 24,
  },
  plusTextLight: {
    color: "#fff",
    fontSize: 24,
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
  seeMore: {
    fontSize: 13,
    color: "#999",
  },
  multiUserCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
  },
  multiUserIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
    tintColor: "#DB6130",
  },
  multiUserText: {
    flex: 1,
  },
  multiUserTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  multiUserDesc: {
    fontSize: 12,
    color: "#666",
  },
  objectsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  objectItem: {
    alignItems: "center",
    marginRight: 15,
    marginBottom: 15,
  },
  objectIcon: {
    width: 60,
    height: 60,
    backgroundColor: "#fff",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  objectIconAdd: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(219, 97, 48, 0.2)",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  objectEmoji: {
    fontSize: 28,
  },
  objectAddText: {
    fontSize: 28,
    color: "#DB6130",
  },
  objectLabel: {
    fontSize: 12,
    color: "#333",
  },
  noObjects: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
});
