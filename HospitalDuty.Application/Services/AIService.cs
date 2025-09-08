using System;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using HospitalDuty.Application.Contracts.Services;

namespace HospitalDuty.Application.Services
{
    public class AIService : IAIService
    {
        private readonly string _apiKey;
        private readonly HttpClient _httpClient;

        public AIService(string apiKey)
        {
            _apiKey = apiKey ?? throw new ArgumentNullException(nameof(apiKey));
            _httpClient = new HttpClient();
        }

        public async Task<string> GetAIResponseAsync(string userMessage, string context = "")
        {
            try
            {
                // Hastane yönetim sistemi için özel prompt
                var systemPrompt = @"Sen Hastane Yönetim Sistemi'nin yardımcı asistanısın. 
                Kullanıcılara vardiya yönetimi, çalışan takibi ve hastane operasyonları hakkında yardım ediyorsun.
                
                Konuşma tarzın:
                - Samimi ve dostane ol
                - Kısa ve net cevaplar ver
                - 'Merhaba' dersen 'Merhaba! Size nasıl yardımcı olabilirim?' gibi doğal cevaplar ver
                - 'Nasılsın' dersen 'İyiyim, teşekkürler! Sizin için buradayım.' gibi cevaplar ver
                - Robotik konuşma yapma, normal insan gibi konuş
                
                ÖNEMLİ: Aşağıda gerçek proje verileri var. Bu verileri kullanarak kullanıcının sorularını yanıtla.
                Eğer kullanıcı 'shift türleri nelerdir' derse, aşağıdaki verilerden yanıtla.
                Eğer kullanıcı 'hangi departmanlar var' derse, aşağıdaki verilerden yanıtla.
                Eğer kullanıcı 'kaç çalışan var' derse, aşağıdaki verilerden yanıtla.
                
                Sistem özellikleri:
                - Vardiya planlaması ve yönetimi
                - Çalışan yönetimi
                - Departman yönetimi
                - Shift tercihleri
                - Takvim görüntüleme
                - Profil yönetimi
                
                Kullanıcı sorularına samimi, yardımcı cevaplar ver. Gerçek proje verilerini kullan.
                Eğer soru sistem dışındaysa nazikçe sistem hakkında soru sormasını söyle.";

                var requestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new { text = $"{systemPrompt}\n\nPROJE VERİLERİ:\n{context}\n\nKullanıcı: {userMessage}" }
                            }
                        }
                    },
                    generationConfig = new
                    {
                        temperature = 0.7,
                        topP = 0.8,
                        maxOutputTokens = 1000
                    }
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(
                    $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_apiKey}",
                    content);

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var responseObj = JsonSerializer.Deserialize<JsonElement>(responseContent);
                    
                    if (responseObj.TryGetProperty("candidates", out var candidates) && 
                        candidates.GetArrayLength() > 0)
                    {
                        var firstCandidate = candidates[0];
                        if (firstCandidate.TryGetProperty("content", out var contentObj) &&
                            contentObj.TryGetProperty("parts", out var parts) &&
                            parts.GetArrayLength() > 0)
                        {
                            var firstPart = parts[0];
                            if (firstPart.TryGetProperty("text", out var text))
                            {
                                return text.GetString() ?? "Üzgünüm, cevap alınamadı.";
                            }
                        }
                    }
                }

                return "Üzgünüm, şu anda cevap veremiyorum. Lütfen tekrar deneyin.";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"AI Service Error: {ex.Message}");
                return "Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
            }
        }

        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }
}
