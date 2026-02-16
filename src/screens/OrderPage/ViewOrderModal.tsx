import React, {useState, useEffect} from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Text, Div} from '../../components/common/UI';
import {orderService} from '../../services/orderService';

interface ViewOrderModalProps {
  visible: boolean;
  onClose: () => void;
  table: any;
}

const ViewOrderModal = ({visible, onClose, table}: ViewOrderModalProps) => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getActiveOrders(table.id);
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

  const handleServeItem = async (itemId: string) => {
    try {
      await orderService.serveItem(itemId);
      // Success feedback
      fetchActiveOrder(); // Refresh modal list
    } catch (err) {
      console.log('err', err);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'READY':
        return {bg: '#E8F5E9', text: '#27ae60', label: 'READY TO SERVE'};
      case 'PREPARING':
        return {bg: '#FFF9C4', text: '#F39C12', label: 'KITCHEN PREPARING'};
      case 'SERVED':
        return {bg: '#F5F5F5', text: '#95A5A6', label: 'SERVED'};
      default:
        return {bg: '#E3F2FD', text: '#3498DB', label: 'PENDING'};
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Div style={styles.overlay}>
        <Div style={styles.modalContainer}>
          {/* Header */}
          <Div style={styles.header}>
            <Div>
              <Text style={styles.title}>Table {table.name}</Text>
              <Text style={styles.subtitle}>Current Live Order</Text>
            </Div>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </Div>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#fa2c37"
              style={{margin: 50}}
            />
          ) : !order ? (
            <Div p={40} alc>
              <Text style={{color: '#999'}}>No active orders found.</Text>
            </Div>
          ) : (
            <ScrollView p={15}>
              {order.items?.map((item: any) => {
                const status = getStatusStyle(item.status);
                return (
                  <Div key={item.id} style={styles.orderItem}>
                    <Div flex={1}>
                      <Text style={styles.itemName}>
                        {item.quantity}x {item.menuItem.name}
                      </Text>
                      <Div bg={status.bg} style={styles.statusBadge}>
                        <Text style={[styles.statusText, {color: status.text}]}>
                          {status.label}
                        </Text>
                      </Div>
                    </Div>

                    {item.status === 'READY' && (
                      <TouchableOpacity
                        style={styles.serveBtn}
                        onPress={() => handleServeItem(item.id)}>
                        <Text style={styles.serveBtnText}>SERVE</Text>
                      </TouchableOpacity>
                    )}

                    {item.status === 'SERVED' && (
                      <Text style={styles.checkMark}>✓</Text>
                    )}
                  </Div>
                );
              })}
            </ScrollView>
          )}

          {/* Total Footer */}
          {order && (
            <Div style={styles.footer}>
              <Text style={styles.totalLabel}>Running Total</Text>
              <Text style={styles.totalAmount}>₹{order.totalAmount || 0}</Text>
            </Div>
          )}
        </Div>
      </Div>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {fontSize: 22, fontWeight: '900', color: '#1A1A1A'},
  subtitle: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  closeBtn: {
    backgroundColor: '#F5F5F5',
    width: 30,
    height: 30,
    borderRadius: 15,
    center: true,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {fontWeight: 'bold', color: '#666'},

  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  itemName: {fontSize: 16, fontWeight: '700', color: '#333'},
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: {fontSize: 10, fontWeight: 'bold'},

  serveBtn: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  serveBtnText: {color: '#FFF', fontWeight: 'bold', fontSize: 12},
  checkMark: {fontSize: 20, color: '#95A5A6', marginRight: 10},

  footer: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {fontSize: 14, color: '#666', fontWeight: 'bold'},
  totalAmount: {fontSize: 24, fontWeight: '900', color: '#fa2c37'},
});

export default ViewOrderModal;
