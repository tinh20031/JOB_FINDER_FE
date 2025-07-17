import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import API_CONFIG from "../config/api.config";

let connection = null;

export function startNotificationHub(token, userId, onReceiveNotification) {
  if (connection) return connection;

  const SIGNALR_HUB_URL = API_CONFIG.SIGNALR_HUB_URL;

  connection = new HubConnectionBuilder()
    .withUrl(
      SIGNALR_HUB_URL,
      {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: 1, // WebSockets
      }
    )
    .configureLogging(LogLevel.Information)
    .withAutomaticReconnect()
    .build();

  connection.on("ReceiveNotification", (notification) => {
    if (onReceiveNotification) onReceiveNotification(notification);
  });

  connection.start()
    .then(() => {
      connection.invoke("JoinUserGroup", String(userId));
    })
    .catch(console.error);

  return connection;
}

export function stopNotificationHub() {
  if (connection) {
    connection.stop();
    connection = null;
  }
} 