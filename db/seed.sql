INSERT INTO departments(department_name)
VALUES 
('Management'),
('Sales'),
('Warehouse'),
('Human Resources'),
('Quality Control'),
('Front Desk'),
('Accounting');

INSERT INTO roles(title, salary, department_id)
VALUES
('Regional Manager', 75000, 1),
('Sales Rep', 65000, 2),
('Receptionist', 35000, 6),
('HR Rep', 55000, 4),
('Warehouse Clerk', 45000, 3),
('Accountant', 55000, 7);

INSERT INTO employees(first_name, last_name, role_id, manager_id) 
VALUES
('Michael', 'Scott', 1, NULL),
('Pam', 'Beesly', 2, 1),
('Jim', 'Halpert', 3, 1),
('Toby', 'Flenderson', 4, 2),
('Stanley', 'Hudson', 5, 1),
('Darryl', 'Philbin', 6, 1);

