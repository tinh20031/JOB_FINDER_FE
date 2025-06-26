'use client'

import React, { useState, useEffect, useCallback } from 'react';
import SearchBox from "./SearchBox";
import ContactList from "./ContactList";
import ContentField from "./ContentField";
import { useDispatch, useSelector } from "react-redux";
import { chatSidebarToggle } from "../../../../../features/toggle/toggleSlice";
import messageService from '../../../../../services/messageService';
import signalRService from '../../../../../services/signalRService';
import { useSearchParams } from 'next/navigation';
import apiService from '../../../../../services/api.service';

const ChatBox = () => {
    const dispatch = useDispatch();
    const { user, token, profileUpdated } = useSelector((state) => state.auth);
    const searchParams = useSearchParams();
    const urlCompanyId = searchParams.get('companyId');
    const [messages, setMessages] = useState([]);
    const [currentChatPartnerId, setCurrentChatPartnerId] = useState(null);
    const [chatContacts, setChatContacts] = useState([]);
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [errorLoadingContacts, setErrorLoadingContacts] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentUserFullName, setCurrentUserFullName] = useState('');
    const [currentUserProfileImage, setCurrentUserProfileImage] = useState('');
    const [unreadContactIds, setUnreadContactIds] = useState([]);
    const [onlineUserIds, setOnlineUserIds] = useState([]);
    const [partnerOnline, setPartnerOnline] = useState(false);

    useEffect(() => {
        const id = user?.id || user?.userId;
        setCurrentUserId(id);

        const fetchUserProfile = async () => {
            if (id) {
                try {
                    const profile = await apiService.get('/CandidateProfile/me');
                    setCurrentUserFullName(profile.fullName || '');
                    setCurrentUserProfileImage(profile.image || '');
                } catch (error) {
                    console.error("Failed to fetch user profile", error);
                }
            }
        }

        fetchUserProfile();

    }, [user, profileUpdated]);

    const fetchChatContacts = useCallback(async () => {
        if (!currentUserId) return;
        setLoadingContacts(true);
        setErrorLoadingContacts(null);
        try {
            const response = await messageService.getMessagedCompanies(currentUserId);
            const fetchedContacts = response.data.map(msg => ({
                id: String(msg.companyId),
                name: msg.companyName || "Unknown",
                lastMessageText: msg.messageText,
                timestamp: msg.sentAt,
                avatar: msg.urlCompanyLogo || "/images/resource/default-avatar.png",
                unreadCount: 0,
            }));
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

    useEffect(() => {
        signalRService.startConnection();

        const handleReceiveMessage = (messageData) => {
            const isForCurrentChat =
                (String(messageData.senderId) === String(currentUserId) && String(messageData.receiverId) === String(currentChatPartnerId)) ||
                (String(messageData.senderId) === String(currentChatPartnerId) && String(messageData.receiverId) === String(currentUserId));

            if (isForCurrentChat) {
                setMessages(prev => [...prev, messageData]);
            }
            
            const contactId = String(messageData.senderId) === String(currentUserId) ? messageData.receiverId : messageData.senderId;
            if (String(contactId) !== String(currentChatPartnerId)) {
                setUnreadContactIds(prev => [...new Set([...prev, String(contactId)])]);
            }

            fetchChatContacts();
        };
        
        const handleUserOnlineStatus = ({ userId, isOnline }) => {
            setOnlineUserIds(prev => isOnline ? [...new Set([...prev, String(userId)])] : prev.filter(id => id !== String(userId)));
            if (String(userId) === String(currentChatPartnerId)) {
                setPartnerOnline(isOnline);
            }
        };

        const handleOnlineUsersList = (onlineUsers) => {
            setOnlineUserIds(onlineUsers.map(String));
        };

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
                .then(response => {
                    const historyMessages = response.data.map(msg => ({
                        ...msg,
                        timestamp: msg.timestamp ? new Date(msg.timestamp).toISOString() : null,
                    }));
                    setMessages(historyMessages);
                })
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

    const chatToggle = () => dispatch(chatSidebarToggle());

    const handleContactSelect = (partnerId) => {
        setCurrentChatPartnerId(String(partnerId));
        setUnreadContactIds(prev => prev.filter(id => id !== String(partnerId)));
    };

    const currentChatPartner = chatContacts.find(c => String(c.id) === String(currentChatPartnerId));

    return (
        <div className="row" style={{ height: "100%" }}>
            <div className="contacts_column col-xl-4 col-lg-5 col-md-12 col-sm-12 chat" style={{ height: "100%" }} id="chat_contacts">
                <div className="card contacts_card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <div className="card-header">
                        <div className="fix-icon position-absolute top-0 end-0 show-1023" onClick={chatToggle}>
                            <span className="flaticon-close"></span>
                        </div>
                    </div>
                    <div className="card-body contacts_body" style={{ flexGrow: 1, overflowY: "auto" }}>
                        <ContactList
                            onContactSelect={handleContactSelect}
                            currentChatPartnerId={currentChatPartnerId}
                            contacts={chatContacts.map(c => ({...c, isOnline: onlineUserIds.includes(String(c.id))}))}
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
