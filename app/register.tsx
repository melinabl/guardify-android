import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
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

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Erreur", "Remplis tous les champs !");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas !");
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        "Erreur",
        "Le mot de passe doit faire au moins 6 caractères !",
      );
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)");
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

      <View style={styles.inputContainer}>
        <Image
          source={require("../assets/images/icon-facebook.png")}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="mot de passe"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Image
          source={require("../assets/images/icon-facebook.png")}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="confirmer mot de passe"
          placeholderTextColor="#999"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonPrimaryText}>
          {loading ? "Inscription..." : "S'inscrire"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>

      <View style={styles.socialContainer}>
        <Image
          source={require("../assets/images/icon-facebook.png")}
          style={styles.socialIcon}
        />
        <Image
          source={require("../assets/images/icon-facebook.png")}
          style={styles.socialIcon}
        />
        <Image
          source={require("../assets/images/icon-facebook.png")}
          style={styles.socialIcon}
        />
        <Image
          source={require("../assets/images/icon-facebook.png")}
          style={styles.socialIcon}
        />
      </View>
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
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 20,
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
    marginBottom: 35,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  socialIcon: {
    width: 35,
    height: 35,
    resizeMode: "contain",
    marginHorizontal: 12,
  },
});
