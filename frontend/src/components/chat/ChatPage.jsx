import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { useSocket } from '../../hooks/useSocket';
import { MessageCircle, ArrowLeft } from 'lucide-react';

const ChatPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);

  const { socket, isConnected } = useSocket(currentUser?.id);

  // Check for pre-selected user from URL params
  useEffect(() => {
    const userId = searchParams.get('userId');
    const userName = searchParams.get('name');
    const userRole = searchParams.get('role');
    
    if (userId && userName) {
      setSelectedUser({
        id: userId,
        name: decodeURIComponent(userName),
        role: userRole || 'user'
      });
      if (isMobileView) {
        setShowChat(true);
      }
    }
  }, [searchParams, isMobileView]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    setCurrentUser(JSON.parse(userData));
    setLoading(false);
    
    // Check if mobile view
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    if (isMobileView) {
      setShowChat(true);
    }
  };

  const handleBackToList = () => {
    setShowChat(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        {/* <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Dashboard
        </button> */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <MessageCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-1">
              {currentUser.role === 'entrepreneur' 
                ? 'Connect with mentors and investors' 
                : currentUser.role === 'mentor'
                ? 'Chat with your mentees'
                : 'Connect with entrepreneurs'}
            </p>
            {!isConnected && (
              <p className="text-yellow-600 text-sm mt-1 flex items-center">
                <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                Connecting to chat server...
              </p>
            )}
            {isConnected && (
              <p className="text-green-600 text-sm mt-1 flex items-center">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Connected
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[70vh] min-h-[500px]">
        <div className="flex h-full">
          {/* Chat List - Hide on mobile when chat is open */}
          {(!isMobileView || !showChat) && (
            <div className={`${isMobileView ? 'w-full' : 'w-1/3'} border-r border-gray-200`}>
              <ChatList
                onSelectUser={handleSelectUser}
                selectedUserId={selectedUser?.id}
                socket={socket}
                currentUserRole={currentUser.role}
                currentUserId={currentUser.id}
              />
            </div>
          )}
          
          {/* Chat Window */}
          {(!isMobileView || showChat) && (
            <div className={`${isMobileView ? 'w-full' : 'w-2/3'} relative`}>
              {isMobileView && showChat && (
                <button
                  onClick={handleBackToList}
                  className="absolute top-4 left-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition z-20"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
              )}
              <ChatWindow
                user={selectedUser}
                currentUser={currentUser}
                onClose={() => {
                  setSelectedUser(null);
                  setShowChat(false);
                }}
                socket={socket}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-700">
          💡 <span className="font-medium">Tip:</span> You can start a conversation by clicking on any mentor, investor, or entrepreneur from your dashboard. All messages are real-time and secure.
        </p>
      </div>
    </div>
  );
};

export default ChatPage;