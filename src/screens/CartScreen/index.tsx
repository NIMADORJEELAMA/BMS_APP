import React, {useState} from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  View,
} from 'react-native';
import {Text} from '../../components/common/UI';
import MainLayout from '../../screens/MainLayout';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {updateCartQuantity, clearCart} from '../../redux/slices/cartSlice';
import {orderService} from '../../services/orderService';
import swiggyColors from '../../assets/Color/swiggyColor';

const CartScreen = ({route, navigation}: any) => {
  const {table} = route.params;
  const tableId = table?.id;
  const tableName = table?.name || table?.number;
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [isOrdering, setIsOrdering] = useState(false);

  const itemList = Object.values(cartItems);
  const totalAmount = itemList.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handlePlaceOrder = async () => {
    if (itemList.length === 0) return;
    setIsOrdering(true);
    try {
      const payload = {
        tableId: tableId,
        items: itemList.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
        })),
      };
      console.log('payload', payload);
      await orderService.createOrder(payload);
      Alert.alert('Success', 'Order sent to kitchen!');
      dispatch(clearCart());
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Could not place order. Try again.');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <MainLayout title="Review Order" subtitle={`${tableName}`} showBack>
      <View style={{flex: 1, backgroundColor: swiggyColors.surface}}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 120}}>
          {/* Order Items Section */}
          <View style={styles.sectionCard}>
            {itemList.map(
              (item, index) => (
                console.log('item>>>', item),
                (
                  <View
                    key={item.id}
                    style={[
                      styles.cartItem,
                      index === itemList.length - 1 && {borderBottomWidth: 0},
                    ]}>
                    <View style={styles.itemMain}>
                      {/* Standard Veg/Non-Veg Marker */}
                      <View
                        style={[
                          styles.marker,
                          // {
                          //   borderColor: item?.isVeg
                          //     ? swiggyColors.veg
                          //     : swiggyColors.nonVeg,
                          // },
                        ]}>
                        <View
                        // style={[
                        //   styles.dot,
                        //   {
                        //     backgroundColor: item?.isVeg
                        //       ? swiggyColors.veg
                        //       : swiggyColors.nonVeg,
                        //   },
                        // ]}
                        />
                        <Text style={styles.index}>
                          {index + 1} {'.'}
                        </Text>
                      </View>
                      <View style={{marginLeft: 10}}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemPrice}>₹{item.price}</Text>
                      </View>
                    </View>

                    {/* Swiggy-Style Qty Counter */}
                    <View style={styles.qtyContainer}>
                      <TouchableOpacity
                        onPress={() =>
                          dispatch(updateCartQuantity({item, delta: -1}))
                        }
                        style={styles.qtyBtn}>
                        <Text style={styles.qtyBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          dispatch(updateCartQuantity({item, delta: 1}))
                        }
                        style={styles.qtyBtn}>
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              ),
            )}

            {itemList.length === 0 && (
              <View style={{padding: 40, alignItems: 'center'}}>
                <Text style={{color: swiggyColors.textSecondary}}>
                  Your cart is empty
                </Text>
              </View>
            )}
          </View>

          {/* Bill Details Section */}
          {/* {itemList.length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Bill Details</Text>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Total</Text>
                <Text style={styles.billValue}>₹{totalAmount}</Text>
              </View>
              <View style={[styles.billRow, styles.totalRow]}>
                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                <Text style={styles.grandTotalValue}>₹{totalAmount}</Text>
              </View>
            </View>
          )} */}
        </ScrollView>

        <View style={styles.footer}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View>
              <Text style={styles.btnPrice}>₹{totalAmount}</Text>
              <Text style={styles.btnSub}>View detailed bill</Text>
            </View>
            <View>
              <TouchableOpacity
                activeOpacity={0.9}
                style={[
                  styles.confirmBtn,
                  isOrdering && {backgroundColor: swiggyColors.textSecondary},
                ]}
                onPress={handlePlaceOrder}
                disabled={isOrdering}>
                {isOrdering ? (
                  <ActivityIndicator color={swiggyColors.background} />
                ) : (
                  <View style={styles.btnContent}>
                    <Text style={styles.btnAction}>CONFIRM ORDER</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: swiggyColors.background,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 2,
    paddingHorizontal: 12,
    shadowColor: swiggyColors.textPrimary,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemMain: {flex: 1, flexDirection: 'row', alignItems: 'center'},
  marker: {
    width: 20,
    height: 20,
    // borderWidth: 1.5,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: swiggyColors.primary,
  },
  dot: {width: 6, height: 6, borderRadius: 3},
  index: {fontSize: 12, fontWeight: '700', color: swiggyColors.background},
  itemName: {fontSize: 15, fontWeight: '700', color: swiggyColors.textPrimary},
  itemPrice: {fontSize: 13, color: swiggyColors.textSecondary, marginTop: 2},

  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4D5D9',
    borderRadius: 8,
    height: 34,
    backgroundColor: swiggyColors.background,
  },
  qtyBtn: {paddingHorizontal: 12, height: '100%', justifyContent: 'center'},
  qtyBtnText: {color: swiggyColors.veg, fontSize: 18, fontWeight: '700'},
  qtyText: {
    color: swiggyColors.veg,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'center',
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: swiggyColors.textPrimary,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  billLabel: {fontSize: 14, color: swiggyColors.textSecondary},
  billValue: {fontSize: 14, color: swiggyColors.textPrimary, fontWeight: '600'},
  totalRow: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: swiggyColors.textPrimary,
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: swiggyColors.textPrimary,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: swiggyColors.background,
    padding: 14,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  confirmBtn: {
    backgroundColor: swiggyColors.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 20,
    elevation: 4,
  },
  btnContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btnPrice: {
    color: swiggyColors.textPrimary,
    fontSize: 26,
    fontWeight: '900',

    lineHeight: 28,
  },
  btnSub: {
    color: swiggyColors.primary,
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.9,
  },
  btnAction: {
    color: swiggyColors.background,
    fontSize: 14,
    fontWeight: '900',
  },
});

export default CartScreen;
