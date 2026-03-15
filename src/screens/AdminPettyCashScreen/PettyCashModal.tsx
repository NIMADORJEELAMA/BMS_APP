import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
// Re-enabling icons since they are in your package.json
// import { X, IndianRupee, AlignLeft, User as UserIcon, Check } from 'lucide-react-native';
import {operationService} from '../../services/operationService';
import {User} from '../../services/usersService';
import Toast from 'react-native-toast-message';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  users: User[]; // Using the passed users array
}

export default function PettyCashModal({
  isOpen,
  onClose,
  onSuccess,
  users,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [showUserList, setShowUserList] = useState(false);

  const [form, setForm] = useState({
    userId: '',
    userName: '',
    amount: '',
    reason: '',
  });

  const handleSelectUser = (user: User) => {
    setForm({...form, userId: user.id, userName: user.name});
    setShowUserList(false);
  };

  const handleSubmit = async () => {
    if (!form.userId || !form.amount || !form.reason) {
      return Toast.show({type: 'error', text1: 'Please fill all fields'});
    }

    try {
      setLoading(true);
      await operationService.createPettyCash({
        userId: form.userId,
        amount: Number(form.amount),
        reason: form.reason,
        // Backend usually defaults to today, but you can add date: format(new Date(), 'yyyy-MM-dd')
      });

      Toast.show({type: 'success', text1: 'Entry added successfully'});
      setForm({userId: '', userName: '', amount: '', reason: ''});
      onSuccess();
      onClose();
    } catch (error) {
      Toast.show({type: 'error', text1: 'Failed to create entry'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>New Petty Cash Entry</Text>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <Text>close</Text>
              {/* <X color="#64748b" size={24} /> */}
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {/* Staff Member Selection */}
            <Text style={styles.label}>STAFF MEMBER</Text>
            <TouchableOpacity
              style={styles.pickerTrigger}
              onPress={() => setShowUserList(!showUserList)}>
              {/* <UserIcon size={18} color="#94a3b8" /> */}
              <Text
                style={[
                  styles.pickerText,
                  !form.userName && {color: '#94a3b8'},
                ]}>
                {form.userName || 'Select Staff Member'}
              </Text>
            </TouchableOpacity>

            {/* User List Dropdown */}
            {showUserList && (
              <View style={styles.userDropdown}>
                <FlatList
                  data={users}
                  keyExtractor={item => item.id}
                  style={{maxHeight: 200}} // Increased height slightly for better visibility
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={styles.userItem}
                      onPress={() => handleSelectUser(item)}>
                      <View>
                        <Text style={styles.userItemText}>{item.name}</Text>
                        <Text style={styles.userRoleText}>{item.role}</Text>
                      </View>
                      {form.userId === item.id && (
                        <Text style={styles.userRoleText}>{item.role}</Text>

                        // <Check size={18} color="#6366f1" />
                      )}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No active staff found</Text>
                  }
                />
              </View>
            )}

            <Text style={styles.label}>AMOUNT</Text>
            <View style={styles.inputContainer}>
              {/* <IndianRupee size={18} color="#94a3b8" /> */}
              <TextInput
                placeholder="0.00"
                keyboardType="numeric"
                style={styles.input}
                value={form.amount}
                onChangeText={val => setForm({...form, amount: val})}
              />
            </View>

            <Text style={styles.label}>REASON</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              {/* <AlignLeft size={18} color="#94a3b8" style={{marginTop: 12}} /> */}
              <TextInput
                placeholder="What is this for?"
                multiline
                style={[styles.input, styles.textArea]}
                value={form.reason}
                onChangeText={val => setForm({...form, reason: val})}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.disabledBtn]}
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>CREATE ENTRY</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {fontSize: 18, fontWeight: '800', color: '#1e293b'},
  form: {gap: 12},
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1,
    marginTop: 8,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pickerText: {
    flex: 1,
    paddingHorizontal: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  userDropdown: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: -8,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  userItemText: {fontWeight: '700', color: '#1e293b', fontSize: 14},
  userRoleText: {fontSize: 10, color: '#94a3b8', fontWeight: '600'},
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 12,
    color: '#1e293b',
    fontWeight: '600',
  },
  textAreaContainer: {alignItems: 'flex-start', height: 100},
  textArea: {height: 100, textAlignVertical: 'top', paddingTop: 14},
  submitBtn: {
    backgroundColor: '#0f172a',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  disabledBtn: {opacity: 0.7},
  submitBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  emptyText: {padding: 20, textAlign: 'center', color: '#94a3b8'},
});
