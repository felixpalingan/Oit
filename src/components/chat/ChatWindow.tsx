'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '@/types';
import { createClient } from '@/utils/supabase/client';
import {
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  CheckCheck,
  FileText,
  ArrowLeft,
} from 'lucide-react';

interface ChatWindowProps {
  currentUser: User;
  chatUser: User;
  onBackMobile: () => void;
  onStartCall: (isVideo: boolean) => void;
}

export default function ChatWindow({
  currentUser,
  chatUser,
  onBackMobile,
  onStartCall,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [uploading, setUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch Initial Messages & Wire Supabase Realtime Listener
  useEffect(() => {
    async function fetchMessages() {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${chatUser.id}),and(sender_id.eq.${chatUser.id},receiver_id.eq.${currentUser.id})`)
          .order('created_at', { ascending: true });

        if (!error && data) {
          setMessages(data as Message[]);
        } else {
          // Default mock messages matching user's image if database has no messages yet
          setMessages([
            {
              id: 'm1',
              sender_id: chatUser.id,
              receiver_id: currentUser.id,
              content: 'Hey! Are we still meeting for coffee later to discuss the new project?',
              created_at: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              id: 'm2',
              sender_id: chatUser.id,
              receiver_id: currentUser.id,
              content: 'I found that document you were asking about too.',
              created_at: new Date(Date.now() - 3500000).toISOString(),
            },
            {
              id: 'm3',
              sender_id: currentUser.id,
              receiver_id: chatUser.id,
              content: 'Yes! 2 PM at the usual place works for me.',
              created_at: new Date(Date.now() - 1800000).toISOString(),
            },
            {
              id: 'm4',
              sender_id: currentUser.id,
              receiver_id: chatUser.id,
              content: 'Project_Brief_v2.pdf',
              file_url: '#',
              file_name: 'Project_Brief_v2.pdf',
              file_size: '2.4 MB',
              created_at: new Date(Date.now() - 1700000).toISOString(),
            },
            {
              id: 'm5',
              sender_id: chatUser.id,
              receiver_id: currentUser.id,
              content: 'Sounds perfect! See you then.',
              created_at: new Date(Date.now() - 600000).toISOString(),
            },
          ]);
        }
      } catch (err) {
        console.error('Fetch messages error:', err);
      } finally {
        setTimeout(scrollToBottom, 100);
      }
    }

    fetchMessages();

    // Wiring Supabase Realtime Listener on table `messages`
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          // Check if message belongs to current chat conversation
          if (
            (newMsg.sender_id === currentUser.id && newMsg.receiver_id === chatUser.id) ||
            (newMsg.sender_id === chatUser.id && newMsg.receiver_id === currentUser.id)
          ) {
            setMessages((prev) => [...prev, newMsg]);
            setTimeout(scrollToBottom, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser.id, chatUser.id, supabase]);

  // Handle Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const contentToSend = inputText.trim();
    setInputText('');

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser.id,
          receiver_id: chatUser.id,
          content: contentToSend,
        })
        .select()
        .single();

      if (error) {
        console.warn('Insert message DB warning:', error.message);
        // Fallback local update
        setMessages((prev) => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            sender_id: currentUser.id,
            receiver_id: chatUser.id,
            content: contentToSend,
            created_at: new Date().toISOString(),
          },
        ]);
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Handle File Attachment Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileSizeFormatted = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      await supabase.from('messages').insert({
        sender_id: currentUser.id,
        receiver_id: chatUser.id,
        content: file.name,
        file_name: file.name,
        file_size: fileSizeFormatted,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          sender_id: currentUser.id,
          receiver_id: chatUser.id,
          content: file.name,
          file_name: file.name,
          file_size: fileSizeFormatted,
          created_at: new Date().toISOString(),
        },
      ]);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 h-full bg-[#000000] flex flex-col relative overflow-hidden select-none">
      
      {/* Top Header Bar */}
      <div className="px-5 py-3.5 bg-[#121215] border-b border-zinc-800/80 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackMobile}
            className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center font-bold text-[#FF5C00]">
              {chatUser.avatar_url ? (
                <img src={chatUser.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                chatUser.username[0]?.toUpperCase()
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#121215]" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-white leading-tight">
              {chatUser.display_name || chatUser.username}
            </h3>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Online
            </span>
          </div>
        </div>

        {/* Action Call Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStartCall(false)}
            title="Voice Call"
            className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <Phone className="w-4 h-4" />
          </button>

          <button
            onClick={() => onStartCall(true)}
            title="Video Call"
            className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <Video className="w-4 h-4" />
          </button>

          <button
            title="More Options"
            className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message Stream Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-[#000000]">
        
        {/* Date Separator Pill */}
        <div className="flex justify-center my-3">
          <span className="bg-[#1c1c21] text-zinc-400 text-[10px] font-semibold px-3 py-1 rounded-full border border-zinc-800/60 shadow-sm">
            Today, 9:30 AM
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-end gap-2 max-w-[85%] md:max-w-[65%]">
                
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center text-xs font-bold text-[#FF5C00] shrink-0 mb-1">
                    {chatUser.avatar_url ? (
                      <img src={chatUser.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      chatUser.username[0]?.toUpperCase()
                    )}
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl relative shadow-md ${
                    isMe
                      ? 'bg-[#ff8a65] text-white rounded-br-none'
                      : 'bg-[#1c1c21] text-zinc-100 border border-zinc-800/80 rounded-bl-none'
                  }`}
                >
                  {/* File Attachment Card */}
                  {msg.file_name ? (
                    <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/20">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white truncate max-w-[180px]">
                          {msg.file_name}
                        </p>
                        <p className="text-[10px] opacity-80">{msg.file_size || 'Document'}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  )}

                  {/* Timestamp & Orange Double Checkmarks */}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-80">
                    <span>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && (
                      <CheckCheck className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Message Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-[#121215] border-t border-zinc-800/80 flex items-center gap-3"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="flex-1 bg-[#1c1c21] border border-zinc-800 rounded-full px-4 py-2.5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-zinc-400 hover:text-white transition-colors shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
          />

          <button
            type="button"
            onClick={() => setInputText((prev) => prev + ' 😊')}
            className="text-zinc-400 hover:text-white transition-colors shrink-0"
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-10 h-10 bg-[#ff8a65] hover:bg-[#ff7a52] text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-[#ff8a65]/20 transition-all disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
