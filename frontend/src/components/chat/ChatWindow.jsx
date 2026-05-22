import { useState, useEffect, useRef } from 'react';
import API from '../../services/api';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { User, X, Briefcase, Mail, GraduationCap, MessageCircle } from 'lucide-react';

const ChatWindow = ({ user: otherUser, currentUser, onClose, socket }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageIdsRef = useRef(new Set()); // Track message IDs to prevent duplicates

  useEffect(() => {
    if (otherUser) {
      fetchMessages();
    }
  }, [otherUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    // Remove existing listeners to prevent duplicates
    socket.off('new-message');
    socket.off('user-typing');

    // Listen for new messages
    socket.on('new-message', (data) => {
      // Prevent duplicate messages
      if (data.senderId === otherUser?.id && !messageIdsRef.current.has(data.id)) {
        messageIdsRef.current.add(data.id);
        setMessages(prev => [...prev, {
          id: data.id,
          senderId: data.senderId,
          receiverId: currentUser.id,
          message: data.message,
          createdAt: data.createdAt,
          isRead: false
        }]);
      }
    });

    // Listen for typing indicator
    socket.on('user-typing', (data) => {
      if (data.userId === otherUser?.id) {
        setIsTyping(data.isTyping);
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        if (data.isTyping) {
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 2000);
        }
      }
    });

    return () => {
      socket.off('new-message');
      socket.off('user-typing');
    };
  }, [socket, otherUser, currentUser.id]);

  const fetchMessages = async () => {
    try {
      const response = await API.get(`/chat/conversation/${otherUser.id}`);
      const fetchedMessages = response.data.data.messages;
      
      // Clear the message IDs set and add new ones
      messageIdsRef.current.clear();
      fetchedMessages.forEach(msg => messageIdsRef.current.add(msg.id));
      
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (messageText) => {
    if (!messageText.trim() || !otherUser || sending || !socket) return;

    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      senderId: currentUser.id,
      receiverId: otherUser.id,
      message: messageText,
      createdAt: new Date().toISOString(),
      isRead: false,
      isTemp: true,
    };

    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();

    const cleanupListeners = () => {
      socket.off('message-sent', handleMessageSent);
      socket.off('message-error', handleMessageError);
    };

    const handleMessageSent = (data) => {
      if (data?.success && data.data) {
        const newMessage = data.data;
        setMessages(prev => prev.map(msg =>
          msg.id === tempId ? newMessage : msg
        ));
        messageIdsRef.current.add(newMessage.id);
      } else {
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
      }
      cleanupListeners();
      setSending(false);
    };

    const handleMessageError = (data) => {
      console.error('Socket send error:', data?.error);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      cleanupListeners();
      setSending(false);
    };

    socket.once('message-sent', handleMessageSent);
    socket.once('message-error', handleMessageError);

    socket.emit('send-message', {
      senderId: currentUser.id,
      receiverId: otherUser.id,
      message: messageText,
    });
  };

  const handleTyping = (isTypingNow) => {
    socket.emit('typing', {
      senderId: currentUser.id,
      receiverId: otherUser.id,
      isTyping: isTypingNow,
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'entrepreneur': return 'bg-blue-100 text-blue-800';
      case 'investor': return 'bg-green-100 text-green-800';
      case 'mentor': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'entrepreneur': return <Briefcase className="h-4 w-4" />;
      case 'investor': return <Mail className="h-4 w-4" />;
      case 'mentor': return <GraduationCap className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

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
            {otherUser.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="font-semibold text-white">{otherUser.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(otherUser.role)}`}>
              <span className="flex items-center">
                {getRoleIcon(otherUser.role)}
                <span className="ml-1 capitalize">{otherUser.role}</span>
              </span>
            </span>
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
            <p className="text-sm text-gray-400">Send a message to start the conversation</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === currentUser?.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 rounded-full px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        disabled={sending}
      />
    </div>
  );
};

export default ChatWindow;