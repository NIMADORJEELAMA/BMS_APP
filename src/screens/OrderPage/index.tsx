import React, {useState, useEffect, useMemo} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
  View,
  Text,
  ScrollView,
} from 'react-native';
import {Div} from '../../components/common/UI';
import MainLayout from '../../screens/MainLayout';
import {orderService} from '../../services/orderService';
import {useDispatch, useSelector} from 'react-redux';
import {updateCartQuantity} from '../../redux/slices/cartSlice';
import {RootState} from '../../redux/store';
import {useNavigation} from '@react-navigation/native';
import ViewOrderModal from './ViewOrderModal';
import SearchBar from '../../components/Searchbar';
import swiggyColors from '../../assets/Color/swiggyColor';
import CustomDropdown from '../../components/CustomDropdown';
import Cart from '../../assets/Icons/cart.svg'; // Adjust path
import BackIcon from '../../assets/Icons/left-arrow.svg'; // Adjust path

const screenWidth = Dimensions.get('window').width;
const itemWidth = (screenWidth - 48) / 3; // Precise spacing for 3-column grid

const OrderPage = ({route}: any) => {
  const navigation = useNavigation<any>();
  const {table} = route.params;

  // State
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [selectedType, setSelectedType] = useState<'FOOD' | 'ALCOHOL'>('FOOD');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  // Redux
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const totalCartCount = Object.values(cartItems).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  // Fetch Menu on Mount
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await orderService.getMenu();
        // Automatically hide inactive items
        setMenuItems(data.filter((item: any) => item.isActive));
      } catch (err) {
        console.error('Failed to fetch menu:', err);
      }
    };
    fetchMenu();
  }, []);
  const categoriesList = useMemo(() => {
    const uniqueCats = Array.from(
      new Set(menuItems.map(item => item.category)),
    );
    return [
      {label: 'All Categories', value: 'ALL'},
      ...uniqueCats.map(cat => ({label: cat, value: cat})),
    ];
  }, [menuItems]);
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesVeg = isVegOnly ? item.isVeg === true : true;
      const matchesType = item.type === selectedType;

      // New Category Filter
      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;

      return matchesSearch && matchesVeg && matchesType && matchesCategory;
    });
  }, [search, isVegOnly, selectedType, selectedCategory, menuItems]);
  const handleQtyChange = (item: any, delta: number) => {
    dispatch(updateCartQuantity({item, delta}));
  };

  // Header Cart Icon Component
  const CartIcon = () => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate('CartScreen', {table})}
      style={styles.cartHeaderBtn}>
      {/* Replace emoji with SVG if possible */}
      <Text style={{fontSize: 22}}>
        <Cart height={24} />
      </Text>
      {totalCartCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalCartCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderGridItem = ({item}: any) => {
    console.log('item', item);
    const quantity = cartItems[item.id]?.quantity || 0;

    return (
      <View style={styles.swiggyCard}>
        {/* Veg/Non-Veg Marker - Top Left */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}>
          <View
            style={[
              styles.marker,
              {
                borderColor: item.isVeg
                  ? swiggyColors.veg
                  : swiggyColors.nonVeg,
              },
            ]}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: item.isVeg
                    ? swiggyColors.veg
                    : swiggyColors.nonVeg,
                },
              ]}
            />
          </View>
          <View>
            <Text style={styles.itemCategory}>{item.category}</Text>
          </View>
        </View>
        {/* Item Info */}
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={{alignSelf: 'flex-start'}}>
            <Text style={styles.itemPrice}>₹{item.price}</Text>
          </View>

          {/* Dynamic Button Section */}
          <View style={styles.buttonWrapper}>
            {quantity === 0 ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.swiggyAddBtn}
                onPress={() => handleQtyChange(item, 1)}>
                <Text style={styles.addBtnText}>ADD</Text>
                <Text style={styles.plusSign}>+</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.swiggyQtyBtn}>
                <TouchableOpacity
                  onPress={() => handleQtyChange(item, -1)}
                  style={styles.qtyTouch}>
                  <Text style={styles.qtyActionText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.qtyValueText}>{quantity}</Text>

                <TouchableOpacity
                  onPress={() => handleQtyChange(item, 1)}
                  style={styles.qtyTouch}>
                  <Text style={styles.qtyActionText}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <MainLayout
      title={`${table.name || table.number}`}
      showBack
      rightComponent={<CartIcon />}>
      <StatusBar barStyle="dark-content" />

      <View style={{flex: 1, backgroundColor: '#FBFBFE'}}>
        <View style={styles.headerContainer}>
          {/* Search Row */}
          <View style={styles.searchRowContainer}>
            <View style={{flex: 1}}>
              <SearchBar
                value={search}
                onChangeText={setSearch}
                placeholder="Search menu..."
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.vegToggle, isVegOnly && styles.vegToggleActive]}
              onPress={() => setIsVegOnly(!isVegOnly)}>
              <View
                style={[
                  styles.vegBox,
                  {borderColor: isVegOnly ? swiggyColors.veg : '#CBD5E1'},
                ]}>
                <View
                  style={[
                    styles.vegInnerDot,
                    {
                      backgroundColor: isVegOnly
                        ? swiggyColors.veg
                        : 'transparent',
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.vegToggleLabel,
                  isVegOnly && {color: swiggyColors.veg},
                ]}>
                VEG
              </Text>
            </TouchableOpacity>
          </View>

          {/* Horizontal Scroll Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{overflow: 'visible'}}
            contentContainerStyle={styles.filterScroll}>
            {/* Food/Alcohol Toggle */}
            <View style={styles.slider}>
              {['FOOD', 'ALCOHOL'].map((t: any) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.sliderTab,
                    selectedType === t && styles.activeTab,
                  ]}
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
            </View>

            {/* Category Dropdown as a Chip */}
            <View style={styles.dropdownWrapper}>
              <CustomDropdown
                options={categoriesList}
                selectedValue={selectedCategory}
                onSelect={val => setSelectedCategory(val)}
                placeholder="Category"
              />
            </View>

            {/* View Order Action */}
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => setModalVisible(true)}>
              <Text style={styles.headerActionBtnText}>Active Order</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id}
          renderItem={renderGridItem}
          numColumns={3}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={{padding: 12, paddingBottom: 100}}
          ListEmptyComponent={
            <Div center mt={50}>
              <Text style={{color: '#94A3B8'}}>No items found.</Text>
            </Div>
          }
        />
      </View>

      <ViewOrderModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        table={table}
      />
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    zIndex: 5000,
    position: 'relative',
    // elevation: 1,
  },
  searchRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    overflow: 'visible',
    // marginBottom: 80,
  },
  slider: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginRight: 10,
    width: 160, // Fixed width for the toggle
  },
  sliderTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 9,
  },
  activeTab: {
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  tabText: {fontSize: 11, fontWeight: '700', color: '#94A3B8'},
  activeTabText: {color: '#FC8019'}, // Swiggy Orange

  dropdownWrapper: {
    minWidth: 130,
    marginRight: 10,
    overflow: 'visible',
    zIndex: 6000, // Higher than headerContainer
  },
  headerActionBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  headerActionBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },

  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  activeFilterChip: {
    borderColor: '#FC8019',
    backgroundColor: '#FFF5EE', // Very light orange tint
  },
  activeVegChip: {
    borderColor: '#60B246',
    backgroundColor: '#F0FDF4',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3D4152', // Swiggy's deep grey for text
  },
  activeFilterText: {
    color: '#FC8019',
  },
  // Veg Icon Styling
  vegBox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    borderRadius: 2,
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Modern Veg Toggle
  vegToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vegToggleActive: {
    borderColor: '#27ae60',
    backgroundColor: '#F0FDF4',
  },

  vegInnerDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  vegToggleLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  // Action Row
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  currentOrderBtn: {
    flex: 1,
    backgroundColor: '#fa2c37',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  historyBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Slider

  // Grid Item
  gridRow: {
    justifyContent: 'flex-start',
  },

  // Badge
  cartHeaderBtn: {padding: 8},
  badge: {
    position: 'absolute',
    top: 2,
    right: 0,
    backgroundColor: '#fa2c37',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {color: '#FFF', fontSize: 9, fontWeight: '900'},
  swiggyCard: {
    width: itemWidth,
    margin: 4,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    // Refined Shadow
    shadowColor: '#282C3F',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'space-between',
    minHeight: 160,
  },
  marker: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    // marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  itemInfo: {
    flex: 1,
    marginBottom: 0,
  },
  itemName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3D4152', // Deep grey
    lineHeight: 18,
  },
  itemCategory: {
    fontSize: 10,
    color: '#7E808C',
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  cardFooter: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3D4152',
    marginBottom: 8,
    alignContent: 'flex-start',
  },
  buttonWrapper: {
    width: '100%',
    height: 36,
  },
  // ADD Button Styling
  swiggyAddBtn: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4D5D9',
    borderRadius: 8,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    // Button Shadow
    shadowColor: '#000',
    shadowOpacity: 0.05,
    elevation: 2,
  },
  addBtnText: {
    color: '#60B246', // Swiggy uses Green for 'ADD'
    fontWeight: '900',
    fontSize: 13,
  },
  plusSign: {
    position: 'absolute',
    right: 8,
    top: 2,
    color: '#60B246',
    fontSize: 12,
    fontWeight: '900',
  },
  // Qty Selector Styling
  swiggyQtyBtn: {
    flexDirection: 'row',
    backgroundColor: '#60B246', // Swiggy uses green for active qty controls
    borderRadius: 8,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  qtyTouch: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyActionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  qtyValueText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    minWidth: 20,
    textAlign: 'center',
  },
});

export default OrderPage;
