import AsyncStorage from '@react-native-async-storage/async-storage';

// Only auth and cart survive app restarts; catalog/orders/admin data always
// refetches so it never goes stale.
const rootPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'cart'],
};

export default rootPersistConfig;
