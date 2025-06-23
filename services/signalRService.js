import * as signalR from "@microsoft/signalr";
import { authService } from "./authService";
import API_CONFIG from "../config/api.config";

const HUB_URL = API_CONFIG.SIGNALR_HUB_URL;

class SignalRService {
    connection = null;

    startConnection = async () => {
        if (this.connection && this.connection.state !== signalR.HubConnectionState.Disconnected) {
            console.log("SignalR connection is already active or connecting. State:", this.connection.state);
            return;
        }

        if (!this.connection) {
            const token = authService.getToken();
            if (!token) {
                console.error("No auth token found, SignalR connection not started.");
                return;
            }
    
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(HUB_URL, {
                    accessTokenFactory: () => token,
                })
                .withAutomaticReconnect()
                .build();
    
            this.connection.onclose((error) => {
                console.log("SignalR connection closed.", error);
            });
        }

        try {
            await this.connection.start();
            console.log("SignalR Connected.");
        } catch (err) {
            console.error("SignalR Connection Error: ", err);
        }
    };

    stopConnection = async () => {
        if (this.connection) {
            await this.connection.stop();
            console.log("SignalR Disconnected.");
            this.connection = null;
        }
    };

    on = (event, callback) => {
        if (!this.connection) {
            return;
        }
        this.connection.on(event, callback);
    };

    off = (event, callback) => {
        if (!this.connection) {
            return;
        }
        this.connection.off(event, callback);
    };

    invoke = (method, ...args) => {
        if (!this.connection) {
            return Promise.reject("SignalR connection not established.");
        }
        return this.connection.invoke(method, ...args);
    };
}

const signalRService = new SignalRService();
export default signalRService; 