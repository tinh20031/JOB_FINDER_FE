'use client'

import React, { useState, useEffect, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import axios from 'axios';
import SearchBox from "./SearchBox";
import ContactList from "./ContactList";
import ContentField from "./ContentField";
import { useDispatch } from "react-redux";
import { chatSidebarToggle } from "../../../../../features/toggle/toggleSlice";
import { authService } from "../../../../../services/authService"; 
import { jwtDecode } from 'jwt-decode';

const ChatBox = () => {
  const dispatch = useDispatch();
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentChatPartnerId, setCurrentChatPartnerId] = useState(null);
  const [chatContacts, setChatContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [errorLoadingContacts, setErrorLoadingContacts] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserFullName, setCurrentUserFullName] = useState('');
  const [currentUserProfileImage, setCurrentUserProfileImage] = useState('');

  // Initialize user data
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(parseInt(decoded.unique_name));
        setCurrentUserFullName(authService.getFullName() || '');
        setCurrentUserProfileImage(authService.getProfileImage() || '');
      } catch (e) {
        console.error("Error decoding token:", e);
      }
    }
  }, []);

  // Fetch chat contacts
  const fetchChatContacts = useCallback(async () => {
    if (!currentUserId) return;
    
    setLoadingContacts(true);
    setErrorLoadingContacts(null);
    try {
      const token = authService.getToken();
      const response = await axios.get(`http://localhost:5194/api/Message/companies-messaged/${currentUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const fetchedContacts = response.data.map(msg => {
        return {
          id: (msg.senderId === currentUserId) ? msg.receiverId : msg.senderId,
          name: msg.companyName || "Unknown",
          lastMessageText: msg.messageText,
          timestamp: msg.sentAt,
          avatar: msg.urlCompanyLogo || "/images/resource/default-avatar.png",
          unreadCount: 0,
        };
      });

      const uniqueContacts = Array.from(new Map(fetchedContacts.map(item => [item['id'], item])).values());
      setChatContacts(uniqueContacts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (err) {
      console.error("Error loading contacts:", err);
      setErrorLoadingContacts("Failed to load chat contacts. Please try again later.");
    } finally {
      setLoadingContacts(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchChatContacts();
  }, [fetchChatContacts]);

  const currentChatPartner = chatContacts.find(contact => contact.id === currentChatPartnerId);

  // Initialize SignalR connection
  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5194/chatHub", {
        accessTokenFactory: () => authService.getToken()
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    return () => {
      if (newConnection.state === signalR.HubConnectionState.Connected) {
        newConnection.stop();
      }
    };
  }, []);

  // Start SignalR connection and set up event handlers
  useEffect(() => {
    if (connection) {
      if (connection.state === signalR.HubConnectionState.Disconnected) {
        connection.start()
          .then(async () => {
            console.log('SignalR Connection Established!');
            // Join user group
            try {
              await axios.post('http://localhost:5194/api/Message/join-group', {}, {
                headers: {
                  'Authorization': `Bearer ${authService.getToken()}`
                }
              });
            } catch (error) {
              console.error('Error joining SignalR group:', error);
            }
          })
          .catch(e => console.error('Error establishing SignalR connection: ', e));
      }
      // Set up message handler
      connection.on("ReceiveMessage", (messageData) => {
        console.log("Received Message:", messageData);
        // Check if this message is for the current chat
        if (
          (messageData.senderId === currentUserId && messageData.receiverId === currentChatPartnerId) ||
          (messageData.senderId === currentChatPartnerId && messageData.receiverId === currentUserId)
        ) {
          setMessages(prevMessages => [...prevMessages, {
            ...messageData,
            timestamp: messageData.sentAt || new Date().toISOString()
          }]);
        }
        // Tối ưu cập nhật chatContacts local, không fetch lại toàn bộ
        setChatContacts(prevContacts => {
          const contactId = messageData.senderId === currentUserId ? messageData.receiverId : messageData.senderId;
          const existing = prevContacts.find(c => c.id === contactId);
          const updatedContact = {
            id: contactId,
            name: messageData.companyName || existing?.name || "Unknown",
            lastMessageText: messageData.messageText,
            timestamp: messageData.sentAt,
            avatar: messageData.urlCompanyLogo || existing?.avatar || "/images/resource/default-avatar.png",
            unreadCount: 0,
            position: messageData.industryName || existing?.position || "Company",
          };
          let newContacts;
          if (existing) {
            newContacts = prevContacts
              .map(c => c.id === contactId ? updatedContact : c)
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          } else {
            newContacts = [updatedContact, ...prevContacts];
          }
          return newContacts;
        });
      });

      // Set up contact list update handler
      connection.on("UpdateContactList", () => {
        console.log("Updating contact list...");
        fetchChatContacts();
      });

      // Connection event handlers
      connection.onreconnected(() => {
        console.log("SignalR Reconnected.");
        fetchChatContacts();
      });

      connection.onreconnecting((error) => {
        console.warn("SignalR Reconnecting...", error);
      });

      connection.onclose((error) => {
        console.error("SignalR Connection closed.", error);
      });
    }
  }, [connection, currentUserId, currentChatPartnerId, fetchChatContacts]);

  // Fetch message history when chat partner changes
  useEffect(() => {
    if (connection && connection.state === signalR.HubConnectionState.Connected && currentChatPartnerId && currentUserId) {
      console.log(`Fetching history for current user ${currentUserId} and partner ${currentChatPartnerId}`);
      
      axios.get(`http://localhost:5194/api/Message/history/${currentUserId}/${currentChatPartnerId}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      })
        .then(response => {
          console.log("Message history API response:", response.data);
          const historyMessages = response.data.map(msg => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : null,
            senderFullName: msg.senderFullName,
            senderImage: msg.senderImage,
          }));
          setMessages(historyMessages);
        })
        .catch(error => {
          console.error("Error fetching message history:", error);
          setMessages([]);
        });
    }
  }, [currentChatPartnerId, connection, connection?.state, currentUserId]);

  const sendMessage = async (messageText) => {
    if (!currentChatPartnerId || !currentUserId) {
      console.warn('Cannot send message: No chat partner selected or user not authenticated.');
      return;
    }
    try {
      const token = authService.getToken();
      const messagePayload = {
        senderId: currentUserId,
        receiverId: currentChatPartnerId,
        relatedJobId: 0,
        messageText: messageText,
      };
      console.log("Sending message payload:", messagePayload);
      await axios.post("http://localhost:5194/api/Message/send", messagePayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // You might want to show an error message to the user here
    }
  };

  const chatToggle = () => {
    dispatch(chatSidebarToggle());
  };

  const handleContactSelect = (partnerId) => {
    if (partnerId !== currentChatPartnerId) {
      setCurrentChatPartnerId(partnerId);
      console.log("Selected partner ID:", partnerId);
      const selectedPartner = chatContacts.find(contact => contact.id === partnerId);
      console.log("Selected partner object:", selectedPartner);
    }
  };

  return (
    <div className="row" style={{ height: "100%" }}>
      <div
        className="contacts_column col-xl-4 col-lg-5 col-md-12 col-sm-12 chat" 
        style={{ height: "100%" }}
        id="chat_contacts"
      >
        <div className="card contacts_card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <div className="card-header">
            <div
              className="fix-icon position-absolute top-0 end-0 show-1023"
              onClick={chatToggle}
            >
              <span className="flaticon-close"></span>
            </div>
          </div>

          <div className="card-body contacts_body" style={{ flexGrow: 1, overflowY: "auto" }}>
            <ContactList
              onContactSelect={handleContactSelect}
              currentChatPartnerId={currentChatPartnerId}
              contacts={chatContacts}
              loading={loadingContacts}
              error={errorLoadingContacts}
            />
          </div>
        </div>
      </div>

      <div className="col-xl-8 col-lg-7 col-md-12 col-sm-12 chat" style={{ height: "100%" }}>
        <ContentField
          messages={messages}
          sendMessage={sendMessage}
          currentChatPartner={currentChatPartner}
          currentUserId={currentUserId}
          currentUserFullName={currentUserFullName}
          currentUserProfileImage={currentUserProfileImage}
        />
      </div>
    </div>
  );
};

export default ChatBox;
