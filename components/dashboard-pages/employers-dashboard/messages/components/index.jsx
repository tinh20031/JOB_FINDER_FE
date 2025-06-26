'use client'

import React, { useState, useEffect, useCallback } from 'react';
import SearchBox from "./SearchBox";
import ContactList from "./ContactList";
import ContentField from "./ContentField";
import { useDispatch, useSelector } from "react-redux";
import { chatSidebarToggle } from "../../../../../features/toggle/toggleSlice";
import messageService from '../../../../../services/messageService';
import signalRService from '../../../../../services/signalRService';
import apiService from '../../../../../services/api.service';

const ChatBox = () => {
    const dispatch = useDispatch();
    const { user, token, profileUpdated } = useSelector((state) => state.auth);
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

    useEffect(() => {
        const id = user?.id || user?.userId;
        setCurrentUserId(id);

        const fetchCompanyProfile = async () => {
            if (id) {
                try {
                    const profile = await apiService.get(`/CompanyProfile/${id}`);
                    setCurrentUserFullName(profile.companyName || 'My Company');
                    setCurrentUserProfileImage(profile.urlCompanyLogo || '');
                } catch (error) {
                    console.error("Failed to fetch company profile", error);
                }
            }
        }
        fetchCompanyProfile();
    }, [user, profileUpdated]);

    const fetchChatContacts = useCallback(async () => {
        if (!currentUserId) return;
        setLoadingContacts(true);
        setErrorLoadingContacts(null);
        try {
            const response = await messageService.getMessagedCandidates(currentUserId);
            const fetchedContacts = response.data.map(msg => ({
                id: String(msg.candidateId),
                name: msg.candidateFullName || "Unknown Candidate",
                lastMessageText: msg.messageText,
                timestamp: msg.sentAt,
                avatar: msg.candidateImage || "/images/resource/default-avatar.png",
            }));
            const uniqueContacts = Array.from(new Map(fetchedContacts.map(item => [item.id, item])).values());
            setChatContacts(uniqueContacts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        } catch (err) {
            console.error("Error loading contacts:", err);
            setErrorLoadingContacts("Failed to load contacts.");
        } finally {
            setLoadingContacts(false);
        }
    }, [currentUserId]);

    useEffect(() => {
        fetchChatContacts();
    }, [fetchChatContacts]);

    useEffect(() => {
        signalRService.startConnection();

        const handleReceiveMessage = (messageData) => {
            const isForCurrentChat =
                (String(messageData.senderId) == currentUserId && String(messageData.receiverId) == currentChatPartnerId) ||
                (String(messageData.senderId) == currentChatPartnerId && String(messageData.receiverId) == currentUserId);

            if (isForCurrentChat) {
                setMessages(prev => [...prev, messageData]);
            }
            const contactId = String(messageData.senderId) == currentUserId ? messageData.receiverId : messageData.senderId;
            if (String(contactId) != currentChatPartnerId) {
                setUnreadContactIds(prev => [...new Set([...prev, String(contactId)])]);
            }
            fetchChatContacts();
        };

        const handleUserOnlineStatus = ({ userId, isOnline }) => {
            setOnlineUserIds(prev => isOnline ? [...new Set([...prev, String(userId)])] : prev.filter(id => id != String(userId)));
            if (String(userId) == currentChatPartnerId) {
                setPartnerOnline(isOnline);
            }
        };
        const handleOnlineUsersList = (onlineUsers) => setOnlineUserIds(onlineUsers.map(String));

        signalRService.on("ReceiveMessage", handleReceiveMessage);
        signalRService.on("UserOnlineStatusChanged", handleUserOnlineStatus);
        signalRService.on("OnlineUsersList", handleOnlineUsersList);

        return () => {
            signalRService.off("ReceiveMessage", handleReceiveMessage);
            signalRService.off("UserOnlineStatusChanged", handleUserOnlineStatus);
            signalRService.off("OnlineUsersList", handleOnlineUsersList);
        };
    }, [currentUserId, currentChatPartnerId, fetchChatContacts]);

    useEffect(() => {
        if (currentChatPartnerId && currentUserId) {
            messageService.getMessageHistory(currentUserId, currentChatPartnerId)
                .then(response => setMessages(response.data || []))
                .catch(error => {
                    console.error("Error fetching message history:", error);
                    setMessages([]);
                });
        }
    }, [currentChatPartnerId, currentUserId]);

    useEffect(() => {
        if (currentChatPartnerId) {
            setPartnerOnline(onlineUserIds.includes(String(currentChatPartnerId)));
        }
    }, [currentChatPartnerId, onlineUserIds]);

    const sendMessage = async (messageText) => {
        if (!messageText.trim() || !currentChatPartnerId || !currentUserId) return;
        
        try {
            const payload = {
                senderId: parseInt(currentUserId, 10),
                receiverId: parseInt(currentChatPartnerId, 10),
                messageText: messageText,
            };
            await messageService.sendMessage(payload);
            // Giao diện sẽ được cập nhật bởi sự kiện 'ReceiveMessage' từ server.
        } catch (e) {
            console.error('Error sending message via HTTP: ', e);
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

    const currentChatPartner = chatContacts.find(contact => contact.id == currentChatPartnerId);

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
                            contacts={chatContacts.map(c => ({ ...c, isOnline: onlineUserIds.includes(String(c.id)) }))}
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