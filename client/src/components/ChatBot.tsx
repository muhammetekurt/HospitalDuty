import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Fade,
  Slide,
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Close as CloseIcon,
  SmartToy as BotIcon
} from '@mui/icons-material';
import { aiService } from '../services/aiService';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  showContinueOptions?: boolean;
}

interface ChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
}

// Uygulama kullanımı hakkında önceden tanımlanmış sorular ve cevaplar
const faqData = [
  {
    question: "Nasıl giriş yaparım?",
    answer: "Ana sayfada 'Giriş Yap' butonuna tıklayarak email ve şifrenizle giriş yapabilirsiniz. Eğer şifrenizi unuttuysanız 'Şifremi Unuttum' linkini kullanabilirsiniz."
  },
  {
    question: "Shift tercihlerimi nasıl belirlerim?",
    answer: "Sol menüden 'Shift Tercihleri' sekmesine gidin ve 'Yeni Tercih Ekle' butonuna tıklayın. Tarih aralığını seçin ve tercih ettiğiniz shift türünü belirleyin."
  },
  {
    question: "Shift takvimini nasıl görüntülerim?",
    answer: "Sol menüden 'Shift Takvimi' sekmesine giderek aylık shift planınızı görüntüleyebilirsiniz. Takvimde farklı renkler farklı shift türlerini temsil eder."
  },
  {
    question: "Profilimi nasıl güncellerim?",
    answer: "Sağ üst köşedeki profil resminize tıklayın ve 'Profil' seçeneğini seçin. Buradan kişisel bilgilerinizi ve profil fotoğrafınızı güncelleyebilirsiniz."
  },
  {
    question: "Çalışan listesini nasıl görüntülerim?",
    answer: "Sol menüden 'Çalışanlar' sekmesine giderek departmanınızdaki tüm çalışanları görebilirsiniz. Arama ve filtreleme özelliklerini kullanarak istediğiniz çalışanı bulabilirsiniz."
  },
  {
    question: "Departman yöneticisi ne yapabilir?",
    answer: "Departman yöneticileri shift planlaması yapabilir, çalışanları yönetebilir ve departman ayarlarını düzenleyebilir. Ayrıca shift tercihlerini onaylayabilir veya reddedebilir."
  },
  {
    question: "Sistem yöneticisi ne yapabilir?",
    answer: "Sistem yöneticileri hastaneleri yönetebilir, yeni departmanlar oluşturabilir ve tüm sistem ayarlarını düzenleyebilir. En yüksek yetki seviyesine sahiptirler."
  },
  {
    question: "Shift türleri nelerdir?",
    answer: "Sistemde genellikle Gündüz (08:00-16:00), Akşam (16:00-00:00) ve Gece (00:00-08:00) shift türleri bulunur. Her hastane kendi shift türlerini tanımlayabilir."
  },
  {
    question: "Mobil cihazlarda kullanabilir miyim?",
    answer: "Evet, uygulama responsive tasarıma sahiptir ve mobil cihazlarda da rahatlıkla kullanabilirsiniz. Tüm özellikler mobil cihazlarda da mevcuttur."
  },
  {
    question: "Bildirimler nasıl alırım?",
    answer: "Shift değişiklikleri, yeni atamalar ve önemli güncellemeler için otomatik bildirimler alırsınız. Bildirimler uygulama içinde ve e-posta ile gönderilir."
  },
  {
    question: "Shift tercihlerimi nasıl belirlerim?",
    answer: "Shift tercihlerinizi belirlemek için 'Vardiya Tercihleri' sayfasına gidin. Orada hangi günlerde çalışmak istediğinizi, hangi saatleri tercih ettiğinizi ve çalışmak istemediğiniz günleri belirleyebilirsiniz. Bu tercihler vardiya planlamasında dikkate alınır."
  },
  {
    question: "Vardiya tercihleri nasıl çalışır?",
    answer: "Vardiya tercihleri sistemi, çalışanların hangi günlerde ve saatlerde çalışmak istediğini belirtmesine olanak tanır. Sistem bu tercihleri dikkate alarak vardiya planlaması yapar. Tercihlerinizi 'Vardiya Tercihleri' sayfasından güncelleyebilirsiniz."
  },
  {
    question: "Hangi shift türleri var?",
    answer: "Sistemimizde 3 farklı shift türü bulunmaktadır:\n• Normal (0): Standart çalışma saatleri\n• Night (1): Gece vardiyası\n• Emergency (2): Acil durum vardiyası\n\nHer shift türünün kendine özgü çalışma saatleri ve kuralları vardır."
  },
  {
    question: "Vardiya nasıl eklerim?",
    answer: "Vardiya eklemek için 'Vardiya Listesi' sayfasına gidin ve 'Yeni Vardiya Ekle' butonuna tıklayın. Çalışanı, tarihi, başlangıç ve bitiş saatlerini, shift türünü seçin ve kaydedin. Sadece yetkili kullanıcılar vardiya ekleyebilir."
  }
];

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Merhaba! Hastane Yönetim Sistemi'ne hoş geldiniz! Vardiya planlaması, çalışan takibi ve hastane operasyonları hakkında size nasıl yardımcı olabilirim? Aşağıdaki örnek sorulardan birini seçebilir veya kendi sorunuzu yazabilirsiniz.",
      isUser: false,
      timestamp: new Date(),
      showContinueOptions: false
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const findAnswer = (question: string): string => {
    const normalizedQuestion = question.toLowerCase().trim();
    
    for (const faq of faqData) {
      const normalizedFaqQuestion = faq.question.toLowerCase();
      if (normalizedQuestion.includes(normalizedFaqQuestion) || 
          normalizedFaqQuestion.includes(normalizedQuestion)) {
        return faq.answer;
      }
    }

    // Anahtar kelime bazlı arama
    if (normalizedQuestion.includes('giriş') || normalizedQuestion.includes('login')) {
      return faqData[0].answer;
    } else if (normalizedQuestion.includes('shift') && normalizedQuestion.includes('tercih')) {
      return faqData[6].answer; // "Shift tercihlerimi nasıl belirlerim?"
    } else if (normalizedQuestion.includes('vardiya') && normalizedQuestion.includes('tercih')) {
      return faqData[7].answer; // "Vardiya tercihleri nasıl çalışır?"
    } else if (normalizedQuestion.includes('shift') && (normalizedQuestion.includes('tür') || normalizedQuestion.includes('tip'))) {
      return faqData[8].answer; // "Hangi shift türleri var?"
    } else if (normalizedQuestion.includes('vardiya') && (normalizedQuestion.includes('ekle') || normalizedQuestion.includes('oluştur'))) {
      return faqData[9].answer; // "Vardiya nasıl eklerim?"
    } else if (normalizedQuestion.includes('takvim') || normalizedQuestion.includes('calendar')) {
      return faqData[2].answer;
    } else if (normalizedQuestion.includes('profil') || normalizedQuestion.includes('profile')) {
      return faqData[3].answer;
    } else if (normalizedQuestion.includes('çalışan') || normalizedQuestion.includes('employee')) {
      return faqData[4].answer;
    } else if (normalizedQuestion.includes('yönetici') || normalizedQuestion.includes('manager')) {
      return faqData[5].answer;
    } else if (normalizedQuestion.includes('sistem') || normalizedQuestion.includes('admin')) {
      return faqData[6].answer;
    } else if (normalizedQuestion.includes('mobil') || normalizedQuestion.includes('mobile')) {
      return faqData[4].answer;
    } else if (normalizedQuestion.includes('bildirim') || normalizedQuestion.includes('notification')) {
      return faqData[5].answer;
    }

    return "Üzgünüm, bu konuda size yardımcı olamıyorum. Lütfen daha spesifik bir soru sorun veya aşağıdaki örnek sorulardan birini seçin. Daha fazla yardım için sistem yöneticinizle iletişime geçebilirsiniz.";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Yeni soru sorulduğunda hızlı soruları gizle
    setShowQuickQuestions(false);

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
      showContinueOptions: false
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Önce FAQ kontrolü yap
    const faqAnswer = findAnswer(currentInput);
    if (faqAnswer !== "Üzgünüm, bu konuda size yardımcı olamıyorum. Lütfen daha spesifik bir soru sorun veya aşağıdaki örnek sorulardan birini seçin. Daha fazla yardım için sistem yöneticinizle iletişime geçebilirsiniz.") {
      // FAQ'da cevap bulundu, AI'ya sorma
      const botMessage: Message = {
        id: Date.now() + 1,
        text: faqAnswer,
        isUser: false,
        timestamp: new Date(),
        showContinueOptions: true
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      return;
    }

    // FAQ'da cevap bulunamadı, AI'ya sor
    try {
      const response = await aiService.chat({
        message: currentInput,
        context: 'Hastane Yönetim vardiya yönetim sistemi'
      });

      const botMessage: Message = {
        id: Date.now() + 1,
        text: response.message,
        isUser: false,
        timestamp: new Date(),
        showContinueOptions: true
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      
      // Hata durumunda fallback cevap
      const fallbackAnswer = findAnswer(currentInput);
      const botMessage: Message = {
        id: Date.now() + 1,
        text: fallbackAnswer,
        isUser: false,
        timestamp: new Date(),
        showContinueOptions: true
      };
      
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    handleSendMessage();
  };

  const handleContinueResponse = (response: 'yes' | 'no') => {
    if (response === 'yes') {
      // Hızlı soruları tekrar göster
      setShowQuickQuestions(true);
      const continueMessage: Message = {
        id: Date.now(),
        text: "Tabii! İşte tekrar sık sorulan sorular:",
        isUser: false,
        timestamp: new Date(),
        showContinueOptions: false
      };
      setMessages(prev => [...prev, continueMessage]);
    } else {
      // Teşekkür mesajı
      const thankYouMessage: Message = {
        id: Date.now(),
        text: "Rica ederim! Başka bir konuda yardıma ihtiyacınız olursa buradayım. İyi günler! 😊",
        isUser: false,
        timestamp: new Date(),
        showContinueOptions: false
      };
      setMessages(prev => [...prev, thankYouMessage]);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chatbot İkonu */}
      <Fade in={!isOpen}>
        <Box
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            zIndex: 1000,
          }}
        >
          <IconButton
            onClick={onToggle}
            sx={{
              backgroundColor: '#1d3557',
              color: 'white',
              width: 56,
              height: 56,
              boxShadow: '0 4px 12px rgba(29, 53, 87, 0.3)',
              '&:hover': {
                backgroundColor: '#457b9d',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <ChatIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </Box>
      </Fade>

      {/* Chat Penceresi */}
      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            left: { xs: 16, sm: 'auto' },
            width: { xs: 'calc(100vw - 32px)', sm: 380 },
            height: { xs: 'calc(100vh - 32px)', sm: 500 },
            maxHeight: { xs: 'calc(100vh - 32px)', sm: 500 },
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              backgroundColor: '#1d3557',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: '#457b9d', width: 32, height: 32 }}>
                <BotIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Yardım Merkezi
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Online
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={onToggle}
              size="small"
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 2,
              backgroundColor: '#f8f9fa',
            }}
          >
            {messages.map((message) => (
              <Box key={message.id}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '80%',
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: message.isUser ? '#1d3557' : 'white',
                      color: message.isUser ? 'white' : '#1d3557',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Typography variant="body2">
                      {message.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        opacity: 0.7,
                        fontSize: '0.7rem',
                      }}
                    >
                      {message.timestamp.toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Devam etme seçenekleri */}
                {message.showContinueOptions && !message.isUser && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: 'white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                        Başka bir sorunuz var mı?
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label="Evet"
                          size="small"
                          onClick={() => handleContinueResponse('yes')}
                          sx={{
                            backgroundColor: '#1d3557',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#457b9d',
                            },
                          }}
                        />
                        <Chip
                          label="Hayır"
                          size="small"
                          onClick={() => handleContinueResponse('no')}
                          sx={{
                            backgroundColor: '#e0e0e0',
                            color: '#666',
                            '&:hover': {
                              backgroundColor: '#d0d0d0',
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            ))}

            {isTyping && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Bot yazıyor...
                  </Typography>
                </Box>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Quick Questions - State ile kontrol edilir */}
          {showQuickQuestions && (
            <Box sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Sık sorulan sorular:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {faqData.slice(0, 4).map((faq, index) => (
                  <Chip
                    key={index}
                    label={faq.question}
                    size="small"
                    onClick={() => handleQuickQuestion(faq.question)}
                    sx={{
                      fontSize: '0.7rem',
                      height: 24,
                      '&:hover': {
                        backgroundColor: '#1d3557',
                        color: 'white',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Divider />

          {/* Input */}
          <Box sx={{ p: 2, backgroundColor: 'white' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                ref={inputRef}
                fullWidth
                placeholder="Sorunuzu yazın..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                size="small"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <IconButton
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                sx={{
                  backgroundColor: '#1d3557',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#457b9d',
                  },
                  '&:disabled': {
                    backgroundColor: '#e0e0e0',
                    color: '#9e9e9e',
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Slide>
    </>
  );
};

export default ChatBot;
