import React, {useState, useEffect, useMemo} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import {Text, Div} from '../../components/common/UI';
import MainLayout from '../../screens/MainLayout';
import {orderService} from '../../services/orderService';
import {useDispatch, useSelector} from 'react-redux';
import {updateCartQuantity} from '../../redux/slices/cartSlice';
import {RootState} from '../../redux/store';

import {useNavigation} from '@react-navigation/native'; // Ensure this is imported
import ViewOrderModal from './ViewOrderModal';
const screenWidth = Dimensions.get('window').width;
const itemWidth = (screenWidth - 48) / 3; // Precise spacing for 3 columns

const OrderPage = ({route}: any) => {
  const navigation = useNavigation();
  const {table} = route.params;
  console.log('table111', table);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [selectedType, setSelectedType] = useState<'FOOD' | 'ALCOHOL'>('FOOD');
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch();

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const itemCount = Object.values(cartItems).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const totalCartCount = Object.values(cartItems).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await orderService.getMenu();
        setMenuItems(data.filter((item: any) => item.isActive));
      } catch (err) {
        console.error(err);
      }
    };
    fetchMenu();
  }, []);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesVeg = isVegOnly ? item.isVeg === true : true;
      return matchesSearch && matchesVeg && item.type === selectedType;
    });
  }, [search, isVegOnly, selectedType, menuItems]);

  const handleQtyChange = (item: any, delta: number) => {
    dispatch(updateCartQuantity({item, delta}));
  };

  const renderGridItem = ({item}: any) => {
    const quantity = cartItems[item.id]?.quantity || 0;

    return (
      <Div style={styles.card}>
        {/* Veg/Non-Veg Marker */}
        <Div
          style={[
            styles.vegMarker,
            {borderColor: item.isVeg ? '#27ae60' : '#c0392b'},
          ]}>
          <Div
            style={[
              styles.vegDot,
              {backgroundColor: item.isVeg ? '#27ae60' : '#c0392b'},
            ]}
          />
        </Div>

        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemCategory}>{item.category}</Text>

        <Div style={styles.cardFooter}>
          <Text style={styles.itemPrice}>₹{item.price}</Text>

          {quantity === 0 ? (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => handleQtyChange(item, 1)}>
              <Text style={styles.addBtnText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <Div style={styles.qtyControls}>
              <TouchableOpacity
                style={styles.qtyTouch}
                onPress={() => handleQtyChange(item, -1)}>
                <Text style={styles.qtyActionText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValueText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyTouch}
                onPress={() => handleQtyChange(item, 1)}>
                <Text style={styles.qtyActionText}>+</Text>
              </TouchableOpacity>
            </Div>
          )}
        </Div>
      </Div>
    );
  };
  const CartIcon = () => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('CartScreen', {
          tableId: table.id,
          tableName: table.name,
          table: table, // Passing the full object just in case
        })
      }
      style={styles.cartContainer}>
      <Text style={{fontSize: 24}}>🛒</Text>
      {itemCount > 0 && (
        <Div style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount}</Text>
        </Div>
      )}
    </TouchableOpacity>
  );
  return (
    <MainLayout
      title={`Table ${table.name}`}
      showBack
      rightComponent={<CartIcon />} // Pass it here
    >
      <Div p={12} flex={1} bg="#F8F9FA">
        {/* Header Search & Toggle */}
        <Div style={styles.searchRow}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search menu..."
            placeholderTextColor="#999"
            onChangeText={setSearch}
          />
          <TouchableOpacity
            style={[styles.vegBtn, isVegOnly && styles.vegBtnActive]}
            onPress={() => setIsVegOnly(!isVegOnly)}>
            <Div
              style={[
                styles.vegDot,
                {
                  backgroundColor: isVegOnly ? '#27ae60' : '#BBB',
                  marginRight: 4,
                },
              ]}
            />
            <Text
              style={[
                styles.vegBtnLabel,
                {color: isVegOnly ? '#27ae60' : '#888'},
              ]}>
              VEG
            </Text>
          </TouchableOpacity>
        </Div>

        {/* Floating Cart Button Info */}
        <Div style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.currentOrderBtn}
            onPress={() => setModalVisible(true)}>
            <Text style={styles.btnText}>Current Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropBtn}>
            <Text style={styles.btnText}>▼</Text>
          </TouchableOpacity>
        </Div>

        {/* Type Slider */}
        <Div style={styles.slider}>
          {['FOOD', 'ALCOHOL'].map((t: any) => (
            <TouchableOpacity
              key={t}
              style={[styles.sliderTab, selectedType === t && styles.activeTab]}
              onPress={() => setSelectedType(t)}>
              <Text
                style={[
                  styles.tabText,
                  selectedType === t && styles.activeTabText,
                ]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </Div>

        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id}
          renderItem={renderGridItem}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 40}}
        />
      </Div>
      <ViewOrderModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        table={table}
      />
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  cartContainer: {
    padding: 5,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -4,
    top: -2,
    backgroundColor: '#fa2c37',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Search & Filters
  searchRow: {flexDirection: 'row', marginBottom: 12},
  searchBar: {
    flex: 0.75,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    marginRight: 8,
    elevation: 2,
    color: '#333',
  },
  vegBtn: {
    flex: 0.25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    backgroundColor: '#FFF',
  },
  vegBtnActive: {borderColor: '#27ae60', backgroundColor: '#E8F5E9'},
  vegBtnLabel: {fontSize: 10, fontWeight: '800'},

  // Action Buttons
  buttonRow: {flexDirection: 'row', marginBottom: 12},
  currentOrderBtn: {
    flex: 1,
    backgroundColor: '#fa2c37',
    paddingVertical: 14,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
    elevation: 4,
  },
  dropBtn: {
    width: 45,
    backgroundColor: '#333',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  btnText: {color: '#FFF', fontWeight: 'bold', fontSize: 13},

  // Slider
  slider: {
    flexDirection: 'row',
    backgroundColor: '#E9ECEF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  sliderTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#FFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  tabText: {fontWeight: 'bold', color: '#6C757D', fontSize: 12},
  activeTabText: {color: '#fa2c37'},

  // Grid Card
  card: {
    width: itemWidth,
    margin: 4,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 150,
  },
  vegMarker: {
    borderWidth: 1,
    padding: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  vegDot: {width: 6, height: 6, borderRadius: 3},
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#212529',
    textAlign: 'center',
    marginTop: 4,
    height: 38,
  },
  itemCategory: {
    fontSize: 9,
    color: '#ADB5BD',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  cardFooter: {width: '100%', alignItems: 'center', marginTop: 10},
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#495057',
    marginBottom: 6,
  },

  // Buttons & Qty
  addBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#fa2c37',
    width: '100%',
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  addBtnText: {color: '#fa2c37', fontSize: 11, fontWeight: 'bold'},

  qtyControls: {
    flexDirection: 'row',
    backgroundColor: '#fa2c37',
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  qtyTouch: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    flex: 1,
    alignItems: 'center',
  },
  qtyActionText: {color: '#FFF', fontSize: 16, fontWeight: 'bold'},
  qtyValueText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  },
});

export default OrderPage;
