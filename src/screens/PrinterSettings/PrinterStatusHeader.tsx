// import React, {useEffect, useState} from 'react';
// import {StyleSheet, Text, View} from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import {BLEPrinter} from 'react-native-thermal-receipt-printer-image-qr';

// const PrinterStatusHeader = () => {
//   const [isConnected, setIsConnected] = useState(false);
//   const [printerName, setPrinterName] = useState('No Printer');

//   const verifyAndReconnect = async () => {
//     try {
//       await BLEPrinter.init();
//       const savedMac = await AsyncStorage.getItem('SAVED_PRINTER_MAC');
//       const savedName = await AsyncStorage.getItem('SAVED_PRINTER_NAME');

//       if (!savedMac) {
//         setIsConnected(false);
//         return;
//       }

//       await BLEPrinter.connectPrinter(savedMac);
//       setIsConnected(true);
//       setPrinterName(savedName || 'Printer');
//     } catch (e) {
//       console.log('Adapter not ready yet:', e);
//       setIsConnected(false);
//     }
//   };

//   useEffect(() => {
//     verifyAndReconnect();
//     const interval = setInterval(verifyAndReconnect, 15000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <View style={styles.statusBadge}>
//       <View
//         style={[
//           styles.dot,
//           {backgroundColor: isConnected ? '#22c55e' : '#ef4444'},
//         ]}
//       />
//       <Text numberOfLines={1} style={styles.statusText}>
//         {isConnected ? printerName : 'Offline'}
//       </Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   statusBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f1f5f9', // Light slate background
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     maxWidth: 150, // Prevents long names from pushing out header icons
//   },
//   dot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     marginRight: 6,
//     // Add a slight glow effect
//     shadowOffset: {width: 0, height: 0},
//     shadowOpacity: 0.5,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   statusText: {
//     fontSize: 11,
//     fontWeight: '600',
//     color: '#475569',
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
// });

// export default PrinterStatusHeader;

import React, {useEffect, useState, useRef} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BLEPrinter} from 'react-native-thermal-receipt-printer-image-qr';

// ✅ Tracks real connection state across the app
// (avoids re-connecting every 15s which was causing crashes)
let _isConnecting = false;

const PrinterStatusHeader = () => {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'offline'>(
    'offline',
  );
  const [printerName, setPrinterName] = useState('No Printer');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const verifyAndReconnect = async () => {
    // ✅ Prevent parallel reconnect calls
    if (_isConnecting) return;
    _isConnecting = true;
    setStatus('connecting');

    try {
      const savedMac = await AsyncStorage.getItem('SAVED_PRINTER_MAC');
      const savedName = await AsyncStorage.getItem('SAVED_PRINTER_NAME');

      if (!savedMac) {
        setStatus('offline');
        setPrinterName('No Printer');
        _isConnecting = false;
        return;
      }

      // ✅ Init before every connect attempt
      await BLEPrinter.init();
      await BLEPrinter.connectPrinter(savedMac);

      setStatus('connected');
      setPrinterName(savedName || 'Printer');
    } catch (e: any) {
      const msg = e?.message || '';

      // ✅ If already connected, treat as success — don't flip to offline
      if (
        msg.includes('already connected') ||
        msg.includes('Already connected')
      ) {
        setStatus('connected');
      } else {
        setStatus('offline');
      }
    } finally {
      _isConnecting = false;
    }
  };

  useEffect(() => {
    verifyAndReconnect();

    // ✅ Check every 30s (was 15s — too aggressive, caused crashes)
    intervalRef.current = setInterval(verifyAndReconnect, 30_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const dotColor =
    status === 'connected'
      ? '#22c55e'
      : status === 'connecting'
      ? '#f59e0b'
      : '#ef4444';

  const label =
    status === 'connected'
      ? printerName
      : status === 'connecting'
      ? 'Connecting...'
      : 'Offline';

  return (
    <View style={styles.statusBadge}>
      <View style={[styles.dot, {backgroundColor: dotColor}]} />
      <Text numberOfLines={1} style={styles.statusText}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxWidth: 150,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
    elevation: 2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default PrinterStatusHeader;
