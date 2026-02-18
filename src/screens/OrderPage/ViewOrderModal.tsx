import React, {useState, useEffect} from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  View,
} from 'react-native';
import {Div} from '../../components/common/UI';
import {orderService} from '../../services/orderService';
import CloseBtn from '../../assets/Icons/closeIcon.svg';
import swiggyColors from '../../assets/Color/swiggyColor';
import color from '../../assets/Color/color';
import {socket} from '../../services/socketService';
import Toast from 'react-native-toast-message';
interface ViewOrderModalProps {
  visible: boolean;
  onClose: () => void;
  table: {
    id: string;
    name: string;
  };
}
const ViewOrderModal = ({visible, onClose, table}: ViewOrderModalProps) => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getActiveOrders(table.id);
      console.log('data', data);
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) fetchActiveOrder();
  }, [visible]);
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handleUpdate = (data: any) => {
      // Only refresh if the update belongs to THIS table
      // The backend now sends the whole table object or tableId
      if (data.id === table.id || data.tableId === table.id) {
        console.log('Refreshing order for table:', table.id);
        fetchActiveOrder();
      }
    };

    socket.on('newOrder', handleUpdate);
    socket.on('itemStatusUpdated', handleUpdate);

    socket.on('itemStatusUpdated', data => {
      console.log('data>>>>>', data);
      // Check if the item belongs to this table's order
      if (data.tableId === table.id || data.orderId === order?.id) {
        // fetchActiveOrder();
        if (data.status === 'READY') {
          Toast.show({
            type: 'success',
            text1: '🍳 Kitchen Update',
            text2: `Food is ready for ${table.name}`,
            position: 'top',
            topOffset: 50,
            props: {
              backgroundColor: swiggyColors.veg,
            },
          });
        }
      }
    });

    return () => {
      socket.off('tableUpdated', handleUpdate);
      socket.off('newOrder', handleUpdate);
      socket.off('itemStatusUpdated');
    };
  }, [table.id, order?.id]); // Re-bind when IDs change

  const handleServeItem = async (itemId: string) => {
    try {
      await orderService.serveItem(itemId);
      // Success feedback
      // fetchActiveOrder(); // Refresh modal list
    } catch (err) {
      console.log('err', err);
    }
  };
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'READY':
        return {
          bg: '#ECFDF5',
          text: '#059669',
          label: 'READY',
          icon: 'check-circle',
        };
      case 'PREPARING':
        return {
          bg: '#FFFBEB',
          text: '#D97706',
          label: 'PREPARING',
          icon: 'clock',
        };
      case 'SERVED':
        return {
          bg: '#F8FAFC',
          text: '#94A3B8',
          label: 'SERVED',
          icon: 'user-check',
        };
      default:
        return {
          bg: '#EFF6FF',
          text: '#2563EB',
          label: 'PENDING',
          icon: 'loader',
        };
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <Div style={styles.overlay}>
        {/* Background Blur Effect Tap to Close */}
        <TouchableOpacity
          activeOpacity={1}
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <Div style={styles.modalContainer}>
          {/* Decorative Drag Handle */}
          <View style={styles.dragHandle} />

          <Div style={styles.header}>
            <Div>
              <Text style={styles.subtitle}>{table.name}</Text>
              <Text style={styles.title}>Order Summary</Text>
            </Div>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <CloseBtn width={20} height={20} color="#64748B" />
            </TouchableOpacity>
          </Div>

          {loading ? (
            <Div style={styles.loaderContainer}>
              <ActivityIndicator size="small" color="#FC8019" />
              <Text style={styles.loadingText}>Fetching updates...</Text>
            </Div>
          ) : !order ? (
            <Div style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyText}>
                No active orders for this table
              </Text>
            </Div>
          ) : (
            <ScrollView
              style={styles.scrollArea}
              showsVerticalScrollIndicator={false}>
              {order.items?.map((item: any) => {
                const config = getStatusConfig(item.status);
                const isReady = item.status === 'READY';

                return (
                  <Div key={item.id} style={styles.orderItem}>
                    <Div style={styles.itemMain}>
                      <Div style={styles.qtyBadge}>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                      </Div>
                      <Div flex={1}>
                        <Text style={styles.itemName}>
                          {item.menuItem.name}
                        </Text>
                        <Div
                          style={StyleSheet.flatten([
                            styles.statusPill,
                            {backgroundColor: config.bg},
                          ])}>
                          <View
                            style={[styles.dot, {backgroundColor: config.text}]}
                          />
                          <Text
                            style={[styles.statusLabel, {color: config.text}]}>
                            {config.label}
                          </Text>
                        </Div>
                      </Div>
                    </Div>

                    {isReady && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.serveBtn}
                        onPress={() => handleServeItem(item.id)}>
                        <Text style={styles.serveBtnText}>Serve</Text>
                      </TouchableOpacity>
                    )}
                  </Div>
                );
              })}
            </ScrollView>
          )}

          {/* {order && (
            <Div style={styles.footer}>
              <Div>
                <Text style={styles.footerLabel}>Grand Total</Text>
                <Text style={styles.footerSub}>Inclusive of taxes</Text>
              </Div>
              <Text style={styles.totalAmount}>₹{order.totalAmount || 0}</Text>
            </Div>
          )} */}
        </Div>
      </Div>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)', // Darker, more premium backdrop
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: color.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '85%',
    bottom: 0,
    // paddingBottom: 10,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: -10},
    // shadowOpacity: 0.1,
    // shadowRadius: 20,
    // elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: {fontSize: 24, fontWeight: '800', color: '#1E293B'},
  subtitle: {
    fontSize: 14,
    fontWeight: '800',
    // color: '#fff',
    letterSpacing: 1,
    color: swiggyColors.primary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {paddingHorizontal: 24},
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemMain: {flexDirection: 'row', alignItems: 'center', flex: 1},
  qtyBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  qtyText: {fontSize: 14, fontWeight: '800', color: '#1E293B'},
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
  },
  dot: {width: 6, height: 6, borderRadius: 3, marginRight: 6},
  statusLabel: {fontSize: 10, fontWeight: '800'},
  serveBtn: {
    backgroundColor: color.dark, // Dark button looks more "Pro"
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  serveBtnText: {color: '#FFF', fontWeight: '700', fontSize: 12},
  footer: {
    marginTop: 10,
    marginHorizontal: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: swiggyColors.veg,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // shadowColor: color.dark,
    // shadowOffset: {width: 0, height: 4},
    // shadowOpacity: 0.3,
    // shadowRadius: 1,
    // elevation: 4,
  },
  footerLabel: {color: '#FFF', fontSize: 14, fontWeight: '700'},
  footerSub: {color: '#f3f3f3', fontSize: 10, marginTop: 2},
  totalAmount: {fontSize: 28, fontWeight: '900', color: '#FFF'},
  loaderContainer: {padding: 60, alignItems: 'center'},
  loadingText: {marginTop: 10, color: '#64748B', fontSize: 12},
  emptyContainer: {padding: 60, alignItems: 'center'},
  emptyEmoji: {fontSize: 40, marginBottom: 10},
  emptyText: {color: '#94A3B8', fontWeight: '600'},
});

export default ViewOrderModal;
