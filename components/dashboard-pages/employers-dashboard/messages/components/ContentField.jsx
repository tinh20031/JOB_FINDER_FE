import Image from "next/image";
import ChatHamburger from "../../../employers-dashboard/messages/components/ChatHamburger";
import React, { useState, useEffect, useRef } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { FiPaperclip } from 'react-icons/fi';
import messageService from '../../../../../services/messageService';
import { useRouter } from 'next/navigation';

const ChatBoxContentField = ({ 
  messages, 
  setMessages, 
  sendMessage, 
  sendFile, 
  currentChatPartner, 
  currentUserId, 
  currentUserFullName, 
  currentUserProfileImage, 
  partnerOnline, 
  loadingMessages,
  loadingMoreMessages,
  hasMoreMessages,
  onLoadMoreMessages
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [showRemove, setShowRemove] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [enlargedImageUrl, setEnlargedImageUrl] = useState(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle infinite scroll
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop } = messagesContainerRef.current;
    
    // If scrolled to top and there are more messages, load more
    if (scrollTop === 0 && hasMoreMessages && !loadingMoreMessages) {
      onLoadMoreMessages();
    }
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [hasMoreMessages, loadingMoreMessages, onLoadMoreMessages]);

  useEffect(() => {
    // Only auto-scroll to bottom for new messages, not when loading old ones
    if (!loadingMoreMessages) {
      scrollToBottom();
    }
  }, [messages, loadingMoreMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() && !selectedFile) return;
    sendMessage(messageInput, selectedFile);
    setMessageInput('');
    setSelectedFile(null);
    setImagePreviewUrl(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file && file.type.startsWith('image/')) {
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setImagePreviewUrl(null);
    }
  };

  const handleCandidateNameClick = () => {
    if (currentChatPartner && currentChatPartner.id) {
      router.push(`/candidate-profile/${currentChatPartner.id}`);
    }
  };

  // Ưu tiên trạng thái online realtime từ prop partnerOnline
  let partnerIsOnline = partnerOnline;
  // Nếu prop chưa có, fallback về trạng thái từ message cuối
  if (partnerIsOnline === undefined && messages && messages.length > 0 && currentChatPartner) {
    const lastMessage = messages[messages.length - 1];
    if (currentChatPartner.id === lastMessage.senderId && 'senderIsOnline' in lastMessage) {
      partnerIsOnline = lastMessage.senderIsOnline;
    } else if (currentChatPartner.id === lastMessage.receiverId && 'receiverIsOnline' in lastMessage) {
      partnerIsOnline = lastMessage.receiverIsOnline;
    }
  }

  // Định dạng ngày/giờ: HH:mm dd/MM/yyyy theo giờ Việt Nam, cộng thêm 7 tiếng nếu backend trả về giờ không có offset
  const formatDateVN = (str) => {
    if (!str) return '';
    const dateObj = new Date(str);
    dateObj.setHours(dateObj.getHours() + 7);
    return dateObj.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour12: false
    });
  };

  if (!currentChatPartner) {
    return (
      <div className="card message-card d-flex justify-content-center align-items-center h-100">
        <h3>Select a contact to start chatting</h3>
      </div>
    );
  }

  return (
    <div className="card message-card h-100">
      <div className="card-header">
        <div className="d-flex align-items-center">
          <ChatHamburger />
          <div className="chat-partner-info d-flex align-items-center">
            <Image
              src={
                currentChatPartner.avatar &&
                (currentChatPartner.avatar.startsWith("/") ||
                  currentChatPartner.avatar.startsWith("http"))
                  ? currentChatPartner.avatar
                  : "/images/resource/default-avatar.png"
              }
              className="rounded-circle me-2"
              alt={currentChatPartner.name}
              width={48}
              height={48}
              style={{
                objectFit: 'cover',
                border: '2px solid #e0e0e0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                borderRadius: '50%',
                width: '48px',
                height: '48px'
              }}
              onError={(e) => {
                e.target.src = '/images/resource/default-avatar.png';
              }}
            />
            <div>
              <h5 
                className="mb-0 candidate-name" 
                onClick={handleCandidateNameClick}
                style={{ cursor: 'pointer', color: '#1967d2' }}
              >
                {currentChatPartner.name}
              </h5>
              <small className="text-muted">
                {partnerIsOnline ? (
                  <span style={{ color: '#4caf50' }}>
                    <span style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#4caf50',
                      marginRight: 4
                    }} />
                    Online
                  </span>
                ) : (
                  <span style={{ color: '#aaa' }}>
                    <span style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#aaa',
                      marginRight: 4
                    }} />
                    Offline
                  </span>
                )}
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body msg_card_body" ref={messagesContainerRef} style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
        {/* Loading more messages indicator */}
        {loadingMoreMessages && (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span className="ms-2">Loading more messages...</span>
          </div>
        )}

        {/* Initial loading */}
        {loadingMessages ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} style={{ display: 'flex', marginBottom: 16, alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eee', marginRight: 12 }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: '60%', height: 16, background: '#eee', borderRadius: 8, marginBottom: 8 }} />
                <div style={{ width: '40%', height: 12, background: '#f3f3f3', borderRadius: 8 }} />
              </div>
            </div>
          ))
        ) : (
          messages.map((msg, index) => {
            const parsedTimestamp = msg.sentAt ? new Date(msg.sentAt) : null;
            const timeToDisplay = parsedTimestamp && isValid(parsedTimestamp) ? format(parsedTimestamp, 'HH:mm') : '';
            const isMyMessage = msg.senderId == currentUserId;
            // Lấy avatar đúng cho từng phía
            const avatarUrl = isMyMessage
              ? ((currentUserProfileImage && (currentUserProfileImage.startsWith('/') || currentUserProfileImage.startsWith('http'))) ? currentUserProfileImage : '/images/resource/candidate-6.png')
              : (msg.senderImage || (currentChatPartner && currentChatPartner.avatar) || '/images/resource/default-avatar.png');
            const displayName = isMyMessage
              ? (currentUserFullName || 'You')
              : (msg.senderFullName || (currentChatPartner && currentChatPartner.name) || '');

            return (
              <div
                key={msg.id || index}
                className={`message ${isMyMessage ? 'sent' : 'received'} mb-3`}
                style={{
                  display: 'flex',
                  justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: '8px'
                }}
              >
                {!isMyMessage && (
                  <div style={{ 
                    position: 'relative',
                    flexShrink: 0,
                    marginRight: '8px'
                  }}>
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      width={40}
                      height={40}
                      className="rounded-circle"
                      style={{ 
                        objectFit: 'cover',
                        border: '2px solid #e0e0e0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px'
                      }}
                      onError={(e) => {
                        e.target.src = '/images/resource/default-avatar.png';
                      }}
                    />
                    {partnerOnline && (
                      <div style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#4caf50',
                        borderRadius: '50%',
                        border: '2px solid white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    )}
                  </div>
                )}
                
                <div
                  className={`message-content p-3 rounded ${
                    isMyMessage
                      ? 'bg-primary text-white'
                      : 'bg-light text-dark'
                  }`}
                  style={{
                    maxWidth: '70%',
                    wordWrap: 'break-word',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  {msg.fileUrl && (
                    <div className="mb-2">
                      {msg.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <div>
                          <img
                            src={msg.fileUrl}
                            alt="Attachment"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '200px',
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                            onClick={() => setEnlargedImageUrl(msg.fileUrl)}
                          />
                        </div>
                      ) : (
                        <div className="d-flex align-items-center">
                          <FiPaperclip className="me-2" />
                          <a
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none"
                          >
                            {msg.fileUrl.split('/').pop()}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {msg.messageText && (
                    <div className="message-text">{msg.messageText}</div>
                  )}
                  
                  <div
                    className={`message-time mt-1 ${
                      isMyMessage ? 'text-white-50' : 'text-muted'
                    }`}
                    style={{ fontSize: '0.75rem' }}
                  >
                    {timeToDisplay}
                  </div>
                </div>

                {isMyMessage && (
                  <div style={{ 
                    position: 'relative',
                    flexShrink: 0,
                    marginLeft: '8px'
                  }}>
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      width={40}
                      height={40}
                      className="rounded-circle"
                      style={{ 
                        objectFit: 'cover',
                        border: '2px solid #e0e0e0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px'
                      }}
                      onError={(e) => {
                        e.target.src = '/images/resource/default-avatar.png';
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="card-footer">
        <form onSubmit={handleSendMessage} className="d-flex align-items-center">
          <div className="flex-grow-1 me-2">
            <input
              type="text"
              className="form-control"
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
          </div>
          
          <div className="d-flex align-items-center">
            <label className="btn btn-outline-secondary me-2 mb-0" style={{ cursor: 'pointer' }}>
              <FiPaperclip />
              <input
                type="file"
                className="d-none"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
            </label>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!messageInput.trim() && !selectedFile}
            >
              Send
            </button>
          </div>
        </form>
        
        {imagePreviewUrl && (
          <div className="mt-2">
            <img
              src={imagePreviewUrl}
              alt="Preview"
              style={{
                maxWidth: '100px',
                maxHeight: '100px',
                borderRadius: '8px'
              }}
            />
            <button
              className="btn btn-sm btn-outline-danger ms-2"
              onClick={() => {
                setSelectedFile(null);
                setImagePreviewUrl(null);
              }}
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Enlarged image modal */}
      {enlargedImageUrl && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1050
          }}
          onClick={() => setEnlargedImageUrl(null)}
        >
          <img
            src={enlargedImageUrl}
            alt="Enlarged"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ChatBoxContentField;
 