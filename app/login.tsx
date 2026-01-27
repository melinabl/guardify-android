import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Remplis tous les champs !");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
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

      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonPrimaryText}>
          {loading ? "Connexion..." : "Connexion"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => router.push("/register")}
      >
        <Text style={styles.buttonSecondaryText}>Pas encore de compte ?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/forgot-password")}>
        <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
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
    backgroundColor: "grey",
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
    marginBottom: 12,
    elevation: 2,
  },
  buttonPrimaryText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  buttonSecondary: {
    backgroundColor: "white",
    paddingVertical: 14,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 1,
  },
  buttonSecondaryText: {
    color: "#333",
    fontSize: 16,
  },
  forgotText: {
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
