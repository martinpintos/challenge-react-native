import "react-native-get-random-values";
import "@ethersproject/shims";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import WalletConnectProvider from "react-native-walletconnect";
import { RootSiblingParent } from "react-native-root-siblings";
import { LogBox } from "react-native";
import { StatusBar } from "react-native";

LogBox.ignoreLogs(["Warning: ..."]);
LogBox.ignoreAllLogs();

const Stack = createNativeStackNavigator();

function App() {
  return (
    <RootSiblingParent>
      <StatusBar barStyle="light-content" />
      <WalletConnectProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </WalletConnectProvider>
    </RootSiblingParent>
  );
}

export default App;
