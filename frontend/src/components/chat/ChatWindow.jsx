import { useState, useEffect, useRef, useCallback } from "react";
import API from "../../services/api";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { User, X, Briefcase, Mail, GraduationCap, MessageCircle } from "lucide-react";

const ChatWindow = ({ user: otherUser, currentUser, onClose, socket }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [forwardMessage, setForwardMessage] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [contacts, setContacts] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageIdsRef = useRef(new Set());

  const normalizeMessageId = (id) => id?.toString();

  const deduplicateMessages = (msgs) => {
    return msgs.filter((msg, index, self) =>
      self.findIndex((m) => normalizeMessageId(m.id) === normalizeMessageId(msg.id)) === index
    );
  };

  useEffect(() => {
    if (otherUser) {
      fetchMessages();
      fetchContacts();
    }
  }, [otherUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket || !otherUser) return;

    const handleNewMessage = (data) => {
      if (normalizeMessageId(data.senderId) === normalizeMessageId(otherUser.id)) {
        const normalizedId = normalizeMessageId(data.id);
        if (!messageIdsRef.current.has(normalizedId)) {
          messageIdsRef.current.add(normalizedId);
          setMessages(prev => {
            if (prev.some(msg => normalizeMessageId(msg.id) === normalizedId)) return prev;
            return [...prev, data];
          });
        }
      }
    };

    const handleMessageDeleted = (data) => {
      if (data.messageId) {
        const normalizedId = normalizeMessageId(data.messageId);
        setMessages(prev => prev.filter(msg => normalizeMessageId(msg.id) !== normalizedId));
        messageIdsRef.current.delete(normalizedId);
      }
    };

    const handleMessageEdited = (data) => {
      if (data.messageId && data.newMessage) {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId ? { ...msg, message: data.newMessage, isEdited: true } : msg
        ));
      }
    };

    socket.on("new-message", handleNewMessage);
    socket.on("message-deleted", handleMessageDeleted);
    socket.on("message-edited", handleMessageEdited);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("message-deleted", handleMessageDeleted);
      socket.off("message-edited", handleMessageEdited);
    };
  }, [socket, otherUser]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/chat/conversation/${otherUser.id}`);
      const fetchedMessages = response.data.data.messages || [];
      const uniqueMessages = deduplicateMessages(fetchedMessages);
      messageIdsRef.current.clear();
      uniqueMessages.forEach(msg => messageIdsRef.current.add(normalizeMessageId(msg.id)));
      setMessages(uniqueMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await API.get("/chat/conversations");
      setContacts(response.data.data.map(c => c.user));
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = useCallback(async (messageText) => {
    if (!messageText.trim() || !otherUser || sending) return;

    setSending(true);
    
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const tempMessage = {
      id: tempId,
      senderId: currentUser.id,
      receiverId: otherUser.id,
      message: messageText,
      createdAt: new Date().toISOString(),
      isRead: false,
      isTemp: true
    };
    
    messageIdsRef.current.add(normalizeMessageId(tempId));
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();
    
    try {
      const response = await API.post("/chat/send", {
        receiverId: otherUser.id,
        message: messageText,
      });

      const newMessage = response.data.data;
      const normalizedNewId = normalizeMessageId(newMessage.id);
      messageIdsRef.current.add(normalizedNewId);
      
      setMessages(prev => {
        const withoutTemp = prev.filter(msg => msg.id !== tempId);
        if (withoutTemp.some(msg => normalizeMessageId(msg.id) === normalizedNewId)) {
          return withoutTemp;
        }
        return [...withoutTemp, newMessage];
      });
      
      socket.emit("send-message", {
        senderId: currentUser.id,
        receiverId: otherUser.id,
        message: messageText,
        id: newMessage.id,
        createdAt: newMessage.createdAt,
      });
      
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    } finally {
      setSending(false);
    }
  }, [otherUser, currentUser.id, sending, socket]);

  const handleEditMessage = async (messageId, newMessage) => {
    try {
      const response = await API.put(`/chat/message/${messageId}`, { message: newMessage });
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, message: newMessage, isEdited: true } : msg
      ));
      
      socket.emit("edit-message", {
        messageId,
        newMessage,
        senderId: currentUser.id,
        receiverId: otherUser.id,
      });
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await API.delete(`/chat/message/${messageId}`);
      
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      messageIdsRef.current.delete(messageId);
      
      socket.emit("delete-message", {
        messageId,
        senderId: currentUser.id,
        receiverId: otherUser.id,
      });
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleCopyMessage = (message) => {
    console.log("Message copied:", message);
  };

  const handleForwardMessage = (message) => {
    setForwardMessage(message);
    setShowForwardModal(true);
  };

  const handleSendForward = async (selectedUserId) => {
    if (!forwardMessage) return;
    
    try {
      await API.post("/chat/send", {
        receiverId: selectedUserId,
        message: `[Forwarded] ${forwardMessage.message}`,
      });
      
      setShowForwardModal(false);
      setForwardMessage(null);
    } catch (error) {
      console.error("Error forwarding message:", error);
    }
  };

  const handleSendFile = useCallback(async (formData) => {
    if (!otherUser || uploading) return;

    setUploading(true);
    
    formData.append("receiverId", otherUser.id);
    
    try {
      const response = await API.post("/chat/send-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newMessage = response.data.data;
      messageIdsRef.current.add(newMessage.id);
      
      setMessages(prev => [...prev, newMessage]);
      scrollToBottom();
      
      socket.emit("send-message", {
        senderId: currentUser.id,
        receiverId: otherUser.id,
        message: `📎 ${newMessage.fileName}`,
        id: newMessage.id,
        createdAt: newMessage.createdAt,
      });
      
    } catch (error) {
      console.error("Error sending file:", error);
    } finally {
      setUploading(false);
    }
  }, [otherUser, uploading, currentUser.id, socket]);

  const handleTyping = useCallback((isTypingNow) => {
    if (!otherUser) return;
    socket.emit("typing", {
      senderId: currentUser.id,
      receiverId: otherUser.id,
      isTyping: isTypingNow,
    });
  }, [otherUser, currentUser.id, socket]);

  if (!otherUser) {
    return (
      <div className="bg-white rounded-xl shadow-lg h-full flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600">Select a conversation</h3>
          <p className="text-gray-400">Choose someone to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold">
            {otherUser.name?.charAt(0) || "U"}
          </div>
          <div>
            <h3 className="font-semibold text-white">{otherUser.name}</h3>
            <span className="text-xs text-blue-100 capitalize">{otherUser.role}</span>
          </div>
        </div>
        <button onClick={onClose} className="text-white hover:text-gray-200 transition">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No messages yet</p>
            <p className="text-sm text-gray-400">Send a message or share a file to start the conversation</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === currentUser?.id}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
                onCopy={handleCopyMessage}
                onForward={handleForwardMessage}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
        
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 rounded-full px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
        onTyping={handleTyping}
        disabled={sending}
        uploading={uploading}
      />

      {/* Forward Modal */}
      {showForwardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold">Forward to</h3>
              <button onClick={() => setShowForwardModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {contacts.filter(c => c.id !== currentUser.id).map(contact => (
                <button
                  key={contact.id}
                  onClick={() => handleSendForward(contact.id)}
                  className="w-full p-3 flex items-center space-x-3 hover:bg-gray-50 rounded-lg transition"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {contact.name?.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{contact.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{contact.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;