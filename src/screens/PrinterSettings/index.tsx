// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   PermissionsAndroid,
//   Platform,
// } from 'react-native';
// import {BLEPrinter} from 'react-native-thermal-receipt-printer-image-qr';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import MainLayout from '../MainLayout';
// import Toast from 'react-native-toast-message';
// import SearchIcon from '../../assets/Icons/search.svg'; // Adjust path
// import PrinterIcon from '../../assets/Icons/printersvg.svg'; // Adjust path
// import swiggyColors from '../../assets/Color/swiggyColor';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const PrinterSettings = () => {
//   const [printers, setPrinters] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [connectedMac, setConnectedMac] = useState<string | null>(null);

//   const requestPermissions = async () => {
//     if (Platform.OS === 'android') {
//       await PermissionsAndroid.requestMultiple([
//         PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
//         PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
//         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//       ]);
//     }
//   };

//   const scanPrinters = async () => {
//     setLoading(true);
//     try {
//       await requestPermissions();
//       await BLEPrinter.init();
//       const results = await BLEPrinter.getDeviceList();
//       setPrinters(results);
//     } catch (err) {
//       Toast.show({type: 'error', text1: 'Discovery Failed'});
//     } finally {
//       setLoading(false);
//     }
//   };

//   const connectToPrinter = async (printer: any) => {
//     try {
//       setLoading(true);
//       // Initialize again just to be safe
//       await BLEPrinter.init();
//       await BLEPrinter.connectPrinter(printer.inner_mac_address);

//       await AsyncStorage.setItem(
//         'SAVED_PRINTER_MAC',
//         printer.inner_mac_address,
//       );
//       await AsyncStorage.setItem('SAVED_PRINTER_NAME', printer.device_name);

//       setConnectedMac(printer.inner_mac_address);

//       Toast.show({
//         type: 'success',
//         text1: 'Connected',
//         text2: `${printer.device_name} is ready.`,
//       });
//     } catch (err) {
//       console.error(err);
//       Toast.show({type: 'error', text1: 'Connection Failed'});
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <MainLayout title="Printer Settings" subtitle="Configure Bluetooth KOT">
//       <View style={styles.container}>
//         <TouchableOpacity
//           style={styles.scanBtn}
//           onPress={scanPrinters}
//           disabled={loading}>
//           <SearchIcon
//             width={18}
//             height={18}
//             stroke="#ffffff"
//             fill={'#ffffff'}
//             style={styles.searchIcon}
//           />
//           <Text style={styles.btnText}>
//             {loading ? 'Searching...' : 'Scan for Printers'}
//           </Text>
//         </TouchableOpacity>

//         <FlatList
//           data={printers}
//           keyExtractor={(item: any) => item.inner_mac_address}
//           renderItem={({item}: any) => (
//             <TouchableOpacity
//               style={[
//                 styles.deviceCard,
//                 connectedMac === item.inner_mac_address && styles.connected,
//               ]}
//               onPress={() => connectToPrinter(item)}>
//               <View>
//                 <Text style={styles.deviceName}>
//                   {item.device_name || 'Unknown Device'}
//                 </Text>
//                 <Text style={styles.macAddress}>{item.inner_mac_address}</Text>
//               </View>
//               {connectedMac === item.inner_mac_address && (
//                 <PrinterIcon
//                   width={26}
//                   height={26}
//                   fill={swiggyColors.veg}
//                   style={styles.searchIcon}
//                 />
//               )}
//             </TouchableOpacity>
//           )}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>
//               No printers found. Scan to begin.
//             </Text>
//           }
//         />
//       </View>
//     </MainLayout>
//   );
// };

// const styles = StyleSheet.create({
//   container: {flex: 1, padding: 20},
//   scanBtn: {
//     backgroundColor: '#1e293b',
//     padding: 15,
//     borderRadius: 10,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 20,
//     gap: 10,
//   },
//   searchIcon: {
//     marginRight: 10,
//     color: 'red',
//   },
//   btnText: {color: '#fff', fontWeight: 'bold'},
//   deviceCard: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 15,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     marginBottom: 10,
//     elevation: 2,
//   },
//   connected: {borderColor: '#059669', borderWidth: 1},
//   deviceName: {fontWeight: 'bold', fontSize: 16},
//   macAddress: {color: '#64748b', fontSize: 12},
//   emptyText: {textAlign: 'center', marginTop: 50, color: '#94a3b8'},
// });

// export default PrinterSettings;

// import React, {useState} from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   PermissionsAndroid,
//   Platform,
//   Alert,
// } from 'react-native';
// import {BLEPrinter} from 'react-native-thermal-receipt-printer-image-qr';
// import MainLayout from '../MainLayout';
// import Toast from 'react-native-toast-message';
// import SearchIcon from '../../assets/Icons/search.svg';
// import PrinterIcon from '../../assets/Icons/printersvg.svg';
// import swiggyColors from '../../assets/Color/swiggyColor';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // ✅ Known thermal printer name keywords — filters out phones, earbuds, etc.
// const PRINTER_KEYWORDS = [
//   'print',
//   'pos',
//   'kot',
//   'thermal',
//   'receipt',
//   'bill',
//   'rpp',
//   'mtp',
//   'xp-',
//   'rp-',
//   'pt-',
//   'zj-',
//   'gp-',
//   'btp',
//   'rongta',
//   'epson',
//   'star',
//   'sewoo',
//   'citizen',
//   'bixolon',
//   'datecs',
//   'goojprt',
//   'hoin',
//   'munbyn',
// ];

// const isPrinterDevice = (device: any): boolean => {
//   const name = (device.device_name || '').toLowerCase();
//   return PRINTER_KEYWORDS.some(keyword => name.includes(keyword));
// };

// const PrinterSettings = () => {
//   const [allDevices, setAllDevices] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [connectedMac, setConnectedMac] = useState<string | null>(null);
//   const [testPrinting, setTestPrinting] = useState(false);
//   const [showAll, setShowAll] = useState(false); // toggle to show non-printers

//   const printers = showAll ? allDevices : allDevices.filter(isPrinterDevice);

//   const requestPermissions = async () => {
//     if (Platform.OS === 'android') {
//       await PermissionsAndroid.requestMultiple([
//         PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
//         PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
//         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//       ]);
//     }
//   };

//   const scanPrinters = async () => {
//     setLoading(true);
//     setAllDevices([]);
//     setConnectedMac(null);
//     try {
//       await requestPermissions();
//       await BLEPrinter.init();
//       const results = await BLEPrinter.getDeviceList();
//       setAllDevices(results || []);

//       const printerCount = (results || []).filter(isPrinterDevice).length;
//       if (printerCount === 0) {
//         Toast.show({
//           type: 'info',
//           text1: 'No Printers Found',
//           text2: `${
//             results?.length || 0
//           } BT devices found. Enable "Show All" to see them.`,
//         });
//       }
//     } catch (err) {
//       Toast.show({type: 'error', text1: 'Discovery Failed'});
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Test print BEFORE saving — confirms it's actually a printer
//   const testPrint = async (mac: string): Promise<boolean> => {
//     try {
//       setTestPrinting(true);
//       await BLEPrinter.printText(
//         '<C>-- TEST PRINT --</C>\n<C>Printer OK</C>\n\n\n',
//       );
//       return true;
//     } catch (err) {
//       return false;
//     } finally {
//       setTestPrinting(false);
//     }
//   };

//   const connectToPrinter = async (printer: any) => {
//     try {
//       setLoading(true);
//       await BLEPrinter.init();
//       await BLEPrinter.connectPrinter(printer.inner_mac_address);

//       // ✅ Verify it's a real printer by doing a test print
//       const printOk = await testPrint(printer.inner_mac_address);

//       if (!printOk) {
//         Alert.alert(
//           'Not a Printer?',
//           `Connected to "${printer.device_name}" but test print failed. This might not be a thermal printer.\n\nSave anyway?`,
//           [
//             {text: 'Cancel', style: 'cancel'},
//             {
//               text: 'Save Anyway',
//               onPress: () => savePrinter(printer),
//             },
//           ],
//         );
//         return;
//       }

//       await savePrinter(printer);
//     } catch (err) {
//       console.error(err);
//       Toast.show({
//         type: 'error',
//         text1: 'Connection Failed',
//         text2: 'Make sure the printer is on and in range.',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const savePrinter = async (printer: any) => {
//     await AsyncStorage.setItem('SAVED_PRINTER_MAC', printer.inner_mac_address);
//     await AsyncStorage.setItem('SAVED_PRINTER_NAME', printer.device_name);
//     setConnectedMac(printer.inner_mac_address);
//     Toast.show({
//       type: 'success',
//       text1: 'Printer Saved ✓',
//       text2: `${printer.device_name} is ready.`,
//     });
//   };

//   return (
//     <MainLayout title="Printer Settings" subtitle="Configure Bluetooth KOT">
//       <View style={styles.container}>
//         {/* Scan Button */}
//         <TouchableOpacity
//           style={styles.scanBtn}
//           onPress={scanPrinters}
//           disabled={loading}>
//           <SearchIcon width={18} height={18} stroke="#ffffff" fill="#ffffff" />
//           <Text style={styles.btnText}>
//             {loading ? 'Searching...' : 'Scan for Printers'}
//           </Text>
//         </TouchableOpacity>

//         {/* Show All Toggle */}
//         {allDevices.length > 0 && (
//           <TouchableOpacity
//             style={styles.toggleRow}
//             onPress={() => setShowAll(p => !p)}>
//             <View style={[styles.toggleDot, showAll && styles.toggleDotOn]} />
//             <Text style={styles.toggleText}>
//               {showAll
//                 ? `Showing all ${allDevices.length} devices`
//                 : `Showing ${printers.length} printer(s) only`}
//             </Text>
//           </TouchableOpacity>
//         )}

//         <FlatList
//           data={printers}
//           keyExtractor={(item: any) => item.inner_mac_address}
//           renderItem={({item}: any) => {
//             const isKnownPrinter = isPrinterDevice(item);
//             return (
//               <TouchableOpacity
//                 style={[
//                   styles.deviceCard,
//                   connectedMac === item.inner_mac_address && styles.connected,
//                 ]}
//                 onPress={() => connectToPrinter(item)}
//                 disabled={loading || testPrinting}>
//                 <View style={{flex: 1}}>
//                   <View style={styles.nameRow}>
//                     <Text style={styles.deviceName}>
//                       {item.device_name || 'Unknown Device'}
//                     </Text>
//                     {/* ✅ Warn user if device doesn't look like a printer */}
//                     {!isKnownPrinter && (
//                       <View style={styles.warnBadge}>
//                         <Text style={styles.warnText}>Not a printer?</Text>
//                       </View>
//                     )}
//                   </View>
//                   <Text style={styles.macAddress}>
//                     {item.inner_mac_address}
//                   </Text>
//                 </View>
//                 {connectedMac === item.inner_mac_address && (
//                   <PrinterIcon width={26} height={26} fill={swiggyColors.veg} />
//                 )}
//               </TouchableOpacity>
//             );
//           }}
//           ListEmptyComponent={
//             <View style={styles.emptyContainer}>
//               <Text style={styles.emptyText}>
//                 {loading
//                   ? 'Scanning...'
//                   : 'No printers found.\nMake sure your printer is ON and paired in Bluetooth settings first.'}
//               </Text>
//             </View>
//           }
//         />
//       </View>
//     </MainLayout>
//   );
// };

// const styles = StyleSheet.create({
//   container: {flex: 1, padding: 20},
//   scanBtn: {
//     backgroundColor: '#1e293b',
//     padding: 15,
//     borderRadius: 10,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 12,
//     gap: 10,
//   },
//   btnText: {color: '#fff', fontWeight: 'bold'},
//   toggleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//     gap: 8,
//     paddingHorizontal: 4,
//   },
//   toggleDot: {
//     width: 28,
//     height: 16,
//     borderRadius: 8,
//     backgroundColor: '#cbd5e1',
//   },
//   toggleDotOn: {
//     backgroundColor: '#3b82f6',
//   },
//   toggleText: {fontSize: 12, color: '#64748b'},
//   deviceCard: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 15,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     marginBottom: 10,
//     elevation: 2,
//   },
//   connected: {borderColor: '#059669', borderWidth: 1.5},
//   nameRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     flexWrap: 'wrap',
//   },
//   deviceName: {fontWeight: 'bold', fontSize: 15},
//   macAddress: {color: '#64748b', fontSize: 12, marginTop: 2},
//   warnBadge: {
//     backgroundColor: '#fef3c7',
//     borderRadius: 4,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//   },
//   warnText: {fontSize: 10, color: '#92400e', fontWeight: '600'},
//   emptyContainer: {marginTop: 60, alignItems: 'center', paddingHorizontal: 20},
//   emptyText: {
//     textAlign: 'center',
//     color: '#94a3b8',
//     lineHeight: 22,
//     fontSize: 14,
//   },
// });

// export default PrinterSettings;

import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import {BLEPrinter} from 'react-native-thermal-receipt-printer-image-qr';
import MainLayout from '../MainLayout';
import Toast from 'react-native-toast-message';
import SearchIcon from '../../assets/Icons/search.svg';
import PrinterIcon from '../../assets/Icons/printersvg.svg';
import swiggyColors from '../../assets/Color/swiggyColor';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Known thermal printer name keywords — filters out phones, earbuds, etc.
const PRINTER_KEYWORDS = [
  'print',
  'pos',
  'kot',
  'thermal',
  'receipt',
  'bill',
  'rpp',
  'mtp',
  'xp-',
  'rp-',
  'pt-',
  'zj-',
  'gp-',
  'btp',
  'rongta',
  'epson',
  'star',
  'sewoo',
  'citizen',
  'bixolon',
  'datecs',
  'goojprt',
  'hoin',
  'munbyn',
];

const isPrinterDevice = (device: any): boolean => {
  const name = (device.device_name || '').toLowerCase();
  return PRINTER_KEYWORDS.some(keyword => name.includes(keyword));
};

const PrinterSettings = () => {
  const [allDevices, setAllDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectedMac, setConnectedMac] = useState<string | null>(null);
  const [testPrinting, setTestPrinting] = useState(false);
  const [showAll, setShowAll] = useState(false); // toggle to show non-printers

  const printers = showAll ? allDevices : allDevices.filter(isPrinterDevice);

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
    setAllDevices([]);
    setConnectedMac(null);
    try {
      await requestPermissions();
      await BLEPrinter.init();
      const results = await BLEPrinter.getDeviceList();
      setAllDevices(results || []);

      const printerCount = (results || []).filter(isPrinterDevice).length;
      if (printerCount === 0) {
        Toast.show({
          type: 'info',
          text1: 'No Printers Found',
          text2: `${
            results?.length || 0
          } BT devices found. Enable "Show All" to see them.`,
        });
      }
    } catch (err) {
      Toast.show({type: 'error', text1: 'Discovery Failed'});
    } finally {
      setLoading(false);
    }
  };

  // ✅ Test print BEFORE saving — confirms it's actually a printer
  const testPrint = async (mac: string): Promise<boolean> => {
    try {
      setTestPrinting(true);
      await BLEPrinter.printText(
        '<C>-- TEST PRINT --</C>\n<C>Printer OK</C>\n\n\n',
      );
      return true;
    } catch (err) {
      return false;
    } finally {
      setTestPrinting(false);
    }
  };

  const connectToPrinter = async (printer: any) => {
    try {
      setLoading(true);
      await BLEPrinter.init();
      await BLEPrinter.connectPrinter(printer.inner_mac_address);

      // ✅ Verify it's a real printer by doing a test print
      const printOk = await testPrint(printer.inner_mac_address);

      if (!printOk) {
        Alert.alert(
          'Not a Printer?',
          `Connected to "${printer.device_name}" but test print failed. This might not be a thermal printer.\n\nSave anyway?`,
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Save Anyway',
              onPress: () => savePrinter(printer),
            },
          ],
        );
        return;
      }

      await savePrinter(printer);
    } catch (err) {
      console.error(err);
      Toast.show({
        type: 'error',
        text1: 'Connection Failed',
        text2: 'Make sure the printer is on and in range.',
      });
    } finally {
      setLoading(false);
    }
  };

  const savePrinter = async (printer: any) => {
    await AsyncStorage.setItem('SAVED_PRINTER_MAC', printer.inner_mac_address);
    await AsyncStorage.setItem('SAVED_PRINTER_NAME', printer.device_name);
    setConnectedMac(printer.inner_mac_address);
    Toast.show({
      type: 'success',
      text1: 'Printer Saved ✓',
      text2: `${printer.device_name} is ready.`,
    });
  };

  const disconnectPrinter = async () => {
    Alert.alert(
      'Disconnect Printer',
      'Are you sure you want to disconnect and forget this printer?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await BLEPrinter.closeConn();
            } catch (_) {
              // ignore if already disconnected
            }
            await AsyncStorage.removeItem('SAVED_PRINTER_MAC');
            await AsyncStorage.removeItem('SAVED_PRINTER_NAME');
            setConnectedMac(null);
            Toast.show({
              type: 'info',
              text1: 'Printer Disconnected',
              text2: 'Scan to connect a new printer.',
            });
          },
        },
      ],
    );
  };

  return (
    <MainLayout title="Printer Settings" subtitle="Configure Bluetooth KOT">
      <View style={styles.container}>
        {/* Scan Button */}
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={scanPrinters}
          disabled={loading}>
          <SearchIcon width={18} height={18} stroke="#ffffff" fill="#ffffff" />
          <Text style={styles.btnText}>
            {loading ? 'Searching...' : 'Scan for Printers'}
          </Text>
        </TouchableOpacity>

        {/* Disconnect Button — only shown when a printer is connected */}

        <TouchableOpacity
          style={styles.disconnectBtn}
          onPress={disconnectPrinter}
          disabled={loading}>
          <Text style={styles.disconnectBtnText}>✕ Disconnect Printer</Text>
        </TouchableOpacity>

        {/* Show All Toggle */}
        {allDevices.length > 0 && (
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setShowAll(p => !p)}>
            <View style={[styles.toggleDot, showAll && styles.toggleDotOn]} />
            <Text style={styles.toggleText}>
              {showAll
                ? `Showing all ${allDevices.length} devices`
                : `Showing ${printers.length} printer(s) only`}
            </Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={printers}
          keyExtractor={(item: any) => item.inner_mac_address}
          renderItem={({item}: any) => {
            const isKnownPrinter = isPrinterDevice(item);
            return (
              <TouchableOpacity
                style={[
                  styles.deviceCard,
                  connectedMac === item.inner_mac_address && styles.connected,
                ]}
                onPress={() => connectToPrinter(item)}
                disabled={loading || testPrinting}>
                <View style={{flex: 1}}>
                  <View style={styles.nameRow}>
                    <Text style={styles.deviceName}>
                      {item.device_name || 'Unknown Device'}
                    </Text>
                    {/* ✅ Warn user if device doesn't look like a printer */}
                    {!isKnownPrinter && (
                      <View style={styles.warnBadge}>
                        <Text style={styles.warnText}>Not a printer?</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.macAddress}>
                    {item.inner_mac_address}
                  </Text>
                </View>
                {connectedMac === item.inner_mac_address && (
                  <PrinterIcon width={26} height={26} fill={swiggyColors.veg} />
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {loading
                  ? 'Scanning...'
                  : 'No printers found.\nMake sure your printer is ON and paired in Bluetooth settings first.'}
              </Text>
            </View>
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
    marginBottom: 12,
    gap: 10,
  },
  btnText: {color: '#fff', fontWeight: 'bold'},
  disconnectBtn: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ef4444',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  disconnectBtnText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
    paddingHorizontal: 4,
  },
  toggleDot: {
    width: 28,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#cbd5e1',
  },
  toggleDotOn: {
    backgroundColor: '#3b82f6',
  },
  toggleText: {fontSize: 12, color: '#64748b'},
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
  connected: {borderColor: '#059669', borderWidth: 1.5},
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  deviceName: {fontWeight: 'bold', fontSize: 15},
  macAddress: {color: '#64748b', fontSize: 12, marginTop: 2},
  warnBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  warnText: {fontSize: 10, color: '#92400e', fontWeight: '600'},
  emptyContainer: {marginTop: 60, alignItems: 'center', paddingHorizontal: 20},
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    lineHeight: 22,
    fontSize: 14,
  },
});

export default PrinterSettings;
