import Image from "next/image";
import ChatHamburger from "./ChatHamburger";
import React, { useState, useEffect, useRef } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { authService } from "../../../../../services/authService";

const ChatBoxContentField = ({ messages, sendMessage, currentChatPartner, currentUserId, currentUserFullName, currentUserProfileImage, partnerOnline }) => {
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

  let partnerIsOnline = partnerOnline;
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
        <div className="d-flex bd-highlight">
          <div className="img_cont">
            <Image
              width={48}
              height={48}
              src={currentChatPartner.avatar || "/images/resource/default-avatar.png"}
              alt="user avatar"
              className="rounded-circle user_img"
            />
          </div>
          <div className="user_info">
            <span>{currentChatPartner.name}</span>
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
      <div className="card-body msg_card_body">
        {messages.map((msg, index) => {
          const parsedTimestamp = msg.sentAt ? new Date(msg.sentAt) : null;
          const timeToDisplay = parsedTimestamp && isValid(parsedTimestamp) ? format(parsedTimestamp, 'HH:mm') : '';
          const isMyMessage = msg.senderId == currentUserId;
          const companyAvatar = authService.getProfileImageCompany() || '/images/resource/company-6.png';
          const companyName = authService.getFullNameCompany() || 'Company';
          return (
            <div key={index} className={`d-flex ${isMyMessage ? 'justify-content-end reply' : 'justify-content-start'} mb-1`} style={{marginBottom: '4px'}}>
              <div className="img_cont_msg">
                <Image
                  width={32}
                  height={32}
                  style={{ width: 32, height: 32, minWidth: 32, minHeight: 32, maxWidth: 32, maxHeight: 32 }}
                  src={
                    isMyMessage
                      ? companyAvatar
                      : (currentChatPartner.avatar || '/images/resource/default-avatar.png')
                  }
                  alt="avatar"
                  className="rounded-circle user_img_msg small-avatar"
                />
                <div className="name small-name">
                  {isMyMessage
                    ? companyName
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
      <style jsx>{`
        .message-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }
        .msg_head {
          flex-shrink: 0;
        }
        .msg_card_body {
          flex-grow: 1;
          overflow-y: auto;
          padding-bottom: 0px;
        }
        .card-footer {
          flex-shrink: 0;
          padding: 15px;
          z-index: 10;
        }
        .form-group {
        }
        .type_msg {
          resize: none;
          min-height: 40px;
          max-height: 1200px;
        }
        .submit-btn {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
          z-index: 11;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 12px;
        }
        .flaticon-send {
          font-size: 20px;
        }
        /* Giảm khoảng cách giữa các message bubble */
        .msg_card_body .d-flex.mb-2 {
          margin-bottom: 4px !important;
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