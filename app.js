const inquirer = require('inquirer');
const db = require('./db/connection');

const promptQuestions = () => {
  return inquirer.prompt([
    //Prompt with main menu of options
    {
      type: 'list',
      name: 'menuChoice',
      message: 'Choose one of the following options:',
      choices: ['View All Employees', 'View All Departments', 'View All Roles', 'Add a Department', 'Add a Role', 'Add an Employee', 'Update an Employee Role', 'Exit']
    }
  ])
    .then(answer => {
      switch (answer.menuChoice) {
        case 'View All Employees':
          allEmployees();
          break;
        case 'View All Departments':
          allDepartments();
          break;
        case 'View All Roles':
          allRoles();
          break;
        case 'Add a Department':
          newDepartment();
          break;
        case 'Add a Role':
          newRole();
          break;
        case 'Exit':
          db.end();
          break;
      }
    });
};

promptQuestions()

const allEmployees = () => {
  const sql =
    `SELECT employees.id, employees.first_name AS "First Name", employees.last_name AS "Last Name", roles.title, departments.department_name AS "Department", roles.salary AS "Salary", CONCAT(manager.first_name," ",manager.last_name) AS "Manager"
  FROM employees
  LEFT JOIN roles ON roles.id = employees.role_id 
  LEFT JOIN departments ON departments.id = roles.department_id
  LEFT JOIN employees manager ON employees.manager_id = manager.id
  ORDER BY employees.id;`
  db.query(sql, (err, results) => {
    if (err) throw err;
    // console.log(results)
    console.table(results)
    promptQuestions();
    // process.exit(0)
  })
}

const allDepartments = () => {
  const sql = `SELECT id AS "Department ID", department_name AS "Department Name" FROM departments`
  db.query(sql, (err, results) => {
    if (err) throw err;
    // console.log(results)
    console.log("")
    console.table(results)
    promptQuestions();
  })
}

const allRoles = () => {
  const sql =
    `SELECT roles.id AS "Role ID", roles.title AS "Title", roles.salary AS "Salary", departments.department_name AS Department
  FROM roles
  LEFT JOIN departments ON departments.id = roles.department_id`
  db.query(sql, (err, results) => {
    if (err) throw err;
    // console.log(results)
    console.table(results)
    promptQuestions();
  })
}

const newDepartment = () => {
  inquirer.prompt([
    {
      name: 'newDepartment',
      type: 'input',
      message: 'Enter the name of the new Department:'
    }
  ]).then((answer) => {
    // console.log(answer)
    db.query(`INSERT INTO departments(department_name) VALUES( ? )`, answer.newDepartment)
    // allDepartments();
    promptQuestions();
  })
}

const newRole = () => {
  inquirer.prompt([
    {
      name: 'newTitle',
      type: 'input',
      message: 'Enter the new Title:'
    },
    {
      name: 'newSalary',
      type: 'input',
      message: 'Enter the salary for the new Title:'
    }
    // {
    //     name: 'newDept',
    //     type: 'list',
    //     choices: function () {
    //         let choiceArray = results[1].map(choice => choice.department_name);
    //         return choiceArray;
    //     },
    //     message: 'Select the Department for this new Title:'
    // }
  ]).then((answer) => {
    // console.log(answer)
    db.query(
      `INSERT INTO roles(title, salary, department_id) 
      VALUES
      ("${answer.newTitle}", "${answer.newSalary}", 
      (SELECT id FROM departments WHERE department_name = "Sales"));`
    )
    // allDepartments();
    promptQuestions();
  })
}