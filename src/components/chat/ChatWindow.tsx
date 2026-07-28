'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Room, Message, UserProfile } from '@/types';
import { createClient } from '@/lib/supabase/client';
import {
  Send,
  Paperclip,
  Phone,
  Video,
  Check,
  CheckCheck,
  CornerUpLeft,
  Trash2,
  Copy,
  Share2,
  X,
  FileText,
  Flame,
  ArrowLeft,
  MoreVertical,
} from 'lucide-react';

interface ChatWindowProps {
  room: Room;
  currentProfile: UserProfile;
  onBackMobile: () => void;
  onStartCall: (isVideo: boolean) => void;
}

export default function ChatWindow({
  room,
  currentProfile,
  onBackMobile,
  onStartCall,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [actionMenuMsgId, setActionMenuMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Scroll to bottom on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch initial messages for room
  useEffect(() => {
    async function fetchMessages() {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*)
        `)
        .eq('room_id', room.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data as Message[]);
        setTimeout(scrollToBottom, 100);
      }
    }
    fetchMessages();

    // Subscribe to real-time new messages
    const channel = supabase
      .channel(`room_${room.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${room.id}` },
        async (payload) => {
          const newMsg = payload.new as Message;
          // Fetch sender profile info
          const { data: senderData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newMsg.sender_id)
            .single();

          setMessages((prev) => [...prev, { ...newMsg, sender: senderData || undefined }]);
          setTimeout(scrollToBottom, 100);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `room_id=eq.${room.id}` },
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
  }, [room.id, supabase]);

  // Handle Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !uploading) return;

    const contentToSend = inputText.trim();
    setInputText('');
    const replyIdToSend = replyTo?.id || null;
    setReplyTo(null);

    try {
      const { data, error } = await supabase.from('messages').insert({
        room_id: room.id,
        sender_id: currentProfile.id,
        content: contentToSend,
        reply_to_id: replyIdToSend,
      }).select().single();

      if (error) throw error;
      if (data) {
        // Insert message status 'sent'
        await supabase.from('message_statuses').insert({
          message_id: data.id,
          user_id: currentProfile.id,
          status: 'read', // Orange checkmark for sender
        });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `chat-media/${fileName}`;

      let mediaType: 'image' | 'video' | 'document' = 'document';
      if (file.type.startsWith('image/')) mediaType = 'image';
      else if (file.type.startsWith('video/')) mediaType = 'video';

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (uploadError) {
        // Fallback placeholder URL if bucket not setup
        console.warn('Storage upload warning:', uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);

      const mediaUrl = publicUrlData?.publicUrl || URL.createObjectURL(file);

      await supabase.from('messages').insert({
        room_id: room.id,
        sender_id: currentProfile.id,
        content: file.name,
        media_url: mediaUrl,
        media_type: mediaType,
      });
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Message Actions
  const handleCopyMessage = (content: string | null) => {
    if (content) {
      navigator.clipboard.writeText(content);
      setActionMenuMsgId(null);
    }
  };

  const handleUnsendMessage = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ is_deleted: true, content: 'Pesan telah dihapus.' })
        .eq('id', messageId);

      setActionMenuMsgId(null);
    } catch (err) {
      console.error('Failed to unsend message:', err);
    }
  };

  return (
    <div className="flex-1 h-full bg-[#050505] flex flex-col relative overflow-hidden">
      
      {/* Header Bar */}
      <div className="p-4 bg-[#09090b] border-b border-zinc-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackMobile}
            className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-[#ff6b00] flex items-center justify-center font-bold text-[#ff6b00] overflow-hidden">
            {room.avatar_url ? (
              <img src={room.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (room.name || 'Chat')[0]?.toUpperCase()
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-white leading-tight">
              {room.name || 'Personal Chat'}
            </h3>
            <span className="text-[11px] text-[#ff6b00] font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              {isTyping ? 'sedang mengetik...' : 'Aktif'}
            </span>
          </div>
        </div>

        {/* Action Buttons: Voice Call, Video Call */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStartCall(false)}
            title="Panggilan Suara (Voice Call)"
            className="p-2.5 bg-[#18181b] hover:bg-[#ff6b00]/20 text-[#ff6b00] border border-zinc-800 rounded-xl transition-all hover:scale-105"
          >
            <Phone className="w-4 h-4" />
          </button>

          <button
            onClick={() => onStartCall(true)}
            title="Panggilan Video (Video Call)"
            className="p-2.5 bg-[#ff6b00] hover:bg-[#ff8533] text-white rounded-xl transition-all shadow-md shadow-orange-950/40 hover:scale-105"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentProfile.id;
          const isDeleted = msg.is_deleted;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}
            >
              <div className="flex items-end gap-2 max-w-[85%] md:max-w-[70%]">
                
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-[#ff6b00] shrink-0 overflow-hidden mb-1">
                    {msg.sender?.avatar_url ? (
                      <img src={msg.sender.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      msg.sender?.username[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl relative shadow-lg ${
                    isMe
                      ? 'bg-gradient-to-r from-[#ff6b00] to-[#ea580c] text-white rounded-br-none'
                      : 'bg-[#18181b] text-zinc-100 border border-zinc-800/80 rounded-bl-none'
                  } ${isDeleted ? 'italic opacity-60' : ''}`}
                >
                  {/* Sender Name for Group Chat */}
                  {!isMe && room.type === 'group' && (
                    <span className="text-[10px] font-bold text-[#ff6b00] block mb-1">
                      {msg.sender?.display_name || msg.sender?.username}
                    </span>
                  )}

                  {/* Quoted Reply Preview */}
                  {msg.reply_to_id && (
                    <div className="mb-2 p-2 bg-black/20 border-l-2 border-white/60 rounded text-xs opacity-90">
                      <span className="font-semibold block text-[10px]">Membalas pesan</span>
                    </div>
                  )}

                  {/* Media Content Attachment */}
                  {msg.media_url && !isDeleted && (
                    <div className="mb-2 rounded-xl overflow-hidden max-w-sm">
                      {msg.media_type === 'image' ? (
                        <img src={msg.media_url} alt="Attachment" className="w-full h-auto object-cover rounded-lg" />
                      ) : msg.media_type === 'video' ? (
                        <video src={msg.media_url} controls className="w-full rounded-lg" />
                      ) : (
                        <a
                          href={msg.media_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 p-3 bg-black/40 rounded-lg text-xs font-mono hover:underline"
                        >
                          <FileText className="w-5 h-5 text-[#ff6b00]" />
                          <span className="truncate">{msg.content || 'Unduh Dokumen'}</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Text Content */}
                  {msg.content && <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>}

                  {/* Timestamp & Orange Checkmark Status */}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] opacity-75">
                    <span>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    
                    {/* Centang Oranye Status */}
                    {isMe && !isDeleted && (
                      <span className="inline-flex items-center ml-1">
                        {/* 2 Orange Checkmarks for Delivered & Read */}
                        <CheckCheck className="w-3.5 h-3.5 checkmark-orange text-[#ff6b00]" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Action Button */}
                <button
                  onClick={() => setActionMenuMsgId(actionMenuMsgId === msg.id ? null : msg.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-white rounded transition-opacity"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Floating Action Menu */}
              {actionMenuMsgId === msg.id && (
                <div className="mt-1 p-1 bg-[#18181b] border border-zinc-800 rounded-xl shadow-xl z-20 flex items-center gap-1 text-xs">
                  <button
                    onClick={() => {
                      setReplyTo(msg);
                      setActionMenuMsgId(null);
                    }}
                    className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-[#ff6b00] flex items-center gap-1"
                  >
                    <CornerUpLeft className="w-3.5 h-3.5" /> Reply
                  </button>
                  <button
                    onClick={() => handleCopyMessage(msg.content)}
                    className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                  {isMe && !isDeleted && (
                    <button
                      onClick={() => handleUnsendMessage(msg.id)}
                      className="p-1.5 hover:bg-red-950/40 text-red-400 rounded-lg flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Unsend
                    </button>
                  )}
                </div>
              )}

            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Banner */}
      {replyTo && (
        <div className="px-4 py-2 bg-[#18181b] border-t border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-300 overflow-hidden">
            <CornerUpLeft className="w-4 h-4 text-[#ff6b00]" />
            <span className="truncate">Membalas: <i>{replyTo.content}</i></span>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Message Input Box */}
      <form onSubmit={handleSendMessage} className="p-4 bg-[#09090b] border-t border-zinc-800 flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-3 text-zinc-400 hover:text-[#ff6b00] bg-[#18181b] border border-zinc-800 rounded-xl transition-colors shrink-0"
        >
          {uploading ? (
            <span className="animate-spin w-4 h-4 border-2 border-[#ff6b00] border-t-transparent rounded-full block" />
          ) : (
            <Paperclip className="w-5 h-5" />
          )}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Tulis pesan Oit..."
          className="flex-1 px-4 py-3 bg-[#141417] border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff6b00] transition-colors"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="btn-orange p-3 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

    </div>
  );
}
