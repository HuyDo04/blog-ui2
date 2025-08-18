import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faStop, faXmark, faExpand, faMinimize } from "@fortawesome/free-solid-svg-icons";    
import {
  createConversation,
  sendMessage,
  getMessages,
  closeConversation,
  stopRequest,
} from "@/services/chatbot.service";
import styles from "./Chatbot.module.scss";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false); // ✅ state mới
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Luôn scroll xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mở chat và tạo conversation
  const handleOpenChat = async () => {
    setIsOpen(true);
    try {
      const conv = await createConversation();
      setConversationId(conv.id);

      const history = await getMessages(conv.id);
      setMessages(Array.isArray(history) ? history : []);
    } catch (err) {
      console.error("Error creating conversation:", err);
    }
  };

  // Gửi tin nhắn
  const handleSend = async () => {
    if (!input.trim() || !conversationId || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const botMessage = await sendMessage(conversationId, { message: input });
      if (botMessage) {
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  // Dừng request hiện tại
  const handleStop = () => {
    stopRequest();
    setLoading(false);
  };

  // Đóng chat và reset state
  const handleClose = async () => {
    if (conversationId) {
      try {
        await closeConversation(conversationId);
      } catch (err) {
        console.error("Error closing conversation:", err);
      }
    }
    setIsOpen(false);
    setConversationId(null);
    setMessages([]);
    setIsMaximized(false);
  };

  return (
    <div className={styles.chatbotContainer}>
      {!isOpen ? (
        <button onClick={handleOpenChat} className={styles.openBtn}>
          Chat
        </button>
      ) : (
        <div className={`${styles.chatbotBox} ${isMaximized ? styles.maximized : ""}`}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <h2>Chatbot</h2>
            <div className={styles.headerActions}>
              <button onClick={() => setIsMaximized(!isMaximized)} className={styles.toggleSizeBtn}>
                <FontAwesomeIcon icon={isMaximized ? faMinimize : faExpand} />
              </button>
              <button onClick={handleClose} className={styles.endBtn}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className={styles.chatMessages}>
            {Array.isArray(messages) && messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`${styles.message} ${
                    msg.role === "user" ? styles.userMsg : styles.botMsg
                  }`}
                >
                  {msg.content}
                </div>
              ))
            ) : (
              <p className={styles.empty}>Bạn có muốn hỏi gì không? </p>
            )}

            {loading && (
              <div className={styles.sending}>
                <div></div>
                <div></div>
                <div></div>
              </div>
            )}

            <div ref={messagesEndRef} />  
          </div>

          {/* Input */}
          <div className={styles.chatInput}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className={styles.inputBox}
              placeholder="Type a message..."
            />

            {!loading ? (
              <button onClick={handleSend} className={styles.sendBtn}>
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            ) : (
              <button onClick={handleStop} className={styles.stopBtn}>
                <FontAwesomeIcon icon={faStop} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
