import React, {useEffect, useState, useMemo} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import MainLayout from '../MainLayout';

import {io} from 'socket.io-client';
import api from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {socket} from '../../services/socketService';
import RoomIcon from '../../assets/Icons/housesvg.svg';
import ChairIcon from '../../assets/Icons/chair.svg';
import TickIcon from '../../assets/Icons/tick-svgrepo-com.svg';

import swiggyColors from '../../assets/Color/swiggyColor';

// Use your actual IP, not localhost for physical devices

const KitchenDashboard = () => {
  const [rawItems, setRawItems] = useState([]);
  const [printingId, setPrintingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const fetchKitchenQueue = async () => {
    try {
      const res = await api.get('/orders/kitchen/pending');
      console.log('res.data', res.data);
      setRawItems(res.data);
    } catch (err) {
      console.error('Error fetching kitchen queue:', err);
    }
  };

  // --- LOGIC PRESERVED FROM NEXT.JS ---
  const groupedOrders = useMemo(() => {
    const groups: {[key: string]: any} = {};
    rawItems.forEach((item: any) => {
      const orderId = item.orderId;
      if (!groups[orderId]) {
        const parentOrder = item.order;
        groups[orderId] = {
          id: orderId,
          tableNumber:
            parentOrder?.table?.number ||
            (parentOrder?.roomId
              ? `Room ${parentOrder.roomId.slice(0, 4)}`
              : 'N/A'),
          createdAt: parentOrder?.createdAt,
          roomId: parentOrder?.roomId,
          items: [],
        };
      }
      groups[orderId].items.push(item);
    });

    return Object.values(groups).sort(
      (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [rawItems]);

  useEffect(() => {
    fetchKitchenQueue();
    socket.on('kitchenUpdate', () => {
      // Sound logic in RN requires expo-av or react-native-sound
      fetchKitchenQueue();
      Toast.show({
        type: 'success',
        text1: 'New KOT Received!',
        position: 'top',
      });
    });
    return () => {
      socket.off('kitchenUpdate');
    };
  }, []);

  const handleMarkItemReady = async (itemId: string) => {
    try {
      await api.patch(`/orders/item/${itemId}/status`, {status: 'READY'});
      Toast.show({
        type: 'success',
        text1: `Waiter is notified`,
        // text2: 'The kitchen has received your order.',
        position: 'top',
        topOffset: 50,
        // Pass custom data here
        props: {
          backgroundColor: swiggyColors.textPrimary,
        },
      });
      fetchKitchenQueue();
    } catch (err) {
      Toast.show({type: 'error', text1: 'Failed to update status'});
    }
  };

  const handlePrintKOT = async (order: any) => {
    try {
      setPrintingId(order.id);
      const itemsToPrint = order.items.filter(
        (item: any) => item.status === 'PENDING',
      );
      if (itemsToPrint.length === 0) return;

      await Promise.all(
        itemsToPrint.map((item: any) =>
          api.patch(`/orders/item/${item.id}/status`, {status: 'PREPARING'}),
        ),
      );

      console.log('Printing New KOT for:', itemsToPrint);

      Toast.show({
        type: 'success',
        text1: `KOT Printed for ${itemsToPrint.length} items.`,
        // text2: 'The kitchen has received your order.',
        position: 'top',
        topOffset: 50,
        // Pass custom data here
        props: {
          backgroundColor: swiggyColors.veg,
        },
      });
      fetchKitchenQueue();
    } catch (err) {
      Toast.show({type: 'error', text1: 'Failed to update kitchen status'});
    } finally {
      setPrintingId(null);
    }
  };

  const handleMarkEntireOrderReady = async (order: any) => {
    try {
      const updatePromises = order.items
        .filter(
          (item: any) => item.status !== 'READY' && item.status !== 'SERVED',
        )
        .map((item: any) =>
          api.patch(`/orders/item/${item.id}/status`, {status: 'READY'}),
        );

      if (updatePromises.length === 0) return;
      await Promise.all(updatePromises);
      // Toast.show({
      //   type: 'success',
      //   text1: `Table ${order.tableNumber} Ready!`,
      //   position: 'top',
      // });
      fetchKitchenQueue();
    } catch (err) {
      Toast.show({type: 'error', text1: 'Failed to mark ready'});
    }
  };

  // Render Component for Ticket Card
  const renderOrderTicket = ({item: order}: {item: any}) => {
    const hasPendingItems = order.items.some(
      (i: any) => i.status === 'PENDING',
    );
    const orderTime = order.createdAt
      ? new Date(order.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '--:--';

    return (
      <View
        style={[
          styles.card,
          hasPendingItems ? styles.borderPending : styles.borderCooking,
        ]}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.iconBox,
                hasPendingItems ? styles.bgPending : styles.bgCooking,
              ]}>
              <View>
                {order.roomId ? (
                  <RoomIcon height={14} width={14} fill={'#fff'} />
                ) : (
                  <ChairIcon height={14} width={14} />
                )}
              </View>
            </View>
            <View>
              <Text style={styles.tableNum}>{order.tableNumber}</Text>
              <Text style={styles.orderTime}>{orderTime}</Text>
            </View>
          </View>
          <View
            style={[
              styles.badge,
              hasPendingItems ? styles.badgeWait : styles.badgeCook,
            ]}>
            <Text
              style={[
                styles.badgeText,
                hasPendingItems ? styles.badgeWaitText : styles.badgeCookText,
              ]}>
              {hasPendingItems ? 'WAITING' : 'COOKING'}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.itemsScrollView}
          nestedScrollEnabled={true} // Important for Android inside a FlatList
          showsVerticalScrollIndicator={true}>
          <View style={styles.itemsList}>
            {order.items.map((item: any) => (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  item.status === 'PENDING'
                    ? styles.itemPending
                    : styles.itemActive,
                ]}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemQty}>{item.quantity}×</Text>
                  <View>
                    <Text style={styles.itemName}>
                      {item.menuItem?.name}{' '}
                      {item.order?.isSpicy && <Text>🌶️</Text>}
                    </Text>

                    {item.order?.note && (
                      <Text style={styles.itemNote}>"{item.order.note}"</Text>
                    )}
                    <Text style={styles.itemStatus}>{item.status}</Text>
                  </View>
                </View>
                {item.status === 'PREPARING' && (
                  <TouchableOpacity
                    style={styles.TickBtn}
                    onPress={() => handleMarkItemReady(item.id)}>
                    <TickIcon height={20} width={20} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
        <TouchableOpacity
          style={[
            styles.footerBtn,
            hasPendingItems ? styles.btnPrint : styles.btnReady,
          ]}
          onPress={() =>
            hasPendingItems
              ? handlePrintKOT(order)
              : handleMarkEntireOrderReady(order)
          }>
          <Text style={styles.footerBtnText}>
            {hasPendingItems ? 'PRINT KOT' : 'MARK READY'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchKitchenQueue();
    setRefreshing(false);
  };

  return (
    <MainLayout
      title="Kitchen Queue"
      subtitle={`${groupedOrders.length} Active Tickets`}>
      <FlatList
        data={groupedOrders}
        renderItem={renderOrderTicket}
        numColumns={2} // <--- Add this
        key={'_'}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.listPadding}
        columnWrapperStyle={styles.columnWrapper}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cafe-outline" size={60} color="#cbd5e1" />
            <Text style={styles.emptyText}>Kitchen Clear</Text>
          </View>
        }
      />
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  listPadding: {padding: 8},
  columnWrapper: {
    justifyContent: 'space-between', // Spreads the 2 cards to the edges
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12, // Slightly smaller radius looks better in grids
    marginBottom: 16,
    padding: 12,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    // maxHeight: 70,

    // Grid Math: (100% / 2 columns) - (margin/gap)
    width: '48%',
  },
  borderPending: {borderLeftColor: '#f59e0b'},
  borderCooking: {borderLeftColor: '#3b82f6'},
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {flexDirection: 'row', alignItems: 'center', gap: 10},
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgPending: {backgroundColor: '#f59e0b'},
  bgCooking: {backgroundColor: '#059669'},
  tableNum: {
    fontSize: 12, // Smaller for 2-column
    fontWeight: '900',
    color: '#1e293b',
  },
  orderTime: {fontSize: 11, color: '#64748b'},
  badge: {paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6},
  badgeWait: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  badgeWaitText: {
    color: '#111',
  },
  badgeCookText: {
    color: '#fff',
  },

  badgeCook: {backgroundColor: '#059669'},
  badgeText: {fontSize: 8, fontWeight: 'bold', color: '#f3f3f3'},
  itemsScrollView: {
    // This is the magic part:
    maxHeight: 210, // Limits the list height
    marginVertical: 8,
  },
  itemsList: {marginVertical: 10},
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    marginBottom: 6,
  },
  itemPending: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  itemActive: {backgroundColor: '#f8fafc'},
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2, // Reduced gap
    flex: 1,
  },
  itemQty: {fontSize: 12, fontWeight: '900', color: '#94a3b8'},
  itemName: {
    fontSize: 10, // Smaller font
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    flexShrink: 1, // Prevent text overflow
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  itemNote: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#d97706', // Amber/Orange color to stand out
    fontWeight: '600',
    marginTop: 2,
    backgroundColor: '#fffbeb', // Light yellow background for the note
    paddingHorizontal: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  // Update itemName to ensure it doesn't push the flame icon out
  // itemName: {
  //   fontSize: 12,
  //   fontWeight: 'bold',
  //   color: '#0f172a',
  //   textTransform: 'uppercase',
  // },
  itemStatus: {fontSize: 9, color: '#64748b'},
  footerBtn: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  TickBtn: {
    backgroundColor: '#fff',
    padding: 2,
    borderRadius: 50,
  },
  btnPrint: {backgroundColor: '#1e293b'},
  btnReady: {backgroundColor: '#059669'},
  footerBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  emptyContainer: {alignItems: 'center', marginTop: 100},
  emptyText: {marginTop: 12, fontSize: 18, color: '#94a3b8', fontWeight: '600'},
});

export default KitchenDashboard;
