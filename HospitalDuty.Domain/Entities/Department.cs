using System;
using System.Collections.Generic;

namespace HospitalDuty.Domain.Entities;

public class Department
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;

    public Guid HospitalId { get; set; }

    public Guid ManagerId { get; set; }

    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    public ICollection<Shift> Shifts { get; set; } = new List<Shift>();
}
