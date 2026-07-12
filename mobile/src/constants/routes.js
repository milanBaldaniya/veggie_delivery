// Centralized screen name constants so navigation.navigate() calls never use raw strings.

export const AUTH_ROUTES = Object.freeze({
  SPLASH: 'Splash',
  LOGIN: 'Login',
  OTP_VERIFY: 'OtpVerify',
  PROFILE_SETUP: 'ProfileSetup',
});

export const CUSTOMER_TABS = Object.freeze({
  HOME: 'HomeTab',
  CATEGORIES: 'CategoriesTab',
  CART: 'CartTab',
  ORDERS: 'OrdersTab',
  PROFILE: 'ProfileTab',
});

export const CUSTOMER_ROUTES = Object.freeze({
  HOME: 'Home',
  SEARCH: 'Search',
  CATEGORIES: 'Categories',
  PRODUCT_LIST: 'ProductList',
  PRODUCT_DETAILS: 'ProductDetails',
  CART: 'Cart',
  MY_ORDERS: 'MyOrders',
  ORDER_DETAILS: 'OrderDetails',
  WEEKLY_BILLS: 'WeeklyBills',
  BILL_DETAILS: 'BillDetails',
  PROFILE: 'Profile',
  EDIT_PROFILE: 'EditProfile',
  NOTIFICATIONS: 'Notifications',
  SETTINGS: 'Settings',
});

export const ADMIN_TABS = Object.freeze({
  DASHBOARD: 'DashboardTab',
  ORDERS: 'OrdersTab',
  PRODUCTS: 'ProductsTab',
  CUSTOMERS: 'CustomersTab',
  MORE: 'MoreTab',
});

export const ADMIN_ROUTES = Object.freeze({
  DASHBOARD: 'Dashboard',
  ORDERS_LIST: 'OrdersList',
  ORDER_DETAILS: 'AdminOrderDetails',
  PRODUCT_LIST: 'AdminProductList',
  PRODUCT_FORM: 'ProductForm',
  CATEGORY_LIST: 'AdminCategoryList',
  CATEGORY_FORM: 'CategoryForm',
  CUSTOMER_LIST: 'CustomerList',
  CUSTOMER_DETAILS: 'CustomerDetails',
  BUILDING_LIST: 'BuildingList',
  BUILDING_FORM: 'BuildingForm',
  WING_LIST: 'WingList',
  FLAT_LIST: 'FlatList',
  REPORTS: 'Reports',
  REPORT_DETAIL: 'ReportDetail',
  NOTIFICATIONS: 'AdminNotifications',
  SETTINGS: 'AdminSettings',
});
