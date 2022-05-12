import "react-native-get-random-values";
import "@ethersproject/shims";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import WalletConnectProvider from "react-native-walletconnect";
import { StatusBar } from "react-native";
import { LogBox } from "react-native";

LogBox.ignoreLogs(["exported from 'deprecated-react-native-prop-types'."]);
LogBox.ignoreLogs([
  "ViewPropTypes will be removed",
  "ColorPropType will be removed",
]);

const Stack = createNativeStackNavigator();

function App() {
  return (
    <WalletConnectProvider>
      <StatusBar barStyle="light-content" />
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
  );
}

export default App;
