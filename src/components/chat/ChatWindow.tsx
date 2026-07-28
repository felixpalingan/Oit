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
  Download,
  Image as ImageIcon,
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
  const [messageText, setMessageText] = useState('');

  // File Upload State & Progress
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState('');

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
          if (
            (newMsg.sender_id === currentUser.id && newMsg.receiver_id === chatUser.id) ||
            (newMsg.sender_id === chatUser.id && newMsg.receiver_id === currentUser.id)
          ) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
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
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    const contentToSend = messageText.trim();
    setMessageText('');

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            content: contentToSend,
            sender_id: currentUser.id,
            receiver_id: chatUser.id,
          },
        ])
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle File Upload to Supabase Storage Bucket 'chat-attachments'
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadFileName(selectedFile.name);
    setUploadProgress(15);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${currentUser.id}/${fileName}`;

      setUploadProgress(40);

      // Upload to Supabase Storage bucket 'chat-attachments'
      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.warn('Storage upload error / bucket notice:', uploadError.message);
      }

      setUploadProgress(75);

      // Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl || URL.createObjectURL(selectedFile);

      // Insert message record into Supabase messages table
      const { data: insertedMsg, error: insertError } = await supabase
        .from('messages')
        .insert([
          {
            content: selectedFile.name,
            attachment_url: publicUrl,
            file_name: selectedFile.name,
            file_size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
            sender_id: currentUser.id,
            receiver_id: chatUser.id,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting attachment message:', insertError);
        // Local fallback update
        setMessages((prev) => [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            sender_id: currentUser.id,
            receiver_id: chatUser.id,
            content: selectedFile.name,
            attachment_url: publicUrl,
            file_name: selectedFile.name,
            file_size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
            created_at: new Date().toISOString(),
          },
        ]);
      } else if (insertedMsg) {
        setMessages((prev) => [...prev, insertedMsg as Message]);
      }

      setUploadProgress(100);
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        scrollToBottom();
      }, 400);
    }
  };

  const isImageFile = (url?: string | null, name?: string | null) => {
    const target = (url || name || '').toLowerCase();
    return target.endsWith('.png') || target.endsWith('.jpg') || target.endsWith('.jpeg') || target.endsWith('.webp') || target.endsWith('.gif');
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
          const attachUrl = msg.attachment_url || msg.file_url;
          const isImg = isImageFile(attachUrl, msg.file_name);

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
                  {/* Image Attachment Lightbox */}
                  {attachUrl && isImg ? (
                    <div className="mb-1 rounded-xl overflow-hidden max-w-sm border border-white/20">
                      <img src={attachUrl} alt="Attachment" className="w-full h-auto object-cover max-h-60 rounded-lg" />
                    </div>
                  ) : attachUrl || msg.file_name ? (
                    /* Document / File Attachment Card */
                    <a
                      href={attachUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-colors"
                    >
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p className="text-xs font-bold text-white truncate max-w-[180px]">
                          {msg.file_name || msg.content || 'Document'}
                        </p>
                        <p className="text-[10px] opacity-80">{msg.file_size || 'Click to download'}</p>
                      </div>
                      <Download className="w-4 h-4 text-white/80 shrink-0" />
                    </a>
                  ) : (
                    /* Text Content */
                    <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  )}

                  {/* Timestamp & Double Checkmarks */}
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

      {/* Uploading Progress Bar Container (Matching User's Image Design) */}
      {isUploading && (
        <div className="px-6 py-1.5 bg-[#121215] border-t border-zinc-800/80">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
            <span className="truncate">Uploading {uploadFileName}...</span>
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

      {/* Bottom Message Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
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
            disabled={isUploading}
            className="text-zinc-400 hover:text-white transition-colors shrink-0 disabled:opacity-50"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isUploading}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
          />

          <button
            type="button"
            onClick={() => setMessageText((prev) => prev + ' 😊')}
            className="text-zinc-400 hover:text-white transition-colors shrink-0"
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleSendMessage}
          disabled={!messageText.trim() || isUploading}
          className="w-10 h-10 bg-[#ff8a65] hover:bg-[#ff7a52] text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-[#ff8a65]/20 transition-all disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
