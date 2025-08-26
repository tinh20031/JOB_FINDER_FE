'use client'

import React, { useState, useEffect, useCallback } from 'react';
import SearchBox from "./SearchBox";
import ContactList from "./ContactList";
import ContentField from "./ContentField";
import { useDispatch, useSelector } from "react-redux";
import { chatSidebarToggle } from "../../../../../features/toggle/toggleSlice";
import messageService from '../../../../../services/messageService';
import chatService from '../../../../../services/chatService';
import { useSearchParams } from 'next/navigation';
import apiService from '../../../../../services/api.service';
import Cookies from 'js-cookie';

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
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
    const [totalMessages, setTotalMessages] = useState(0);
    const PAGE_SIZE = 20;

    useEffect(() => {
        let id = user?.id || user?.userId;
        if (!id && typeof window !== 'undefined') {
            id = localStorage.getItem('userId') || (typeof Cookies !== 'undefined' ? Cookies.get('userId') : undefined);
        }
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
            const response = await messageService.getMessagedCompanies(Number(currentUserId));
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
            if (urlCompanyId && uniqueContacts.some(c => c.id === urlCompanyId)) {
                setCurrentChatPartnerId(urlCompanyId);
            }
        } catch (err) {
            console.error("Error loading contacts:", err);
            setErrorLoadingContacts("Failed to load chat contacts. Please try again later.");
        } finally {
            setLoadingContacts(false);
        }
    }, [currentUserId, urlCompanyId]);

    // Load messages with pagination
    const loadMessages = useCallback(async (page = 1, append = false) => {
        if (!currentChatPartnerId || !currentUserId) return;
        
        if (page === 1) {
            setLoadingMessages(true);
        } else {
            setLoadingMoreMessages(true);
        }

        try {
            const response = await messageService.getMessageHistoryWithPagination(
                currentUserId, 
                currentChatPartnerId, 
                page, 
                PAGE_SIZE
            );
            
            const newMessages = response.data.messages || response.data;
            const total = response.data.total || newMessages.length;
            
            setTotalMessages(total);
            
            if (append) {
                setMessages(prev => [...newMessages, ...prev]);
            } else {
                setMessages(newMessages);
            }
            
            // Check if there are more messages to load
            const loadedCount = (page - 1) * PAGE_SIZE + newMessages.length;
            setHasMoreMessages(loadedCount < total);
            
        } catch (error) {
            console.error("Error loading messages:", error);
            if (!append) {
                setMessages([]);
            }
        } finally {
            setLoadingMessages(false);
            setLoadingMoreMessages(false);
        }
    }, [currentChatPartnerId, currentUserId]);

    // Load more messages when scrolling up
    const loadMoreMessages = useCallback(() => {
        if (!loadingMoreMessages && hasMoreMessages) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            loadMessages(nextPage, true);
        }
    }, [loadingMoreMessages, hasMoreMessages, currentPage, loadMessages]);

    useEffect(() => {
        fetchChatContacts();
    }, [fetchChatContacts]);

    useEffect(() => {
        chatService.startConnection();

        const handleReceiveMessage = (messageData) => {
            const isForCurrentChat =
                (String(messageData.senderId) === String(currentUserId) && String(messageData.receiverId) === String(currentChatPartnerId)) ||
                (String(messageData.senderId) === String(currentChatPartnerId) && String(messageData.receiverId) === String(currentUserId));

            if (isForCurrentChat) {
                setMessages(prev => [...prev, messageData]);
            }

            const contactId = String(messageData.senderId) === String(currentUserId) ? String(messageData.receiverId) : String(messageData.senderId);

            if (String(contactId) !== String(currentChatPartnerId)) {
                setUnreadContactIds(prev => [...new Set([...prev, String(contactId)])]);
            }

            // Update contacts list in-place without refetching
            setChatContacts(prevContacts => {
                const isSenderUser = String(messageData.senderId) === String(currentUserId);
                const contactIndex = prevContacts.findIndex(c => c.id === contactId);

                let newOrUpdatedContact;

                if (contactIndex > -1) { // Contact exists, update it
                    newOrUpdatedContact = {
                        ...prevContacts[contactIndex],
                        lastMessageText: messageData.messageText || (messageData.fileUrl ? 'Sent a file' : ''),
                        timestamp: messageData.sentAt,
                    };
                } else { // New contact
                    newOrUpdatedContact = {
                        id: contactId,
                        name: isSenderUser ? messageData.receiverFullName : messageData.senderFullName,
                        lastMessageText: messageData.messageText || (messageData.fileUrl ? 'Sent a file' : ''),
                        timestamp: messageData.sentAt,
                        avatar: (isSenderUser ? messageData.receiverImage : messageData.senderImage) || "/images/resource/default-avatar.png",
                        unreadCount: 0,
                    };
                }

                const remainingContacts = prevContacts.filter(c => c.id !== contactId);
                return [newOrUpdatedContact, ...remainingContacts];
            });
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

        chatService.on("ReceiveMessage", handleReceiveMessage);
        chatService.on("UserOnlineStatusChanged", handleUserOnlineStatus);
        chatService.on("OnlineUsersList", handleOnlineUsersList);

        return () => {
            chatService.off("ReceiveMessage", handleReceiveMessage);
            chatService.off("UserOnlineStatusChanged", handleUserOnlineStatus);
            chatService.off("OnlineUsersList", handleOnlineUsersList);
        };
    }, [currentUserId, currentChatPartnerId]);

    // Reset pagination and load messages when chat partner changes
    useEffect(() => {
        if (currentChatPartnerId && currentUserId) {
            setCurrentPage(1);
            setHasMoreMessages(true);
            setMessages([]);
            loadMessages(1, false);
        }
    }, [currentChatPartnerId, currentUserId, loadMessages]);

    useEffect(() => {
        if (currentChatPartnerId) {
            setPartnerOnline(onlineUserIds.includes(String(currentChatPartnerId)));
        }
    }, [currentChatPartnerId, onlineUserIds]);

    useEffect(() => {
        if (currentUserId && currentChatPartnerId) {
            const roomId = `${Math.min(Number(currentUserId), Number(currentChatPartnerId))}_${Math.max(Number(currentUserId), Number(currentChatPartnerId))}`;
            chatService.joinRoom(roomId);
        }
    }, [currentUserId, currentChatPartnerId]);
    
    const sendMessage = async (messageText, file = null) => {
        if ((!messageText || !messageText.trim()) && !file) return;
        if (!currentChatPartnerId || !currentUserId) return;
        try {
            const payload = {
                senderId: parseInt(currentUserId, 10),
                receiverId: parseInt(currentChatPartnerId, 10),
                messageText: messageText,
                file: file,
            };
            await messageService.sendMessage(payload);
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
                    setMessages={setMessages}
                    sendMessage={sendMessage}
                    currentChatPartner={currentChatPartner}
                    currentUserId={currentUserId}
                    currentUserFullName={currentUserFullName}
                    currentUserProfileImage={currentUserProfileImage}
                    partnerOnline={partnerOnline}
                    loadingMessages={loadingMessages}
                    loadingMoreMessages={loadingMoreMessages}
                    hasMoreMessages={hasMoreMessages}
                    onLoadMoreMessages={loadMoreMessages}
                />
            </div>
        </div>
    );
};

export default ChatBox;