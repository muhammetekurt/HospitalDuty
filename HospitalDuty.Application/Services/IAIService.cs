using System.Threading.Tasks;

namespace HospitalDuty.Application.Contracts.Services
{
    public interface IAIService
    {
        Task<string> GetAIResponseAsync(string userMessage, string context = "");
    }
}
