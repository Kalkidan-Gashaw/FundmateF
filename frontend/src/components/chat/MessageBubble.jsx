import React, { useState, useRef, useEffect } from "react";
import { FileText, Download, Image, File, MoreVertical, Edit, Trash2, Copy, Share, Check, X, AlertTriangle } from "lucide-react";
import API from "../../services/api";

const MessageBubble = React.memo(({ message, isOwn, onEdit, onDelete, onCopy, onForward }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.message);
  const [showCopied, setShowCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith("image/")) return <Image className="h-8 w-8 text-blue-500" />;
    return <FileText className="h-8 w-8 text-blue-500" />;
  };

  const handleDownload = async () => {
    try {
      const response = await API.get(`/chat/download/${message.id}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", message.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== message.message) {
      onEdit(message.id, editText);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(message.message);
  };

  const handleCopy = async () => {
    const textToCopy = message.message || message.fileName;
    await navigator.clipboard.writeText(textToCopy);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
    onCopy?.(message);
    setShowMenu(false);
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    onDelete(message.id);
    setShowDeleteModal(false);
  };

  const handleForward = () => {
    onForward(message);
    setShowMenu(false);
  };

  const isFileMessage = message.fileUrl;

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => {
    if (!showDeleteModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Message</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this message?<br />
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete Message
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // If editing, show edit input
  if (isEditing && !isFileMessage) {
    return (
      <>
        <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
          <div className="max-w-[70%]">
            <div className="bg-white rounded-2xl border border-blue-300 p-2 shadow-lg">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Save
                </button>
              </div>
            </div>
            <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mt-1`}>
              <span className="text-xs text-gray-400">Editing...</span>
            </div>
          </div>
        </div>
        <DeleteConfirmationModal />
      </>
    );
  }

  return (
    <>
      <div className={`group flex ${isOwn ? "justify-end" : "justify-start"} mb-4 message-wrapper`}>
        <div className={`max-w-[70%] relative ${isOwn ? "order-1" : "order-2"}`}>
          {!isOwn && (
            <div className="flex items-center mb-1 ml-1">
              <span className="text-xs font-medium text-gray-600">
                {message.sender?.name || "User"}
              </span>
            </div>
          )}
          
          {/* Message Menu Button - Always visible on hover for own messages */}
          {isOwn && !isFileMessage && (
            <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Message Menu Dropdown */}
          {showMenu && isOwn && !isFileMessage && (
            <>
              {/* Backdrop to close menu when clicking elsewhere */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowMenu(false)}
              />
              <div
                ref={menuRef}
                className="absolute -left-36 top-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[130px]"
              >
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </button>
                <button
                  onClick={handleForward}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Share className="h-4 w-4" />
                  <span>Forward</span>
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
          
          {/* Message Bubble Content */}
          {isFileMessage ? (
            <div
              className={`p-3 rounded-2xl cursor-pointer ${
                isOwn
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(message.fileType)}
                <div className="flex-1">
                  <p className="text-sm font-medium break-words">{message.fileName}</p>
                  <p className="text-xs opacity-75">{formatFileSize(message.fileSize)}</p>
                </div>
                <button
                  onClick={handleDownload}
                  className={`p-1 rounded-full ${
                    isOwn ? "hover:bg-blue-500" : "hover:bg-gray-200"
                  } transition`}
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`px-4 py-2 rounded-2xl cursor-pointer ${
                isOwn
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
            </div>
          )}
          
          <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mt-1 items-center space-x-1`}>
            <span className="text-xs text-gray-400">{formatTime(message.createdAt)}</span>
            {isOwn && message.isRead && (
              <span className="text-xs text-blue-500">✓ Read</span>
            )}
            {isOwn && !message.isRead && (
              <span className="text-xs text-gray-400">✓ Sent</span>
            )}
            {showCopied && (
              <span className="text-xs text-green-500 flex items-center">
                <Check className="h-3 w-3 mr-1" /> Copied!
              </span>
            )}
          </div>
        </div>
      </div>
      <DeleteConfirmationModal />
    </>
  );
});

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;