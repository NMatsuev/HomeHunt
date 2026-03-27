import NetInfo from "@react-native-community/netinfo";

class NetworkService {
  constructor() {
    this.isConnected = true;
    this.listeners = [];
    this.setupListener();
  }

  setupListener() {
    NetInfo.addEventListener((state) => {
      const wasConnected = this.isConnected;
      this.isConnected =
        state.isConnected && state.isInternetReachable !== false;

      if (wasConnected !== this.isConnected) {
        this.notifyListeners();
      }
    });
  }

  async checkConnection() {
    const state = await NetInfo.fetch();
    this.isConnected = state.isConnected && state.isInternetReachable !== false;
    return this.isConnected;
  }

  addListener(callback) {
    this.listeners.push(callback);
    callback(this.isConnected);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach((callback) => callback(this.isConnected));
  }
}

export default new NetworkService();
