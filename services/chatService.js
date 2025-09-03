import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import API_CONFIG from '../config/api.config';
import { authService } from './authService';

class ChatService {
  constructor() {
    this.hubUrl = API_CONFIG.SIGNALR_CHAT_HUB_URL;
    this.connection = null;
  }

  async startConnection() {
    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) return;
    this.connection = new HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => authService.getToken(),
      })
      .configureLogging(LogLevel.None)
      .withAutomaticReconnect()
      .build();
    await this.connection.start();
  }

  stopConnection() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
  }

  on(event, callback) {
    if (this.connection) this.connection.on(event, callback);
  }

  off(event, callback) {
    if (this.connection) this.connection.off(event, callback);
  }

  async joinUserGroup(userId) {
    if (this.connection) {
      await this.connection.invoke('JoinUserGroup', userId);
    }
  }

  async leaveUserGroup(userId) {
    if (this.connection) {
      await this.connection.invoke('LeaveUserGroup', userId);
    }
  }

  async joinRoom(roomId) {
    if (this.connection) {
      await this.connection.invoke('JoinRoom', roomId);
    }
  }
}

const chatService = new ChatService();
export default chatService; 