import { useState, useEffect } from 'react';
import API from '../../services/api';
import { MessageCircle, Users, Mail, Briefcase, GraduationCap, Loader } from 'lucide-react';

const ChatList = ({ onSelectUser, selectedUserId, socket, currentUserRole, currentUserId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllConnections();
  }, [currentUserRole, currentUserId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      // Update conversation list when new message arrives
      fetchAllConnections();
      
      // Play notification sound if not in active chat
      if (selectedUserId !== data.senderId) {
        // Optional: play sound or show browser notification
        console.log('New message from:', data.senderId);
      }
    };

    const handleMessagesRead = (data) => {
      // Update unread count when messages are read
      setConversations(prev => prev.map(conv => 
        conv.user.id === data.byUser 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    };

    socket.on('new-message', handleNewMessage);
    socket.on('messages-read', handleMessagesRead);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('messages-read', handleMessagesRead);
    };
  }, [socket, selectedUserId]);

  const fetchAllConnections = async () => {
    setLoading(true);
    try {
      // Fetch chat conversations
      const chatResponse = await API.get('/chat/conversations');
      const chatData = chatResponse.data.data || [];
      
      let allConversations = [...chatData];
      
      // Add role-specific connections that don't have chat history yet
      if (currentUserRole === 'entrepreneur') {
        // Get accepted mentors
        try {
          const mentorshipResponse = await API.get('/mentor/my-requests');
          const acceptedMentors = mentorshipResponse.data.data || [];
          
          acceptedMentors.forEach(req => {
            if (req.status === 'accepted' || req.status === 'completed') {
              const exists = chatData.some(chat => chat.user?.id === req.mentor?.id);
              if (!exists && req.mentor) {
                allConversations.push({
                  user: {
                    id: req.mentor.id,
                    name: req.mentor.name,
                    email: req.mentor.email,
                    role: 'mentor',
                  },
                  lastMessage: `Start a conversation with your mentor`,
                  lastMessageTime: null,
                  unreadCount: 0,
                  isNew: true,
                });
              }
            }
          });
        } catch (error) {
          console.error('Error fetching mentors:', error);
        }
        
        // Get interested investors (signed NDAs)
        try {
          const investorsResponse = await API.get('/entrepreneur/interested-investors');
          const interestedInvestors = investorsResponse.data.data || [];
          
          interestedInvestors.forEach(investor => {
            const exists = chatData.some(chat => chat.user?.id === investor.id);
            if (!exists) {
              allConversations.push({
                user: {
                  id: investor.id,
                  name: investor.name,
                  email: investor.email,
                  role: 'investor',
                },
                lastMessage: `Investor showed interest in your startup`,
                lastMessageTime: null,
                unreadCount: 0,
                isNew: true,
              });
            }
          });
        } catch (error) {
          console.error('Error fetching investors:', error);
        }
      } 
      else if (currentUserRole === 'mentor') {
        // Get active mentees
        try {
          const menteesResponse = await API.get('/mentor/active-mentees');
          const activeMentees = menteesResponse.data.data || [];
          
          activeMentees.forEach(mentee => {
            const exists = chatData.some(chat => chat.user?.id === mentee.entrepreneur?.id);
            if (!exists && mentee.entrepreneur) {
              allConversations.push({
                user: {
                  id: mentee.entrepreneur.id,
                  name: mentee.entrepreneur.name,
                  email: mentee.entrepreneur.email,
                  role: 'entrepreneur',
                },
                lastMessage: `Start a conversation with your mentee`,
                lastMessageTime: null,
                unreadCount: 0,
                isNew: true,
              });
            }
          });
        } catch (error) {
          console.error('Error fetching mentees:', error);
        }
      }
      else if (currentUserRole === 'investor') {
        // Get connected startups (signed NDAs)
        try {
          const startupsResponse = await API.get('/investor/connected-startups');
          const connectedStartups = startupsResponse.data.data || [];
          
          connectedStartups.forEach(startup => {
            const exists = chatData.some(chat => chat.user?.id === startup.id);
            if (!exists) {
              allConversations.push({
                user: {
                  id: startup.id,
                  name: startup.name,
                  email: startup.email,
                  role: 'entrepreneur',
                },
                lastMessage: `Startup you're interested in`,
                lastMessageTime: null,
                unreadCount: 0,
                isNew: true,
              });
            }
          });
        } catch (error) {
          console.error('Error fetching startups:', error);
        }
      }
      
      // Remove duplicates by user id
      const uniqueConversations = [];
      const seenIds = new Set();
      for (const conv of allConversations) {
        if (conv.user && !seenIds.has(conv.user.id)) {
          seenIds.add(conv.user.id);
          uniqueConversations.push(conv);
        }
      }
      
      // Sort by last message time (most recent first)
      uniqueConversations.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
      });
      
      setConversations(uniqueConversations);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const markConversationAsRead = async (userId) => {
    try {
      await API.put(`/chat/mark-read/${userId}`);
      
      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.user.id === userId 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSelectUser = (user) => {
    onSelectUser(user);
    markConversationAsRead(user.id);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'entrepreneur':
        return <Briefcase className="h-4 w-4 text-blue-500" />;
      case 'investor':
        return <Mail className="h-4 w-4 text-green-500" />;
      case 'mentor':
        return <GraduationCap className="h-4 w-4 text-purple-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'entrepreneur': return 'Entrepreneur';
      case 'investor': return 'Investor';
      case 'mentor': return 'Mentor';
      default: return 'User';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
        <h2 className="text-lg font-bold text-white flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          Messages
        </h2>
        <p className="text-xs text-blue-100 mt-1">
          {currentUserRole === 'entrepreneur' 
            ? 'Chat with mentors and investors' 
            : currentUserRole === 'mentor'
            ? 'Chat with your mentees'
            : 'Chat with entrepreneurs'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No conversations yet</p>
            <p className="text-sm text-gray-400">
              {currentUserRole === 'entrepreneur' 
                ? 'Connect with mentors or investors to start chatting' 
                : currentUserRole === 'mentor'
                ? 'Accept mentorship requests to start chatting'
                : 'Sign NDAs with startups to start chatting'}
            </p>
          </div>
        ) : (
          <>
            {conversations.map((conv) => (
              <button
                key={conv.user.id}
                onClick={() => handleSelectUser(conv.user)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition border-b border-gray-100 ${
                  selectedUserId === conv.user.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      conv.user.role === 'entrepreneur' ? 'bg-blue-600' :
                      conv.user.role === 'investor' ? 'bg-green-600' : 'bg-purple-600'
                    }`}>
                      {conv.user.name?.charAt(0) || 'U'}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium text-gray-900 truncate">{conv.user.name}</span>
                        {getRoleIcon(conv.user.role)}
                      </div>
                      <span className="text-xs text-gray-400">{formatTime(conv.lastMessageTime)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex flex-col">
                        <p className="text-sm text-gray-500 truncate">
                          {conv.lastMessage || `Click to start chatting`}
                        </p>
                        <span className="text-xs text-gray-400 capitalize">
                          {getRoleLabel(conv.user.role)}
                        </span>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-600 font-medium px-2 py-0.5 rounded-full">
                          {conv.unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatList;