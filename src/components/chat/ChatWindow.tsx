'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/store/useAppStore';
import {
  Phone,
  Video,
  MoreVertical,
  Smile,
  Send,
  CheckCheck,
  Check,
  FileText,
  Menu,
  Download,
  UploadCloud,
  Hash,
  Plus,
  Eye,
  Reply,
  Edit2,
  Trash2,
  X,
  AtSign,
} from 'lucide-react';

interface ChatWindowProps {
  currentUser: User;
  chatUser?: User | null;
  usersList?: User[];
  isChatUserOnline?: boolean;
  onBackMobile: () => void;
  onStartCall: (isVideo: boolean) => void;
  onOpenUserProfile?: (user: User) => void;
  onOpenImageLightbox?: (url: string, fileName?: string) => void;
}

export default function ChatWindow({
  currentUser,
  chatUser,
  usersList = [],
  isChatUserOnline = false,
  onBackMobile,
  onStartCall,
  onOpenUserProfile,
  onOpenImageLightbox,
}: ChatWindowProps) {
  // 1. State Management (Zustand)
  const { activeChannelId, activeChannelName, setIsMobileDrawerOpen } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sendersMap, setSendersMap] = useState<Record<string, User>>({});

  // Ticket 7: Edit & Delete Message State
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Ticket 8: Quote Reply State
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);

  // Ticket 8: Mentions Overlay State
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [showMentionOverlay, setShowMentionOverlay] = useState(false);

  // File Upload State & Progress
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState('');

  // Drag and Drop State
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const currentChannelId = activeChannelId || 'general';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isImageFile = (url?: string | null, name?: string | null) => {
    const target = (url || name || '').toLowerCase();
    return (
      /\.(png|jpe?g|webp|gif|svg|bmp)(\?.*)?$/i.test(target) ||
      target.startsWith('data:image/') ||
      target.includes('/image')
    );
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Helper: Trigger Browser Push Notification
  const triggerBrowserPushNotification = (title: string, body: string, iconUrl?: string | null) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: body || 'Anda menerima pesan baru.',
          icon: iconUrl || '/oit_logo.png',
        });
      } catch (err) {
        console.warn('Browser notification trigger error:', err);
      }
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async () => {
    if (!chatUser) return;
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', chatUser.id)
        .eq('receiver_id', currentUser.id)
        .eq('is_read', false);

      setMessages((prev) =>
        prev.map((m) =>
          m.sender_id === chatUser.id && m.receiver_id === currentUser.id
            ? { ...m, is_read: true }
            : m
        )
      );
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  // Fetch profiles for message senders
  const fetchSenderProfiles = async (msgs: Message[]) => {
    const senderIds = Array.from(new Set(msgs.map((m) => m.sender_id).filter(Boolean)));
    if (senderIds.length === 0) return;

    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .in('id', senderIds);

      if (data) {
        const map: Record<string, User> = {};
        data.forEach((u: User) => {
          map[u.id] = u;
        });
        setSendersMap((prev) => ({ ...prev, ...map }));
      }
    } catch (err) {
      console.error('Error fetching sender profiles:', err);
    }
  };

  useEffect(() => {
    setMessages([]);

    async function fetchChannelMessages() {
      try {
        let query = supabase.from('messages').select('*');

        if (chatUser) {
          query = query.or(
            `and(sender_id.eq.${currentUser.id},receiver_id.eq.${chatUser.id}),and(sender_id.eq.${chatUser.id},receiver_id.eq.${currentUser.id})`
          );
        } else {
          query = query.eq('channel_id', currentChannelId);
        }

        const { data, error } = await query
          .order('created_at', { ascending: true })
          .limit(100);

        if (!error && data) {
          const msgs = data as Message[];
          setMessages(msgs);
          await fetchSenderProfiles(msgs);
          if (chatUser) await markMessagesAsRead();
        }
      } catch (err) {
        console.error('Fetch channel messages error:', err);
      } finally {
        setTimeout(scrollToBottom, 100);
      }
    }

    fetchChannelMessages();

    const channelName = chatUser
      ? `dm:${[currentUser.id, chatUser.id].sort().join('_')}`
      : `channel:${currentChannelId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const newMsg = payload.new as Message;

          const belongsToCurrentScope = chatUser
            ? (newMsg.sender_id === currentUser.id && newMsg.receiver_id === chatUser.id) ||
              (newMsg.sender_id === chatUser.id && newMsg.receiver_id === currentUser.id)
            : newMsg.channel_id === currentChannelId || (!newMsg.receiver_id && !newMsg.channel_id);

          if (belongsToCurrentScope) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });

            await fetchSenderProfiles([newMsg]);

            if (newMsg.sender_id !== currentUser.id) {
              const sender = sendersMap[newMsg.sender_id] || chatUser;
              const senderTitle = sender ? (sender.display_name || sender.username) : 'Member Oit';
              triggerBrowserPushNotification(
                `Pesan dari ${senderTitle}`,
                newMsg.content || 'Mengirim lampiran berkas.',
                sender?.avatar_url
              );
            }

            if (chatUser && newMsg.sender_id === chatUser.id) {
              await markMessagesAsRead();
            }

            setTimeout(scrollToBottom, 100);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          const updatedMsg = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser.id, chatUser?.id, currentChannelId, supabase]);

  // Mentions Regex Trigger Check
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMessageText(val);

    const mentionMatch = val.match(/@(\w*)$/);
    if (mentionMatch) {
      setMentionSearch(mentionMatch[1].toLowerCase());
      setShowMentionOverlay(true);
    } else {
      setShowMentionOverlay(false);
      setMentionSearch(null);
    }
  };

  const selectMentionUser = (user: User) => {
    const newText = messageText.replace(/@(\w*)$/, `@${user.username} `);
    setMessageText(newText);
    setShowMentionOverlay(false);
    setMentionSearch(null);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    const contentToSend = messageText.trim();
    const replyToIdToSend = replyingToMessage ? replyingToMessage.id : null;

    setMessageText('');
    setReplyingToMessage(null);
    setShowMentionOverlay(false);

    try {
      const payload: any = {
        content: contentToSend,
        sender_id: currentUser.id,
        receiver_id: chatUser ? chatUser.id : null,
        channel_id: chatUser ? null : currentChannelId,
        reply_to_id: replyToIdToSend,
        is_read: false,
      };

      const { data, error } = await supabase
        .from('messages')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Failed to insert message:', error);
      } else if (data) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data as Message];
        });
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Unexpected error sending message:', err);
    }
  };

  // Ticket 7: Edit Message
  const handleStartEdit = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditText(msg.content || '');
  };

  const handleSaveEdit = async (msgId: string) => {
    if (!editText.trim()) return;

    const newContent = editText.trim();
    setEditingMessageId(null);

    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, content: newContent, is_edited: true } : m))
    );

    try {
      await supabase
        .from('messages')
        .update({ content: newContent, is_edited: true })
        .eq('id', msgId);
    } catch (err) {
      console.error('Edit message error:', err);
    }
  };

  // Ticket 7: Soft Delete Message
  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pesan ini?')) return;

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, is_deleted: true, content: 'Pesan ini telah dihapus' } : m
      )
    );

    try {
      await supabase
        .from('messages')
        .update({ is_deleted: true, content: 'Pesan ini telah dihapus' })
        .eq('id', msgId);
    } catch (err) {
      console.error('Delete message error:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const processSingleFile = async (selectedFile: File) => {
    setIsUploading(true);
    setUploadFileName(selectedFile.name);
    setUploadProgress(20);

    try {
      const fileExt = selectedFile.name.split('.').pop() || 'file';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `${currentUser.id}/${fileName}`;

      setUploadProgress(40);
      let publicUrl = '';

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!uploadError) {
        setUploadProgress(70);
        const { data: publicUrlData } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(filePath);

        publicUrl = publicUrlData?.publicUrl || '';
      }

      if (!publicUrl || uploadError) {
        try {
          publicUrl = await fileToBase64(selectedFile);
        } catch (b64Err) {
          console.error('Base64 conversion failed:', b64Err);
        }
      }

      setUploadProgress(85);
      const fileSizeFormatted = `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;

      const payload = {
        content: selectedFile.name,
        attachment_url: publicUrl,
        file_name: selectedFile.name,
        file_size: fileSizeFormatted,
        sender_id: currentUser.id,
        receiver_id: chatUser ? chatUser.id : null,
        channel_id: chatUser ? null : currentChannelId,
        reply_to_id: replyingToMessage ? replyingToMessage.id : null,
        is_read: false,
      };

      const { data: insertedMsg, error: insertError } = await supabase
        .from('messages')
        .insert([payload])
        .select()
        .single();

      if (!insertError && insertedMsg) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === insertedMsg.id)) return prev;
          return [...prev, insertedMsg as Message];
        });
      }
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadFileName('');
        setReplyingToMessage(null);
        scrollToBottom();
      }, 300);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      await processSingleFile(files[i]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        await processSingleFile(files[i]);
      }
    }
  };

  // Helper Function: Render Text Content with Interactive Clickable Mentions (Custom Contrast for isMe)
  const renderFormattedContent = (content: string, isMe: boolean) => {
    if (!content) return null;

    const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }

      const mentionUsername = match[1];
      const targetUser = usersList.find(
        (u) =>
          u.username.toLowerCase() === mentionUsername.toLowerCase() ||
          (u.display_name && u.display_name.toLowerCase() === mentionUsername.toLowerCase())
      );

      parts.push(
        <span
          key={`mention-${match.index}`}
          onClick={(e) => {
            e.stopPropagation();
            if (targetUser && onOpenUserProfile) {
              onOpenUserProfile(targetUser);
            }
          }}
          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-extrabold cursor-pointer border transition-all mx-0.5 shadow-sm ${
            isMe
              ? 'bg-white/25 hover:bg-white/40 text-white border-white/40'
              : 'bg-[#FF5C00]/30 hover:bg-[#FF5C00]/50 text-[#FF5C00] hover:text-white border-[#FF5C00]/50'
          }`}
        >
          @{mentionUsername}
        </span>
      );

      lastIndex = mentionRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  };

  const currentTitle = chatUser
    ? (chatUser.display_name || chatUser.username)
    : `# ${activeChannelName}`;

  // Filter mention users list
  const filteredMentionUsers = usersList.filter((u) => {
    if (!mentionSearch) return true;
    const name = (u.display_name || u.username).toLowerCase();
    return name.includes(mentionSearch);
  });

  const myUsernameTag = currentUser.username.toLowerCase();
  const myDisplayNameTag = (currentUser.display_name || '').toLowerCase();

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex-1 h-full bg-[#121215] flex flex-col relative overflow-hidden select-none w-full"
    >
      {/* Drag & Drop Visual Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-[#000000]/90 backdrop-blur-md border-4 border-dashed border-[#FF5C00] m-3 rounded-3xl flex flex-col items-center justify-center pointer-events-none animate-pulse">
          <div className="w-16 h-16 bg-[#FF5C00]/20 rounded-full flex items-center justify-center mb-3 shadow-xl shadow-[#FF5C00]/30">
            <UploadCloud className="w-8 h-8 text-[#FF5C00]" />
          </div>
          <h3 className="text-lg font-extrabold text-white">Lepaskan File di Sini</h3>
          <p className="text-xs text-zinc-400 mt-1">
            File akan otomatis diunggah ke <span className="text-[#FF5C00] font-bold">{currentTitle}</span>
          </p>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="px-4 md:px-5 py-3 bg-[#121215] border-b border-zinc-800/80 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Mobile Hamburger Drawer Toggle Button */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            title="Open Channels Menu"
            className="md:hidden p-2 text-zinc-300 hover:text-white rounded-xl bg-[#1c1c21] border border-zinc-800 active:scale-95 transition-all"
          >
            <Menu className="w-5 h-5 text-[#FF5C00]" />
          </button>

          {chatUser ? (
            <div
              onClick={() => onOpenUserProfile && onOpenUserProfile(chatUser)}
              className="relative shrink-0 cursor-pointer group"
              title="Lihat Profil Pengguna"
            >
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center font-bold text-xs text-[#FF5C00] group-hover:border-[#FF5C00] transition-colors">
                {chatUser.avatar_url ? (
                  <img src={chatUser.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  chatUser.username[0]?.toUpperCase()
                )}
              </div>
              <div
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#121215] transition-colors ${
                  isChatUserOnline ? 'bg-emerald-500' : 'bg-zinc-600'
                }`}
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
              <Hash className="w-4 h-4 text-zinc-300" />
            </div>
          )}

          <div
            onClick={() => chatUser && onOpenUserProfile && onOpenUserProfile(chatUser)}
            className={`overflow-hidden max-w-[150px] sm:max-w-[240px] md:max-w-xs ${chatUser ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
          >
            <h3 className="text-xs md:text-sm font-bold text-white leading-tight truncate">
              {currentTitle}
            </h3>
            {chatUser && (
              <span
                className={`text-[10px] md:text-[11px] font-medium flex items-center gap-1 mt-0.5 transition-colors ${
                  isChatUserOnline ? 'text-emerald-400' : 'text-zinc-500'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full inline-block ${
                    isChatUserOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'
                  }`}
                />
                {isChatUserOnline ? 'Online' : 'Offline'}
              </span>
            )}
          </div>
        </div>

        {/* Action Call Buttons */}
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => onStartCall(false)}
            title="Voice Call"
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors active:scale-95 cursor-pointer"
          >
            <Phone className="w-4 h-4" />
          </button>

          <button
            onClick={() => onStartCall(true)}
            title="Video Call"
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors active:scale-95 cursor-pointer"
          >
            <Video className="w-4 h-4" />
          </button>

          <button
            title="More Options"
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors active:scale-95 cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message Stream Area */}
      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-4 bg-[#121215]">
        
        {/* Date Separator Pill */}
        <div className="flex justify-center my-2">
          <span className="bg-[#1c1c21] text-zinc-400 text-[10px] font-semibold px-3 py-1 rounded-full border border-zinc-800/60 shadow-sm">
            Today
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser.id;
          const senderProfile = sendersMap[msg.sender_id] || (isMe ? currentUser : chatUser);
          const senderName = isMe
            ? 'You'
            : (senderProfile?.display_name || senderProfile?.username || 'Member');
          const senderAvatar = senderProfile?.avatar_url;
          const senderInitial = (senderProfile?.username || 'U')[0].toUpperCase();

          const attachUrl = msg.attachment_url || msg.file_url || (msg.content?.startsWith('http') || msg.content?.startsWith('data:') ? msg.content : null);
          const isImg = isImageFile(attachUrl, msg.file_name || msg.content);
          const isRead = msg.is_read;

          // Check if message mentions CURRENT USER (Highlight condition)
          const lowerContent = (msg.content || '').toLowerCase();
          const isMentioningMe = !isMe && (
            lowerContent.includes(`@${myUsernameTag}`) ||
            (myDisplayNameTag && lowerContent.includes(`@${myDisplayNameTag}`))
          );

          // Find quoted parent message for Ticket 8
          const parentMsg = msg.reply_to_id ? messages.find((m) => m.id === msg.reply_to_id) : null;
          const parentSender = parentMsg ? sendersMap[parentMsg.sender_id] : null;
          const parentSenderName = parentMsg?.sender_id === currentUser.id ? 'You' : (parentSender?.display_name || parentSender?.username || 'User');

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 group relative p-1.5 rounded-2xl transition-all ${
                isMentioningMe ? 'bg-[#FF5C00]/10 border-l-4 border-[#FF5C00] pl-3' : ''
              } ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Actual Sender Avatar (Clickable to view User Profile) */}
              <div
                onClick={() => senderProfile && onOpenUserProfile && onOpenUserProfile(senderProfile)}
                title={`Lihat Profil @${senderProfile?.username || ''}`}
                className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center text-xs font-bold text-[#FF5C00] shrink-0 mt-0.5 cursor-pointer hover:border-[#FF5C00] transition-colors"
              >
                {senderAvatar ? (
                  <img src={senderAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{senderInitial}</span>
                )}
              </div>

              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[90%] sm:max-w-[80%] md:max-w-[70%] relative`}>
                
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    onClick={() => senderProfile && onOpenUserProfile && onOpenUserProfile(senderProfile)}
                    className="text-[11px] md:text-xs font-bold text-white cursor-pointer hover:underline"
                  >
                    {senderName}
                  </span>
                  <span className="text-[9px] md:text-[10px] text-zinc-500">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {msg.is_edited && !msg.is_deleted && (
                    <span className="text-[9px] text-zinc-500 italic font-medium">(diedit)</span>
                  )}
                </div>

                {/* QUOTED PARENT MESSAGE SNIPPET */}
                {parentMsg && (
                  <div className="mb-1.5 p-2 bg-[#18181c] border-l-2 border-[#FF5C00] rounded-r-xl text-[10px] text-zinc-400 max-w-full overflow-hidden">
                    <span className="font-bold text-[#FF5C00] mr-1">Replying to @{parentSenderName}:</span>
                    <span className="truncate block italic">{parentMsg.is_deleted ? 'Pesan telah dihapus' : (parentMsg.content || 'Attachment')}</span>
                  </div>
                )}

                {/* MESSAGE BUBBLE CONTAINER */}
                <div
                  className={`p-3 rounded-2xl relative shadow-md group/bubble ${
                    isMentioningMe
                      ? 'bg-[#1e1c18] border-2 border-[#FF5C00] text-zinc-100'
                      : isMe
                      ? 'bg-[#FF5C00] text-white rounded-tr-none'
                      : 'bg-[#1c1c21] text-zinc-100 border border-zinc-800/80 rounded-tl-none'
                  }`}
                >
                  {/* HOVER ACTION BAR (Reply, Edit, Delete) */}
                  {!msg.is_deleted && (
                    <div
                      className={`absolute -top-3.5 ${
                        isMe ? 'left-2' : 'right-2'
                      } hidden group-hover:flex items-center gap-1 p-1 bg-[#161619] border border-zinc-800 rounded-xl shadow-lg z-20`}
                    >
                      <button
                        type="button"
                        onClick={() => setReplyingToMessage(msg)}
                        title="Quote Reply"
                        className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <Reply className="w-3.5 h-3.5" />
                      </button>

                      {isMe && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(msg)}
                            title="Edit Pesan"
                            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            title="Hapus Pesan"
                            className="p-1 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* DELETED MESSAGE UI */}
                  {msg.is_deleted ? (
                    <p className="text-xs italic text-zinc-400 font-medium flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Pesan ini telah dihapus</span>
                    </p>
                  ) : editingMessageId === msg.id ? (
                    /* INLINE EDIT INPUT FIELD */
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-3 py-1.5 bg-black/40 border border-white/30 rounded-xl text-xs text-white focus:outline-none"
                      />
                      <div className="flex items-center justify-end gap-2 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setEditingMessageId(null)}
                          className="px-2 py-1 text-zinc-300 hover:text-white font-bold"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(msg.id)}
                          className="px-2.5 py-1 bg-white text-black rounded-lg font-bold hover:bg-zinc-200"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  ) : attachUrl && isImg ? (
                    /* Image Attachment */
                    <div
                      onClick={() => onOpenImageLightbox && onOpenImageLightbox(attachUrl, msg.file_name || msg.content || 'image.png')}
                      className="block cursor-pointer hover:opacity-90 transition-opacity mb-1"
                    >
                      <div className="rounded-xl overflow-hidden max-w-xs sm:max-w-sm border border-white/20 relative group bg-black/40">
                        <img
                          src={attachUrl}
                          alt={msg.file_name || 'Uploaded Image'}
                          className="w-full h-auto object-cover max-h-64 md:max-h-72 rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1.5">
                          <Eye className="w-4 h-4" /> Lihat & Download Gambar
                        </div>
                      </div>
                    </div>
                  ) : attachUrl || msg.file_name ? (
                    /* Document Card */
                    <a
                      href={attachUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={msg.file_name || msg.content || 'attachment'}
                      className="flex items-center gap-2.5 p-2.5 bg-white/15 hover:bg-white/25 rounded-xl border border-white/30 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                    >
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[180px]">
                          {msg.file_name || msg.content || 'Document'}
                        </p>
                        <p className="text-[9px] text-white/80">{msg.file_size || 'Download'}</p>
                      </div>
                      <Download className="w-4 h-4 text-white shrink-0" />
                    </a>
                  ) : (
                    /* Text Content with Interactive Clickable Mentions */
                    <p className="text-xs whitespace-pre-wrap leading-relaxed">
                      {renderFormattedContent(msg.content || '', isMe)}
                    </p>
                  )}

                  {/* Realtime Checkmarks */}
                  {isMe && !msg.is_deleted && (
                    <div className="flex justify-end mt-0.5">
                      {isRead ? (
                        <CheckCheck className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-white/70" />
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Uploading Progress Bar */}
      {isUploading && (
        <div className="px-4 py-1.5 bg-[#121215] border-t border-zinc-800/80">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
            <span className="truncate max-w-[200px]">Uploading {uploadFileName}...</span>
            <span className="font-bold text-[#FF5C00] ml-2">{uploadProgress}%</span>
          </div>
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF5C00] transition-all duration-300 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* QUOTE REPLY PREVIEW BAR */}
      {replyingToMessage && (
        <div className="px-4 py-2 bg-[#18181c] border-t border-zinc-800 flex items-center justify-between z-20 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2 overflow-hidden">
            <Reply className="w-4 h-4 text-[#FF5C00] shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[10px] font-bold text-white block">
                Replying to @{sendersMap[replyingToMessage.sender_id]?.username || 'User'}:
              </span>
              <span className="text-xs text-zinc-400 truncate block">
                {replyingToMessage.content || 'Attachment'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setReplyingToMessage(null)}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MENTIONS OVERLAY DROPDOWN (@username) */}
      {showMentionOverlay && filteredMentionUsers.length > 0 && (
        <div className="mx-4 mb-1 p-2 bg-[#18181c] border border-zinc-800 rounded-2xl shadow-2xl z-30 max-h-40 overflow-y-auto space-y-1 animate-in zoom-in-95 duration-100">
          <div className="px-2 py-1 text-[10px] font-extrabold text-[#FF5C00] uppercase tracking-wider flex items-center gap-1">
            <AtSign className="w-3 h-3" /> Mention Member:
          </div>
          {filteredMentionUsers.map((u) => (
            <div
              key={u.id}
              onClick={() => selectMentionUser(u)}
              className="flex items-center gap-2 p-2 hover:bg-[#242429] rounded-xl cursor-pointer transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center text-[10px] font-bold text-[#FF5C00] shrink-0">
                {u.avatar_url ? (
                  <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  (u.username || 'U')[0].toUpperCase()
                )}
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-white block truncate">{u.display_name || u.username}</span>
                <span className="text-[10px] text-zinc-400 block truncate">@{u.username}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Message Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 md:p-4 bg-[#121215] border-t border-zinc-800/80 flex items-center gap-2 md:gap-3 shrink-0"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-9 h-9 md:w-10 md:h-10 bg-[#1c1c21] hover:bg-[#25252b] text-zinc-400 hover:text-white border border-zinc-800 rounded-full flex items-center justify-center shrink-0 transition-colors active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" />
        </button>

        <div className="flex-1 bg-[#1c1c21] border border-zinc-800 rounded-2xl px-3 md:px-4 py-2 md:py-2.5 flex items-center gap-2 shadow-inner">
          <input
            type="text"
            value={messageText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isUploading}
            placeholder={`Message ${currentTitle}...`}
            className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none font-medium"
          />

          <button
            type="button"
            onClick={() => setMessageText((prev) => prev + ' 😊')}
            className="text-zinc-400 hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <Smile className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleSendMessage}
          disabled={!messageText.trim() || isUploading}
          className="w-9 h-9 md:w-10 md:h-10 bg-[#FF5C00] hover:bg-[#ff701a] text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-[#FF5C00]/25 transition-all disabled:opacity-40 active:scale-95 cursor-pointer"
        >
          <Send className="w-4 h-4 fill-current stroke-[2.5]" />
        </button>
      </form>

    </div>
  );
}
