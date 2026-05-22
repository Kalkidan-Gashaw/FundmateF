const MessageBubble = ({ message, isOwn }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-1' : 'order-2'}`}>
        {!isOwn && (
          <div className="flex items-center mb-1 ml-1">
            <span className="text-xs font-medium text-gray-600">
              {message.sender?.name || 'User'}
            </span>
          </div>
        )}
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
        </div>
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mt-1`}>
          <span className="text-xs text-gray-400">{formatTime(message.createdAt)}</span>
          {isOwn && message.isRead && (
            <span className="text-xs text-blue-500 ml-1">✓ Read</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;