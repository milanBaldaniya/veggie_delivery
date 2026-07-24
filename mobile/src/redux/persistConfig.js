import AsyncStorage from '@react-native-async-storage/async-storage';
import { createTransform } from 'redux-persist';

// loginStatus/loginError/profileStatus/profileError are transient UI state,
// not data — if an app kill lands mid-request, a stale 'loading' would
// otherwise persist and get restored on every future launch, permanently
// stuck-spinning the button. Reset them on every rehydrate.
const authTransform = createTransform(
  (inboundState) => inboundState,
  (outboundState) => ({
    ...outboundState,
    loginStatus: 'idle',
    loginError: null,
    profileStatus: 'idle',
    profileError: null,
  }),
  { whitelist: ['auth'] }
);

// Only auth and cart survive app restarts; catalog/orders/admin data always
// refetches so it never goes stale.
const rootPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'cart'],
  transforms: [authTransform],
};

export default rootPersistConfig;
