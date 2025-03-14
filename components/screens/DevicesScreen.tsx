import React from "react";
import {
  View,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Card, Button, Divider } from "react-native-paper";
import Icon from '@react-native-vector-icons/ionicons';
import ScreenWrapper from "../ScreenWrapper";
import { wp } from "../helpers/common";

import BackButton from "../BackButton";
const DevicesScreen = () => {
  const [googleFitEnabled, setGoogleFitEnabled] = React.useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = React.useState(true);

  return (
    <ScreenWrapper bg={"#FFF"}>
      <View style={{ backgroundColor: "#edf3fc" }}>
        <View style={{ backgroundColor: "#FFF",marginBottom:15 }}>
          <View
            style={{
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#FFF",
            }}
          >
            <BackButton size={26} />
            <Text style={{ fontSize: 18, fontWeight: "600", marginLeft: 8 }}>
              View Devices
            </Text>
          </View>

          <Text style={{ color: "#6B7280", marginBottom: 16, marginLeft: 16 }}>
            Manage your connected devices
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          {/* Current Device */}
          <Card
            style={{ padding: 16, borderRadius: 10, backgroundColor: "#FFFF" }}
          >
            <Text style={{ fontWeight: "700" }}>Current Device</Text>
            <Text style={{ color: "#6B7280", fontSize: 12 }}>
              Connected and syncing
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 12,
              }}
            >
              <Icon name="watch" size={36} color="gray" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ fontWeight: "600", fontSize: 16 }}>
                  SmartWatch Pro
                </Text>
                <Text style={{ color: "#6B7280", fontSize: 12 }}>
                  🔋 85% • Last sync: 2m ago
                </Text>
              </View>
              <Text style={{ color: "green", fontWeight: "600" }}>
                ● Active
              </Text>
            </View>
          </Card>

          {/* Google Fit */}
          <Card
            style={{
              padding: 16,
              marginTop: 16,
              borderRadius: 10,
              backgroundColor: "#FFFF",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon name="logo-google" size={20} color="black" />
                <Text
                  style={{ fontWeight: "600", fontSize: 16, marginLeft: 8 }}
                >
                  Google Fit
                </Text>
              </View>
              <Switch
                value={googleFitEnabled}
                onValueChange={setGoogleFitEnabled}
              />
            </View>
            <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 8 }}>
              Connected as john.doe@gmail.com
            </Text>
            <Text style={{ color: "#6B7280", fontSize: 12 }}>
              Last synced: Today at 14:30
            </Text>
          </Card>

          {/* Added Devices */}
          <Text style={{ fontWeight: "600", marginTop: 24 }}>
            Added Devices
          </Text>
          <Card
            style={{
              padding: 16,
              marginTop: 8,
              borderRadius: 10,
              backgroundColor: "#FFFF",
            }}
          >
            <TouchableOpacity
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 10,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon name="watch" size={24} color="gray" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ fontWeight: "600" }}>SmartWatch Lite</Text>
                  <Text style={{ color: "#6B7280", fontSize: 12 }}>
                    Disconnected • 2 days ago
                  </Text>
                </View>
              </View>
              <Icon name="chevron-forward-outline" size={24} color="gray" />
            </TouchableOpacity>
            <Divider />
            <TouchableOpacity
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 10,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon name="watch" size={24} color="gray" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ fontWeight: "600" }}>SmartWatch Sport</Text>
                  <Text style={{ color: "#6B7280", fontSize: 12 }}>
                    Disconnected • 1 week ago
                  </Text>
                </View>
              </View>
              <Icon name="chevron-forward-outline" size={24} color="gray" />
            </TouchableOpacity>
          </Card>

          {/* Bluetooth */}
          <Card
            style={{
              padding: 16,
              marginTop: 16,
              borderRadius: 10,
              backgroundColor: "#FFFF",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon name="bluetooth" size={20} color="black" />
                <Text
                  style={{ fontWeight: "600", fontSize: 16, marginLeft: 8 }}
                >
                  Bluetooth
                </Text>
              </View>
              <Switch
                value={bluetoothEnabled}
                onValueChange={setBluetoothEnabled}
              />
            </View>
            <Button
              mode="contained"
              style={{
                marginTop: 10,
                backgroundColor: "#EFF6FF",
              }}
            >
              <Text
                style={{
                  color: "#3B82F6",
                }}
              >
                {" "}
                Scan for Devices
              </Text>
            </Button>
          </Card>

          {/* Available Devices */}
          <Text style={{ fontWeight: "600", marginTop: 24 }}>
            Available Devices
          </Text>
          <Card
            style={{
              padding: 16,
              marginTop: 8,
              borderRadius: 10,
              backgroundColor: "#FFFF",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 10,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon name="watch" size={24} color="gray" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ fontWeight: "600" }}>SmartWatch Elite</Text>
                  <Text style={{ color: "#6B7280", fontSize: 12 }}>
                    Strong signal
                  </Text>
                </View>
              </View>
              <Button
                style={{
                  backgroundColor: "#052658",
                  paddingHorizontal: 10,
                  paddingVertical: 1,
                  borderRadius: 15,
                }}
              >
                <Text style={{ color: "#FFF" }}>Connect</Text>
              </Button>
            </View>
            <Divider />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 10,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon name="watch" size={24} color="gray" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ fontWeight: "600" }}>SmartWatch Fit</Text>
                  <Text style={{ color: "#6B7280", fontSize: 12 }}>
                    Good signal
                  </Text>
                </View>
              </View>
              <Button
                style={{
                  backgroundColor: "#052658",
                  paddingHorizontal: 10,
                  paddingVertical: 1,
                  borderRadius: 15,
                }}
              >
                <Text style={{ color: "#FFF" }}>Connect</Text>
              </Button>
            </View>
            <Divider />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 10,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon name="watch" size={24} color="gray" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ fontWeight: "600" }}>SmartWatch Mini</Text>
                  <Text style={{ color: "#6B7280", fontSize: 12 }}>
                    Weak signal
                  </Text>
                </View>
              </View>
              <Button
                style={{
                  backgroundColor: "#052658",
                  paddingHorizontal: 10,
                  paddingVertical: 1,
                  borderRadius: 15,
                }}
              >
                <Text style={{ color: "#FFF" }}>Connect</Text>
              </Button>
            </View>
          </Card>

          {/* Help Section */}
          <Card
            style={{
              padding: 16,
              marginTop: 16,
              borderRadius: 10,
              marginBottom: 40,
              backgroundColor: "#FFFF",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon name="information-circle-outline" size={30} color="black" />
              <Text style={{ fontWeight: "600", fontSize: 16, marginLeft: 8 }}>
                Need Help?
              </Text>
            </View>
            <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 4 }}>
              View support options
            </Text>
          </Card>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: wp(20),
  },
});

export default DevicesScreen;
