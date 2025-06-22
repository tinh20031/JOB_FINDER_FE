'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import SearchBox from "./SearchBox";
import ContactList from "./ContactList";
import ContentField from "./ContentField";
import { useDispatch } from "react-redux";
import { chatSidebarToggle } from "../../../../../features/toggle/toggleSlice";
import { authService } from "../../../../../services/authService";
import { jwtDecode } from 'jwt-decode';
import messageService from '../../../../../services/messageService';

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
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState([]);

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
      return;
    }
    
    setLoadingContacts(true);
    setErrorLoadingContacts(null);
    try {
      const response = await messageService.getMessagedCandidates(currentUserId);
      const fetchedContacts = response.data.map(msg => ({
        id: String(msg.candidateId),
        name: msg.candidateFullName,
        lastMessageText: msg.messageText,
        timestamp: msg.sentAt,
        avatar: msg.candidateImage || "/images/resource/default-avatar.png",
        unreadCount: 0,
      }));
      
      const uniqueContacts = Array.from(new Map(fetchedContacts.map(item => [item.id, item])).values());
      setChatContacts(() => {
        const newContacts = uniqueContacts.map(c => ({
          ...c,
          isOnline: onlineUserIds.includes(String(c.id))
        }));
        return newContacts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });
    } catch (err) {
      console.error("Error loading contacts:", err);
      setErrorLoadingContacts("Failed to load chat contacts. Please try again later.");
    } finally {
      setLoadingContacts(false);
    }
  }, [currentUserId, onlineUserIds]);

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
            try {
              await messageService.joinGroup();
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
        if (
          (senderId === partnerId && receiverId === myId)
        ) {
          setMessages(prevMessages => [...prevMessages, {
            ...messageData,
            timestamp: messageData.sentAt || new Date().toISOString()
          }]);
        }
        // Hiệu ứng nổi bật khi có tin nhắn mới
        const contactId = senderId === myId ? receiverId : senderId;
        if (senderId !== myId && contactId !== partnerId) {
          setUnreadContactIds(prev => prev.includes(String(contactId)) ? prev : [...prev, String(contactId)]);
        }
      };
      connection.on("ReceiveMessage", handler);
      // Set up contact list update handler
      connection.on("UpdateContactList", () => {
        fetchChatContacts();
      });
      // Lắng nghe realtime online status
      connection.on("UserOnlineStatusChanged", ({ userId, isOnline }) => {
        setOnlineUserIds(prev =>
          isOnline
            ? [...new Set([...prev, String(userId)])]
            : prev.filter(id => id !== String(userId))
        );
        setChatContacts(contacts => {
          const mapped = contacts.map(c =>
            String(c.id) === String(userId)
              ? { ...c, isOnline }
              : c
          );
          return mapped;
        });
        if (currentChatPartnerId && String(currentChatPartnerId) === String(userId)) {
          setPartnerOnline(isOnline);
        }
      });
      // Lắng nghe danh sách user online khi vừa kết nối
      connection.on("OnlineUsersList", (onlineUserIds) => {
        setOnlineUserIds(onlineUserIds);
        setChatContacts(contacts => {
          const mapped = contacts.map(c => ({
            ...c,
            isOnline: onlineUserIds.includes(String(c.id))
          }));
          return mapped;
        });
        if (currentChatPartnerId) {
          setPartnerOnline(onlineUserIds.includes(String(currentChatPartnerId)));
        }
      });
      // Connection event handlers
      connection.onreconnected(() => {
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
        connection.off("UpdateContactList");
        connection.off("UserOnlineStatusChanged");
        connection.off("OnlineUsersList");
      };
    }
  }, [connection, fetchChatContacts, currentUserId, currentChatPartnerId, onlineUserIds]);

  // Fetch message history when chat partner changes
  useEffect(() => {
    if (connection && connection.state === signalR.HubConnectionState.Connected && currentChatPartnerId && currentUserId) {
      messageService.getMessageHistory(currentUserId, currentChatPartnerId)
        .then(response => {
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
      const messagePayload = {
        senderId: currentUserId,
        receiverId: currentChatPartnerId,
        relatedJobId: 0,
        messageText: messageText,
        sentAt: new Date().toISOString(),
      };
      await messageService.sendMessage(messagePayload);
      setMessages(prevMessages => [
        ...prevMessages,
        { ...messagePayload }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const chatToggle = () => {
    dispatch(chatSidebarToggle());
  };

  const handleContactSelect = (partnerId) => {
    if (String(partnerId) !== currentChatPartnerId) {
      setCurrentChatPartnerId(String(partnerId));
      setUnreadContactIds(prev => prev.filter(id => id !== String(partnerId)));
    }
  };

  // Khi đổi partner hoặc chatContacts thay đổi, luôn lấy trạng thái online từ contact list nếu có
  useEffect(() => {
    if (currentChatPartnerId && chatContacts.length > 0) {
      const partner = chatContacts.find(c => String(c.id) === String(currentChatPartnerId));
      setPartnerOnline(!!partner?.isOnline);
    }
  }, [currentChatPartnerId, chatContacts]);

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
          partnerOnline={partnerOnline}
        />
      </div>
    </div>
  );
};

export default ChatBox;