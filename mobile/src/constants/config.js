// Update per environment. Android emulator can't reach "localhost" on the
// host machine — use 10.0.2.2 there; iOS simulator can use localhost directly;
// a physical device needs your machine's LAN IP.
export const API_BASE_URL = 'http://10.0.2.2:5000/api/v1';
