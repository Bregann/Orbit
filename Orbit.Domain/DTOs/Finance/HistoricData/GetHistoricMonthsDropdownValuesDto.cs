namespace Orbit.Domain.DTOs.Finance.HistoricData
{
    public class GetHistoricMonthsDropdownValuesDto
    {
        public required HistoricMonthDropdownValueDto[] Months { get; set; }
    }

    public class HistoricMonthDropdownValueDto
    {
        public required int Id { get; set; }
        public required string DisplayName { get; set; }
    }
}
