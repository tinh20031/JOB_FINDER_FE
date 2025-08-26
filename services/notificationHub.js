import { HubConnectionBuilder, LogLevel, HubConnectionState } from "@microsoft/signalr";
import API_CONFIG from "../config/api.config";

class NotificationHubService {
  constructor() {
    this.connection = null;
    this.token = null;
    this.userId = null;
    this.onReceiveNotification = null;
    this.isStarting = false;
  }

  async start(token, userId, onReceiveNotification) {
    // Always update the callback so the latest handler is used
    this.onReceiveNotification = onReceiveNotification;
    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
      return this.connection;
    }
    if (this.isStarting) return;
    this.isStarting = true;
    this.token = token;
    this.userId = userId;

    this.connection = new HubConnectionBuilder()
      .withUrl(API_CONFIG.SIGNALR_NOTIFICATION_HUB_URL, {
        accessTokenFactory: () => this.token,
        // Allow negotiation and transport fallback (WS/SSE/LongPolling)
      })
    .configureLogging(LogLevel.None)
    .withAutomaticReconnect()
    .build();

    this.connection.on("ReceiveNotification", (notification) => {
      if (this.onReceiveNotification) this.onReceiveNotification(notification);
    });

    try {
      await this.connection.start();
      await this.connection.invoke("JoinUserGroup", String(this.userId));
    } finally {
      this.isStarting = false;
    }
    return this.connection;
}

  stop() {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      this.connection.stop();
      this.connection = null;
  }
  }
}

const notificationHubService = new NotificationHubService();
export default notificationHubService; 