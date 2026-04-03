namespace Orbit.Domain.DTOs.Finance.Banking
{
    public class GoCardlessInitiateConnectionRequest
    {
        public required string InstitutionId { get; set; }
    }

    public class GoCardlessInitiateConnectionResponse
    {
        public string AuthorizationUrl { get; set; } = "";
        public string RequisitionId { get; set; } = "";
    }

    public class GoCardlessCompleteConnectionRequest
    {
        public required string RequisitionId { get; set; }
    }
}
