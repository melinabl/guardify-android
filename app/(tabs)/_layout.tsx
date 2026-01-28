import { Tabs } from "expo-router";
import { Image, StyleSheet } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#DB6130",
        tabBarInactiveTintColor: "#999",
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/images/HOME-PNG.png")}
              style={[styles.icon, { tintColor: color }]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="security"
        options={{
          title: "Sécurité",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/images/SECURITY-ICON.png")}
              style={[styles.icon, { tintColor: color }]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="locate"
        options={{
          title: "Localiser",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/images/LOCALISATION-ICON.png")}
              style={[styles.icon, { tintColor: color }]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/images/NOTIFICATION-ICON.png")}
              style={[styles.icon, { tintColor: color }]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../../assets/images/PROFIL-ICON-MENU.png")}
              style={[styles.icon, { tintColor: color }]}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
    elevation: 10,
  },
  tabLabel: {
    fontSize: 11,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
});
