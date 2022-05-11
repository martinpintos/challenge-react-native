import { ethers } from "ethers";
import React, { useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from "react-native";
import { useWalletConnect } from "react-native-walletconnect";
import { useEffect } from "react";
import tw from "tailwind-rn";
import Icon from "react-native-vector-icons/AntDesign";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-root-toast";

const wait = (timeout) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

const provider = new ethers.providers.InfuraProvider(
  "rinkeby",
  "bd722b08b5104395b8f9bbdaa57d1c86"
);

const options = [
  {
    name: "Receive",
    icon: "down",
    value: "receive",
  },
  {
    name: "Send",
    icon: "up",
    value: "send",
  },
  {
    name: "Swap",
    icon: "swap",
    value: "swap",
  },
];

const Item = ({ from, to, value, type, date }) => (
  <View style={tw("w-full px-5 mb-3")}>
    <Text
      style={[tw("flex-1 font-normal mb-0.5 text-base"), { color: "#52525b" }]}
    >
      {date}
    </Text>
    <TouchableOpacity
      style={[
        tw("flex-row p-3 items-center justify-between h-16 rounded-xl"),
        { backgroundColor: "#27272a" },
      ]}
    >
      <View style={tw("flex-row items-center")}>
        <View
          style={[
            tw("h-12 rounded-full pt-0.5 w-12 items-center justify-center "),
            { backgroundColor: "#3f3f46" },
          ]}
        >
          <Icon
            name={type === "received" ? "down" : "up"}
            size={28}
            color="white"
          />
        </View>
        <View style={tw(" ml-3")}>
          <Text style={tw("text-white font-semibold text-lg")}>
            {type === "received" ? "Received" : "Sent"}
          </Text>
          <Text style={[tw("font-medium"), { color: "#52525b" }]}>
            {type === "received"
              ? `From: ${from.slice(0, 6)}...${from.slice(-4)}`
              : `To: ${to.slice(0, 6)}...${to.slice(-4)}`}
          </Text>
        </View>
      </View>
      <Text
        style={
          type === "received"
            ? tw("text-xl font-semibold text-green-400")
            : tw("text-xl font-semibold text-red-400")
        }
      >
        {type === "received" ? `+${value}` : `-${value}`} ETH
      </Text>
    </TouchableOpacity>
  </View>
);

const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [ethBalance, setEthBalance] = useState(0);
  const [fiatBalance, setFiatBalance] = useState(0);
  const [fiatBalanceVariation, setFiatBalanceVariation] = useState(0);
  const [percentageVariation, setPercentageVariation] = useState(0);
  const [address, setAddress] = useState("");
  const [transactions, setTransactions] = useState([]);
  const { killSession, session } = useWalletConnect();
  const hasWallet = !!session.length;

  const showToast = () => {
    Toast.show("Address copied to clipboard", {
      duration: Toast.durations.LONG,
      position: Toast.positions.BOTTOM,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
    });
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(address?.toString());
  };

  const handlePress = () => {
    copyToClipboard();
    showToast();
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    wait(2000).then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    if (!hasWallet) {
      navigation.navigate("Login");
    }
  }, [hasWallet]);

  useEffect(() => {
    if (!!hasWallet) {
      setAddress(session[0].accounts[0]);
    }
  }, [hasWallet]);

  useEffect(() => {
    provider.getBalance(address).then((balance) => {
      const etherBalance = ethers.utils.formatEther(balance);
      setEthBalance(etherBalance);
    });
  }, [address, refreshing, hasWallet]);

  useEffect(() => {
    if (!!address) {
      fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true`
      )
        .then((response) => response.json())
        .then((data) => {
          const roundedFiatBalance =
            Math.round(ethBalance * data.ethereum.usd * 100) / 100;
          setFiatBalance(roundedFiatBalance);

          const roundedPercentageVariation =
            Math.round(data.ethereum.usd_24h_change * 100) / 100;
          setPercentageVariation(roundedPercentageVariation);

          const roundedFiatBalanceVariation =
            Math.round(
              ((ethBalance * data.ethereum.usd * data.ethereum.usd_24h_change) /
                100) *
                100
            ) / 100;

          setFiatBalanceVariation(roundedFiatBalanceVariation);
        });
    }
  }, [refreshing, ethBalance]);

  useEffect(() => {
    if (!!address) {
      fetch(
        `https://api-rinkeby.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=YourApiKeyToken`,
        {
          method: "GET",
        }
      )
        .then((response) => response.json())
        .then((data) => {
          const transactions = data.result.map((transaction) => {
            const value = ethers.utils.formatEther(transaction.value);
            const date = new Date(transaction.timeStamp * 1000);
            const dateString =
              date.getDate() +
              "/" +
              (date.getMonth() + 1) +
              "/" +
              date.getFullYear() +
              " " +
              date.toLocaleTimeString(navigator.language, {
                hour: "2-digit",
                minute: "2-digit",
              });
            const type = transaction.to === address ? "received" : "sent";
            return {
              timeStamp: transaction.timeStamp,
              from: transaction.from,
              to: transaction.to,
              value,
              date: dateString,
              type,
            };
          });
          const orderedTransactions = transactions.sort(
            (a, b) => b.timeStamp - a.timeStamp
          );

          setTransactions(orderedTransactions);
        });
    }
  }, [address, refreshing, hasWallet, ethBalance]);

  const renderItem = ({ item }) => (
    <Item
      value={item.value}
      to={item.to}
      from={item.from}
      type={item.type}
      date={item.date}
    />
  );

  return (
    <SafeAreaView
      style={[tw("flex-1 bg-black"), { backgroundColor: "#18181b" }]}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={tw("flex-1")}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={tw("my-3 flex-row  items-center justify-between px-5")}>
          <TouchableOpacity onPress={handlePress}>
            <Text style={tw("text-lg font-bold text-white")}>
              Wallet 1{" "}
              <Text style={[tw(" font-normal"), { color: "#71717a" }]}>
                ({address.slice(0, 6)}...{address.slice(-4)})
              </Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={killSession} style={tw("p-1")}>
            <Icon name="logout" size={28} color="white" />
          </TouchableOpacity>
        </View>
        <View style={tw(" my-3 px-5")}>
          <Text style={[tw("text-xl"), { color: "#71717a" }]}>
            Total balance
          </Text>

          <Text style={[tw("text-white font-light"), { fontSize: "68px" }]}>
            ${Math.trunc(fiatBalance)}
            <Text style={{ color: "#3f3f46" }}>
              ,{fiatBalance.toString().split(".")[1]}
            </Text>
          </Text>
          <Text style={[tw("text-2xl"), { color: "#71717a" }]}>
            ≈ {Math.round(ethBalance * 100000) / 100000} ETH
          </Text>
          <View style={tw("flex-row ")}>
            <Text
              style={[
                tw("mr-2 font-bold text-lg"),
                fiatBalanceVariation >= 0
                  ? { color: "#22c55e" }
                  : { color: "#ef4444" },
              ]}
            >
              {fiatBalanceVariation.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </Text>
            <Text
              style={[
                tw("font-bold text-lg"),
                fiatBalanceVariation >= 0
                  ? { color: "#22c55e" }
                  : { color: "#ef4444" },
              ]}
            >
              ({Math.abs(percentageVariation)}%)
            </Text>
          </View>
        </View>
        <View style={tw(" flex-row  my-3 px-5")}>
          {options.map((option) => (
            <TouchableOpacity style={tw("items-center justify-center mr-4")}>
              <View
                style={[
                  tw("h-16 items-center justify-center w-16 rounded-full"),
                  { backgroundColor: "#27272a" },
                ]}
              >
                <Icon name={option.icon} size={36} color="white" />
              </View>
              <Text style={tw("mt-1 text-white")}>{option.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <FlatList
          data={transactions}
          renderItem={renderItem}
          keyExtractor={(item) => item.date.toString()}
          style={tw("flex-1 mt-3")}
          ListHeaderComponent={
            <View style={tw("flex-row items-center justify-between mb-2 px-5")}>
              <Text style={tw("text-white font-semibold text-xl")}>
                Recent transactions
              </Text>
              <TouchableOpacity style={tw("p-1 items-center justify-center")}>
                <Text style={tw("text-white")}>See all</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
