'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { useAppStore } from '@/store/useAppStore';
import {
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Send,
  CheckCheck,
  Check,
  FileText,
  ArrowLeft,
  Download,
  ExternalLink,
  UploadCloud,
  Hash,
  Plus,
} from 'lucide-react';

interface ChatWindowProps {
  currentUser: User;
  chatUser?: User | null;
  onBackMobile: () => void;
  onStartCall: (isVideo: boolean) => void;
}

export default function ChatWindow({
  currentUser,
  chatUser,
  onBackMobile,
  onStartCall,
}: ChatWindowProps) {
  const { activeChannelName } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');

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

  const markMessagesAsRead = async () => {
    if (!chatUser) return;
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', chatUser.id)
        .eq('receiver_id', currentUser.id)
        .eq('is_read', false);
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  // Fetch Initial Messages & Wire Supabase Realtime Listener
  useEffect(() => {
    async function fetchMessages() {
      try {
        let query = supabase.from('messages').select('*');
        if (chatUser) {
          query = query.or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${chatUser.id}),and(sender_id.eq.${chatUser.id},receiver_id.eq.${currentUser.id})`);
        }
        const { data, error } = await query.order('created_at', { ascending: true }).limit(50);

        if (!error && data) {
          setMessages(data as Message[]);
          if (chatUser) await markMessagesAsRead();
        }
      } catch (err) {
        console.error('Fetch messages error:', err);
      } finally {
        setTimeout(scrollToBottom, 100);
      }
    }

    fetchMessages();

    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (chatUser && newMsg.sender_id === chatUser.id) {
            await markMessagesAsRead();
          }
          setTimeout(scrollToBottom, 100);
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
  }, [currentUser.id, chatUser, supabase]);

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
            receiver_id: chatUser ? chatUser.id : null,
            is_read: false,
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
      } else {
        console.warn('Supabase storage upload notice:', uploadError.message);
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

      const { data: insertedMsg, error: insertError } = await supabase
        .from('messages')
        .insert([
          {
            content: selectedFile.name,
            attachment_url: publicUrl,
            file_name: selectedFile.name,
            file_size: fileSizeFormatted,
            sender_id: currentUser.id,
            receiver_id: chatUser ? chatUser.id : null,
            is_read: false,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Database message insert error:', insertError);
        const tempMsg: Message = {
          id: `temp-${Date.now()}`,
          sender_id: currentUser.id,
          receiver_id: chatUser ? chatUser.id : null,
          content: selectedFile.name,
          attachment_url: publicUrl,
          file_name: selectedFile.name,
          file_size: fileSizeFormatted,
          is_read: false,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempMsg]);
      } else if (insertedMsg) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === insertedMsg.id)) return prev;
          return [...prev, insertedMsg as Message];
        });
      }

      setUploadProgress(100);
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadFileName('');
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

  const currentTitle = chatUser
    ? (chatUser.display_name || chatUser.username)
    : `# ${activeChannelName}`;

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex-1 h-full bg-[#121215] flex flex-col relative overflow-hidden select-none"
    >
      {/* Drag & Drop Visual Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-[#000000]/90 backdrop-blur-md border-4 border-dashed border-[#FF5C00] m-3 rounded-3xl flex flex-col items-center justify-center pointer-events-none animate-pulse">
          <div className="w-20 h-20 bg-[#FF5C00]/20 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-[#FF5C00]/30">
            <UploadCloud className="w-10 h-10 text-[#FF5C00]" />
          </div>
          <h3 className="text-xl font-extrabold text-white">Lepaskan File di Sini</h3>
          <p className="text-xs text-zinc-400 mt-1">
            File akan otomatis diunggah dan dikirim ke <span className="text-[#FF5C00] font-bold">{currentTitle}</span>
          </p>
        </div>
      )}

      {/* Top Header Bar Matching Design Image */}
      <div className="px-5 py-3 bg-[#121215] border-b border-zinc-800/80 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackMobile}
            className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {chatUser ? (
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center font-bold text-[#FF5C00]">
                {chatUser.avatar_url ? (
                  <img src={chatUser.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  chatUser.username[0]?.toUpperCase()
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#121215]" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
              <Hash className="w-4 h-4 text-zinc-300" />
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-white leading-tight">
              {currentTitle}
            </h3>
            {chatUser && (
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Online
              </span>
            )}
          </div>
        </div>

        {/* Action Call Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStartCall(false)}
            title="Voice Call"
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <Phone className="w-4 h-4" />
          </button>

          <button
            onClick={() => onStartCall(true)}
            title="Video Call"
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <Video className="w-4 h-4" />
          </button>

          <button
            title="More Options"
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message Stream Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-[#121215]">
        
        {/* Date Separator Pill */}
        <div className="flex justify-center my-3">
          <span className="bg-[#1c1c21] text-zinc-400 text-[10px] font-semibold px-3 py-1 rounded-full border border-zinc-800/60 shadow-sm">
            Today
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser.id;
          const attachUrl = msg.attachment_url || msg.file_url || (msg.content?.startsWith('http') || msg.content?.startsWith('data:') ? msg.content : null);
          const isImg = isImageFile(attachUrl, msg.file_name || msg.content);
          const isRead = msg.is_read;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden flex items-center justify-center text-xs font-bold text-[#FF5C00] shrink-0 mt-0.5">
                {isMe ? (
                  currentUser.avatar_url ? (
                    <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    currentUser.username[0]?.toUpperCase()
                  )
                ) : chatUser?.avatar_url ? (
                  <img src={chatUser.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  (chatUser?.username || 'K')[0]?.toUpperCase()
                )}
              </div>

              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
                
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-white">
                    {isMe ? 'You' : (chatUser?.display_name || chatUser?.username || 'Kenji (31)')}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-2xl relative shadow-md ${
                    isMe
                      ? 'bg-[#FF5C00] text-white rounded-tr-none'
                      : 'bg-[#1c1c21] text-zinc-100 border border-zinc-800/80 rounded-tl-none'
                  }`}
                >
                  {/* Image Attachment Lightbox */}
                  {attachUrl && isImg ? (
                    <a
                      href={attachUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block cursor-pointer hover:opacity-90 transition-opacity mb-1"
                    >
                      <div className="rounded-xl overflow-hidden max-w-sm border border-white/20 relative group bg-black/40">
                        <img
                          src={attachUrl}
                          alt={msg.file_name || 'Uploaded Image'}
                          className="w-full h-auto object-cover max-h-72 rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1.5">
                          <ExternalLink className="w-4 h-4" /> Buka Gambar
                        </div>
                      </div>
                    </a>
                  ) : attachUrl || msg.file_name ? (
                    /* Document Card */
                    <a
                      href={attachUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={msg.file_name || msg.content || 'attachment'}
                      className="flex items-center gap-3 p-3 bg-white/15 hover:bg-white/25 rounded-xl border border-white/30 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                    >
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p className="text-xs font-bold text-white truncate max-w-[180px]">
                          {msg.file_name || msg.content || 'Document'}
                        </p>
                        <p className="text-[10px] text-white/80">{msg.file_size || 'Klik untuk unduh'}</p>
                      </div>
                      <Download className="w-4 h-4 text-white shrink-0" />
                    </a>
                  ) : (
                    /* Text Content */
                    <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  )}

                  {/* Checkmarks */}
                  {isMe && (
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

      {/* Bottom Message Input Bar Matching Design Image */}
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
          multiple
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-10 h-10 bg-[#1c1c21] hover:bg-[#25252b] text-zinc-400 hover:text-white border border-zinc-800 rounded-full flex items-center justify-center shrink-0 transition-colors disabled:opacity-50"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="flex-1 bg-[#1c1c21] border border-zinc-800 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-inner">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isUploading}
            placeholder={`Message ${currentTitle}...`}
            className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
          />

          <button
            type="button"
            onClick={() => setMessageText((prev) => prev + ' 😊')}
            className="text-zinc-400 hover:text-white transition-colors shrink-0"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleSendMessage}
          disabled={!messageText.trim() || isUploading}
          className="w-10 h-10 bg-[#FF5C00] hover:bg-[#ff701a] text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-[#FF5C00]/25 transition-all disabled:opacity-40 active:scale-[0.98]"
        >
          <Send className="w-4 h-4 fill-current stroke-[2.5]" />
        </button>
      </form>

    </div>
  );
}
