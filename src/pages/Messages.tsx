import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { safeJSONParse } from '@/lib/safeJSON';
import {
  Send,
  MessageCircle,
  Search,
  CheckCheck,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
} from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';
import { StableInput, StableTextarea } from '@/components/StableInputs';

/* ───────────────────── Types ───────────────────── */
interface MockMessage {
  id: number;
  sender: 'me' | 'them';
  content: string;
  time: string;
}

interface MockConversation {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  messages: MockMessage[];
}

/* ───────────────────── Mock Data ───────────────────── */
const defaultConversations: MockConversation[] = [
  {
    id: 1,
    name: 'Amara Okafor',
    avatar: 'AO',
    lastMessage: 'Thanks for the opportunity! When can we schedule the interview?',
    time: '2 min ago',
    unread: 2,
    online: true,
    messages: [
      { id: 1, sender: 'them', content: 'Hi! I saw your application for the Frontend Developer role.', time: '10:30 AM' },
      { id: 2, sender: 'me', content: 'Yes, I am very interested! I have 4 years of React experience.', time: '10:32 AM' },
      { id: 3, sender: 'them', content: 'Great! Your profile looks strong. Would you be available for a call this week?', time: '10:35 AM' },
      { id: 4, sender: 'me', content: 'Absolutely! I am free Tuesday and Thursday afternoon.', time: '10:38 AM' },
      { id: 5, sender: 'them', content: 'Thanks for the opportunity! When can we schedule the interview?', time: '10:40 AM' },
    ],
  },
  {
    id: 2,
    name: 'BongoHive HR',
    avatar: 'BH',
    lastMessage: 'Your application has been shortlisted. Please prepare for a technical assessment.',
    time: '1 hour ago',
    unread: 1,
    online: false,
    messages: [
      { id: 1, sender: 'them', content: 'Thank you for applying to the Senior Frontend Developer position at BongoHive.', time: 'Yesterday' },
      { id: 2, sender: 'me', content: 'Thank you for considering my application!', time: 'Yesterday' },
      { id: 3, sender: 'them', content: 'Your application has been shortlisted. Please prepare for a technical assessment.', time: '1 hour ago' },
    ],
  },
  {
    id: 3,
    name: 'Kofi Mensah',
    avatar: 'KM',
    lastMessage: 'Let me know if you need any clarifications about the project requirements.',
    time: '3 hours ago',
    unread: 0,
    online: true,
    messages: [
      { id: 1, sender: 'me', content: 'Hi Kofi, I came across your profile on Levav.', time: 'Yesterday' },
      { id: 2, sender: 'them', content: 'Hello! Thanks for reaching out. I would love to hear more.', time: 'Yesterday' },
      { id: 3, sender: 'me', content: 'I have a mobile app project that needs a React Native developer.', time: 'Yesterday' },
      { id: 4, sender: 'them', content: 'That sounds perfect for my skill set! I have built 5 production apps.', time: '3 hours ago' },
      { id: 5, sender: 'them', content: 'Let me know if you need any clarifications about the project requirements.', time: '3 hours ago' },
    ],
  },
];

/* ───────────────────── Animation Variants ───────────────────── */
const sidebarItemSlide = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.19, 1, 0.22, 1] },
  }),
};

const messageSlide = {
  hidden: { opacity: 0, y: 10, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: [0.19, 1, 0.22, 1] },
  },
};

/* ───────────────────── Messages Page ───────────────────── */
export default function Messages() {
  const [activeId, setActiveId] = useState<number>(1);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [conversations, setConversations] = useState<MockConversation[]>(() => {
    return safeJSONParse<MockConversation[]>('levav_conversations', defaultConversations);
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { isOffline, queueAction } = useOffline();

  // Persist conversations to localStorage
  useEffect(() => {
    localStorage.setItem('levav_conversations', JSON.stringify(conversations));
  }, [conversations]);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? conversations[0];

  // Compute total unread count
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  // Auto-scroll to bottom on conversation change or new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeId, activeConversation?.messages?.length]);

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle send
  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;

    // If offline, queue the message for later sync
    if (isOffline) {
      queueAction({
        type: 'message',
        data: {
          conversationId: activeId,
          content: text,
          conversationName: activeConversation?.name || '',
        },
      });
      // Still show the message locally for UX
      const newMsg: MockMessage = {
        id: Date.now(),
        sender: 'me',
        content: text + ' (pending — offline)',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeId
            ? {
                ...conv,
                messages: [...conv.messages, newMsg],
                lastMessage: text + ' (pending — offline)',
                time: 'Just now',
              }
            : conv
        )
      );
      setInputValue('');
      inputRef.current?.focus();
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }

    const newMsg: MockMessage = {
      id: Date.now(),
      sender: 'me',
      content: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeId
          ? {
              ...conv,
              messages: [...conv.messages, newMsg],
              lastMessage: text,
              time: 'Just now',
            }
          : conv
      )
    );

    setInputValue('');
    inputRef.current?.focus();

    // Scroll to bottom after send
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, [inputValue, activeId]);

  // Handle enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Select conversation
  const handleSelectConversation = (id: number) => {
    setActiveId(id);
    setShowMobileChat(true);
    // Mark as read
    setConversations((prev) =>
      prev.map((conv) => (conv.id === id ? { ...conv, unread: 0 } : conv))
    );
  };

  return (
    <div className="min-h-[calc(100dvh-72px)] bg-midnight flex">
      {/* ─── Left Sidebar ─── */}
      <aside
        className={`w-full sm:w-[320px] lg:w-[360px] flex-shrink-0 border-r border-white/[0.06] flex flex-col bg-black/40 backdrop-blur-xl ${
          showMobileChat ? 'hidden sm:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-white text-lg font-semibold font-display">Messages</h1>
              {totalUnread > 0 && (
                <span className="bg-[#C6FF34] text-black text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                  {totalUnread}
                </span>
              )}
            </div>
            <button className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.06] transition-colors">
              <MessageCircle className="w-4 h-4 text-[#A0A0A0]" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
            <StableInput
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-[#666666] focus:outline-none focus:border-[#C6FF34]/30 transition-colors text-sm"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {filteredConversations.map((conv, i) => (
              <motion.button
                key={conv.id}
                custom={i}
                variants={sidebarItemSlide}
                initial="hidden"
                animate="visible"
                onClick={() => handleSelectConversation(conv.id)}
                className={`w-full flex items-start gap-3 p-4 text-left transition-all border-b border-white/[0.03] ${
                  activeId === conv.id
                    ? 'bg-[#C6FF34]/5 border-l-2 border-l-[#C6FF34]'
                    : 'hover:bg-white/[0.02] border-l-2 border-l-transparent'
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0 self-start">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold ${
                      activeId === conv.id
                        ? 'bg-gradient-to-br from-[#C6FF34] to-[#7E3BED] text-black'
                        : 'bg-white/[0.06] text-[#A0A0A0]'
                    }`}
                  >
                    {conv.avatar}
                  </div>
                  {conv.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#C6FF34] rounded-full border-2 border-black" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-white text-sm font-medium truncate">{conv.name}</span>
                    <span className="text-[#666666] text-xs flex-shrink-0 ml-2">{conv.time}</span>
                  </div>
                  <p className="text-[#666666] text-xs truncate">{conv.lastMessage}</p>
                </div>

                {/* Unread Badge */}
                {conv.unread > 0 && (
                  <span className="flex-shrink-0 self-center bg-[#C6FF34] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </motion.button>
            ))}
          </AnimatePresence>

          {filteredConversations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-8 h-8 text-[#666666] mb-3" />
              <p className="text-[#666666] text-sm">No conversations found</p>
            </div>
          )}
        </div>
      </aside>

      {/* ─── Right Chat Panel ─── */}
      <main
        className={`flex-1 flex flex-col min-w-0 ${
          showMobileChat ? 'flex' : 'hidden sm:flex'
        }`}
      >
        {/* Chat Header */}
        <div className="h-16 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 border-b border-white/[0.06] bg-white/[0.01] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {/* Mobile back button */}
            <button
              onClick={() => setShowMobileChat(false)}
              className="sm:hidden w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 text-[#A0A0A0]" />
            </button>

            {/* Avatar */}
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C6FF34] to-[#7E3BED] flex items-center justify-center text-xs font-bold text-black">
                {activeConversation?.avatar}
              </div>
              {activeConversation?.online && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#C6FF34] rounded-full border-2 border-black" />
              )}
            </div>

            {/* Name */}
            <div>
              <p className="text-white text-sm font-medium">{activeConversation?.name}</p>
              <p className="text-[#666666] text-xs">
                {activeConversation?.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.06] transition-colors">
              <Phone className="w-4 h-4 text-[#A0A0A0]" />
            </button>
            <button className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.06] transition-colors">
              <Video className="w-4 h-4 text-[#A0A0A0]" />
            </button>
            <button className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.06] transition-colors">
              <MoreVertical className="w-4 h-4 text-[#A0A0A0]" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
          <AnimatePresence>
            {activeConversation?.messages?.map((msg, i) => {
              const isOwn = msg.sender === 'me';
              return (
                <motion.div
                  key={msg.id}
                  variants={messageSlide}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: i * 0.03 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] md:max-w-[65%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar (only show for other person's messages) */}
                    {!isOwn && (
                      <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-[10px] font-bold text-[#A0A0A0] flex-shrink-0 mb-1">
                        {activeConversation?.avatar}
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isOwn
                          ? 'bg-[#C6FF34]/15 text-white border border-[#C6FF34]/20 rounded-br-md'
                          : 'bg-white/[0.05] text-white/90 border border-white/[0.06] rounded-bl-md'
                      }`}
                    >
                      {msg.content}
                      <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[#666666] text-[10px]">{msg.time}</span>
                        {isOwn && (
                          <CheckCheck className="w-3 h-3 text-[#C6FF34]" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 pb-6 sm:pb-4 border-t border-white/[0.06] bg-white/[0.01] backdrop-blur-xl">
          <div className="flex items-end gap-3">
            <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-end transition-colors focus-within:border-[#C6FF34]/30">
              <StableTextarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 bg-transparent text-white text-sm placeholder-[#666666] px-4 py-3 resize-none focus:outline-none max-h-[120px] min-h-[44px]"
                style={{ scrollbarWidth: 'thin' }}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                inputValue.trim()
                  ? 'bg-[#C6FF34] text-black hover:bg-[#d4ff5c]'
                  : 'bg-white/[0.05] text-[#666666]'
              }`}
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
          <p className="text-[#666666] text-[10px] mt-2 px-1">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </main>
    </div>
  );
}
