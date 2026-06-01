import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, File, X, Loader, AlertCircle } from "lucide-react";

const ChatInput = ({ onSendMessage, onTyping, disabled, onSendFile, uploading }) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', 
    '.txt', '.csv', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', 
    '.zip', '.rar', '.mp3', '.wav', '.mp4', '.mpeg'];

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      setIsTyping(false);
      onTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file extension
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (allowedExtensions.includes(ext)) {
        setSelectedFile(file);
        setFileError(null);
      } else {
        setFileError(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setTimeout(() => setFileError(null), 5000);
      }
    }
  };

  const handleSendFile = async () => {
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    
    if (typeof onSendFile === 'function') {
      await onSendFile(formData);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      console.error("onSendFile is not a function");
    }
  };

  const cancelFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      {/* File Error Message */}
      {fileError && (
        <div className="mb-3 p-2 bg-red-50 text-red-700 text-xs rounded-lg flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {fileError}
        </div>
      )}

      {/* File Preview */}
      {selectedFile && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <File className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSendFile}
              disabled={uploading}
              className="p-1 text-green-600 hover:text-green-700"
            >
              {uploading ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
            <button
              onClick={cancelFile}
              className="p-1 text-red-500 hover:text-red-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <div className="relative">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-600 transition rounded-full hover:bg-gray-100"
            disabled={disabled || uploading}
            title="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          {/* Tooltip for allowed files */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
            Allowed: PDF, DOC, XLS, PPT, TXT, CSV, Images, ZIP, MP3, MP4
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.webp,.svg,.zip,.rar,.mp3,.wav,.mp4,.mpeg"
        />
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
      
      {/* Allowed file types hint */}
      <div className="mt-2 text-xs text-gray-400 text-center">
        Supported files: PDF, Word, Excel, PowerPoint, Images, Text, CSV, ZIP, MP3, MP4 (Max 50MB)
      </div>
    </div>
  );
};

export default ChatInput;