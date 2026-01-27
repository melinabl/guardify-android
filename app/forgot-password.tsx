import { router } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth } from "../firebaseConfig";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Erreur", "Entre ton email !");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Email envoyé !",
        "Vérifie ta boîte mail pour réinitialiser ton mot de passe.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (error: any) {
      Alert.alert("Erreur", error.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/GUARDIFY-LOGO.png")}
        style={styles.logo}
      />

      <View style={styles.separator} />

      <Text style={styles.title}>Mot de passe oublié</Text>

      <View style={styles.inputContainer}>
        <Image
          source={require("../assets/images/icon-facebook.png")}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="e-mail"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={handleReset}
        disabled={loading}
      >
        <Text style={styles.buttonPrimaryText}>
          {loading ? "Envoi..." : "Réinitialiser"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.linkText}>Retour à la connexion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    backgroundColor: "#F8F8F7",
  },
  logo: {
    width: 200,
    height: 80,
    resizeMode: "contain",
    marginBottom: 20,
  },
  separator: {
    width: 150,
    height: 2,
    backgroundColor: "#DB6130",
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    color: "#333",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 25,
    paddingBottom: 8,
  },
  inputIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    marginRight: 12,
    tintColor: "#999",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 5,
  },
  buttonPrimary: {
    backgroundColor: "#DB6130",
    paddingVertical: 14,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
  },
  buttonPrimaryText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  linkText: {
    color: "#333",
    fontSize: 14,
  },
});
