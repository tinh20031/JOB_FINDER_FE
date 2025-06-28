import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';
import API_CONFIG from '../config/api.config';
import authService from './authService';

class ChatService {
  constructor() {
    this.hubUrl = `${API_CONFIG.BASE_URL.replace('/api', '')}/chatHub`;
  }

  createHubConnection() {
    return new HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
        accessTokenFactory: () => authService.getToken()
      })
      .withAutomaticReconnect()
      .build();
  }
}

const chatService = new ChatService();
export default chatService; 