import Image from "next/image";
import ChatHamburger from "../../../employers-dashboard/messages/components/ChatHamburger";
import React, { useState, useEffect, useRef } from 'react';
import { format, parseISO, isValid } from 'date-fns';

const ChatBoxContentField = ({ messages, sendMessage, sendFile, currentChatPartner, currentUserId, currentUserFullName, currentUserProfileImage, partnerOnline }) => {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput('');
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
        {messages.map((msg, index) => {
          const parsedTimestamp = msg.sentAt ? new Date(msg.sentAt) : null;
          const timeToDisplay = parsedTimestamp && isValid(parsedTimestamp) ? format(parsedTimestamp, 'HH:mm') : '';

          const isMyMessage = msg.senderId == currentUserId;
          return (
            <div key={index} className={`d-flex ${isMyMessage ? 'justify-content-end reply' : 'justify-content-start'} mb-2`}>
              <div className="img_cont_msg">
                <Image
                  width={32}
                  height={32}
                  style={{ width: 32, height: 32, minWidth: 32, minHeight: 32, maxWidth: 32, maxHeight: 32 }}
                  src={
                    isMyMessage
                      ? ((currentUserProfileImage && (currentUserProfileImage.startsWith('/') || currentUserProfileImage.startsWith('http'))) ? currentUserProfileImage : '/images/resource/candidate-6.png')
                      : ((currentChatPartner.avatar && (currentChatPartner.avatar.startsWith('/') || currentChatPartner.avatar.startsWith('http'))) ? currentChatPartner.avatar : '/images/resource/default-avatar.png')
                  }
                  alt="avatar"
                  className="rounded-circle user_img_msg small-avatar"
                />
                <div className="name small-name">
                  {isMyMessage
                    ? (currentUserFullName || 'You')
                    : (currentChatPartner.name)}
                  <span className="msg_time small-time">{timeToDisplay}</span>
                </div>
              </div>
              <div className="msg_cotainer">
                {msg.messageText}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {/* End .card-body */}

      <div className="card-footer">
        <div className="form-group mb-0">
          <form onSubmit={handleSendMessage} style={{ display: "flex" }}>
            <textarea
              className="form-control type_msg"
              placeholder="Type a message..."
              required
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              style={{ flexGrow: 1, marginRight: "10px" }}
            ></textarea>
            <button
              type="submit"
              className="theme-btn btn-style-one submit-btn"
              style={{ position: "static", height: "auto", pointerEvents: "auto", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px', background: 'none', border: 'none' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#1890ff" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
      {/* End .card-footer */}

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
 