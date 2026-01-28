import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { auth } from "../firebaseConfig";

export default function SplashScreen() {
  const [progress] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animation de la progress bar (2 secondes)
    Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    // Vérifier l'auth après 2 secondes
    const timer = setTimeout(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          router.replace("/(tabs)");
        } else {
          router.replace("/login");
        }
        unsubscribe();
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/GUARDIFY-LOGO-WHITE.png")}
        style={styles.logoImage}
      />
      <Text style={styles.subtitle}>Protège tes objets</Text>

      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
      </View>

      <Text style={styles.loadingText}>Chargement...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B1925",
  },
  logo: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#DB6130",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#F8F8F7",
    marginBottom: 60,
  },
  progressContainer: {
    width: "70%",
    height: 6,
    backgroundColor: "#1a2d3d",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#DB6130",
    borderRadius: 3,
  },
  loadingText: {
    marginTop: 20,
    color: "#F8F8F7",
    fontSize: 14,
  },
  logoImage: {
    width: 200,
    height: 100,
    resizeMode: "contain",
    marginBottom: 20,
  },
});
