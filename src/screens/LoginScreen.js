import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Image,
  StatusBar,
} from "react-native";
import React, { useEffect } from "react";
import { useWalletConnect } from "react-native-walletconnect";
import tw from "tailwind-rn";

const LoginScreen = ({ navigation }) => {
  const { createSession, session } = useWalletConnect();
  const hasWallet = !!session.length;

  useEffect(() => {
    if (!!hasWallet) {
      navigation.navigate("Home");
    }
  }, [hasWallet, navigation]);

  return (
    <SafeAreaView
      style={[
        tw("flex-1 justify-center bg-black"),
        { backgroundColor: "#18181b" },
      ]}
    >
      <StatusBar barStyle="light-content" />
      <View style={tw("my-4 px-5  items-center justify-center")}>
        <Image
          style={tw("h-80 w-80")}
          source={{
            uri: "https://cdn3d.iconscout.com/3d/premium/thumb/ethereum-coin-5188694-4337892.png",
          }}
        />
        <Text
          style={[
            tw("font-bold text-white text-center w-full"),
            { fontSize: "40px" },
          ]}
        >
          Track your crypto assets easily
        </Text>
        <Text style={tw("text-white text-lg text-center w-80")}>
          To get started, please connect your wallet to the app.
        </Text>
      </View>
      <View style={tw("my-2 px-5")}>
        <TouchableOpacity
          onPress={createSession}
          style={[
            tw("flex-row items-center justify-center p-4 rounded-xl"),
            { backgroundColor: "#3B99FC" },
          ]}
        >
          <View style={tw("items-center justify-center")}>
            <Image
              style={tw("h-6 w-10 ")}
              source={require("../../assets/images/walletconnect-logo-white.png")}
            />
          </View>
          <Text style={tw("ml-4 text-lg text-white font-medium")}>
            Use WalletConnect
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
