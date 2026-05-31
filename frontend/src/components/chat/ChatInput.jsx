import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';

const ChatInput = ({ onSendMessage, onTyping, disabled }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      onTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    
    if (!isTyping && e.target.value) {
      setIsTyping(true);
      onTyping(true);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
    }, 1000);
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex items-center space-x-2">
        <button className="p-2 text-gray-400 hover:text-gray-600 transition rounded-full hover:bg-gray-100">
          <Paperclip className="h-5 w-5" />
        </button>
        <textarea
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={disabled ? "Select a conversation to start chatting" : "Type a message..."}
          disabled={disabled}
          rows="1"
          className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;