import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, ExternalLink } from 'lucide-react';
import api from '../utils/api';

// ================================================================
// HELPER: Parse teks pesan, auto-detect link t.me/ dan URL lain
// ================================================================
const parseMessage = (text) => {
  if (!text) return null;

  const urlRegex = /(https?:\/\/[^\s]+)|(t\.me\/[^\s]+)/gi;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    const raw = match[0];
    const href = raw.startsWith('http') ? raw : `https://${raw}`;
    parts.push({ type: 'link', value: raw, href });
    lastIndex = match.index + raw.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: 'text', value: text }];
};

const BELL_SIZE    = 48;
const POPUP_WIDTH  = 288;  // w-72
const POPUP_HEIGHT = 340;
const GAP          = 12;
const BOTTOM_SAFE  = 80;   // tinggi BottomNav

// ================================================================
// Hitung posisi popup dari koordinat bell yang aktual (px)
// ================================================================
const calcPopupPosition = (bellLeft, bellTop) => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const safeBottom = vh - BOTTOM_SAFE;

  // ── Horizontal: kanan dulu, fallback kiri ──
  let left;
  if (bellLeft + BELL_SIZE + GAP + POPUP_WIDTH <= vw - 8) {
    left = bellLeft + BELL_SIZE + GAP;
  } else if (bellLeft - GAP - POPUP_WIDTH >= 8) {
    left = bellLeft - GAP - POPUP_WIDTH;
  } else {
    left = Math.max(8, Math.min(vw - POPUP_WIDTH - 8, bellLeft + BELL_SIZE + GAP));
  }

  // ── Vertikal: sejajar atas bell, fallback flip ke atas ──
  let top;
  if (bellTop + POPUP_HEIGHT <= safeBottom) {
    top = bellTop;
  } else if (bellTop + BELL_SIZE - POPUP_HEIGHT >= 8) {
    top = bellTop + BELL_SIZE - POPUP_HEIGHT;
  } else {
    top = Math.max(8, safeBottom - POPUP_HEIGHT);
  }

  return { left, top };
};

// ================================================================
// KOMPONEN UTAMA
// ================================================================
const OwnerNotification = () => {

  // ================================================================
  // FIX #1 — RULES OF HOOKS:
  // SEMUA hooks harus dipanggil tanpa kondisi di bagian paling atas.
  // Early return karena token hanya boleh dilakukan SETELAH semua hooks.
  // Bug lama: `if (!token) return null` ada SEBELUM useState → crash/
  // refresh loop saat logout karena React mendeteksi jumlah hooks
  // berbeda antar render.
  // ================================================================

  const [messages, setMessages]     = useState([]);
  const [isOpen, setIsOpen]         = useState(false);
  const [countdown, setCountdown]   = useState(7);
  const [canClose, setCanClose]     = useState(false);
  const [isClosing, setIsClosing]   = useState(false);
  const [pos, setPos]               = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [popupPos, setPopupPos]     = useState({ left: 0, top: 0 });

  const bellRef            = useRef(null);
  const dragStartRef       = useRef({ mouseX: 0, mouseY: 0, elemX: 0, elemY: 0 });
  const hasDraggedRef      = useRef(false);
  const prevMsgCountRef    = useRef(0);
  const countdownRef       = useRef(null);
  const pollingRef         = useRef(null);

  // FIX #2 — POPUP POSITION:
  // posRef tracking posisi bell secara sinkron agar handleOpen
  // tidak baca posisi lama dari DOM sebelum React selesai re-render.
  const posRef = useRef({ x: null, y: null });

  // ================================================================
  // FETCH & POLLING
  // Guard di dalam fetchInfo sudah cukup menangani kasus tanpa token.
  // ================================================================
  const fetchInfo = useCallback(async () => {
    // Guard: jangan hit API kalau sudah logout
    if (!localStorage.getItem('token')) return;
    try {
      const res = await api.get('/info');
      if (res.data?.success && Array.isArray(res.data.data)) {
        const filtered = res.data.data.filter(
          (item) => item.pesan && item.pesan.trim() !== 'belum ada info lebih lanjut'
        );
        setMessages(filtered.length > 0 ? filtered : []);
        prevMsgCountRef.current = filtered.length;
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    // Guard: jangan mulai polling kalau tidak ada token
    if (!localStorage.getItem('token')) return;

    fetchInfo();
    pollingRef.current = setInterval(() => {
      if (!document.hidden) fetchInfo();
    }, 3 * 60 * 1000);
    return () => clearInterval(pollingRef.current);
  }, [fetchInfo]);

  // ================================================================
  // DRAG
  // ================================================================
  const handlePointerDown = useCallback((e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const bell = bellRef.current;
    if (!bell) return;

    const rect = bell.getBoundingClientRect();
    hasDraggedRef.current = false;
    dragStartRef.current  = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX:  rect.left,
      elemY:  rect.top,
    };
    setIsDragging(true);
    bell.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();

    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasDraggedRef.current = true;

    const clampedX = Math.max(0, Math.min(window.innerWidth  - BELL_SIZE, dragStartRef.current.elemX + dx));
    const clampedY = Math.max(0, Math.min(window.innerHeight - BELL_SIZE - BOTTOM_SAFE, dragStartRef.current.elemY + dy));

    // Update posRef sinkron SEBELUM setPos, agar handleOpen baca nilai terbaru
    posRef.current = { x: clampedX, y: clampedY };
    setPos({ x: clampedX, y: clampedY });

    // Popup ikut realtime saat di-drag
    if (isOpen) {
      setPopupPos(calcPopupPosition(clampedX, clampedY));
    }
  }, [isDragging, isOpen]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    if (!hasDraggedRef.current) handleOpen();
  }, [isDragging]);

  // ================================================================
  // BUKA POPUP — gunakan posRef (sinkron) bukan getBoundingClientRect
  // agar posisi popup selalu tepat di samping bell saat itu juga
  // ================================================================
  const handleOpen = () => {
    if (isOpen) return;

    let bellLeft, bellTop;

    if (posRef.current.x !== null && posRef.current.y !== null) {
      // Bell sudah pernah di-drag → pakai posRef (sinkron, bukan state)
      bellLeft = posRef.current.x;
      bellTop  = posRef.current.y;
    } else {
      // Bell belum pernah di-drag → baca dari DOM (posisi awal CSS)
      const bell = bellRef.current;
      if (bell) {
        const rect = bell.getBoundingClientRect();
        bellLeft = rect.left;
        bellTop  = rect.top;
        // Simpan ke posRef agar tap berikutnya konsisten
        posRef.current = { x: bellLeft, y: bellTop };
      } else {
        bellLeft = 16;
        bellTop  = window.innerHeight * 0.3;
      }
    }

    setPopupPos(calcPopupPosition(bellLeft, bellTop));

    setIsOpen(true);
    setIsClosing(false);
    setCanClose(false);
    setCountdown(7);

    clearInterval(countdownRef.current);
    let count = 7;
    countdownRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(countdownRef.current);
        setCanClose(true);
      }
    }, 1000);
  };

  // ================================================================
  // TUTUP POPUP
  // ================================================================
  const handleClose = () => {
    if (!canClose) return;
    clearInterval(countdownRef.current);
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setMessages([]);
      prevMsgCountRef.current = 0;
    }, 400);
  };

  // ================================================================
  // CLEANUP
  // ================================================================
  useEffect(() => {
    return () => {
      clearInterval(countdownRef.current);
      clearInterval(pollingRef.current);
    };
  }, []);

  // ================================================================
  // FIX #1 (lanjutan) — Early return SETELAH semua hooks selesai dipanggil.
  // Ini aman: React sudah mencatat semua hooks di atas secara konsisten.
  // ================================================================
  const token = localStorage.getItem('token');
  if (!token) return null;

  const hasUnread = messages.length > 0 && !isOpen;

  // ================================================================
  // Bell disembunyikan (visibility: hidden) saat popup terbuka.
  // Posisi tetap ada di DOM agar koordinat tidak hilang / bergeser.
  // Saat popup ditutup, bell muncul kembali di posisi yang sama persis.
  // ================================================================
  const bellStyle = pos.x !== null && pos.y !== null
    ? {
        position:   'fixed',
        left:       `${pos.x}px`,
        top:        `${pos.y}px`,
        zIndex:     80,
        transition: isDragging ? 'none' : 'box-shadow 0.2s ease',
        cursor:     isDragging ? 'grabbing' : 'grab',
        touchAction:'none',
        userSelect: 'none',
        visibility: isOpen ? 'hidden' : 'visible',
      }
    : {
        position:   'fixed',
        left:       '16px',
        top:        '30%',
        zIndex:     80,
        cursor:     'grab',
        touchAction:'none',
        userSelect: 'none',
        visibility: isOpen ? 'hidden' : 'visible',
      };

  // ================================================================
  // RENDER
  // ================================================================
  return (
    <>
      <style>{`
        @keyframes ownerFloat {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-8px); }
        }
        @keyframes ownerShakeLoop {
          0%        { transform: rotate(0deg); }
          5%        { transform: rotate(20deg); }
          10%       { transform: rotate(-17deg); }
          15%       { transform: rotate(14deg); }
          20%       { transform: rotate(-10deg); }
          25%       { transform: rotate(6deg); }
          30%       { transform: rotate(-3deg); }
          35%,100%  { transform: rotate(0deg); }
        }
        @keyframes ownerPopupIn {
          0%   { opacity:0; transform:scale(0.92) translateY(8px); }
          100% { opacity:1; transform:scale(1)    translateY(0px); }
        }
        @keyframes ownerPopupOut {
          0%   { opacity:1; transform:scale(1)    translateY(0px); }
          100% { opacity:0; transform:scale(0.92) translateY(8px); }
        }
        @keyframes ownerPopupFloat {
          0%,100% { transform:translateY(0px); }
          50%     { transform:translateY(-5px); }
        }
        @keyframes badgePulse {
          0%,100% { transform:scale(1);   }
          50%     { transform:scale(1.2); }
        }
        .owner-bell-float      { animation: ownerFloat      3s   ease-in-out infinite; }
        .owner-bell-shake-loop { animation: ownerShakeLoop  2.5s ease-in-out infinite; }
        .owner-popup-exit      { animation: ownerPopupOut   0.35s ease-in     forwards; }
        .owner-popup-idle      {
          animation: ownerPopupIn   0.4s cubic-bezier(0.34,1.4,0.64,1) forwards,
                     ownerPopupFloat 4s  ease-in-out 0.5s infinite;
        }
        .owner-badge-pulse     { animation: badgePulse 1.8s ease-in-out infinite; }
        .owner-bell-dragging   {
          animation:none !important;
          transform:scale(1.08);
          filter:brightness(1.15);
        }
      `}</style>

      {/* ── BELL ── */}
      {/* visibility:hidden saat popup terbuka agar posisi tetap terjaga di DOM */}
      <div
        ref={bellRef}
        style={bellStyle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <button
          className={`
            relative flex h-12 w-12 items-center justify-center rounded-2xl
            transition-all duration-200 select-none
            ${isDragging ? 'owner-bell-dragging' : hasUnread ? 'owner-bell-shake-loop' : 'owner-bell-float'}
          `}
          style={{
            background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%)',
            boxShadow: isDragging
              ? '0 16px 40px rgba(139,92,246,.65),0 4px 12px rgba(139,92,246,.4)'
              : '0 8px 24px rgba(139,92,246,.45),0 2px 8px rgba(139,92,246,.3)',
          }}
          aria-label="Pemberitahuan dari Owner"
          onClick={(e) => e.preventDefault()}
        >
          <Bell size={22} className="text-white drop-shadow pointer-events-none" />
          {hasUnread && (
            <span
              className="owner-badge-pulse absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white shadow-lg pointer-events-none"
              style={{
                background: 'linear-gradient(135deg,#f97316,#ef4444)',
                boxShadow: '0 2px 8px rgba(239,68,68,.5)',
              }}
            >
              {messages.length > 9 ? '9+' : messages.length}
            </span>
          )}
        </button>
      </div>

      {/* ── POPUP ── */}
      {isOpen && (
        <div
          className="fixed z-[80]"
          style={{ left: `${popupPos.left}px`, top: `${popupPos.top}px` }}
        >
          <div
            className={`w-72 overflow-hidden rounded-3xl ${isClosing ? 'owner-popup-exit' : 'owner-popup-idle'}`}
            style={{
              background: 'linear-gradient(160deg,#1e1b4b 0%,#2e1065 50%,#1e1b4b 100%)',
              border: '1px solid rgba(139,92,246,.3)',
              boxShadow: '0 20px 60px rgba(109,40,217,.4),0 8px 24px rgba(0,0,0,.3)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom:'1px solid rgba(139,92,246,.2)' }}>
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor:'#a78bfa' }} />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor:'#8b5cf6' }} />
                </span>
                <h4 className="text-sm font-bold text-white tracking-wide">Info dari Owner</h4>
              </div>
              <button
                onClick={handleClose}
                disabled={!canClose}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all duration-200 ${canClose ? 'text-white active:scale-95' : 'cursor-not-allowed'}`}
                style={canClose
                  ? { background:'linear-gradient(135deg,#ef4444,#f97316)', boxShadow:'0 2px 8px rgba(239,68,68,.35)' }
                  : { background:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.4)' }
                }
              >
                <X size={12} />
                {canClose ? 'Tutup' : `${countdown}s`}
              </button>
            </div>

            {/* Pesan */}
            <div className="max-h-64 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((item, index) => {
                const parts = parseMessage(item.pesan);
                return (
                  <div key={index} className="rounded-2xl px-3.5 py-3" style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(139,92,246,.18)' }}>
                    <p className="text-xs leading-relaxed break-words" style={{ color:'rgba(255,255,255,.85)' }}>
                      {parts.map((part, i) =>
                        part.type === 'link' ? (
                          <a key={i} href={part.href} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 font-semibold underline underline-offset-2 break-all"
                            style={{ color:'#c4b5fd' }}
                          >
                            {part.value}
                            <ExternalLink size={10} className="shrink-0 ml-0.5" />
                          </a>
                        ) : (
                          <span key={i}>{part.value}</span>
                        )
                      )}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5" style={{ borderTop:'1px solid rgba(139,92,246,.2)' }}>
              <p className="text-center text-[10px] font-semibold tracking-widest uppercase" style={{ color:'rgba(167,139,250,.6)' }}>
                RuangOTP System
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OwnerNotification;
