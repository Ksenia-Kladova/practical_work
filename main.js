let studentsList = [];

const table = document.querySelector('.bg-white');

function getStudentItem(studentObj) {
  const tableRow = document.createElement('tr');
  const tableCellFullNameStudent = document.createElement('th');
  const tableCellDateBirth = document.createElement('td');
  const tableCellDateAdmission = document.createElement('td');
  const tableCellFaculty = document.createElement('td');
  const tableCellBtnDelete = document.createElement('td');
  const btnDelete = document.createElement('button');

  const getAge = birthDate => Math.floor((new Date() - new Date(birthDate).getTime()) / 3.15576e+10)
  function ageToStr(age) {
    let txt;
    let count = age % 100;
    (count >= 5 && count <= 20) ? txt = 'лет' : (count = count % 10);
    count == 1 ? txt = 'год' : (count >= 2 && count <= 4) ? txt = 'года' : txt = 'лет';

    return age + " " + txt;
  }

  function yearsStudy(year) {
    const fullYearStart = new Date(year);
    const fullYarEnd = new Date(fullYearStart.setFullYear(fullYearStart.getFullYear() + 4));
    let yearCourse;

    fullYarEnd < new Date() ? yearCourse = 'закончил' : yearCourse = getAge(year) + ' курс';

    const textDateAdmission = year + '-' + fullYarEnd.getFullYear() + ' (' + yearCourse + ')';

    return textDateAdmission;
  }

  btnDelete.addEventListener('click', () => {
    fetch(`http://localhost:3000/api/students/${studentObj.id}`, {
      method: 'DELETE'
    })
  })

  tableCellFullNameStudent.textContent = studentObj.name + ' ' + studentObj.lastname + ' ' + studentObj.surname;
  tableCellDateBirth.textContent = new Date(studentObj.birthday).toLocaleDateString({ year: "numeric", month: "numeric", day: "numeric" }) + ' ' + '(' + ageToStr(getAge(studentObj.birthday)) + ')';
  tableCellDateAdmission.textContent = yearsStudy(studentObj.studyStart);
  tableCellFaculty.textContent = studentObj.faculty;
  btnDelete.textContent = 'Удалить';
  btnDelete.classList.add('btn')
  btnDelete.classList.add('btn-info');

  tableCellBtnDelete.append(btnDelete);

  return {
    tableRow,
    tableCellFullNameStudent,
    tableCellDateBirth,
    tableCellDateAdmission,
    tableCellFaculty,
    tableCellBtnDelete
  };
}

async function serverGetData() {
  const response = await fetch('http://localhost:3000/api/students', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })

  let data = await response.json();
  return data
}

let serverData = await serverGetData();

if (serverData) {
  studentsList = serverData;
}

function renderStudentsTable(studentsArray) {
  table.innerHTML = '';

  for (let student of studentsArray) {
    const oneStudent = getStudentItem(student);
    table.append(oneStudent.tableRow);
    oneStudent.tableRow.append(oneStudent.tableCellFullNameStudent);
    oneStudent.tableRow.append(oneStudent.tableCellDateBirth);
    oneStudent.tableRow.append(oneStudent.tableCellDateAdmission);
    oneStudent.tableRow.append(oneStudent.tableCellFaculty);
    oneStudent.tableRow.append(oneStudent.tableCellBtnDelete);
  }
}

const studentsForm = document.querySelector('.form-add');
const inputName = document.getElementById('inputName');
const inputSurname = document.getElementById('inputSurname');
const inputLastname = document.getElementById('inputLastname');
const inputFaculty = document.getElementById('inputFaculty');
const inputDateBirth = document.getElementById('dateBirth');
const inputDateAdmission = document.getElementById('dateAdmission')

function validation(form) {
  function errorRemove(input) {
    const parent = input.parentNode;

    if (parent.classList.contains('error')) {
      parent.querySelector('.invalid-feedback').remove();
      parent.classList.remove('.error');
    }
  }

  function createError(input, text) {
    const parent = input.parentNode;
    const errorLabel = document.createElement('div');
    parent.classList.add('error')
    errorLabel.classList.add('invalid-feedback');
    errorLabel.style.display = 'block';
    errorLabel.textContent = text;
    parent.append(errorLabel);
  }

  let result = true;

  studentsForm.querySelectorAll('.input').forEach(input => {
    errorRemove(input);
    if (!input.value.trim()) {
      createError(input, 'Обязательно для заполнения');
      result = false;
    }
  })
  const minDateBirth = '1900.01.01';
  if (inputDateBirth.valueAsDate < new Date(minDateBirth)) {
    createError(inputDateBirth, 'Дата не может быть раньше 01.01.1900');
    result = false;
  }
  if (inputDateBirth.valueAsDate > new Date()) {
    createError(inputDateBirth, 'Дата не может быть позже текущей даты');
    result = false;
  }
  if (inputDateAdmission.value > 0 && inputDateAdmission.value < 2000) {
    createError(inputDateAdmission, 'Введите год не раньше 2000');
    result = false;
  }
  if (inputDateAdmission.value > new Date().getFullYear()) {
    createError(inputDateAdmission, 'Дата не может быть позже текущей даты');
    result = false;
  }

  return result;
}

studentsForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  if (validation(this) == true) {
  const response = await fetch('http://localhost:3000/api/students', {
    method: 'POST',
    body: JSON.stringify({
      name: inputName.value,
      surname: inputSurname.value,
      lastname: inputLastname.value,
      birthday: inputDateBirth.valueAsDate,
      studyStart: inputDateAdmission.value,
      faculty: inputFaculty.value
    }),
    headers: {
      'Content-Type': 'application/json',
    }
  });
  const student = await response.json();
 
    studentsList.push(student);

    studentsForm.querySelectorAll('.input').forEach(input => {
      input.value = '';
    })
  }

  renderStudentsTable(studentsList);
});


const sortStudents = (studentsArray, prop, dir = false) => studentsArray.sort((a, b) => (!dir ? a[prop] < b[prop] : a[prop] > b[prop]) ? -1 : 1);

const tableStudentsHeaderRow = document.getElementById('trHead');
const tableStudentsHeader = document.querySelectorAll('th');

tableStudentsHeader.forEach(th => {
  th.addEventListener('click', async () => {
    th.textContent.includes('ФИО') ? sortStudents(studentsList, 'surname') : th.textContent.includes('Дата рождения') ? sortStudents(studentsList, 'birthday') : th.textContent.includes('Годы обучения') ? sortStudents(studentsList, 'studyStart') : sortStudents(studentsList, 'faculty');
    renderStudentsTable(studentsList);
  })
})

function filter(arr, prop, value) {
  let result = [];
  for (let obj of arr) {
    if (String(obj[prop]) === value) {
      result.push(obj)
    }
  }

  return result;
}

function filterStr(arr, prop, value) {
  let result = [];
  for (let obj of arr) {
    if ((String(obj[prop].toLowerCase())).includes(value.toLowerCase()) === true) {
      result.push(obj)
    }
  }

  return result;
}

const formFilter = document.querySelector('.form-filter');

function filterStudentTable(studentsArray) {
  const inputFilterFullNameValue = document.getElementById('filterFullName').value;
  const inputFilterDateAdmissionValueEnd = document.getElementById('filterDateAdmissionEnd').value;
  const inputFilterDateAdmissionValueStart = document.getElementById('filterDateAdmissionStart').value;
  const inputFilterFacultyValue = document.getElementById('filterFaculty').value;

  let arr = [];
  for (let obj of studentsArray) {
    const fullName = (obj.name + obj.lastname + obj.surname).toLowerCase();
    if (inputFilterFullNameValue !== '') {
      if (fullName.includes(inputFilterFullNameValue.toLowerCase()) === true) {
        arr.push(obj)
        studentsArray = arr;
      }
    }
  }

  if (inputFilterDateAdmissionValueEnd !== '') {
    studentsArray = filter(studentsArray, 'studyStart', String(inputFilterDateAdmissionValueEnd - 4));
  }
  if (inputFilterDateAdmissionValueStart !== '') {
    studentsArray = filter(studentsArray, 'studyStart', inputFilterDateAdmissionValueStart);
    
  }
  if (inputFilterFacultyValue !== '') {
    studentsArray = filterStr(studentsArray, 'faculty', inputFilterFacultyValue);
  }

  renderStudentsTable(studentsArray)
}

formFilter.addEventListener('submit', function (e) {
  e.preventDefault();
  filterStudentTable(studentsList);
})

renderStudentsTable(studentsList);