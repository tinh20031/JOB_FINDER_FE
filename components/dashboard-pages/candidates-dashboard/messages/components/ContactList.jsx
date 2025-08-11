import Image from "next/image";
import React, { useState } from "react";

const ChatboxContactList = ({
  onContactSelect,
  currentChatPartnerId,
  contacts = [],
  loading = false,
  error = null,
  unreadContactIds = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    try {
      const { formatDistanceToNowStrict, parseISO } = require("date-fns");
      const { enUS } = require("date-fns/locale");
      const date = parseISO(timestamp);
      return formatDistanceToNowStrict(date, { addSuffix: true, locale: enUS });
    } catch {
      return "";
    }
  };

  if (loading)
    return (
      <div className="chat-contacts-container">
        <div className="search-box">
          <div
            className="form-group position-relative"
            style={{ position: "relative" }}
          >
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 15px 10px 40px",
                border: "1px solid #ddd",
                borderRadius: 20,
                fontSize: 14,
                boxSizing: "border-box",
                background: "#fff",
              }}
            />
            <i
              className="flaticon-search"
              style={{
                position: "absolute",
                left: 15,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#999",
                fontSize: 16,
              }}
            />
          </div>
        </div>
        <ul
          className="contacts-list"
          style={{ flexGrow: 1, overflowY: "auto" }}
        >
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 0",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#eee",
                  marginRight: 12,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    width: "60%",
                    height: 14,
                    background: "#eee",
                    borderRadius: 6,
                    marginBottom: 6,
                  }}
                />
                <div
                  style={{
                    width: "40%",
                    height: 12,
                    background: "#f3f3f3",
                    borderRadius: 6,
                  }}
                />
              </div>
            </div>
          ))}
        </ul>
      </div>
    );

  if (error) return <div className="error-message text-danger">{error}</div>;

  return (
    <div className="chat-contacts-container">
      <div className="search-box">
        <div
          className="form-group position-relative"
          style={{ position: "relative" }}
        >
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 15px 10px 40px",
              border: "1px solid #ddd",
              borderRadius: 20,
              fontSize: 14,
              boxSizing: "border-box",
              background: "#fff",
            }}
          />
          <i
            className="flaticon-search"
            style={{
              position: "absolute",
              left: 15,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#999",
              fontSize: 16,
            }}
          />
        </div>
      </div>

      <ul className="contacts-list" style={{ flexGrow: 1, overflowY: "auto" }}>
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <li
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#eee",
                  marginRight: 12,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    width: "60%",
                    height: 14,
                    background: "#eee",
                    borderRadius: 6,
                    marginBottom: 6,
                  }}
                />
                <div
                  style={{
                    width: "40%",
                    height: 12,
                    background: "#f3f3f3",
                    borderRadius: 6,
                  }}
                />
              </div>
            </li>
          ))
        ) : filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => {
            return (
              <li
                key={contact.id}
                className={`contact-item ${
                  contact.id === currentChatPartnerId ? "active" : ""
                } ${unreadContactIds.includes(contact.id) ? "unread" : ""}`}
                onClick={() => onContactSelect(contact.id)}
              >
                <div className="contact-info">
                  <div className="avatar-container">
                    <Image
                      src={
                        contact.avatar &&
                        (contact.avatar.startsWith("/") ||
                          contact.avatar.startsWith("http"))
                          ? contact.avatar
                          : "/images/resource/default-avatar.png"
                      }
                      className="rounded-circle user_img"
                      alt={contact.name}
                      width={60}
                      height={60}
                      style={{
                        objectFit: 'cover',
                        border: '2px solid #e0e0e0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      onError={(e) => {
                        e.target.src = '/images/resource/default-avatar.png';
                      }}
                    />
                    {contact.unreadCount > 0 && (
                      <span className="unread-badge-on-avatar">{contact.unreadCount}</span>
                    )}
                    {unreadContactIds.includes(contact.id) && (
                      <span className="unread-badge"></span>
                    )}
                    {contact.isOnline && (
                      <div style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#4caf50',
                        borderRadius: '50%',
                        border: '3px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }} />
                    )}
                  </div>
                  <div className="message-overview">
                    <div className="name-time">
                      <h4 className="name">{contact.name}</h4>
                      <span className="time">
                        {contact.timestamp ? getTimeAgo(contact.timestamp) : ""}
                      </span>
                      <span
                        className="status-dot"
                        title={contact.isOnline ? "Online" : "Offline"}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: contact.isOnline ? "#4caf50" : "#aaa",
                            marginRight: 4,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            color: contact.isOnline ? "#4caf50" : "#aaa",
                            marginLeft: 2,
                          }}
                        >
                          {contact.isOnline ? "Online" : "Offline"}
                        </span>
                      </span>
                    </div>
                    <p className="last-message-preview">
                      {contact.lastMessageText &&
                      contact.lastMessageText.length > 30
                        ? `${contact.lastMessageText.substring(0, 30)}...`
                        : contact.lastMessageText}
                    </p>
                  </div>
                </div>
              </li>
            );
          })
        ) : (
          <li className="no-contacts">
            <p>No conversations found.</p>
          </li>
        )}
      </ul>

      <style jsx>{`
        .chat-contacts-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background-color: #fff;
          border-right: 1px solid #e0e0e0;
          overflow: hidden;
        }
        .search-box {
          padding: 15px;
          border-bottom: 1px solid #eee;
        }
        .search-box .form-group {
          position: relative;
        }
        .search-box input {
          width: 100%;
          padding: 10px 15px 10px 40px;
          border: 1px solid #ddd;
          border-radius: 20px;
          font-size: 14px;
        }
        .search-box i {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
        }
        .contacts-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .contacts-list li {
          cursor: pointer;
          padding: 10px 15px;
          border-bottom: 1px solid #eee;
          display: flex;
          align-items: center;
        }
        .contacts-list li.active {
          background-color: #e6f0ff;
        }
        .contacts-list li:hover {
          background-color: #f5f5f5;
        }
        .contact-info {
          display: flex;
          align-items: center;
          width: 100%;
        }
        .avatar-container {
          position: relative;
          margin-right: 15px;
        }
        .user_img {
          object-fit: cover;
        }
        .unread-badge-on-avatar {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: #f00;
          color: #fff;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 20px;
          text-align: center;
        }
        .message-overview {
          flex-grow: 1;
          overflow: hidden;
        }
        .name-time {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .name {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .time {
          font-size: 12px;
          color: #999;
          white-space: nowrap;
        }
        .last-message-preview {
          font-size: 14px;
          color: #666;
          margin-bottom: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .contact-position {
          font-size: 12px;
          color: #999;
        }
        .product-image-container {
          margin-left: 10px;
          flex-shrink: 0;
        }
        .no-contacts {
          padding: 20px;
          text-align: center;
          color: #999;
        }
        .contact-item.unread {
          background: #e6f7ff;
          font-weight: bold;
        }
        .unread-badge {
          display: inline-block;
          width: 10px;
          height: 10px;
          background: #1890ff;
          border-radius: 50%;
          margin-left: 8px;
        }
        .status-dot {
          display: flex;
          align-items: center;
          margin-left: 8px;
        }
      `}</style>
    </div>
  );
};

export default ChatboxContactList;