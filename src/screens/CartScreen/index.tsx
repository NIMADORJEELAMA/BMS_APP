import React, {useState} from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Text, Div} from '../../components/common/UI';
import MainLayout from '../../screens/MainLayout';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {updateCartQuantity, clearCart} from '../../redux/slices/cartSlice';
import {orderService} from '../../services/orderService';

const CartScreen = ({route, navigation}: any) => {
  console.log('route', route);
  const {tableId, tableName} = route.params;
  console.log('tableId', tableId); // Pass these when navigating to Cart
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [isOrdering, setIsOrdering] = useState(false);
  const [tableIdCart, setTableIdCart] = useState(tableId);

  const itemList = Object.values(cartItems);
  const totalAmount = itemList.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handlePlaceOrder = async () => {
    if (itemList.length === 0) return;

    setIsOrdering(true);
    try {
      // Mapping Redux state to API Format
      const payload = {
        tableId: tableIdCart,
        items: itemList.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
        })),
      };
      console.log('payload', payload);

      await orderService.createOrder(payload);

      Alert.alert('Success', 'Order sent to kitchen!');
      dispatch(clearCart());
      //   navigation.navigate('Tables'); // Or wherever you want to go after success
    } catch (err) {
      Alert.alert('Error', 'Could not place order. Try again.');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <MainLayout title="Review Order" subtitle={`Table ${tableName}`} showBack>
      <Div flex={1} p={15}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {itemList.map(item => (
            <Div key={item.id} style={styles.cartCard}>
              <Div flex={1}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price} each</Text>
              </Div>

              <Div style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() =>
                    dispatch(updateCartQuantity({item, delta: -1}))
                  }>
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() =>
                    dispatch(updateCartQuantity({item, delta: 1}))
                  }>
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </Div>

              <Text style={styles.subtotal}>₹{item.price * item.quantity}</Text>
            </Div>
          ))}

          {itemList.length === 0 && (
            <Text style={{textAlign: 'center', marginTop: 50, color: '#888'}}>
              No items added to cart yet.
            </Text>
          )}
        </ScrollView>

        {/* Total Summary & Confirm Button */}
        {itemList.length > 0 && (
          <Div style={styles.footer}>
            <Div style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalValue}>₹{totalAmount}</Text>
            </Div>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                isOrdering && {backgroundColor: '#ccc'},
              ]}
              onPress={handlePlaceOrder}
              disabled={isOrdering}>
              {isOrdering ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.confirmText}>
                  CONFIRM & SEND TO KITCHEN
                </Text>
              )}
            </TouchableOpacity>
          </Div>
        )}
      </Div>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  cartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  itemName: {fontSize: 16, fontWeight: '700', color: '#333'},
  itemPrice: {fontSize: 12, color: '#999'},
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    marginHorizontal: 10,
  },
  qtyBtn: {padding: 8, paddingHorizontal: 12},
  qtyBtnText: {fontSize: 18, fontWeight: 'bold', color: '#fa2c37'},
  qtyText: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  },
  subtotal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#333',
    width: 60,
    textAlign: 'right',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 15,
    backgroundColor: 'transparent',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  totalLabel: {fontSize: 16, color: '#666'},
  totalValue: {fontSize: 22, fontWeight: '900', color: '#fa2c37'},
  confirmBtn: {
    backgroundColor: '#fa2c37',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmText: {color: '#FFF', fontWeight: 'bold', fontSize: 14},
});

export default CartScreen;
