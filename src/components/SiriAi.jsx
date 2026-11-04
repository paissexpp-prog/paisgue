import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, X, Send, Paperclip, Image as ImageIcon, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import axios from 'axios';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';

// ================================================================
// HELPER: Parser Pesan (Markdown sederhana untuk **tebal** & Link)
// ================================================================
const parseSiriText = (text) => {
  if (!text) return null;
  const parts = [];
  const regex = /(\*\*.*?\*\*|https?:\/\/[^\s]+)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    const raw = match[0];
    if (raw.startsWith('**') && raw.endsWith('**')) {
      parts.push({ type: 'bold', value: raw.slice(2, -2) });
    } else if (raw.startsWith('http')) {
      parts.push({ type: 'link', value: raw, href: raw });
    }
    lastIndex = match.index + raw.length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: 'text', value: text }];
};

const BUTTON_SIZE = 60;
const BOTTOM_SAFE = 90;

// ================================================================
// HELPER: Smart Bounds Kalkulasi Posisi Popup Chat
// ================================================================
const calcPopupPosition = (buttonLeft, buttonTop) => {
  const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  
  const POPUP_WIDTH = Math.min(360, vw - 32); 
  let POPUP_HEIGHT, left, top;
  const GAP = 12;

  if (vw < 640) {
    POPUP_HEIGHT = Math.min(540, vh - 32); 
    left = (vw - POPUP_WIDTH) / 2;
    top = Math.max(16, vh - POPUP_HEIGHT - 16); 
  } else {
    POPUP_HEIGHT = Math.min(540, vh - 140); 
    left = buttonLeft - POPUP_WIDTH + BUTTON_SIZE;
    if (left < 16) left = 16; 
    if (left + POPUP_WIDTH > vw - 16) left = vw - POPUP_WIDTH - 16; 

    top = buttonTop - POPUP_HEIGHT - GAP;
    if (top < 16) top = buttonTop + BUTTON_SIZE + GAP;
    if (top + POPUP_HEIGHT > vh - 16) top = Math.max(16, vh - POPUP_HEIGHT - 16);
  }

  return { left, top, width: POPUP_WIDTH, height: POPUP_HEIGHT };
};

// ================================================================
// KOMPONEN UTAMA
// ================================================================
const SiriAi = () => {
  const { color } = useTheme();

  // State Manajemen Chat
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  
  // State Upload Gambar
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // State Dragging & UI
  const [isClosing, setIsClosing] = useState(false);
  const [pos, setPos] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [popupPos, setPopupPos] = useState({ left: 0, top: 0, width: 360, height: 540 });

  const buttonRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, elemX: 0, elemY: 0 });
  const hasDraggedRef = useRef(false);
  const posRef = useRef({ x: null, y: null });

  // ================================================================
  // FETCH RIWAYAT CHAT
  // ================================================================
  const fetchHistory = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const res = await api.get('/ai/chat-history');
      if (res.data?.success && Array.isArray(res.data.history)) {
        setMessages(res.data.history);
      }
    } catch (error) {
      console.error("Gagal mengambil riwayat Siri AI", error);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchHistory();
    }
  }, [fetchHistory]);

  // ================================================================
  // REALTIME RESIZE LISTENER
  // ================================================================
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        let btnLeft, btnTop;
        if (posRef.current.x !== null && posRef.current.y !== null) {
          btnLeft = posRef.current.x;
          btnTop = posRef.current.y;
        } else {
          const btn = buttonRef.current;
          if (btn) {
            const rect = btn.getBoundingClientRect();
            btnLeft = rect.left;
            btnTop = rect.top;
          } else {
            btnLeft = window.innerWidth - BUTTON_SIZE - 20;
            btnTop = window.innerHeight - 180;
          }
        }
        setPopupPos(calcPopupPosition(btnLeft, btnTop));
      }
    };

    window.addEventListener('resize', handleResize);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, [isOpen]);

  // ================================================================
  // DRAG LOGIC
  // ================================================================
  const handlePointerDown = useCallback((e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const btn = buttonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    hasDraggedRef.current = false;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX: rect.left,
      elemY: rect.top,
    };
    setIsDragging(true);
    btn.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();

    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasDraggedRef.current = true;

    const clampedX = Math.max(0, Math.min(window.innerWidth - BUTTON_SIZE, dragStartRef.current.elemX + dx));
    const clampedY = Math.max(0, Math.min(window.innerHeight - BUTTON_SIZE - BOTTOM_SAFE, dragStartRef.current.elemY + dy));

    posRef.current = { x: clampedX, y: clampedY };
    setPos({ x: clampedX, y: clampedY });

    if (isOpen) {
      setPopupPos(calcPopupPosition(clampedX, clampedY));
    }
  }, [isDragging, isOpen]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (!hasDraggedRef.current) handleToggleOpen();
  }, [isDragging]);

  // ================================================================
  // BUKA / TUTUP CHAT POPUP
  // ================================================================
  const handleToggleOpen = () => {
    if (isOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 300);
      return;
    }

    let btnLeft, btnTop;
    if (posRef.current.x !== null && posRef.current.y !== null) {
      btnLeft = posRef.current.x;
      btnTop = posRef.current.y;
    } else {
      const btn = buttonRef.current;
      if (btn) {
        const rect = btn.getBoundingClientRect();
        btnLeft = rect.left;
        btnTop = rect.top;
        posRef.current = { x: btnLeft, y: btnTop };
      } else {
        btnLeft = window.innerWidth - BUTTON_SIZE - 20;
        btnTop = window.innerHeight - 180;
      }
    }

    setPopupPos(calcPopupPosition(btnLeft, btnTop));
    setIsOpen(true);
    setIsClosing(false);
    fetchHistory();
  };

  // ================================================================
  // UPLOAD FILE & PREVIEW
  // ================================================================
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5MB.");
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ================================================================
  // KIRIM PESAN & GAMBAR (PENYESUAIAN CDN DAN API)
  // ================================================================
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMsg.trim() && !selectedImage) return;

    const userText = inputMsg.trim();
    const currentImg = selectedImage;

    // Bersihkan form seolah-olah sedang diproses
    setInputMsg('');
    clearImage();
    setIsTyping(true);

    try {
      let imageUrls = [];
      
      // 1. Upload ke CDN Paiscode jika ada gambar
      if (currentImg) {
        const formData = new FormData();
        formData.append('file', currentImg);
        
        // PENTING: Gunakan konfigurasi axios yang bersih untuk menghindari konflik interceptor
        const uploadRes = await axios({
            method: 'post',
            url: 'https://cdn.paiscode.com/upload',
            data: formData,
            // Biarkan browser mengatur boundary multipart/form-data
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (uploadRes.data?.success && uploadRes.data?.data?.url) {
          imageUrls.push(uploadRes.data.data.url);
        } else {
          throw new Error("Gagal mendapatkan URL gambar dari CDN Paiscode");
        }
      }

      // 2. Siapkan Data Optimistic UI
      const newUserMsgContent = [];
      if (userText) newUserMsgContent.push({ type: 'text', text: userText });
      if (imageUrls.length > 0) newUserMsgContent.push({ type: 'image_url', image_url: { url: imageUrls[0] } });

      const newUserMsg = {
        role: 'user',
        content: newUserMsgContent,
        timestamp: new Date().toISOString(),
      };
      
      // Tampilkan pesan User
      setMessages(prev => [newUserMsg, ...prev]);

      // 3. Kirim ke API Siri (RuangOTP)
      const payload = { message: userText || "Ini bukti transfer saya." };
      if (imageUrls.length > 0) {
        payload.images = imageUrls;
      }

      const chatRes = await api.post('/ai/chat', payload);

      if (chatRes.data?.success && chatRes.data?.reply) {
        const aiMsg = {
          role: 'assistant',
          content: chatRes.data.reply.content,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [aiMsg, ...prev]);
      }
    } catch (error) {
      console.error("Gagal mengirim pesan Siri AI:", error);
      
      // Kembalikan pesan yang gagal agar bisa diketik ulang
      setInputMsg(userText); 
      
      const errorMsg = {
        role: 'assistant',
        content: `Maaf, terjadi kesalahan teknis: ${error.message || "Gagal menghubungi server"}. Coba periksa koneksi Anda atau hubungi CS manual.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [errorMsg, ...prev]);
    } finally {
      setIsTyping(false);
    }
  };

  const token = localStorage.getItem('token');
  if (!token) return null;

  const btnStyle = pos.x !== null && pos.y !== null
    ? {
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex: 90,
        touchAction: 'none',
        userSelect: 'none',
        visibility: isOpen ? 'hidden' : 'visible',
      }
    : {
        position: 'fixed',
        right: '20px',
        bottom: '180px', 
        zIndex: 90,
        touchAction: 'none',
        userSelect: 'none',
        visibility: isOpen ? 'hidden' : 'visible',
      };

  return (
    <>
      <style>{`
        @keyframes siriFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-6px) scale(1.02); }
        }
        @keyframes siriPulseBg {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(59, 130, 246, 0); }
        }
        @keyframes popupEnter {
          0% { opacity: 0; transform: scale(0.9) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes popupExit {
          0% { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(0.9) translateY(10px); }
        }
        @keyframes typingDot {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
        .siri-btn-idle {
          animation: siriFloat 3s ease-in-out infinite, siriPulseBg 2.5s infinite;
        }
        .siri-btn-dragging {
          transform: scale(1.1);
          animation: none !important;
          box-shadow: 0 16px 40px rgba(0,0,0,0.3) !important;
        }
        .siri-popup-enter {
          animation: popupEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .siri-popup-exit {
          animation: popupExit 0.25s ease-in forwards;
        }
        .dot-1 { animation: typingDot 1.4s infinite 0s; }
        .dot-2 { animation: typingDot 1.4s infinite 0.2s; }
        .dot-3 { animation: typingDot 1.4s infinite 0.4s; }
      `}</style>

      {/* ==================== TOMBOL MELAYANG SIRI AI ==================== */}
      <div
        ref={buttonRef}
        style={btnStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <button
          className={`relative flex h-[60px] w-[60px] items-center justify-center rounded-full bg-slate-900 border-2 border-slate-700 transition-all duration-200 shadow-xl ${isDragging ? 'siri-btn-dragging cursor-grabbing' : 'siri-btn-idle cursor-grab'}`}
          onClick={(e) => e.preventDefault()}
        >
          <Bot size={28} className="text-white drop-shadow-md" />
          <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 shadow-lg border-2 border-slate-900">
            <Sparkles size={12} className="text-white animate-pulse" />
          </div>
        </button>
      </div>

      {/* ==================== WINDOW CHAT SIRI AI ==================== */}
      {isOpen && (
        <div
          className={`fixed z-[85] flex flex-col bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden ${isClosing ? 'siri-popup-exit' : 'siri-popup-enter'}`}
          style={{
            left: `${popupPos.left}px`,
            top: `${popupPos.top}px`,
            width: `${popupPos.width}px`,
            height: `${popupPos.height}px`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
                <Bot size={20} />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-50 dark:border-slate-900 bg-emerald-500"></span>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Siri AI</h3>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium tracking-wide">Customer Support Agent</p>
              </div>
            </div>
            <button
              onClick={handleToggleOpen}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Area Pesan (Flex Col Reverse) */}
          <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col-reverse gap-4 bg-white dark:bg-slate-950">
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-end gap-2 w-full max-w-[85%]">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                  <Bot size={14} />
                </div>
                <div className="rounded-2xl rounded-bl-sm bg-slate-100 dark:bg-slate-900 px-4 py-3 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1">
                    <span className="dot-1 h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500"></span>
                    <span className="dot-2 h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500"></span>
                    <span className="dot-3 h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500"></span>
                  </div>
                </div>
              </div>
            )}

            {/* Render Mapping Pesan */}
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              
              let textContent = '';
              let imageUrls = [];
              if (Array.isArray(msg.content)) {
                msg.content.forEach((item) => {
                  if (item.type === 'text') textContent += item.text + '\n';
                  if (item.type === 'image_url') imageUrls.push(item.image_url.url);
                });
              } else {
                textContent = msg.content;
              }

              const isAdmin = !isUser && textContent.includes('[Pesan dari Admin]:');
              const bubbleBg = isUser 
                ? `${color.bg} text-slate-800 dark:text-white border border-${color.border.split('-')[1]}-200 dark:border-${color.border.split('-')[1]}-800/50` 
                : isAdmin
                  ? 'bg-amber-50 dark:bg-amber-900/20 text-slate-800 dark:text-white border border-amber-200 dark:border-amber-800'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800';

              return (
                <div key={idx} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {!isUser && (
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-sm text-white mt-auto ${isAdmin ? 'bg-amber-500' : 'bg-blue-600'}`}>
                        {isAdmin ? <Sparkles size={14} /> : <Bot size={14} />}
                      </div>
                    )}

                    <div className={`flex flex-col gap-2 rounded-2xl px-4 py-3 shadow-sm ${isUser ? 'rounded-br-sm' : 'rounded-bl-sm'} ${bubbleBg}`}>
                      
                      {imageUrls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-white/20">
                          <img src={url} alt="Uploaded" className="w-full max-w-[200px] h-auto object-cover hover:opacity-90 transition-opacity" loading="lazy" />
                        </a>
                      ))}

                      {textContent && (
                        <p className="text-[13px] leading-relaxed break-words whitespace-pre-wrap">
                          {parseSiriText(textContent).map((part, i) => 
                            part.type === 'bold' ? (
                              <strong key={i} className="font-bold text-slate-900 dark:text-white">{part.value}</strong>
                            ) : part.type === 'link' ? (
                              <a key={i} href={part.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline">
                                {part.value} <ExternalLink size={10} className="shrink-0"/>
                              </a>
                            ) : (
                              <span key={i}>{part.value}</span>
                            )
                          )}
                        </p>
                      )}

                      <span className={`text-[9px] mt-1 font-medium ${isUser ? 'text-right opacity-60' : 'text-left opacity-50'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Area Input (Footer) */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
            
            {imagePreview && (
              <div className="mb-3 flex items-center gap-3 rounded-xl bg-white dark:bg-slate-950 p-2 border border-slate-200 dark:border-slate-800 shadow-sm relative">
                <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{selectedImage?.name}</p>
                  <p className="text-[10px] text-slate-500">{(selectedImage?.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={clearImage} className="p-2 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                  <X size={16} />
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-2xl bg-white dark:bg-slate-950 text-slate-500 border border-slate-200 dark:border-slate-800 hover:text-blue-600 hover:border-blue-300 dark:hover:border-blue-800 transition-colors shrink-0"
              >
                {imagePreview ? <ImageIcon size={20} /> : <Paperclip size={20} />}
              </button>

              <div className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center px-4 py-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all">
                <input
                  type="text"
                  placeholder="Ketik keluhan atau tanya Siri..."
                  className="w-full bg-transparent text-sm py-2.5 outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onFocus={() => {
                    setTimeout(() => {
                      window.dispatchEvent(new Event('resize'));
                    }, 300);
                  }}
                  disabled={isTyping}
                />
              </div>

              <button
                type="submit"
                disabled={isTyping || (!inputMsg.trim() && !selectedImage)}
                className={`p-3 rounded-2xl text-white shadow-md transition-all shrink-0 ${isTyping || (!inputMsg.trim() && !selectedImage) ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed' : color.btn}`}
              >
                {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="-ml-0.5 mt-0.5" />}
              </button>
            </form>
            
            <p className="text-center text-[9px] text-slate-400 mt-2 font-medium tracking-wide">
              Siri AI Agent Powered by RuangOTP
            </p>
          </div>

        </div>
      )}
    </>
  );
};

export default SiriAi;
