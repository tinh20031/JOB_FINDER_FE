import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import messageService from "@/services/messageService";
import { authService } from "@/services/authService";
import { useSelector } from "react-redux";

const Contact = ({
  companyId,
  jobId,
  companyName,
  industry,
  urlCompanyLogo,
}) => {
  const router = useRouter();
  const { user, token } = useSelector((state) => state.auth);
  const [isModalOpen, setModalOpen] = useState(false);
  const [messageText, setMessageText] = useState(""); // Start with an empty message
  const [error, setError] = useState("");

  const openModal = (e) => {
    e.preventDefault();
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setError("");
    setMessageText(""); // Reset message on close
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      setError("Message cannot be empty.");
      return;
    }
    setError("");

    // Get userId from Redux, fallback to authService
    const userId =
      user?.id ||
      user?.userId ||
      authService.getStoredUser()?.id ||
      authService.getStoredUser()?.userId;
    if (!userId) {
      setError("You must be logged in");
      return;
    }

    const payload = {
      senderId: Number(userId),
      receiverId: Number(companyId),
      relatedJobId: Number(jobId),
      messageText: messageText.trim(),
    };

    try {
      await messageService.sendMessage(payload);
      closeModal();
      router.push(
        `/candidates-dashboard/messages?companyId=${companyId}&jobId=${jobId}`
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message. Please try again.");
    }
  };

  return (
    <>
      <form onSubmit={openModal}>
        <div className="row clearfix">
          <div className="col-lg-12 col-md-12 col-sm-12 form-group">
            <button
              className="theme-btn btn-style-one"
              type="submit"
              name="submit-form"
            >
              Send Message
            </button>
          </div>
        </div>
      </form>

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "10px",
            zIndex: 1100,
          }}
        >
          <div
            style={{
              width: "360px",
              height: "auto",
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "12px 15px",
                borderBottom: "1px solid #e5e5e5",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={urlCompanyLogo || "/images/resource/default-avatar.png"}
                  alt="company logo"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    marginRight: "10px",
                    objectFit: "cover",
                  }}
                />
                <div>
                  <h5
                    style={{ margin: 0, fontSize: "15px", fontWeight: "600" }}
                  >
                    {companyName || "Contact Employer"}
                  </h5>
                  <p style={{ margin: 0, fontSize: "13px", color: "#65676b" }}>
                    {industry || "Replies instantly"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "20px",
                  color: "#606770",
                }}
              >
                &times;
              </button>
            </div>

            {/* Body is removed to eliminate the large empty space */}

            {/* Footer with Input */}
            <div
              style={{ padding: "10px 15px", borderTop: "1px solid #e5e5e5" }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <textarea
                  style={{
                    flexGrow: 1,
                    border: "1px solid #ddd",
                    borderRadius: "18px",
                    padding: "4px 15px",
                    height: "40px !important",
                    minHeight: "100px",
                    boxSizing: "border-box",
                    resize: "none",
                    fontSize: "15px",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Enter Message..."
                />
                <button
                  onClick={handleSendMessage}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  <svg height="24px" width="24px" viewBox="0 0 24 24">
                    <path
                      fill="#007bff"
                      d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                    ></path>
                  </svg>
                </button>
              </div>
              {error && (
                <div
                  style={{
                    color: "#dc3545",
                    paddingTop: "8px",
                    fontSize: "13px",
                    textAlign: "center",
                  }}
                >
                  {error}
                </div>
              )}
            </div>
          </div>
          {/* Chat bubble tail */}
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: "#fff",
              position: "absolute",
              bottom: "-10px",
              right: "20px",
              transform: "rotate(45deg)",
              boxShadow: "5px 5px 10px rgba(0,0,0,0.1)",
            }}
          ></div>
        </div>
      )}
    </>
  );
};

export default Contact;