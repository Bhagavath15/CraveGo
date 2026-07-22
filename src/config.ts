const DEV_API_URL = 'http://localhost:8080';
const PROD_API_URL = 'https://api.cravego.com';

const DEV_SOCKET_URL = 'http://localhost:8080';
const PROD_SOCKET_URL = 'https://api.cravego.com';

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;
export const SOCKET_URL = __DEV__ ? DEV_SOCKET_URL : PROD_SOCKET_URL;
export const PUBLISHABLE_KEY = __DEV__
  ? 'pk_test_51Tu6PPJx0Ey9yNFZPAAcSgeynTjsH6EI67sSpIJl9Ep6vzOK1FFM5Z6qmyZuF10yP9M2sN3EmY5QqHBzcWzpNcs000FEiaTLgS'
  : '';
