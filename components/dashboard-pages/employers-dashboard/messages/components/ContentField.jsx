import Image from "next/image";
import ChatHamburger from "../../../employers-dashboard/messages/components/ChatHamburger";
import React, { useState, useEffect, useRef } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { FiPaperclip } from 'react-icons/fi';
import messageService from '../../../../../services/messageService';

const ChatBoxContentField = ({ messages, setMessages, sendMessage, sendFile, currentChatPartner, currentUserId, currentUserFullName, currentUserProfileImage, partnerOnline, loadingMessages }) => {
  const [messageInput, setMessageInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [showRemove, setShowRemove] = useState(false);
  const messagesEndRef = useRef(null);
  const [enlargedImageUrl, setEnlargedImageUrl] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  if (!currentChatPartner) {
    return (
      <div className="card message-card d-flex justify-content-center align-items-center h-100">
        <h3>Select a contact to start chatting</h3>
      </div>
    );
  }

  return (
    <div className="card message-card">
      <div className="card-header msg_head">
        <div className="d-flex bd-highlight align-items-center">
          <div className="img_cont">
            <Image
              width={48}
              height={48}
              src={currentChatPartner.avatar && (currentChatPartner.avatar.startsWith('/') || currentChatPartner.avatar.startsWith('http')) ? currentChatPartner.avatar : '/images/resource/default-avatar.png'}
              alt="user avatar"
              className="rounded-circle user_img"
              style={{ width: 48, height: 48, minWidth: 48, minHeight: 48, maxWidth: 48, maxHeight: 48 }}
            />
          </div>
          <div className="user_info" style={{ marginLeft: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 18 }}>{currentChatPartner.name}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 13, color: partnerIsOnline ? '#4caf50' : '#aaa', margin: 0, fontWeight: 500 }}>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: partnerIsOnline ? '#4caf50' : '#aaa', marginRight: 6 }} />
              {partnerIsOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="btn-box">
          <ChatHamburger />
        </div>
      </div>
      {/* End .cart-header */}

      <div className="card-body msg_card_body">
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
              <div key={index} className={`d-flex ${isMyMessage ? 'justify-content-end reply' : 'justify-content-start'} mb-2`}>
                <div className="img_cont_msg">
                  <Image
                    width={32}
                    height={32}
                    style={{ width: 32, height: 32, minWidth: 32, minHeight: 32, maxWidth: 32, maxHeight: 32 }}
                    src={avatarUrl}
                    alt="avatar"
                    className="rounded-circle user_img_msg small-avatar"
                  />
                  <div className="name small-name">
                    {displayName}
                    <span className="msg_time small-time">{timeToDisplay}</span>
                  </div>
                </div>
                <div className="msg_cotainer" style={{maxWidth: 320}}>
                  {/* Hiển thị text nếu có */}
                  {msg.messageText && <div style={{whiteSpace: 'pre-line'}}>{msg.messageText}</div>}
                  {/* Hiển thị ảnh nếu là fileType=image */}
                  {msg.fileUrl && msg.fileType === 'image' && (
                    <div style={{marginTop: 8}}>
                      <img
                        src={msg.fileUrl}
                        alt={msg.fileName || 'attachment'}
                        style={{maxWidth: 200, borderRadius: 8, cursor: 'pointer'}}
                        onClick={() => setEnlargedImageUrl(msg.fileUrl)}
                      />
                    </div>
                  )}
                  {/* Hiển thị file khác nếu có */}
                  {msg.fileUrl && msg.fileType !== 'image' && (
                    <div style={{marginTop: 8}}>
                      <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                        {msg.fileName || 'Download file'}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* End .card-body */}

      <div className="card-footer">
        <div className="form-group mb-0">
          <form onSubmit={handleSendMessage} style={{ display: "flex", alignItems: "center" }}>
            <input
              type="file"
              style={{ display: 'none' }}
              id="chat-file-input"
              onChange={handleFileChange}
            />
            <label htmlFor="chat-file-input" style={{ marginRight: 8, cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Attach file">
              <FiPaperclip size={24} color="#888" />
              {selectedFile && !imagePreviewUrl && (
                <div
                  style={{ position: 'relative', marginLeft: 4, display: 'inline-block' }}
                  onMouseEnter={() => setShowRemove(true)}
                  onMouseLeave={() => setShowRemove(false)}
                >
                  <span style={{ color: '#1890ff', fontSize: 12 }}>{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); setImagePreviewUrl(null); }}
                    style={{
                      position: 'absolute', top: -8, right: -18, background: '#fff', border: '1px solid #ccc',
                      borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: showRemove ? 'block' : 'none', padding: 0, lineHeight: 1
                    }}
                    aria-label="Remove file"
                  >✕</button>
                </div>
              )}
            </label>
            {/* Preview ảnh nếu có */}
            {imagePreviewUrl && (
              <div
                style={{ position: 'relative', marginRight: 8, display: 'inline-block' }}
                onMouseEnter={() => setShowRemove(true)}
                onMouseLeave={() => setShowRemove(false)}
              >
                <img src={imagePreviewUrl} alt="Preview" style={{ maxWidth: 60, maxHeight: 60, borderRadius: 8, border: '1px solid #eee' }} />
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); setImagePreviewUrl(null); }}
                  style={{
                    position: 'absolute', top: -8, right: -8, background: '#fff', border: '1px solid #ccc',
                    borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', display: showRemove ? 'block' : 'none', padding: 0, lineHeight: 1
                  }}
                  aria-label="Remove image"
                >✕</button>
              </div>
            )}
            <textarea
              className="form-control type_msg"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              style={{ flexGrow: 1, marginRight: "10px" }}
            ></textarea>
            <button
              type="submit"
              className="theme-btn btn-style-one submit-btn"
              style={{ position: "static", height: "auto", pointerEvents: "auto", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px', background: 'none', border: 'none' }}
              disabled={!messageInput.trim() && !selectedFile}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#1890ff" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
      {/* End .card-footer */}

      {/* Modal phóng to ảnh */}
      {enlargedImageUrl && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setEnlargedImageUrl(null)}
        >
          <img
            src={enlargedImageUrl}
            alt="Enlarged"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, boxShadow: '0 2px 16px #0008' }}
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setEnlargedImageUrl(null)}
            style={{
              position: 'fixed',
              top: 100,
              right: 48,
              fontSize: 36,
              color: '#fff',
              background: 'rgba(0,0,0,0.4)',
              border: 'none',
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10000,
              transition: 'background 0.2s'
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      <style jsx>{`
        .message-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden; /* Prevent main card from scrolling */
        }

        .msg_head {
          flex-shrink: 0; /* Header should not shrink */
        }

        .msg_card_body {
          flex-grow: 1; /* Message body takes available space */
          overflow-y: auto; /* Enable scrolling for messages */
          padding-bottom: 15px; /* Add some padding at the bottom */
        }

        .card-footer {
          flex-shrink: 0; /* Footer should not shrink */
          padding: 15px;
          z-index: 10; /* Ensure footer is on top */
        }

        .form-group {
          /* position: relative; Removed to prevent conflicts */
        }

        .type_msg {
          resize: none; /* Disable textarea resizing */
          min-height: 40px;
          max-height: 120px; /* Limit max height */
          /* padding-right: 100px; /* Removed, handled by flexbox */
        }

        .submit-btn {
          /* Removed absolute positioning, handled by flexbox */
          /* height: 100%; */ /* Removed, handled by flexbox */
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
          z-index: 11; /* Ensure button is above footer */
        }

        .img_cont_msg .user_img_msg.small-avatar {
          width: 16px !important;
          height: 16px !important;
          min-width: 16px !important;
          min-height: 16px !important;
          max-width: 16px !important;
          max-height: 16px !important;
        }
        .name.small-name {
          font-size: 12px !important;
        }
        .msg_time.small-time {
          font-size: 11px !important;
          margin-left: 4px;
        }
        .msg_cotainer {
          padding: 10px 15px;
          border-radius: 15px;
          margin-bottom: 5px;
        }
        .reply .msg_cotainer {
          background-color: #e6f0ff;
          color: #333;
        }
        .justify-content-start .msg_cotainer {
          background-color: #f1f0f0;
          color: #333;
        }
      `}</style>
    </div>
  );
};

export default ChatBoxContentField;
 