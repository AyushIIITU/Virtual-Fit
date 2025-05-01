import { Platform } from 'react-native';
PORT=8080
const API = Platform.OS === 'android' ? `http://192.168.90.168:${PORT}/api` : `http://localhost:${PORT}/api`;
export { API };
