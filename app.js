const inquirer = require('inquirer');
const db = require('./db/connection');

const promptQuestions = () => {
  console.log(" ")
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
          console.log(`

--------------------------------------
VIEW ALL EMPLOYEES
--------------------------------------
          `)
          allEmployees();
          break;
        case 'View All Departments':
          console.log(`
          
--------------------------------------
VIEW ALL DEPARTMENTS
--------------------------------------
          `)
          allDepartments();
          break;
        case 'View All Roles':
          console.log(`
          
--------------------------------------
VIEW ALL ROLES
--------------------------------------
          `)
          allRoles();
          break;
        case 'Add a Department':
          console.log(`
          
--------------------------------------
ADD A DEPARTMENT
--------------------------------------
          `)
          newDepartment();
          break;
        case 'Add a Role':
          console.log(`
          
--------------------------------------
ADD A ROLE
--------------------------------------
          `)
          newRole();
          break;
        case 'Add an Employee':
          console.log(`
          
--------------------------------------
ADD A NEW EMPLOYEE
--------------------------------------
          `)
          newEmployee();
          break;
        case 'Update an Employee Role':
          console.log(`
          
--------------------------------------
UPDATE AN EMPLOYEE'S ROLE
--------------------------------------
          `)
          updateEmployeeRole();
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
    console.table(results)
    promptQuestions();
    // process.exit(0)
  })
}

const allDepartments = () => {
  const sql = `SELECT id AS "Department ID", department_name AS "Department Name" FROM departments`
  db.query(sql, (err, results) => {
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
    db.query(`INSERT INTO departments(department_name) VALUES( ? )`, answer.newDepartment)
    promptQuestions();
  })
}

const newRole = () => {
  db.query(`SELECT department_name FROM departments`, (err, results) => {

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
      },
      {
        name: 'newDept',
        type: 'list',
        choices: function () {
          let optionsArray = results.map(options => options.department_name)
          return optionsArray
        },
        message: 'Select the Department for this new Role:'
      }
    ]).then((answer) => {
      db.query(
        `INSERT INTO roles(title, salary, department_id) 
          VALUES
          ("${answer.newTitle}", "${answer.newSalary}", 
          (SELECT id FROM departments WHERE department_name = "${answer.newDept}"));`
      )
      promptQuestions();
    })
  })
}

const newEmployee = () => {
  db.query(`SELECT CONCAT (employees.first_name," ",employees.last_name) AS full_name FROM employees;`, (err, results) => {
    inquirer.prompt([
      {
        name: 'firstName',
        type: 'input',
        message: 'Enter the new employee\'s first name:'
      },
      {
        name: 'lastName',
        type: 'input',
        message: 'Enter the new employee\'s last name:'
      },
      {
        name: 'manager',
        type: 'list',
        choices: results.map(options => options.full_name),
        message: 'Select the employee\'s manager:'
      }
    ]).then((answer) => {
      db.query(`SELECT title FROM roles;`, (err, results) => {
        inquirer.prompt([
          {
            name: 'role',
            type: 'list',
            choices: results.map(options => options.title),
            message: 'Select the employee\'s new role:'
          }
        ]).then((userResponse) => {
          // console.log(answer.manager)
          // console.log(userResponse.role)
          db.query(
            `INSERT INTO employees(first_name, last_name, role_id,manager_id) 
              VALUES
              ('${answer.firstName}', '${answer.lastName}',(SELECT id FROM roles WHERE title = "${userResponse.role}"),(SELECT id FROM(SELECT id FROM employees WHERE CONCAT(first_name," ",last_name) = ?) AS tmptable))`, [answer.manager], (err, results) => {
            promptQuestions();
          }
          )
        }
        )
      })
    })
  })
}

// const newEmployee = () => {
//   db.query(`SELECT title FROM roles`, (err, results) => {

//     inquirer.prompt([
//         type: 'list',
//         choices: function () {
//           let optionsArray = results.map(options => options.title)
//           return optionsArray
//         },
//         message: 'Select the Role for this new employee:'
//       },
//       {
//         name: 'mgrID',
//         type: 'input',
//         message: 'Enter the new manger\'s ID:'
//       },
//     ]).then((answer) => {
//       db.query(
//         `INSERT INTO employees(first_name, last_name, role_id,manager_id) 
//           VALUES
//           ("${answer.firstName}", "${answer.lastName}", 
//           (SELECT id FROM roles WHERE title = "${answer.role}"),"${answer.mgrID}");`
//       )
//       promptQuestions();
//     })
//   })
// }

const updateEmployeeRole = () => {
  db.query(`SELECT CONCAT (employees.first_name," ",employees.last_name) AS full_name FROM employees;`, (err, results) => {
    inquirer.prompt([
      {
        name: 'name',
        type: 'list',
        choices: results.map(options => options.full_name),
        message: 'Select the employee:'
      }
    ]).then((answer) => {
      db.query(`SELECT title FROM roles;`, (err, results) => {
        inquirer.prompt([
          {
            name: 'role',
            type: 'list',
            choices: results.map(options => options.title),
            message: 'Select the employee\'s new role:'
          }
        ]).then((userResponse) => {
          db.query(
            `UPDATE employees 
              SET role_id = (SELECT id FROM roles WHERE title = ? ) 
              WHERE id = (SELECT id FROM(SELECT id FROM employees WHERE CONCAT(first_name," ",last_name) = ?) AS tmptable)`, [userResponse.role, answer.name], (err, results) => {
            promptQuestions();
          }
          )
        })
      })
    })
  })
}