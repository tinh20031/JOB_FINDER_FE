import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

let connection = null;

export function startNotificationHub(token, userId, onReceiveNotification) {
  if (connection) return connection;

  connection = new HubConnectionBuilder()
    .withUrl(
      process.env.NEXT_PUBLIC_SIGNALR_HUB_URL || "http://localhost:5194/notificationHub",
      //  process.env.NEXT_PUBLIC_SIGNALR_HUB_URL || "https://job-finder-kjt2.onrender.com/notificationHub",
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