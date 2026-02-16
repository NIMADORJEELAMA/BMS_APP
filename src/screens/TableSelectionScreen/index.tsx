import React, {useState, useEffect, useMemo} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  View,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import {Text, Div} from '../../components/common/UI';
import MainLayout from '../MainLayout';
import {tableService} from '../../services/tableService';
import CustomDropdown from '../../components/CustomDropdown';
import Icon from 'react-native-vector-icons/Ionicons';
const {width} = Dimensions.get('window');
const ITEM_WIDTH = (width - 40) / 2;

const TableSelectionScreen = ({navigation}: any) => {
  const [tables, setTables] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([
    {label: 'All Areas', value: 'ALL'},
  ]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const loadInitialData = async () => {
    try {
      const [tableData, categoryData] = await Promise.all([
        tableService.getTables(),
        tableService.getCategories(),
      ]);

      const floorTables = tableData.filter((t: any) => t.room === null);
      setTables(floorTables);

      const mappedCats = categoryData.map((c: any) => ({
        label: c.name,
        value: c.id,
      }));
      setCategories([{label: 'All Areas', value: 'ALL'}, ...mappedCats]);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch layout data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const filteredTables = useMemo(() => {
    return tables.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === 'ALL' || t.category?.id === selectedCategory;
      const matchesStatus =
        selectedStatus === 'ALL' || t.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [search, selectedCategory, selectedStatus, tables]);

  const renderTable = ({item}: {item: any}) => {
    const isOccupied = item.status === 'OCCUPIED';
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.tableCard,
          {backgroundColor: isOccupied ? '#FFF5F5' : '#F7FFF9'},
          isOccupied && styles.occupiedBorder,
        ]}
        onPress={() => navigation.navigate('OrderPage', {table: item})}>
        <View
          style={[
            styles.statusDot,
            {backgroundColor: isOccupied ? '#F43F5E' : '#10B981'},
          ]}
        />
        <Div>
          <Text style={styles.tableName}>{item.name}</Text>
          <Text style={styles.categoryTag}>
            {item.category?.name || 'Table'}
          </Text>
        </Div>

        {isOccupied && item.activeOrder ? (
          <Div style={styles.orderBadge}>
            <Text style={styles.priceText}>
              ₹{item.activeOrder.runningTotal}
            </Text>
            <Text style={styles.itemText}>
              {item.activeOrder.itemCount} Items
            </Text>
          </Div>
        ) : (
          <Text style={styles.availableText}>TAP TO OPEN</Text>
        )}
      </TouchableOpacity>
    );
  };

  const StatusFilters = () => {
    const statuses = [
      {label: 'All', value: 'ALL', color: '#64748B'},
      {label: 'Free', value: 'FREE', color: '#10B981'},
      {label: 'Busy', value: 'OCCUPIED', color: '#F43F5E'},
    ];

    return (
      <View style={styles.sliderTrack}>
        {statuses.map(s => {
          const isActive = selectedStatus === s.value;
          return (
            <TouchableOpacity
              key={s.value}
              activeOpacity={0.8}
              onPress={() => setSelectedStatus(s.value)}
              style={[styles.sliderTab, isActive && styles.activeTab]}>
              <Text
                style={[
                  styles.sliderText,
                  isActive && {color: s.color, fontWeight: '800'},
                ]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <MainLayout
      title="Floor Map"
      subtitle="Select a table to start"
      rightComponent={
        <Div row align="center">
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.profileCircle}></TouchableOpacity>
        </Div>
      }>
      <View style={styles.headerContainer}>
        {/* Search Bar */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search tables..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />

        {/* Filter Row: Aligned side by side */}
        <View style={styles.filterRow}>
          <View style={styles.dropdownBox}>
            <CustomDropdown
              options={categories}
              selectedValue={selectedCategory}
              onSelect={val => setSelectedCategory(val)}
              placeholder="Area"
            />
          </View>

          <View style={styles.statusBox}>
            <StatusFilters />
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#fa2c37"
          style={{marginTop: 50}}
        />
      ) : (
        <FlatList
          data={filteredTables}
          renderItem={renderTable}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Div center mt={50}>
              <Text style={{color: '#94A3B8'}}>
                No tables match your filters.
              </Text>
            </Div>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadInitialData();
              }}
            />
          }
        />
      )}
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  profileCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9', // Light grey background
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerContainer: {
    padding: 10,
    paddingBottom: 12,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,

    backgroundColor: '#FFF',
    zIndex: 1000, // Vital for dropdowns to float over the FlatList
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {elevation: 6},
    }),
  },
  searchInput: {
    backgroundColor: '#F8FAFC',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 12,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  dropdownBox: {
    flex: 1, // 50/50 split
    zIndex: 1001, // Stays above the status slider
  },
  statusBox: {
    flex: 1, // 50/50 split
  },
  sliderTrack: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    height: 30, // Match standard dropdown trigger height
    alignItems: 'center',
  },
  sliderTab: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#FFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {elevation: 2},
    }),
  },
  sliderText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  list: {
    padding: 10,
    paddingBottom: 40,
  },
  tableCard: {
    width: ITEM_WIDTH - 20,
    margin: 10,
    borderRadius: 20,
    padding: 16,
    minHeight: 140,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {elevation: 3},
    }),
  },
  occupiedBorder: {
    borderColor: '#F43F5E30',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 15,
    right: 15,
  },
  tableName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
  },
  categoryTag: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  orderBadge: {
    borderTopWidth: 1,
    borderTopColor: '#00000008',
    paddingTop: 8,
  },
  priceText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#F43F5E',
  },
  itemText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  availableText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5,
  },
});

export default TableSelectionScreen;
