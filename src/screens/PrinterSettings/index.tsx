import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {BLEPrinter} from 'react-native-thermal-receipt-printer-image-qr';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MainLayout from '../MainLayout';
import Toast from 'react-native-toast-message';

const PrinterSettings = () => {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connectedMac, setConnectedMac] = useState<string | null>(null);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
    }
  };

  const scanPrinters = async () => {
    setLoading(true);
    try {
      await requestPermissions();
      await BLEPrinter.init();
      const results = await BLEPrinter.getDeviceList();
      setPrinters(results);
    } catch (err) {
      Toast.show({type: 'error', text1: 'Discovery Failed'});
    } finally {
      setLoading(false);
    }
  };

  const connectToPrinter = async (printer: any) => {
    try {
      setLoading(true);
      await BLEPrinter.connectPrinter(printer.inner_mac_address);
      setConnectedMac(printer.inner_mac_address);
      Toast.show({
        type: 'success',
        text1: `Connected to ${printer.device_name}`,
      });
    } catch (err) {
      Toast.show({type: 'error', text1: 'Connection Failed'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Printer Settings" subtitle="Configure Bluetooth KOT">
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={scanPrinters}
          disabled={loading}>
          <Ionicons name="search" size={20} color="#fff" />
          <Text style={styles.btnText}>
            {loading ? 'Searching...' : 'Scan for Printers'}
          </Text>
        </TouchableOpacity>

        <FlatList
          data={printers}
          keyExtractor={(item: any) => item.inner_mac_address}
          renderItem={({item}: any) => (
            <TouchableOpacity
              style={[
                styles.deviceCard,
                connectedMac === item.inner_mac_address && styles.connected,
              ]}
              onPress={() => connectToPrinter(item)}>
              <View>
                <Text style={styles.deviceName}>
                  {item.device_name || 'Unknown Device'}
                </Text>
                <Text style={styles.macAddress}>{item.inner_mac_address}</Text>
              </View>
              {connectedMac === item.inner_mac_address && (
                <Ionicons name="checkmark-circle" size={24} color="#059669" />
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No printers found. Scan to begin.
            </Text>
          }
        />
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20},
  scanBtn: {
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  btnText: {color: '#fff', fontWeight: 'bold'},
  deviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  connected: {borderColor: '#059669', borderWidth: 1},
  deviceName: {fontWeight: 'bold', fontSize: 16},
  macAddress: {color: '#64748b', fontSize: 12},
  emptyText: {textAlign: 'center', marginTop: 50, color: '#94a3b8'},
});

export default PrinterSettings;
