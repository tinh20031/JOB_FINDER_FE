'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [unreadContactIds, setUnreadContactIds] = useState([]);

  // Thêm useRef để lưu giá trị mới nhất
  const currentUserIdRef = useRef(currentUserId);
  const currentChatPartnerIdRef = useRef(currentChatPartnerId);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    currentChatPartnerIdRef.current = currentChatPartnerId;
  }, [currentChatPartnerId]);

  // Initialize user data
  useEffect(() => {
    const companyId = authService.getCompanyId();
    setCurrentUserId(companyId);
    setCurrentUserFullName(authService.getFullName() || '');
    setCurrentUserProfileImage(authService.getProfileImage() || '');
  }, []);

  // Fetch chat contacts
  const fetchChatContacts = useCallback(async () => {
    if (!currentUserId) {
      console.log("[DEBUG] currentUserId is missing!", currentUserId);
      return;
    }
    
    setLoadingContacts(true);
    setErrorLoadingContacts(null);
    try {
      const token = authService.getToken();
      console.log("[DEBUG] Calling API with companyId:", currentUserId);
      
      const response = await axios.get(`http://localhost:5194/api/Message/candidates-messaged/${currentUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("[DEBUG] API response:", response.data);
      
      const fetchedContacts = response.data.map(msg => {
        return {
          id: msg.candidateId,
          name: msg.candidateFullName || msg.senderFullName || "Unknown",
          lastMessageText: msg.messageText,
          timestamp: msg.sentAt,
          avatar: msg.candidateImage || msg.senderImage || "/images/resource/default-avatar.png",
          unreadCount: 0,
        };
      });
      
      const uniqueContacts = Array.from(new Map(fetchedContacts.map(item => [item['id'], item])).values());
      setChatContacts(uniqueContacts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (err) {
      console.error("[DEBUG] Error loading contacts:", err);
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
      const handler = (messageData) => {
        const myId = Number(currentUserIdRef.current);
        const partnerId = Number(currentChatPartnerIdRef.current);
        const senderId = Number(messageData.senderId);
        const receiverId = Number(messageData.receiverId);
        console.log('ReceiveMessage:', { senderId, receiverId, myId, partnerId, messageData });
        if (
          (senderId === myId && receiverId === partnerId) ||
          (senderId === partnerId && receiverId === myId)
        ) {
          setMessages(prevMessages => [...prevMessages, {
            ...messageData,
            timestamp: messageData.sentAt || new Date().toISOString()
          }]);
        }
        // Hiệu ứng nổi bật khi có tin nhắn mới
        const contactId = senderId === myId ? receiverId : senderId;
        if (contactId !== partnerId) {
          setUnreadContactIds(prev => prev.includes(contactId) ? prev : [...prev, contactId]);
        }
      };
      connection.on("ReceiveMessage", handler);
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
      // Cleanup
      return () => {
        connection.off("ReceiveMessage", handler);
      };
    }
  }, [connection, fetchChatContacts, currentUserId, currentChatPartnerId]);

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
      // KHÔNG setMessages ở đây nữa để tránh double message
      await axios.post("http://localhost:5194/api/Message/send", messagePayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const chatToggle = () => {
    dispatch(chatSidebarToggle());
  };

  const handleContactSelect = (partnerId) => {
    if (partnerId !== currentChatPartnerId) {
      setCurrentChatPartnerId(partnerId);
      currentChatPartnerIdRef.current = partnerId;
      setUnreadContactIds(prev => prev.filter(id => id !== partnerId));
    }
  };

  return (
    <div className="row" style={{ height: "80vh", overflow: "hidden" }}>
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
              unreadContactIds={unreadContactIds}
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