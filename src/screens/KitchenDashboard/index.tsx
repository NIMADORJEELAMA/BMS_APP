import React, {useEffect, useState, useMemo} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import MainLayout from '../MainLayout';
import {Text, Div} from '../../components/common/UI';
import {io} from 'socket.io-client';
import api from '../../services/axiosInstance';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {socket} from '../../services/socketService';
// Use your actual IP, not localhost for physical devices

const KitchenDashboard = () => {
  const [rawItems, setRawItems] = useState([]);
  const [printingId, setPrintingId] = useState<string | null>(null);

  const fetchKitchenQueue = async () => {
    try {
      const res = await api.get('/orders/kitchen/pending');
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
      Toast.show({
        type: 'success',
        text1: `Table ${order.tableNumber} Ready!`,
        position: 'top',
      });
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
              <Ionicons
                name={order.roomId ? 'business' : 'restaurant'}
                size={18}
                color="white"
              />
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
            <Text style={styles.badgeText}>
              {hasPendingItems ? 'WAITING' : 'COOKING'}
            </Text>
          </View>
        </View>

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
                  <Text style={styles.itemName}>{item.menuItem?.name}</Text>
                  <Text style={styles.itemStatus}>{item.status}</Text>
                </View>
              </View>
              {item.status === 'PREPARING' && (
                <TouchableOpacity onPress={() => handleMarkItemReady(item.id)}>
                  <Ionicons name="checkmark-circle" size={26} color="#10b981" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

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
          <Ionicons
            name={hasPendingItems ? 'print' : 'checkmark-done'}
            size={16}
            color="white"
          />
          <Text style={styles.footerBtnText}>
            {hasPendingItems ? 'PRINT KOT' : 'MARK READY'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <MainLayout
      title="Kitchen Queue"
      subtitle={`${groupedOrders.length} Active Tickets`}>
      <FlatList
        data={groupedOrders}
        renderItem={renderOrderTicket}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.listPadding}
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
  listPadding: {padding: 16},
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    borderLeftWidth: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
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
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgPending: {backgroundColor: '#f59e0b'},
  bgCooking: {backgroundColor: '#1e293b'},
  tableNum: {fontSize: 16, fontWeight: '900', color: '#1e293b'},
  orderTime: {fontSize: 11, color: '#64748b'},
  badge: {paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6},
  badgeWait: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  badgeCook: {backgroundColor: '#1e293b'},
  badgeText: {fontSize: 10, fontWeight: 'bold', color: '#92400e'},
  itemsList: {marginVertical: 10},
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  itemPending: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  itemActive: {backgroundColor: '#f8fafc'},
  itemInfo: {flexDirection: 'row', alignItems: 'center', gap: 12},
  itemQty: {fontSize: 18, fontWeight: '900', color: '#94a3b8'},
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  itemStatus: {fontSize: 10, color: '#64748b'},
  footerBtn: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
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
