class department {
    department_id
    name
    created_at
    updated_at
}
class employeeModel {
    name
    contract_employee
    age
    department
    address
}
let departmentList;
$(document).ready(function () {
    formDepartmentNames();
    formEmployeeGrid();
    formDepartmentGrid();
});

async function submit_departmentname() {
    if (validateDepartmentForm()) {
        let hiddenDptField = $("#hiddenDptField").val();
        if (hiddenDptField.toLowerCase() === 'false') {
            let dptName = $("#dptname").val();
            let body = { "name": dptName }
            let response = await fetch('http://206.189.72.24:8000/api/department/add', {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            let result = await response.json();
            if (result) {
                formDepartmentGrid();
                formDepartmentNames();
            }
        } else {
            let hdnDptID = $("#hfdptId").val();
            editDepartment(hdnDptID);
        }
    }
}

async function submitEmpDetails(e) {
    if (validateEmployeeForm()) {
        let hiddenField = $("#hiddenField").val();
        if (hiddenField.toLowerCase() === 'false') {
            let value = $('input[name="contract"]:checked').val();
            let isContract = value === 'true' ? true : false;
            let selectedValue = $('#dpt').val();
            let departmentList = await getDepartments();
            let deptId = departmentList.find(dpt => dpt.name === selectedValue).department_id;
            let empName = $('#empName').val();
            let address = $('#empAddress').val();
            let age = $('#age').val();
            let newEmployee = new employeeModel();
            newEmployee.name = empName;
            newEmployee.contract_employee = isContract;
            newEmployee.department = deptId;
            newEmployee.age = +age;
            newEmployee.address = address;
            const response = await fetch('http://206.189.72.24:8000/api/employee/add', {
                method: 'POST',
                body: JSON.stringify(newEmployee),
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            )
            let result = await response.json();
            if (result) {
                formEmployeeGrid();
            }
        }
        else {
            let empID = $("#empId").val();
            editEmployee(empID);
        }
    }
}

async function formDepartmentNames() {
    let departments = await getDepartments();
    let departmentNames = departments.map(dpt => { return dpt.name });
    $("#dpt").autocomplete({
        source: departmentNames
    });
}

async function getDepartments() {
    let res = await fetch('http://206.189.72.24:8000/api/department/list');
    let departments = await res.json();
    departmentList = departments;
    return departments;
}

async function getEmployeeList() {
    let res = await fetch('http://206.189.72.24:8000/api/employee/list');
    let employees = await res.json();
    return employees;
}

async function formEmployeeGrid() {
    let employees = await getEmployeeList();
    let departmentList = await getDepartments();
    let markup = '';
    $.each(employees, function (i, emp) {
        let departmentName = departmentList.find(dpt => dpt.department_id === emp.department).name;
        let IsContract = emp.contract_employee === true ? "Yes" : "No";
        markup += "<tr> <td> " + emp.name + "</td><td>" + emp.age + "</td><td>" + departmentName + "</td><td>" + IsContract + "</td><td id=editEmployee style='cursor: pointer;color:blue;' onClick='editEmployeeLoad(\"" + emp.employee_id + "\")'>Edit</td><td id=deleteEmployee style='cursor: pointer;color:blue;' onClick='deleteEmployee(\"" + emp.employee_id + "\")'>Delete</td></tr>"
    });
    $("#employeeTable").remove();
    $("#empTable").append("<tbody id='employeeTable'></tbody>")
    $("#employeeTable").append(markup);
    resetForm();
}

async function formDepartmentGrid() {
    let departments = await getDepartments();
    let dptmarkup = '';
    $.each(departments, function (i, dpt) {
        dptmarkup += "<tr><td>" + dpt.name + "</td><td style='cursor: pointer;color:blue;' onClick='editDepartmentLoad(\"" + dpt.department_id + "\")'>Edit</td><td style='cursor: pointer;color:blue;' onClick='deleteDepartment(\"" + dpt.department_id + "\")'>Delete</td></tr>"
    });
    $("#departmentTable").remove();
    $("#dptTable").append("<tbody id='departmentTable'></tbody>")
    $("#departmentTable").append(dptmarkup);
    resetDepartment();
}

async function editEmployeeLoad(employeeId) {
    let employees = await getEmployeeList();
    let departmentList = await getDepartments();
    let employee = new employeeModel();
    employee = employees.find(emp => emp.employee_id === employeeId);
    let isContract = employee.contract_employee ? "true" : "false";
    let deptName = departmentList.find(dpt => dpt.department_id === employee.department).name;
    $("#empName").val(employee.name);
    $("#age").val(employee.age);
    $("#empAddress").val(employee.address);
    $("#dpt").val(deptName);
    $("#hiddenField").val("true");
    $("#empId").val(employeeId);
    //$('input [name="contract"] [value='+'\"'+isContract+'\"'+']').attr('checked', true);
    document.querySelector('input[name="contract"][value=' + '\"' + isContract + '\"' + ']').checked = true;
    $("#eptSubmit").val("Save Changes");
    document.getElementById('employeeHeading').innerHTML = 'Update Employee';
}


async function editEmployee(employeeId) {
    let value = $('input[name="contract"]:checked').val();
    isContract = value === 'true' ? true : false;
    let empName = $('#empName').val();
    let age = $('#age').val();
    let employee = new employeeModel();
    employee.name = empName;
    employee.contract_employee = isContract;
    employee.age = +age;
    const response = await fetch(`http://206.189.72.24:8000/api/employee/interact/${employeeId}`, {
        method: 'POST',
        body: JSON.stringify({ name: employee.name, age: employee.age, contract_employee: employee.contract_employee }),
        headers: {
            'Content-Type': 'application/json'
        }
    }
    )
    let result = await response.json();
    if (result) {
        formEmployeeGrid();
    }
}

async function deleteEmployee(employeeId) {
    await fetch(`http://206.189.72.24:8000/api/employee/interact/${employeeId}`, {
        method: 'DELETE',
    }
    );
    formEmployeeGrid();
}

function resetForm() {
    document.getElementById("idEmpDetails").reset();
    $("#eptSubmit").val("Submit Emp Details");
    document.getElementById('employeeHeading').innerHTML = 'Create Employee';
}

async function editDepartmentLoad(dptId) {
    let departmentList = await getDepartments();
    let departmentName = departmentList.find(dpt => dpt.department_id === dptId).name;
    $("#dptname").val(departmentName);
    $("#hiddenDptField").val("true");
    $("#hfdptId").val(dptId);
    document.getElementById('dptHeading').innerHTML = 'Edit Department';
    $("#dptSubmit").val("Save Changes");
}
async function editDepartment(dptId) {
    let dptName = $("#dptname").val();
    let body = { name: dptName }
    let response = await fetch(`http://206.189.72.24:8000/api/department/interact/${dptId}`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    let result = await response.json();
    if (result) {
        formDepartmentGrid();
        formDepartmentNames();
    }

}
async function deleteDepartment(dptId) {
    let employees = await getEmployeeList();
    let dptEmployees = employees.filter(emp => emp.department === dptId);
    if (dptEmployees && dptEmployees.length > 0 ) {
        let answer = confirm("Deleting a department would delete all employees in that department, do you want to continue?");
        if (answer) {
            for (let i = 0; i < dptEmployees.length; i++) {
                deleteEmployee(dptEmployees[i].employee_id);
            }
            await fetch(`http://206.189.72.24:8000/api/department/interact/${dptId}`, {
                method: 'DELETE',
            }
            );
            formDepartmentGrid();
            formDepartmentNames();
        }
    } else {
        await fetch(`http://206.189.72.24:8000/api/department/interact/${dptId}`, {
            method: 'DELETE',
        }
        );
        formDepartmentGrid();
        formDepartmentNames();
    }
}

function resetDepartment() {
    document.getElementById("dptForm").reset();
    document.getElementById('dptHeading').innerHTML = 'Create Department';
    $("#dptSubmit").val("Submit Department Name");
    $("#dptReset").prop('disabled',true)
}

function validateDepartmentForm() {
    if ($("#dptname").val()) {
        return true;
    } else {
        alert("Enter Department Name");
        return false;
    }
}

function validateEmployeeForm() {
    let errors = '';
    let value = $('input[name="contract"]:checked').val();
    let departmentName = $("#dpt").val().trim();
    if ($('#empName').val() == '') errors += 'Enter Employee Name \n';
    if (value == undefined) errors += 'Select if Employee is Contract \n';
    if ($('#empAddress').val() == '') errors += 'Enter the address \n';
    if ($('#age').val() == '') errors += 'Enter the age \n';
    if (departmentList && departmentList.length > 0) {
        let dpt = departmentList.findIndex(dpt => dpt.name === departmentName);
        if (dpt === -1) {
            errors += 'Please enter the department';
        }
    }
    if (errors.length > 0) {
        alert(errors);
        return false
    } else {
        return true;
    }
}

function resetVisibleToggler() {
    if($("#dptname").val()) $("#dptReset").prop('disabled',false)
    else $("#dptReset").prop('disabled',true)
}
function resetEmpVisibleToggler() {
    if($("#dptname").val()) $("#empReset").prop('disabled',false)
    else $("#empReset").prop('disabled',true)
}