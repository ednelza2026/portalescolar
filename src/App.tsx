import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BookOpen,
  Newspaper,
  Calendar,
  Users,
  BarChart3,
  Phone,
  Heart,
  Star,
  Send,
  Plus,
  Trash2,
  LogOut,
  LogIn,
  Camera,
  User,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FileText,
  MessageSquare,
  Handshake,
  CreditCard,
  Upload,
  Timer,
  ExternalLink,
  ShieldCheck,
  FileDown,
  Play,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Markdown from 'react-markdown';
import { News, SchoolEvent, Evaluation, SchoolSettings, Sponsor } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const parseSponsorMedia = (sponsor: any): Sponsor => {
  let parsed = [];
  try {
    if (sponsor.media_url) {
      if (typeof sponsor.media_url === 'string' && sponsor.media_url.trim().startsWith('[')) {
        parsed = JSON.parse(sponsor.media_url);
      } else {
        // legacy single string migration
        parsed = [{ url: sponsor.media_url, type: sponsor.media_type || 'image' }];
      }
    }
  } catch (e) {
    console.error("Failed to parse sponsor media", e);
  }
  return { ...sponsor, parsed_media: parsed };
};

// --- Components ---

const BannerSlideshow = ({ bannerSetting }: { bannerSetting: any }) => {
  const [idx, setIdx] = useState(0);
  
  const bannerList = useMemo(() => {
    try {
      if (typeof bannerSetting !== 'string' || !bannerSetting) return ["https://picsum.photos/seed/school/1920/1080"];
      if (bannerSetting.startsWith('[')) return JSON.parse(bannerSetting) as string[];
      return [bannerSetting];
    } catch { }
    return ["https://picsum.photos/seed/school/1920/1080"];
  }, [bannerSetting]);

  useEffect(() => {
    if (bannerList.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % bannerList.length), 8000);
    return () => clearInterval(t);
  }, [bannerList.length]);

  const current = bannerList[idx] || bannerList[0];

  return (
    <AnimatePresence mode="wait">
      <motion.img
        key={current}
        src={current}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        referrerPolicy="no-referrer"
      />
    </AnimatePresence>
  );
};

const VideoCard = ({ videoSetting, isAdmin, onSave }: { videoSetting: any, isAdmin: boolean, onSave: (list: string[]) => Promise<void> }) => {
  const [vidIdx, setVidIdx] = useState(0);

  const videoList = useMemo(() => {
    try {
      if (typeof videoSetting !== 'string' || !videoSetting) return [];
      if (videoSetting.startsWith('[')) return JSON.parse(videoSetting) as string[];
      return [videoSetting];
    } catch { }
    return [];
  }, [videoSetting]);

  const safeIdx = videoList.length ? Math.min(vidIdx, videoList.length - 1) : 0;
  const current = videoList[safeIdx] ?? '';

  const renderVideo = (v: string) => {
    const ytMatch = v.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) {
      return (
        <iframe
          key={v}
          src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Vídeo da Escola"
        />
      );
    }
    return (
      <video
        key={v}
        src={v}
        className="absolute inset-0 w-full h-full object-cover"
        controls
        playsInline
      />
    );
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black border-2 border-white/10 group flex-shrink-0" style={{ aspectRatio: '16/9' }}>
      {videoList.length > 0 ? renderVideo(current) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-white/40 p-4 text-center">
          <Play className="w-12 h-12 mb-3 text-white/20" />
          <p className="text-xs font-bold uppercase tracking-widest">Vídeo da Escola</p>
          <p className="text-[10px] mt-1">Configure no painel Admin</p>
        </div>
      )}

      {videoList.length > 1 && (
        <>
          <button
            onClick={() => setVidIdx(i => (i - 1 + videoList.length) % videoList.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur text-white flex items-center justify-center transition-all shadow-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setVidIdx(i => (i + 1) % videoList.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur text-white flex items-center justify-center transition-all shadow-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
            {videoList.map((_, i) => (
              <button
                key={i}
                onClick={() => setVidIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === safeIdx ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </>
      )}

      {isAdmin && (
        <div className="absolute top-2 right-2 z-30 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <label className="cursor-pointer p-1.5 bg-black/70 backdrop-blur text-white rounded-lg hover:bg-black/90 transition-colors" title="Adicionar vídeo">
            <Plus className="w-3.5 h-3.5" />
            <input type="file" className="hidden" accept="video/*" multiple onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              const newUrls: string[] = [];
              for (const file of files) {
                const base64 = await new Promise<string>(resolve => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.readAsDataURL(file);
                });
                newUrls.push(base64);
              }
              await onSave([...videoList, ...newUrls]);
              setVidIdx(videoList.length + newUrls.length - 1);
            }} />
          </label>
          {videoList.length > 0 && (
            <button
              title="Remover este vídeo"
              onClick={async () => {
                if (!confirm('Remover este vídeo?')) return;
                const updated = videoList.filter((_, i) => i !== safeIdx);
                await onSave(updated);
                setVidIdx(Math.max(0, safeIdx - 1));
              }}
              className="p-1.5 bg-red-600/80 backdrop-blur text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {videoList.length > 1 && (
        <div className="absolute top-2 left-2 z-20 px-2 py-0.5 bg-black/60 backdrop-blur text-white text-[10px] font-bold rounded-full">
          {safeIdx + 1}/{videoList.length}
        </div>
      )}
    </div>
  );
};

const Navbar = ({ activeTab, setActiveTab, isAdmin, isSponsor, onLogout, settings, hasPendingPayments }: {
  activeTab: string,
  setActiveTab: (tab: string) => void,
  isAdmin: boolean,
  isSponsor: boolean,
  onLogout: () => void,
  settings: SchoolSettings,
  hasPendingPayments?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'inicio', label: 'Início', icon: BookOpen },
    { id: 'noticias', label: 'Notícias', icon: Newspaper },
    { id: 'eventos', label: 'Eventos', icon: Calendar },
    { id: 'participacao', label: 'Participação', icon: Users },
    { id: 'avaliacao', label: 'Avaliação', icon: BarChart3 },
    { id: 'contato', label: 'Contato', icon: Phone },
  ];

  if (isAdmin) {
    menuItems.push({ id: 'admin', label: 'Admin', icon: FileText });
  }
  if (isSponsor) {
    menuItems.push({ id: 'patrocinador', label: 'Patrocinador', icon: Star });
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#101828] text-slate-200 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="h-14 min-w-[3.5rem] rounded-xl flex items-center justify-center overflow-hidden">
              {settings.logo ? (
                <img src={settings.logo} alt="Logo" className="h-full w-auto object-contain" />
              ) : (
                <BookOpen className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="hidden sm:flex flex-col justify-center min-w-0">
              <span className="text-xl lg:text-2xl font-black tracking-tighter text-white leading-none uppercase truncate">{settings.portal_name || "Portal Escola"}</span>
              <span className="text-[9px] lg:text-[11px] font-bold tracking-widest text-slate-400 leading-tight uppercase mt-0.5 truncate">{settings.school_name || "Ednelza Bezerra Trindade"}</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden xl:flex items-center space-x-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "relative flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeTab === item.id
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
                {item.id === 'admin' && hasPendingPayments && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
            {(isAdmin || isSponsor) && (
              <button
                onClick={onLogout}
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-white transition-colors">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-[#101828] border-b border-slate-800 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center w-full px-3 py-2 rounded-lg text-base font-medium",
                    activeTab === item.id
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              ))}
              {(isAdmin || isSponsor) && (
                <button
                  onClick={onLogout}
                  className="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sair
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const StarRating = ({ rating, setRating, readonly = false }: {
  rating: number,
  setRating?: (r: number) => void,
  readonly?: boolean
}) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => setRating?.(star)}
          className={cn(
            "transition-transform",
            !readonly && "hover:scale-110 active:scale-95",
            star <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"
          )}
        >
          <Star className={cn("w-6 h-6", readonly && "w-4 h-4")} />
        </button>
      ))}
    </div>
  );
};

const SponsorSlider = ({ sponsors }: { sponsors: Sponsor[] }) => {
  const slides = sponsors.flatMap(sponsor => {
    const media = sponsor.parsed_media && sponsor.parsed_media.length > 0
      ? sponsor.parsed_media
      : [{ url: '', type: 'image' as const }];

    return media.map(m => ({
      sponsor,
      mediaItem: m
    }));
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];
  const { sponsor: current, mediaItem } = currentSlide;

  return (
    <div className="w-full mt-6 flex-shrink-0">
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-xl flex flex-col">
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
          <Star className="w-3 h-3 fill-yellow-900" />
          <span>Patrocinador</span>
        </div>

        <div className="w-full h-48 sm:h-56 overflow-hidden relative group">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${current.id}-${mediaItem.url}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full h-full"
            >
              {mediaItem.url ? (
                mediaItem.type === 'video' ? (
                  <video
                    src={mediaItem.url}
                    autoPlay
                    muted
                    loop
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img src={mediaItem.url} alt={current.business_name} className="w-full h-full object-cover" />
                )
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <Handshake className="w-12 h-12 text-slate-300" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-6 relative bg-white flex flex-col justify-between flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h4 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tighter">
                {current.business_name}
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed italic line-clamp-3">
                "{current.ad_text || "Apoie nossa escola! Seja você também um patrocinador."}"
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex space-x-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1.5 transition-all duration-500 rounded-full flex-shrink-0",
                  idx === currentIndex ? "w-8 bg-yellow-400" : "w-1.5 bg-slate-200"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SponsorPortal = ({
  sponsorId,
  businessName,
  onLogout,
  settings
}: {
  sponsorId: number,
  businessName: string,
  onLogout: () => void,
  settings: SchoolSettings
}) => {
  const [sponsorData, setSponsorData] = useState<Sponsor | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchSponsorData = async () => {
    // We use the admin endpoint but just for this ID (backend allows it if we pass ID)
    // Actually I should have made a specific sponsor endpoint. 
    // For now I'll use a hack or just assume we have the data from a new endpoint.
    const res = await fetch(`/api/admin/sponsors`);
    const all = await res.json();
    const mine = all.find((s: any) => s.id === sponsorId);
    setSponsorData(mine ? parseSponsorMedia(mine) : null);
  };

  useEffect(() => {
    fetchSponsorData();
  }, [sponsorId]);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    const newMedia: { url: string; type: 'image' | 'video' }[] = [];

    // Read all selected files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const type = file.type.startsWith('video') ? 'video' : 'image';

      await new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newMedia.push({ url: reader.result as string, type });
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    const currentMedia = sponsorData?.parsed_media || [];
    const updatedMedia = [...currentMedia, ...newMedia];

    await fetch(`/api/sponsors/${sponsorId}/media`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mediaItems: updatedMedia,
        ad_text: sponsorData?.ad_text
      })
    });

    fetchSponsorData();
    setUploading(false);
    setMessage("Mídia adicionada com sucesso!");
  };

  const handleRemoveMedia = async (index: number) => {
    if (!confirm("Remover esta mídia?")) return;

    const currentMedia = [...(sponsorData?.parsed_media || [])];
    currentMedia.splice(index, 1);

    await fetch(`/api/sponsors/${sponsorId}/media`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mediaItems: currentMedia,
        ad_text: sponsorData?.ad_text
      })
    });
    fetchSponsorData();
  };

  const handleTextUpdate = async (text: string) => {
    await fetch(`/api/sponsors/${sponsorId}/media`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mediaItems: sponsorData?.parsed_media || [],
        ad_text: text
      })
    });
    setSponsorData(prev => prev ? { ...prev, ad_text: text } : null);
  };

  const handlePaymentProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      await fetch(`/api/sponsors/${sponsorId}/payment-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_proof_url: base64 })
      });
      fetchSponsorData();
      alert("Comprovante enviado! Aguarde a aprovação do administrador.");
    };
    reader.readAsDataURL(file);
  };

  const generateNewPassword = async () => {
    const res = await fetch(`/api/admin/sponsors/${sponsorId}/new-password`, { method: 'POST' });
    const data = await res.json();
    alert(`Sua nova senha é: ${data.password}\nAnote-a, pois ela não será exibida novamente.`);
  };

  if (!sponsorData) return <div className="p-8 text-center text-slate-500">Carregando painel do patrocinador...</div>;

  const daysLeft = Math.ceil((new Date(sponsorData.subscription_start).getTime() + sponsorData.subscription_duration_days * 24 * 60 * 60 * 1000 - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = daysLeft <= 0;
  const isInactive = sponsorData.active === 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="bg-white rounded-3xl card-shadow border border-slate-100 overflow-hidden">
        <div className="bg-[#101828] p-8 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-2">
              {businessName}
              <button
                onClick={async () => {
                  const newName = prompt("Editar Nome do Patrocinador:", businessName);
                  if (newName && newName !== businessName) {
                    await fetch(`/api/sponsors/${sponsorId}/name`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ business_name: newName })
                    });
                    localStorage.setItem('sponsorName', newName);
                    alert("Nome atualizado com sucesso!");
                    window.location.reload();
                  }
                }}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Editar Nome da Empresa"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </h2>
            <p className="text-slate-400 text-sm">Painel do Patrocinador</p>
          </div>
          <button onClick={onLogout} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <LogOut className="w-6 h-6 border-red-500" />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Status and Expiry */}
          <div className={cn(
            "p-6 rounded-2xl flex flex-col justify-center items-center space-y-4 border-2",
            isInactive ? "bg-yellow-50 border-yellow-100 text-yellow-700" :
              isExpired ? "bg-red-50 border-red-100 text-red-700" : "bg-green-50 border-green-100 text-green-700"
          )}>
            <div className="p-4 bg-white rounded-full shadow-sm">
              <Timer className={cn("w-10 h-10", isInactive ? "text-yellow-500 animate-pulse" : isExpired ? "text-red-500 animate-pulse" : "text-green-500")} />
            </div>
            <div className="text-center">
              <h3 className="font-black text-xl">{isInactive ? "Assinatura Inativa" : (isExpired ? "Assinatura Expirada" : "Assinatura Ativa")}</h3>
              <p className="text-sm opacity-80">{isInactive ? "Aguardando pagamento ou aprovação" : (isExpired ? "Renove para continuar anunciando" : `${daysLeft} dias restantes`)}</p>
            </div>

            {(isExpired || isInactive) && (
              <div className={cn("w-full space-y-4 pt-4 border-t mt-4", isInactive ? "border-yellow-200" : "border-red-200")}>
                <div className="bg-white p-4 rounded-xl text-center shadow-sm">
                  <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Pague via PIX</p>
                  <p className="font-mono font-bold break-all">{settings.pix_key || "Chave não configurada"}</p>
                </div>
                <label className={cn("block w-full py-3 text-white text-center rounded-xl font-bold cursor-pointer transition-colors", isInactive ? "bg-yellow-600 hover:bg-yellow-700" : "bg-red-600 hover:bg-red-700")}>
                  <CreditCard className="w-5 h-5 inline mr-2" />
                  Enviar Comprovante
                  <input type="file" className="hidden" accept="image/*" onChange={handlePaymentProof} />
                </label>
              </div>
            )}

            {sponsorData.payment_status === 'pending' && (
              <div className="w-full bg-yellow-100 text-yellow-800 p-3 rounded-xl text-xs font-bold text-center flex items-center justify-center">
                <AlertCircle className="w-4 h-4 mr-2" /> Comprovante em análise
              </div>
            )}
          </div>

          {/* Media and Ad Text */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-widest">Sua Propaganda (Galeria)</label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {(sponsorData.parsed_media || []).map((m, idx) => (
                  <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden group shadow-sm bg-slate-100">
                    {m.type === 'video' ? (
                      <video src={m.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={m.url} className="w-full h-full object-cover" />
                    )}
                    <button
                      onClick={() => handleRemoveMedia(idx)}
                      className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      title="Remover mídia"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <label className="relative aspect-video rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors group">
                  <Upload className="w-8 h-8 text-slate-300 group-hover:text-school-blue transition-colors mb-2" />
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-widest group-hover:text-school-blue transition-colors">Adicionar Mídia</span>
                  <input type="file" className="hidden" accept="image/*,video/*" multiple onChange={handleMediaUpload} />
                  {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-school-blue"></div></div>}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-widest">Texto do Comercial</label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none text-sm min-h-[100px]"
                placeholder="Ex: Venha conhecer nossas promoções de volta às aulas!"
                defaultValue={sponsorData.ad_text}
                onBlur={(e) => handleTextUpdate(e.target.value)}
              />
              <p className="text-[10px] text-slate-400 mt-1 italic">* O texto é salvo automaticamente ao clicar fora da caixa.</p>
            </div>

            {message && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center font-bold text-sm shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <ShieldCheck className="w-5 h-5 mr-2" />
                {message}
              </div>
            )}

            <button
              onClick={() => {
                setMessage("Propaganda publicada com sucesso! Ela já está visível na página inicial.");
                setTimeout(() => setMessage(""), 5000);
              }}
              className="w-full py-4 bg-school-blue hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-4"
            >
              PUBLICAR PROPAGANDA
            </button>
          </div>
        </div>

        <div className="bg-slate-50 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 mr-1" /> Dados seguros e criptografados
          </div>
          <button
            onClick={generateNewPassword}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center underline"
          >
            Gerar Nova Senha de Acesso
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');
  const [news, setNews] = useState<News[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [settings, setSettings] = useState<SchoolSettings>({});
  const [loading, setLoading] = useState(true);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [currentUser, setCurrentUser] = useState<string | null>(() => localStorage.getItem('currentUser'));
  const [showLogin, setShowLogin] = useState(false);
  const [showSponsorLogin, setShowSponsorLogin] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [activeSponsors, setActiveSponsors] = useState<Sponsor[]>([]);
  const [isSponsor, setIsSponsor] = useState(() => localStorage.getItem('isSponsor') === 'true');
  const [currentSponsor, setCurrentSponsor] = useState<number | null>(() => {
    const s = localStorage.getItem('currentSponsor');
    return s ? parseInt(s) : null;
  });
  const [sponsorName, setSponsorName] = useState(() => localStorage.getItem('sponsorName') || "");

  useEffect(() => {
    fetchData();
    // Real-time access counter: only record once per session
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (!hasVisited) {
      recordAccess();
      sessionStorage.setItem('hasVisited', 'true');
    }
    fetchActiveSponsors();
  }, []);

  const fetchData = async () => {
    try {
      const [newsRes, eventsRes, evalsRes, settingsRes] = await Promise.all([
        fetch('/api/news'),
        fetch('/api/events'),
        fetch('/api/evaluations'),
        fetch('/api/settings'),
      ]);

      setNews(await newsRes.json());
      setEvents(await eventsRes.json());
      setEvaluations(await evalsRes.json());
      setSettings(await settingsRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSponsors = async () => {
    try {
      const res = await fetch('/api/admin/sponsors');
      const s = await res.json();
      setSponsors(s.map(parseSponsorMedia));
    } catch (error) {
      console.error("Error fetching all sponsors:", error);
    }
  };

  const fetchActiveSponsors = async () => {
    try {
      const res = await fetch('/api/sponsors');
      const data = await res.json();
      setActiveSponsors(data.map(parseSponsorMedia));
    } catch (error) {
      console.error("Error fetching active sponsors:", error);
    }
  };

  const recordAccess = async () => {
    try {
      // Small delay to ensure it's not a bot/pre-render
      setTimeout(async () => {
        const res = await fetch('/api/access', { method: 'POST' });
        if (res.ok) {
          // Update the local settings state with the new count
          const newSettings = await (await fetch('/api/settings')).json();
          setSettings(prev => ({ ...prev, access_count: newSettings.access_count }));
        }
      }, 2000);
    } catch (error) {
      console.error("Error recording access:", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(true);
        setCurrentUser(data.username);
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('currentUser', data.username);
        setShowLogin(false);
        setActiveTab('admin');
        fetchAllSponsors(); // load all sponsors as soon as admin logs in
      } else {
        alert("Credenciais inválidas");
      }
    } catch (error) {
      alert("Erro ao fazer login");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentUser(null);
    setIsSponsor(false);
    setCurrentSponsor(null);
    setSponsorName("");
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isSponsor');
    localStorage.removeItem('currentSponsor');
    localStorage.removeItem('sponsorName');
    setActiveTab('inicio');
  };

  const handleSponsorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      const res = await fetch('/api/sponsors/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        setIsSponsor(true);
        setCurrentSponsor(data.id);
        setSponsorName(data.business_name);
        localStorage.setItem('isSponsor', 'true');
        localStorage.setItem('currentSponsor', data.id.toString());
        localStorage.setItem('sponsorName', data.business_name);
        setShowSponsorLogin(false);
        setActiveTab('patrocinador');
      } else {
        alert("Credenciais do patrocinador inválidas");
      }
    } catch (error) {
      alert("Erro ao fazer login de patrocinador");
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'logo', value: base64 })
        });
        setSettings(prev => ({ ...prev, logo: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        let bannerList: string[] = [];
        try {
          const raw = settings.banner as string;
          if (raw) {
            bannerList = raw.startsWith('[') ? JSON.parse(raw) : [raw];
          }
        } catch { }

        const updated = [...bannerList, base64];
        const val = JSON.stringify(updated);
        
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'banner', value: val })
        });
        setSettings(prev => ({ ...prev, banner: val }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLike = async (id: number) => {
    await fetch(`/api/news/${id}/like`, { method: 'POST' });
    setNews(news.map(n => n.id === id ? { ...n, likes: n.likes + 1 } : n));
  };

  const analyzeComments = async () => {
    const comments = evaluations.map(e => e.comment).filter(c => c && c.length > 10);
    if (comments.length === 0) {
      alert("Ainda não há comentários longos o suficiente para gerar uma análise. São necessários comentários com mais de 10 caracteres.");
      return;
    }

    setAiAnalysis("Analisando comentários com Inteligência Artificial, por favor aguarde...");

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro desconhecido");
      }

      setAiAnalysis(data.analysis);
    } catch (error: any) {
      console.error("AI analysis error", error);
      setAiAnalysis(null);
      alert("Falha ao gerar análise: " + error.message);
    }
  };

  const generateSponsorPDF = (sponsor: any) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('pt-BR');
    const endDate = new Date(new Date(sponsor.subscription_start).getTime() + sponsor.subscription_duration_days * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>Credenciais Patrocinador – ${sponsor.business_name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Inter', sans-serif; background: #f8fafc; display:flex; align-items:center; justify-content:center; min-height:100vh; padding:20px; }
    .card { background:#fff; border-radius:20px; box-shadow:0 20px 60px rgba(0,0,0,.12); max-width:500px; width:100%; overflow:hidden; }
    .header { background: linear-gradient(135deg,#1e3a8a,#1d4ed8); padding:32px; text-align:center; color:#fff; }
    .header h1 { font-size:22px; font-weight:900; letter-spacing:-0.5px; margin-bottom:4px; }
    .header p { font-size:12px; opacity:.7; }
    .badge { display:inline-block; background:rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.25); border-radius:99px; padding:4px 14px; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin-top:14px; }
    .body { padding:32px; }
    .company { text-align:center; margin-bottom:28px; }
    .company h2 { font-size:26px; font-weight:900; color:#0f172a; letter-spacing:-1px; }
    .company p { color:#64748b; font-size:13px; margin-top:4px; }
    .cred-box { background:#f1f5f9; border-radius:14px; padding:20px 24px; margin-bottom:20px; border:2px dashed #cbd5e1; }
    .cred-box label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; display:block; margin-bottom:4px; }
    .cred-box .val { font-size:22px; font-weight:900; color:#1e3a8a; letter-spacing:2px; font-family:monospace; }
    .info-row { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f1f5f9; font-size:13px; color:#475569; }
    .info-row strong { color:#0f172a; font-weight:700; }
    .warn { margin-top:24px; background:#fef9c3; border-left:4px solid #eab308; border-radius:8px; padding:14px 16px; font-size:12px; color:#713f12; line-height:1.6; }
    .footer-note { margin-top:24px; text-align:center; font-size:11px; color:#94a3b8; }
    .footer-note strong { display:block; color:#475569; font-size:13px; margin-bottom:4px; }
    @media print {
      body { background:#fff; padding:0; }
      .card { box-shadow:none; border-radius:0; }
      .no-print { display:none; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Portal Escola Ednelza Bezerra Trindade</h1>
      <p>Comprovante de Cadastro de Patrocinador</p>
      <div class="badge">📋 Credenciais de Acesso</div>
    </div>
    <div class="body">
      <div class="company">
        <h2>${sponsor.business_name}</h2>
        <p>Cadastrado em ${dateStr} às ${timeStr}</p>
      </div>

      <div class="cred-box">
        <label>Nome de Usuário</label>
        <div class="val">${sponsor.username}</div>
      </div>

      <div class="cred-box">
        <label>Senha de Acesso</label>
        <div class="val">${sponsor.password || '******'}</div>
      </div>

      <div class="info-row"><span>Chave PIX para Pagamento</span><strong>${settings.pix_key || 'Não configurada'}</strong></div>
      <div class="info-row"><span>Portal Patrocinador</span><strong>Rodapé do site</strong></div>
      <div class="info-row"><span>Duração da assinatura</span><strong>${sponsor.subscription_duration_days} dias</strong></div>
      <div class="info-row"><span>Válido até</span><strong>${endDate}</strong></div>

      <div class="warn">
        ⚠️ <strong>Guarde essas informações com segurança.</strong><br/>
        Com esse usuário e senha, o patrocinador acessa o portal para enviar imagens, vídeos e textos dos anúncios, além de enviar comprovante de pagamento para renovação.
      </div>

      <div class="footer-note">
        <strong>Como acessar o portal?</strong>
        Acesse o site da escola → Role até o rodapé → Clique em "Portal do Patrocinador"
      </div>
    </div>
  </div>
  <script>
    window.onload = () => { window.print(); }
  </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Moved the loading check to just before the return to ensure all hooks are called consistently
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-school-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        isSponsor={isSponsor}
        onLogout={handleLogout}
        settings={settings}
        hasPendingPayments={sponsors.some(s => s.payment_status === 'pending')}
      />

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {activeTab === 'inicio' && (
            <motion.div
              key="inicio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 pb-12"
            >
              {/* Hero Section */}
              <div className="relative w-full overflow-hidden bg-slate-900 min-h-[500px] flex items-center py-12">
                {/* Banner Slideshow */}
                <div className="absolute inset-0 z-0">
                  <BannerSlideshow bannerSetting={settings.banner} />
                </div>

                <div className="absolute inset-0 bg-gradient-to-b from-[#101828]/60 via-transparent to-[#101828]/80 z-[1]" />

                {isAdmin && (
                  <div className="absolute top-4 right-4 z-[30] flex gap-2">
                    <label className="p-2 md:p-3 bg-white/10 backdrop-blur-md text-white rounded-xl cursor-pointer shadow-lg hover:bg-white/20 transition-all flex items-center space-x-2 border border-white/20">
                      <Camera className="w-4 h-4 md:w-5 h-5" />
                      <span className="text-xs md:text-sm font-bold">Adicionar Banner</span>
                      <input type="file" className="hidden" onChange={handleBannerUpload} accept="image/*" />
                    </label>
                    {(() => {
                      let list: string[] = [];
                      try {
                        const raw = settings.banner as string;
                        if (raw && raw.startsWith('[')) list = JSON.parse(raw);
                        else if (raw) list = [raw];
                      } catch { }
                      if (list.length > 0) {
                        return (
                          <button
                            onClick={async () => {
                              if (!confirm('Limpar todos os banners?')) return;
                              await fetch('/api/settings', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ key: 'banner', value: '' })
                              });
                              setSettings(prev => ({ ...prev, banner: '' }));
                            }}
                            className="p-2 md:p-3 bg-red-600/40 backdrop-blur-md text-white rounded-xl shadow-lg hover:bg-red-600/60 transition-all flex items-center space-x-2 border border-white/20"
                          >
                            <Trash2 className="w-4 h-4 md:w-5 h-5" />
                          </button>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}

                <div className="relative z-[10] w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                  {/* Centralized Logo (Special Request) */}
                  <div className="flex flex-col items-center mb-8">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-white/10 backdrop-blur-xl border-4 border-white/20 flex items-center justify-center p-4 shadow-2xl mb-6"
                    >
                      {settings.logo ? (
                        <img src={settings.logo} alt="Logo Central" className="w-full h-full object-contain filter drop-shadow-lg" />
                      ) : (
                        <BookOpen className="w-16 h-16 md:w-24 md:h-24 text-white/50" />
                      )}
                    </motion.div>
                    <div className="text-center">
                      <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase drop-shadow-2xl">
                        {settings.portal_name || "Portal Escola"}
                      </h1>
                      <div className="w-24 h-2 bg-yellow-400 mx-auto mt-4 rounded-full" />
                      <p className="text-lg md:text-xl font-bold text-slate-300 mt-4 uppercase tracking-[0.2em] opacity-80">
                        {settings.school_name || "Ednelza Bezerra Trindade"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-8 h-full items-stretch mt-12">

                    {/* Video Carousel Section */}
                    <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col items-center lg:items-start gap-4">
                      <VideoCard 
                        videoSetting={settings.school_videos || settings.school_video} 
                        isAdmin={isAdmin}
                        onSave={async (list: string[]) => {
                          const val = JSON.stringify(list);
                          setSettings(prev => ({ ...prev, school_videos: val }));
                          await fetch('/api/settings', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ key: 'school_videos', value: val })
                          });
                        }}
                      />
                      {/* Sponsor Slider below video */}
                      <div className="hidden lg:block w-full">
                        <SponsorSlider sponsors={activeSponsors} />
                      </div>
                    </div>


                    {/* News Grid Area */}
                    <div className="w-full lg:w-2/3 xl:w-3/4">
                      {news.length >= 2 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px] md:h-[600px] xl:h-[500px]">
                          {/* Main Left Card */}
                          <div
                            className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-2xl"
                            onClick={() => setActiveTab('noticias')}
                          >
                            <img src={news[0]?.image_url || "https://picsum.photos/seed/news1/800/600"} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                              <div className="w-12 h-1 bg-red-500 mb-4 rounded-full"></div>
                              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight mb-2 drop-shadow-md">
                                {news[0]?.title}
                              </h3>
                              <p className="text-white/80 text-sm md:text-base line-clamp-2 md:line-clamp-3">
                                {news[0]?.content}
                              </p>
                            </div>
                          </div>

                          {/* Right Column Stack */}
                          <div className="flex flex-col gap-4 h-full">
                            {news.slice(1, 3).map((n, i) => (
                              <div
                                key={i}
                                className="relative flex-1 rounded-2xl overflow-hidden cursor-pointer group shadow-2xl"
                                onClick={() => setActiveTab('noticias')}
                              >
                                <img src={n.image_url || `https://picsum.photos/seed/news${i + 2}/800/600`} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-5 md:p-6 w-full">
                                  <div className="w-10 h-1 bg-red-500 mb-3 rounded-full"></div>
                                  <h3 className="text-lg md:text-xl font-bold text-white leading-tight mb-1 drop-shadow-md">
                                    {n.title}
                                  </h3>
                                  <p className="text-white/80 text-xs md:text-sm line-clamp-2">
                                    {n.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-white/50 border-2 border-dashed border-white/20 rounded-3xl p-8">
                          <Newspaper className="w-12 h-12 mb-4 opacity-50" />
                          <p className="text-center">Cadastre as notícias e eventos no painel Admin para exibir o mural.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Sponsor Slider */}
              <div className="lg:hidden w-full max-w-md mx-auto px-4 mt-6 mb-6">
                <SponsorSlider sponsors={activeSponsors} />
              </div>

              {/* Quick Info Cards */}
              <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl card-shadow border border-slate-100 flex items-start space-x-4">
                  <div className="p-3 bg-blue-50 text-school-blue rounded-xl">
                    <Newspaper className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Últimas Notícias</h3>
                    <p className="text-slate-500 text-sm">Fique por dentro de tudo que acontece na nossa escola.</p>
                    <button onClick={() => setActiveTab('noticias')} className="mt-3 text-school-blue font-semibold text-sm flex items-center hover:underline">
                      Ver notícias <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl card-shadow border border-slate-100 flex items-start space-x-4">
                  <div className="p-3 bg-green-50 text-school-green rounded-xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Calendário Escolar</h3>
                    <p className="text-slate-500 text-sm">Datas de reuniões, provas e eventos comemorativos.</p>
                    <button onClick={() => setActiveTab('eventos')} className="mt-3 text-school-green font-semibold text-sm flex items-center hover:underline">
                      Ver eventos <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl card-shadow border border-slate-100 flex items-start space-x-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Espaço dos Pais</h3>
                    <p className="text-slate-500 text-sm">Sua opinião é fundamental para melhorarmos cada dia mais.</p>
                    <button onClick={() => setActiveTab('participacao')} className="mt-3 text-purple-600 font-semibold text-sm flex items-center hover:underline">
                      Participar <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'noticias' && (
            <motion.div
              key="noticias"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto px-4 py-12"
            >
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-3xl font-display font-bold text-slate-900">Notícias e Avisos</h2>
                  <p className="text-slate-500 mt-2">Acompanhe as atividades e projetos da nossa escola.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {news.length > 0 ? news.map((item) => (
                  <motion.article
                    key={item.id}
                    layout
                    className="bg-white rounded-3xl overflow-hidden card-shadow border border-slate-100 flex flex-col md:flex-row"
                  >
                    <div className="md:w-2/5 h-64 md:h-auto overflow-hidden">
                      <img
                        src={item.image_url || "https://picsum.photos/seed/news/800/600"}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-8 md:w-3/5 flex flex-col">
                      <div className="flex items-center text-sm text-slate-400 mb-4">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(item.date).toLocaleDateString('pt-BR')}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                      <div className="text-slate-600 mb-6 line-clamp-3 prose prose-sm">
                        <Markdown>{item.content}</Markdown>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <button
                          onClick={() => handleLike(item.id)}
                          className="flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-50 text-slate-600 hover:bg-pink-50 hover:text-pink-600 transition-colors group"
                        >
                          <Heart className={cn("w-5 h-5 group-active:scale-125 transition-transform", item.likes > 0 && "fill-pink-600 text-pink-600")} />
                          <span className="font-medium">{item.likes} Curtidas</span>
                        </button>
                        {isAdmin && (
                          <button
                            onClick={async () => {
                              if (confirm('Excluir notícia?')) {
                                await fetch(`/api/news/${item.id}`, { method: 'DELETE' });
                                setNews(news.filter(n => n.id !== item.id));
                              }
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.article>
                )) : (
                  <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <Newspaper className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Nenhuma notícia publicada ainda.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'eventos' && (
            <motion.div
              key="eventos"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto px-4 py-12"
            >
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-8">Calendário de Eventos</h2>

              <div className="space-y-4">
                {events.length > 0 ? events.map((event) => (
                  <div key={event.id} className="bg-white p-6 rounded-2xl card-shadow border border-slate-100 flex items-center space-x-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-school-blue/10 rounded-2xl flex flex-col items-center justify-center text-school-blue">
                      <span className="text-xs font-bold uppercase">{new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                      <span className="text-2xl font-bold leading-none">{new Date(event.date).getDate()}</span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-lg text-slate-900">{event.title}</h3>
                      <p className="text-slate-500 text-sm">{event.description}</p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={async () => {
                          if (confirm('Excluir evento?')) {
                            await fetch(`/api/events/${event.id}`, { method: 'DELETE' });
                            setEvents(events.filter(e => e.id !== event.id));
                          }
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Nenhum evento agendado.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'participacao' && (
            <motion.div
              key="participacao"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto px-4 py-12"
            >
              <div className="bg-white rounded-3xl card-shadow border border-slate-100 overflow-hidden">
                <div className="bg-school-blue p-8 text-white">
                  <h2 className="text-2xl font-display font-bold mb-2">Participação dos Pais</h2>
                  <p className="text-blue-100">Sua avaliação ajuda a construir uma escola melhor para todos.</p>
                </div>

                <form
                  className="p-8 space-y-8"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const formData = new FormData(e.currentTarget);
                      const data = {
                        name: formData.get('name'),
                        student: formData.get('student'),
                        class: formData.get('class'),
                        teaching_quality: Number(formData.get('teaching_quality')),
                        communication: Number(formData.get('communication')),
                        organization: Number(formData.get('organization')),
                        security: Number(formData.get('security')),
                        pedagogical_activities: Number(formData.get('pedagogical_activities')),
                        staff_service: Number(formData.get('staff_service')),
                        comment: formData.get('comment'),
                        date: new Date().toISOString()
                      };

                      const res = await fetch('/api/evaluations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                      });

                      if (res.ok) {
                        alert("Avaliação enviada com sucesso! Obrigado pela participação.");
                        setActiveTab('avaliacao');
                        fetchData();
                        e.currentTarget.reset();
                      } else {
                        const err = await res.json();
                        alert("Erro ao enviar avaliação: " + (err.error || "Desconhecido"));
                      }
                    } catch (err) {
                      console.error(err);
                      alert("Erro de conexão ao enviar avaliação.");
                    }
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Seu Nome (Opcional)</label>
                      <input name="name" type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-blue outline-none transition-all" placeholder="Ex: João Silva" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Nome do Aluno (Opcional)</label>
                      <input name="student" type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-blue outline-none transition-all" placeholder="Ex: Maria Silva" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Turma</label>
                      <select name="class" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-blue outline-none transition-all">
                        <option value="">Selecione a turma</option>
                        <option value="1A">1º Ano A</option>
                        <option value="1B">1º Ano B</option>
                        <option value="2A">2º Ano A</option>
                        <option value="2B">2º Ano B</option>
                        <option value="3A">3º Ano A</option>
                        <option value="3B">3º Ano B</option>
                        <option value="4A">4º Ano A</option>
                        <option value="5A">5º Ano A</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-slate-100">
                    <h3 className="font-bold text-lg text-slate-900">Avaliação dos Critérios</h3>

                    {[
                      { id: 'teaching_quality', label: 'Qualidade do Ensino' },
                      { id: 'communication', label: 'Comunicação com os Pais' },
                      { id: 'organization', label: 'Organização da Escola' },
                      { id: 'security', label: 'Segurança dos Alunos' },
                      { id: 'pedagogical_activities', label: 'Atividades Pedagógicas' },
                      { id: 'staff_service', label: 'Atendimento da Equipe' }
                    ].map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-slate-700 font-medium">{item.label}</span>
                        <div className="flex items-center space-x-2">
                          <input type="hidden" name={item.id} id={`rating-${item.id}`} defaultValue="5" />
                          <StarRatingComponent inputId={`rating-${item.id}`} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Deixe sua sugestão ou comentário</label>
                    <textarea name="comment" rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-blue outline-none transition-all" placeholder="Sua opinião é muito importante..."></textarea>
                  </div>

                  <button type="submit" className="w-full py-4 bg-school-blue text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center">
                    <Send className="w-5 h-5 mr-2" />
                    Enviar Avaliação
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'avaliacao' && (
            <motion.div
              key="avaliacao"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 py-12 space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-display font-bold text-slate-900">Painel de Avaliação</h2>
                  <p className="text-slate-500">Resultados baseados na opinião da comunidade escolar.</p>
                </div>

                {/* Termômetro da Escola */}
                <div className="bg-white px-6 py-4 rounded-2xl card-shadow border border-slate-100 flex items-center space-x-4">
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Status Geral</div>
                  {(() => {
                    const avg = evaluations.length > 0
                      ? evaluations.reduce((acc, curr) => acc + (curr.teaching_quality + curr.communication + curr.organization + curr.security + curr.pedagogical_activities + curr.staff_service) / 6, 0) / evaluations.length
                      : 0;

                    if (avg >= 4.5) return <div className="flex items-center text-green-600 font-bold"><div className="w-3 h-3 rounded-full bg-green-600 mr-2 animate-pulse" /> Excelente</div>;
                    if (avg >= 3.5) return <div className="flex items-center text-blue-600 font-bold"><div className="w-3 h-3 rounded-full bg-blue-600 mr-2" /> Bom</div>;
                    if (avg >= 2.5) return <div className="flex items-center text-yellow-600 font-bold"><div className="w-3 h-3 rounded-full bg-yellow-600 mr-2" /> Regular</div>;
                    return <div className="flex items-center text-red-600 font-bold"><div className="w-3 h-3 rounded-full bg-red-600 mr-2" /> Precisa Melhorar</div>;
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico por Critério */}
                <div className="bg-white p-8 rounded-3xl card-shadow border border-slate-100">
                  <h3 className="text-xl font-bold mb-6 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-school-blue" />
                    Média por Critério
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                        { subject: 'Ensino', A: evaluations.reduce((a, c) => a + c.teaching_quality, 0) / (evaluations.length || 1) },
                        { subject: 'Comunicação', A: evaluations.reduce((a, c) => a + c.communication, 0) / (evaluations.length || 1) },
                        { subject: 'Organização', A: evaluations.reduce((a, c) => a + c.organization, 0) / (evaluations.length || 1) },
                        { subject: 'Segurança', A: evaluations.reduce((a, c) => a + c.security, 0) / (evaluations.length || 1) },
                        { subject: 'Pedagógico', A: evaluations.reduce((a, c) => a + c.pedagogical_activities, 0) / (evaluations.length || 1) },
                        { subject: 'Atendimento', A: evaluations.reduce((a, c) => a + c.staff_service, 0) / (evaluations.length || 1) },
                      ]}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} />
                        <Radar name="Escola" dataKey="A" stroke="#1e40af" fill="#1e40af" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Desempenho Geral */}
                <div className="bg-white p-8 rounded-3xl card-shadow border border-slate-100">
                  <h3 className="text-xl font-bold mb-6 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-school-green" />
                    Distribuição de Notas
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Excelente (5)', count: evaluations.filter(e => (e.teaching_quality + e.communication + e.organization + e.security + e.pedagogical_activities + e.staff_service) / 6 >= 4.5).length },
                        {
                          name: 'Bom (4)', count: evaluations.filter(e => {
                            const avg = (e.teaching_quality + e.communication + e.organization + e.security + e.pedagogical_activities + e.staff_service) / 6;
                            return avg >= 3.5 && avg < 4.5;
                          }).length
                        },
                        {
                          name: 'Regular (3)', count: evaluations.filter(e => {
                            const avg = (e.teaching_quality + e.communication + e.organization + e.security + e.pedagogical_activities + e.staff_service) / 6;
                            return avg >= 2.5 && avg < 3.5;
                          }).length
                        },
                        { name: 'Ruim (1-2)', count: evaluations.filter(e => (e.teaching_quality + e.communication + e.organization + e.security + e.pedagogical_activities + e.staff_service) / 6 < 2.5).length },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#15803d" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* AI Analysis Section */}
              <div className="bg-white p-8 rounded-3xl card-shadow border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-purple-600" />
                    Relatório Inteligente (IA)
                  </h3>
                  <button
                    onClick={analyzeComments}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors"
                  >
                    Gerar Análise
                  </button>
                </div>

                {aiAnalysis ? (
                  <div className="prose prose-slate max-w-none bg-purple-50/50 p-6 rounded-2xl border border-purple-100">
                    <Markdown>{aiAnalysis}</Markdown>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    Clique em "Gerar Análise" para processar os comentários dos pais com Inteligência Artificial.
                  </div>
                )}
              </div>

              {/* Comments Section */}
              <div className="bg-white p-8 rounded-3xl card-shadow border border-slate-100 mt-8">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-school-blue" />
                  Sugestões e Comentários Recentes
                </h3>
                {evaluations.filter(e => e.comment && e.comment.trim() !== "").length > 0 ? (
                  <div className="space-y-4">
                    {evaluations.filter(e => e.comment && e.comment.trim() !== "").map((evaluation) => (
                      <div key={evaluation.id} className="relative p-4 bg-slate-50 rounded-2xl border border-slate-100 pr-12">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-700">{evaluation.name || "Anônimo"}</span>
                          <span className="text-xs text-slate-400">{new Date(evaluation.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {evaluation.class && <span className="text-xs font-bold text-school-blue bg-blue-50 px-2 py-1 rounded-md mb-2 inline-block">Turma: {evaluation.class}</span>}
                        <p className="text-slate-600 italic">"{evaluation.comment}"</p>
                        {isAdmin && (
                          <button
                            onClick={async () => {
                              if (confirm('Deletar este comentário permanentemente?')) {
                                await fetch(`/api/evaluations/${evaluation.id}`, { method: 'DELETE' });
                                setEvaluations(evaluations.filter(e => e.id !== evaluation.id));
                              }
                            }}
                            className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-full"
                            title="Deletar comentário"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    Nenhum comentário registrado ainda.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'contato' && (
            <motion.div
              key="contato"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto px-4 py-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-3xl font-display font-bold text-slate-900 mb-6">Fale Conosco</h2>
                  <p className="text-slate-500 mb-8">Estamos à disposição para tirar suas dúvidas e ouvir suas sugestões.</p>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-blue-50 text-school-blue rounded-xl">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Telefone</h4>
                        <p className="text-slate-500">(92) 3333-4444</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-green-50 text-school-green rounded-xl">
                        <Users className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Endereço</h4>
                        <p className="text-slate-500">Rua das Flores, 123 - Centro, Manaus - AM</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl card-shadow border border-slate-100">
                  <h3 className="text-xl font-bold mb-6">Envie uma Mensagem</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Nome</label>
                      <input type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-blue outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                      <input type="email" className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-blue outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Assunto</label>
                      <select className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-blue outline-none">
                        <option>Dúvida</option>
                        <option>Sugestão</option>
                        <option>Reclamação</option>
                        <option>Outros</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Mensagem</label>
                      <textarea rows={4} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-blue outline-none"></textarea>
                    </div>
                    <button type="button" className="w-full py-3 bg-school-blue text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                      Enviar Mensagem
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'admin' && isAdmin && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 py-12"
            >
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
                  Área Administrativa
                  {sponsors.some(s => s.payment_status === 'pending') && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-600 animate-pulse">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      PAGAMENTO PENDENTE
                    </span>
                  )}
                </h2>
                <div className="flex space-x-4">
                  <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-colors flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Relatório PDF
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Publish News */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white p-8 rounded-3xl card-shadow border border-slate-100">
                    <h3 className="text-xl font-bold mb-6 flex items-center">
                      <Plus className="w-5 h-5 mr-2 text-school-blue" />
                      Publicar Nova Notícia
                    </h3>
                    <form
                      className="space-y-4"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const formData = new FormData(form);
                        const data = {
                          title: formData.get('title'),
                          content: formData.get('content'),
                          date: new Date().toISOString(),
                          image_url: formData.get('image_url') || `https://picsum.photos/seed/${Math.random()}/800/600`
                        };

                        try {
                          const res = await fetch('/api/news', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                          });

                          if (res.ok) {
                            form.reset();
                            const preview = document.getElementById('news-image-preview') as HTMLImageElement;
                            const input = document.getElementById('news-image-url') as HTMLInputElement;
                            if (preview) {
                              preview.src = '';
                              preview.classList.add('hidden');
                            }
                            const placeholder = document.getElementById('upload-placeholder');
                            if (placeholder) {
                              placeholder.classList.remove('opacity-0');
                            }
                            if (input) input.value = '';
                            await fetchData();
                            setActiveTab('noticias');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          } else {
                            const err = await res.json();
                            alert("Erro ao publicar: " + (err.error || "Erro desconhecido"));
                          }
                        } catch (error) {
                          alert("Erro de conexão ao publicar notícia.");
                        }
                      }}
                    >
                      <input name="title" required placeholder="Título da Notícia" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-blue outline-none" />
                      <div className="flex flex-col space-y-4">
                        <label className="relative group flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-school-blue hover:bg-blue-50 transition-all overflow-hidden">
                          <div id="upload-placeholder" className="flex flex-col items-center justify-center space-y-2 text-slate-500">
                            <Camera className="w-8 h-8" />
                            <span className="text-sm font-bold">Upload de Imagem da Notícia</span>
                            <span className="text-xs">Clique ou arraste uma foto</span>
                          </div>
                          <img id="news-image-preview" className="hidden absolute inset-0 w-full h-full object-cover" />
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const base64 = reader.result as string;
                                  const preview = document.getElementById('news-image-preview') as HTMLImageElement;
                                  const placeholder = document.getElementById('upload-placeholder');
                                  const input = document.getElementById('news-image-url') as HTMLInputElement;
                                  if (preview) {
                                    preview.src = base64;
                                    preview.classList.remove('hidden');
                                  }
                                  if (placeholder) {
                                    placeholder.classList.add('opacity-0');
                                  }
                                  if (input) input.value = base64;
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        <input id="news-image-url" name="image_url" type="hidden" />
                      </div>
                      <textarea name="content" required rows={6} placeholder="Conteúdo da notícia (Suporta Markdown)..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-blue outline-none font-mono text-sm"></textarea>
                      <button type="submit" className="w-full py-3 bg-school-blue text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                        Publicar Notícia
                      </button>
                    </form>
                  </div>

                  <div className="bg-white p-8 rounded-3xl card-shadow border border-slate-100">
                    <h3 className="text-xl font-bold mb-6 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-school-green" />
                      Criar Novo Evento
                    </h3>
                    <form
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const formData = new FormData(form);
                        const data = {
                          title: formData.get('title'),
                          description: formData.get('description'),
                          date: formData.get('date')
                        };
                        try {
                          const res = await fetch('/api/events', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                          });
                          if (res.ok) {
                            alert("Evento criado com sucesso!");
                            form.reset();
                            fetchData();
                          } else {
                            const err = await res.json();
                            alert("Erro ao criar evento: " + (err.error || "Erro desconhecido"));
                          }
                        } catch (error) {
                          alert("Erro de conexão ao criar evento.");
                        }
                      }}
                    >
                      <input name="title" required placeholder="Título do Evento" className="md:col-span-2 w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-blue outline-none" />
                      <input name="date" type="date" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-blue outline-none" />
                      <input name="description" required placeholder="Breve descrição" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-blue outline-none" />
                      <button type="submit" className="md:col-span-2 w-full py-3 bg-school-green text-white rounded-xl font-bold hover:bg-green-700 transition-colors">
                        Criar Evento
                      </button>
                    </form>
                  </div>
                </div>

                {/* Recent Feedback & Settings */}
                <div className="space-y-8">
                  <div className="bg-white p-8 rounded-3xl card-shadow border border-slate-100">
                    <h3 className="text-xl font-bold mb-6 flex items-center">
                      <Camera className="w-5 h-5 mr-2 text-school-blue" />
                      Configurações Visuais
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">Logo da Escola</label>
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                            {settings.logo ? <img src={settings.logo} className="w-full h-full object-cover" /> : <BookOpen className="text-slate-300" />}
                          </div>
                          <label className="flex-grow px-4 py-2 bg-school-blue text-white text-center rounded-lg text-sm font-bold cursor-pointer hover:bg-blue-700 transition-colors">
                            Alterar Logo
                            <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">Banners em Slideshow (Início)</label>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            {(() => {
                              let list: string[] = [];
                              try {
                                const raw = settings.banner as string;
                                if (raw && raw.startsWith('[')) list = JSON.parse(raw);
                                else if (raw) list = [raw];
                              } catch { }
                              
                              return list.map((b, i) => (
                                <div key={i} className="relative aspect-video rounded-xl bg-slate-50 border border-slate-100 overflow-hidden group">
                                  <img src={b} className="w-full h-full object-cover" />
                                  <button 
                                    onClick={async () => {
                                      if (!confirm("Remover este banner?")) return;
                                      const updated = list.filter((_, idx) => idx !== i);
                                      const val = JSON.stringify(updated);
                                      await fetch('/api/settings', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ key: 'banner', value: val })
                                      });
                                      setSettings(prev => ({ ...prev, banner: val }));
                                    }}
                                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ));
                            })()}
                          </div>
                          <label className="block w-full px-4 py-2 bg-slate-800 text-white text-center rounded-lg text-sm font-bold cursor-pointer hover:bg-slate-900 transition-colors">
                            <Plus className="w-4 h-4 inline mr-2" />
                            Adicionar Banner ao Slideshow
                            <input type="file" className="hidden" onChange={handleBannerUpload} accept="image/*" />
                          </label>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 space-y-4">
                        <h4 className="font-bold text-slate-800 text-sm">Textos da Escola</h4>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Nome do Portal (Principal)</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-school-blue outline-none text-sm"
                            value={settings.portal_name ?? ""}
                            placeholder="Ex: Portal Escola"
                            onChange={async (e) => {
                              const val = e.target.value;
                              setSettings(prev => ({ ...prev, portal_name: val }));
                              await fetch('/api/settings', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ key: 'portal_name', value: val })
                              });
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">
                            🎬 Vídeo da Escola (Link do YouTube ou URL)
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-school-blue outline-none text-sm"
                            value={(settings.school_video as string)?.startsWith('data:') ? '' : (settings.school_video ?? "")}
                            placeholder="Ex: https://youtube.com/watch?v=..."
                            onChange={async (e) => {
                              const val = e.target.value;
                              setSettings(prev => ({ ...prev, school_video: val }));
                              await fetch('/api/settings', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ key: 'school_video', value: val })
                              });
                            }}
                          />
                          <p className="text-[10px] text-slate-400 mt-1">Cole um link do YouTube para exibir no card da página inicial. Ou passe o mouse sobre o card e faça upload de um vídeo.</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Chave PIX para Patrocinadores</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-school-blue outline-none text-sm"
                          value={settings.pix_key ?? ""}
                          placeholder="Ex: CPF, CNPJ ou E-mail"
                          onChange={async (e) => {
                            const val = e.target.value;
                            setSettings(prev => ({ ...prev, pix_key: val }));
                            await fetch('/api/settings', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ key: 'pix_key', value: val })
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl card-shadow border border-slate-100">
                    <h3 className="text-xl font-bold mb-6 flex items-center">
                      <User className="w-5 h-5 mr-2 text-school-blue" />
                      Acesso Administrativo
                    </h3>
                    <form
                      className="space-y-4"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const newUsername = formData.get('newUsername') as string;
                        const newPassword = formData.get('newPassword') as string;

                        if (!newUsername || !newPassword) return;

                        try {
                          const res = await fetch('/api/admin/update-credentials', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              currentUsername: currentUser,
                              newUsername,
                              newPassword
                            })
                          });

                          if (res.ok) {
                            alert("Credenciais atualizadas com sucesso! Por favor, faça login novamente.");
                            handleLogout();
                          } else {
                            alert("Erro ao atualizar credenciais.");
                          }
                        } catch (error) {
                          alert("Erro de conexão.");
                        }
                      }}
                    >
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Novo Usuário</label>
                        <input
                          name="newUsername"
                          type="text"
                          required
                          placeholder="Novo nome de usuário"
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-school-blue outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Nova Senha</label>
                        <input
                          name="newPassword"
                          type="password"
                          required
                          placeholder="Nova senha"
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-school-blue outline-none text-sm"
                        />
                      </div>
                      <button type="submit" className="w-full py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900 transition-colors">
                        Atualizar Credenciais
                      </button>
                    </form>
                  </div>

                  <div className="bg-white p-8 rounded-3xl card-shadow border border-slate-100">
                    <h3 className="text-xl font-bold mb-6">Opiniões Recentes</h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {evaluations.map((evalItem) => (
                        <div key={evalItem.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-sm">{evalItem.name || 'Anônimo'}</span>
                            <span className="text-[10px] text-slate-400">{new Date(evalItem.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-slate-600 italic mb-2">"{evalItem.comment || 'Sem comentário'}"</p>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-bold">
                              {((evalItem.teaching_quality + evalItem.communication + evalItem.organization + evalItem.security + evalItem.pedagogical_activities + evalItem.staff_service) / 6).toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Admin Sponsors Section */}
                <div className="lg:col-span-3">
                  <div className="bg-white p-8 rounded-3xl card-shadow border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold flex items-center">
                        <Handshake className="w-5 h-5 mr-2 text-school-blue" />
                        Gerenciar Patrocinadores
                        {sponsors.some(s => s.payment_status === 'pending') && (
                          <span className="ml-2 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg" title="Pagamentos pendentes!"></span>
                        )}
                      </h3>
                      <button
                        onClick={async () => {
                          const name = prompt("Nome da Empresa/Negócio:");
                          if (name) {
                            const res = await fetch('/api/admin/sponsors', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ business_name: name })
                            });
                            const data = await res.json();
                            fetchAllSponsors();
                            fetchActiveSponsors();

                            // Call the shared helper
                            generateSponsorPDF({
                              ...data,
                              subscription_start: new Date().toISOString(),
                              subscription_duration_days: 30
                            });
                          }
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Novo Patrocinador
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="text-xs uppercase text-slate-400 font-bold border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-3">Empresa</th>
                            <th className="px-4 py-3">Status / Validade</th>
                            <th className="px-4 py-3">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {sponsors.map(sponsor => {
                            const daysLeft = Math.ceil((new Date(sponsor.subscription_start).getTime() + sponsor.subscription_duration_days * 24 * 60 * 60 * 1000 - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            const isExpired = daysLeft <= 0;
                            return (
                              <tr key={sponsor.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-4">
                                  <div className="font-bold text-slate-900 flex items-center gap-2">
                                    {sponsor.business_name}
                                    <button
                                      onClick={async () => {
                                        const newName = prompt("Editar Nome da Empresa:", sponsor.business_name);
                                        if (newName && newName !== sponsor.business_name) {
                                          await fetch(`/api/admin/sponsors/${sponsor.id}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ business_name: newName })
                                          });
                                          fetchAllSponsors();
                                          fetchActiveSponsors();
                                        }
                                      }}
                                      className="p-1 text-slate-400 hover:text-school-blue rounded transition-colors"
                                      title="Editar Nome do Patrocinador"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div className="text-xs text-slate-400">@{sponsor.username}</div>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center space-x-2">
                                    <span className={cn(
                                      "px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
                                      sponsor.active === 0
                                        ? "bg-yellow-100 text-yellow-700"
                                        : isExpired ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                                    )}>
                                      {sponsor.active === 0 ? "Inativo" : (isExpired ? "Expirado" : "Ativo")}
                                    </span>
                                    <span className="text-xs font-medium text-slate-500">{daysLeft} dias</span>
                                    <button
                                      onClick={() => generateSponsorPDF(sponsor)}
                                      className="p-1 text-slate-400 hover:text-school-blue transition-colors rounded"
                                      title="Baixar credenciais em PDF"
                                    >
                                      <FileDown className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  {sponsor.payment_status === 'pending' && (
                                    <div className="mt-1 flex items-center text-[10px] text-red-500 font-bold animate-pulse">
                                      <AlertCircle className="w-3 h-3 mr-1" /> Pagamento à confirmar
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center space-x-2 flex-wrap gap-1">
                                    {/* Show approve button for ANY inactive sponsor */}
                                    {(sponsor.active === 0 || sponsor.payment_status === 'pending') && (
                                      <button
                                        onClick={async () => {
                                          if (confirm(`Aprovar e ativar acesso para ${sponsor.business_name}?`)) {
                                            await fetch(`/api/admin/sponsors/${sponsor.id}/approve`, { method: 'POST' });
                                            fetchAllSponsors();
                                            fetchActiveSponsors();
                                          }
                                        }}
                                        className="px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm text-[10px] font-black flex items-center gap-1"
                                        title="Aprovar e Ativar Acesso"
                                      >
                                        <CheckCircle2 className="w-3 h-3" />
                                        Ativar
                                      </button>
                                    )}
                                    {/* Show voucher button if sponsor uploaded proof */}
                                    {(sponsor as any).payment_proof_url && (
                                      <button
                                        onClick={() => window.open((sponsor as any).payment_proof_url, '_blank')}
                                        className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                        title="Ver Comprovante de Pagamento"
                                      >
                                        <FileText className="w-4 h-4" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => generateSponsorPDF(sponsor)}
                                      className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                                      title="Baixar Credenciais PDF"
                                    >
                                      <FileDown className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={async () => {
                                        const dur = prompt("Duração em dias (ex: 15, 30, 60):", String(sponsor.subscription_duration_days));
                                        if (dur) {
                                          await fetch(`/api/admin/sponsors/${sponsor.id}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ active: sponsor.active, subscription_duration_days: parseInt(dur) })
                                          });
                                          fetchAllSponsors();
                                          fetchActiveSponsors();
                                        }
                                      }}
                                      className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                                      title="Editar Duração"
                                    >
                                      <Timer className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (confirm('Excluir patrocinador?')) {
                                          await fetch(`/api/admin/sponsors/${sponsor.id}`, { method: 'DELETE' });
                                          fetchAllSponsors();
                                          fetchActiveSponsors();
                                        }
                                      }}
                                      className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'patrocinador' && isSponsor && (
            <motion.div
              key="patrocinador"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SponsorPortal
                sponsorId={currentSponsor!}
                businessName={sponsorName}
                onLogout={handleLogout}
                settings={settings}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                {settings.logo ? <img src={settings.logo} className="w-full h-full object-cover" /> : <BookOpen className="text-school-blue" />}
              </div>
              <span className="text-xl font-display font-bold">Portal da Escola</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Dedicados à excelência no ensino e à transparência na gestão escolar para toda a comunidade.
            </p>
            <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-black text-slate-500">Total de Acessos</p>
                <p className="text-xl font-mono font-bold">{settings.access_count || 0}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-500/50" />
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6">Links Rápidos</h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li><button onClick={() => setActiveTab('inicio')} className="hover:text-white transition-colors">Início</button></li>
              <li><button onClick={() => setActiveTab('noticias')} className="hover:text-white transition-colors">Notícias</button></li>
              <li><button onClick={() => setActiveTab('eventos')} className="hover:text-white transition-colors">Eventos</button></li>
              <li><button onClick={() => setActiveTab('avaliacao')} className="hover:text-white transition-colors">Avaliação</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Administração</h4>
            {!isAdmin ? (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center text-slate-400 hover:text-white transition-colors text-sm"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Acesso Restrito
              </button>
            ) : (
              <p className="text-green-500 text-sm flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Modo Administrador Ativo
              </p>
            )}
            <button
              onClick={() => setShowSponsorLogin(true)}
              className="mt-4 flex items-center text-slate-500 hover:text-white transition-colors text-[10px] uppercase font-bold tracking-widest"
            >
              <Handshake className="w-3 h-3 mr-2" />
              Portal do Patrocinador
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-xs flex flex-col items-center space-y-1">
          <span>© {new Date().getFullYear()} Portal Escola Ednelza Bezerra Trindade. Todos os direitos reservados.</span>
          <span className="text-slate-600 font-medium">Desenvolvedora Pedagoga Anedra do Nascimento Lopes</span>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogin(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md"
            >
              <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-school-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-8 h-8 text-school-blue" />
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-900">Acesso Administrativo</h3>
                <p className="text-slate-500">Entre com suas credenciais da escola</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Usuário</label>
                  <input
                    type="text"
                    required
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Senha</label>
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-school-blue outline-none"
                  />
                </div>
                <button type="submit" className="w-full py-4 bg-school-blue text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                  Entrar no Painel
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSponsorLogin && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSponsorLogin(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-slate-100"
            >
              <button onClick={() => setShowSponsorLogin(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Handshake className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-900">Portal do Patrocinador</h3>
                <p className="text-slate-500">Acesse para gerenciar seus anúncios</p>
              </div>
              <form onSubmit={handleSponsorLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Usuário</label>
                  <input
                    name="username"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Seu usuário"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Senha</label>
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Sua senha"
                  />
                </div>
                <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg shadow-slate-100">
                  Acessar Painel
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div >
  );
}

const StarRatingComponent = ({ inputId }: { inputId: string }) => {
  const [rating, setRating] = useState(5);
  const handleSetRating = (val: number) => {
    setRating(val);
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) input.value = val.toString();
  };
  return <StarRating rating={rating} setRating={handleSetRating} />;
};
