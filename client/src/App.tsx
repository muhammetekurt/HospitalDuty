import { useEffect, useState } from "react";
function App() {
  const title = "welcome to react from scratch";
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetch("https://localhost:5000/api/employee/")
      .then((response) => response.json())
      .then((data) => { setEmployees(data); });

      return () => {
      };
  }, []);

  return (
    <>
      <h1 className="app" style={{ color: 'navy', backgroundColor: 'yellow', textAlign: 'center', justifyContent: 'center' }}>{title}</h1>
      {employees.map((employee) => (
        // <h2 key={employee.id} className="app" style={{ color: 'green', textAlign: 'center', justifyContent: 'center' }}>
        //   Employee Name: {employee.name}
        //   Employee Department: {employee.department}
        // </h2>
        <ul>
          <li key={employee.id}>
            Employee Name: {employee.firstName + " " + employee.lastName}
          </li>
          <li>
            Employee Department: {employee.department}
          </li>
          <li>
            Employee Email: {employee.email}
          </li>
        </ul>
      ))}
    </>
  )
}

export default App
