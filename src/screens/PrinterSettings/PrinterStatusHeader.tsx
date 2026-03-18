import AsyncStorage from '@react-native-async-storage/async-storage';
import {useState} from 'react';
import {Text, View} from 'react-native';

const PrinterStatusHeader = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [printerName, setPrinterName] = useState('No Printer');

  const verifyAndReconnect = async () => {
    try {
      const savedMac = await AsyncStorage.getItem('SAVED_PRINTER_MAC');
      const savedName = await AsyncStorage.getItem('SAVED_PRINTER_NAME');

      if (!savedMac) {
        setIsConnected(false);
        setPrinterName('Not Configured');
        return;
      }

      setPrinterName(savedName || 'Thermal Printer');

      // The library's 'getDeviceList' often only shows paired devices,
      // not necessarily the 'active' connection status.
      // A common trick is to check if a "dummy" command works or
      // simply attempt a light-weight connect.

      await BLEPrinter.connectPrinter(savedMac);
      setIsConnected(true);
    } catch (e) {
      console.log('Printer ping failed:', e);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    // Initial check
    verifyAndReconnect();

    // Check every 10 seconds to keep the connection alive
    const interval = setInterval(verifyAndReconnect, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.dot,
          {backgroundColor: isConnected ? '#22c55e' : '#ef4444'},
        ]}
      />
      <Text
        style={[
          styles.statusText,
          {color: isConnected ? '#1e293b' : '#94a3b8'},
        ]}>
        {isConnected ? printerName : 'Printer Offline'}
      </Text>
    </View>
  );
};
