import AsyncStorage from '@react-native-async-storage/async-storage';

// Thin wrapper so callers never touch AsyncStorage's string-only API directly.
const storage = {
  async getItem(key) {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  },
  async setItem(key, value) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async removeItem(key) {
    await AsyncStorage.removeItem(key);
  },
};

export default storage;
