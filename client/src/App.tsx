import { useEffect, useState } from "react";
import type { EmployeeDto } from "./lib/types";
import { List, ListItem, Typography } from "@mui/material";
import axios from "axios";
function App() {
  const title = "welcome to react from scratch";
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);

  useEffect(() => {
    // fetch("https://localhost:5000/api/employee/")
    //   .then((response) => response.json())
    //   .then((data) => { setEmployees(data); });
    axios.get<EmployeeDto[]>("https://localhost:5000/api/employee/")
      .then((response) => { setEmployees(response.data); });

      return () => {
      };
  }, []);

  return (
    <>
      <Typography variant='h3'>{title}</Typography>
      {employees.map((employee) => (
        <List key={employee.id}>
          <ListItem>
            Employee Name: {employee.firstName + " " + employee.lastName}
          </ListItem>
          <ListItem>
            Employee Department: {employee.department || 'No Department'}
          </ListItem>
          <ListItem>
            Employee Email: {employee.email}
          </ListItem>
          <ListItem>
            Employee Roles: {employee.roles?.join(", ") || 'No Roles'}
          </ListItem>
        </List>
      ))}
    </>
  )
}
export default App
