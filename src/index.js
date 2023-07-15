import { Project } from './project.js';
import { Task } from './task.js';
import { format, add, isToday, isThisWeek, parseISO } from 'date-fns';

const homeBtn = document.querySelector('#home-btn');
const todayBtn = document.querySelector('#today-btn');
const weekBtn = document.querySelector('#week-btn');
const addProjectBtn = document.querySelector('#add-project');
const main = document.querySelector('#main');
const projects = document.querySelector('#projects');
const projectListDOM = document.querySelector('#project-list');
const formBackground = document.querySelector('#form-background');
const taskForm = document.querySelector('#task-form');
const addTaskBtn = document.querySelector('#add-task-button');

homeBtn.addEventListener('click', () => {
    boldButtons(homeBtn);
    showAll();
});
todayBtn.addEventListener('click', () => {
    boldButtons(todayBtn);
    showToday();
});
weekBtn.addEventListener('click', () => {
    boldButtons(weekBtn);
    showThisWeek();
});
addProjectBtn.addEventListener('click', projectForm);

let projectList = [];

if (JSON.parse(localStorage.getItem('projects')) != null) {
    let items = JSON.parse(localStorage.getItem('projects'));
    for (const item of items) {
        const newProject = new Project(item._name, item._tasks);
        projectList.push(newProject);

        for (let i = 0; i < item._tasks.length; i++) {
            item._tasks[i]._dueDate = parseISO(item._tasks[i]._dueDate.split().slice(0, 10).join(""));
        }
    }
} 

let homeProject = new Project('Home', []);
let todayProject = new Project('Today', []);
let thisWeekProject = new Project('This Week', []);
let currProject = homeProject;
renderProjects();   
homeBtn.style.fontWeight = 'bold';
showAll();

function projectForm() {
    addProjectBtn.style.display = 'none';
    const form = document.createElement('div');
    form.classList.add('project-form');
    form.innerHTML = '<input id="project-name" placeholder="Name" >';

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add';
    addBtn.addEventListener('click', () => {
        addProject(form);
    });
    form.appendChild(addBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
        endProjectForm(form);
    });
    form.appendChild(cancelBtn);

    projects.appendChild(form);
}

function addProject(form) {
    let name = document.querySelector('#project-name').value;
    if (name != '') {
        const project = new Project(name, []);
        projectList.push(project);
        localStorage.setItem('projects', JSON.stringify(projectList));
        currProject = project;
        endProjectForm(form);
        renderProjects();
        displayProject();
        const recentlyAddedBtn = document.querySelector('#project-list').lastChild;
        recentlyAddedBtn.style.fontWeight = 'bold';
        homeBtn.style.fontWeight = 'normal';
        todayBtn.style.fontWeight = 'normal';
        weekBtn.style.fontWeight = 'normal';
    } 
}

function endProjectForm(form) {
    form.remove();
    addProjectBtn.style.display = 'flex';
}

function renderProjects() {
    projectListDOM.innerHTML = '';
    for (let i = 0; i < projectList.length; i++) {
        const project = document.createElement('button');
        project.classList.add('side-button');
        project.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>format-list-checks</title><path d="M3,5H9V11H3V5M5,7V9H7V7H5M11,7H21V9H11V7M11,15H21V17H11V15M5,20L1.5,16.5L2.91,15.09L5,17.17L9.59,12.59L11,14L5,20Z" /></svg>';
        project.innerHTML += `<p>${projectList[i].name}</p>`
        project.addEventListener('click', () => {
            currProject = projectList[i];
            displayProject();
            boldButtons(project);
        });
        projectListDOM.appendChild(project);
    }
}

function displayProject() {
    main.innerHTML = "";

    const header = document.createElement('div');
    header.classList.add('project-header');

    const name = document.createElement('h2');
    name.textContent = `${currProject.name}`;
    header.appendChild(name);

    const showCheckedBtn = document.createElement('button');
    showCheckedBtn.textContent = "Show Checked"
    showCheckedBtn.setAttribute('id', 'show-checked-button');
    showCheckedBtn.classList.add('showing-checked');
    showCheckedBtn.addEventListener('click', () => {
        showCheckedBtn.classList.toggle('showing-checked');
        showCheckedBtn.classList.toggle('showing-unchecked');
        if (showCheckedBtn.classList.contains('showing-unchecked')) {
            for (let i = 0; i < currProject.tasks.length; i++) {
                if (currProject.tasks[i].checked) {
                    document.querySelector(`[data-index="${i}"]`).style.display = 'none';
                }
            }    
        } else {
            displayProject();
        }
    });
    header.appendChild(showCheckedBtn);

    if (currProject != homeProject && currProject != todayProject && currProject != thisWeekProject) {
        const removeProjectBtn = document.createElement('button');
        removeProjectBtn.classList.add('remove-project-button');
        removeProjectBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>trash-can-outline</title><path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" /></svg>';
        removeProjectBtn.addEventListener('click', deleteProject);
        header.appendChild(removeProjectBtn);
    }

    main.appendChild(header);

    renderTasks();
    
    if (currProject != homeProject && currProject != todayProject && currProject != thisWeekProject) {
        const taskButton = document.createElement('button');
        taskButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>plus</title><path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" /></svg>';
        taskButton.innerHTML += 'Add Task';
        taskButton.setAttribute('id', 'add-task');
        taskButton.addEventListener('click', showTaskForm);
        main.appendChild(taskButton);

        addTaskBtn.addEventListener('click', () => {
            addTask();
        });    
    }
}

function renderTasks() {
    currProject.sortByDate();
    for (let i = 0; i < currProject.tasks.length; i++) {
        const task = document.createElement('div');
        task.classList.add('task-module');
        task.setAttribute('data-index', i);

        const checkBox = document.createElement('button');
        checkBox.classList.add('check-box');
        if (currProject.tasks[i]._checked) {
            checkBox.classList.add('checked');
        }
        checkBox.addEventListener('click', () => {
            currProject._tasks[i]._checked = !currProject._tasks[i]._checked;
            checkBox.classList.toggle('checked');
            displayProject();
            localStorage.setItem('projects', JSON.stringify(projectList));
        });
        task.appendChild(checkBox);

        const div = document.createElement('div');
        div.classList.add('task-sub-module-container');

        const taskLeft = document.createElement('div');
        taskLeft.classList.add('task-sub-module');

        const taskName = document.createElement('p');
        taskName.textContent = `${currProject.tasks[i]._title}`;
        if (currProject.tasks[i]._checked) {
            taskName.style.textDecoration = 'line-through';
        }
        taskLeft.appendChild(taskName);

        const tempDate = add(currProject._tasks[i]._dueDate, {
            days: 1
        });
        taskLeft.innerHTML += `<p>${format(tempDate, 'eee, MMM d')}</p>`;
        taskLeft.innerHTML += `<div class="priority-${currProject.tasks[i]._priority}"><p>${currProject.tasks[i]._priority}</p></div>`;

        div.appendChild(taskLeft);

        const taskRight = document.createElement('div');
        taskRight.classList.add('task-sub-module');

        const editTaskBtn = document.createElement('button');
        editTaskBtn.classList.add('edit-task');
        editTaskBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>square-edit-outline</title><path d="M5,3C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19H5V5H12V3H5M17.78,4C17.61,4 17.43,4.07 17.3,4.2L16.08,5.41L18.58,7.91L19.8,6.7C20.06,6.44 20.06,6 19.8,5.75L18.25,4.2C18.12,4.07 17.95,4 17.78,4M15.37,6.12L8,13.5V16H10.5L17.87,8.62L15.37,6.12Z" /></svg>';
        editTaskBtn.addEventListener('click', () => {
            editTask(currProject.tasks[i]);
        });
        taskRight.appendChild(editTaskBtn);

        const deleteTaskBtn = document.createElement('button');
        deleteTaskBtn.classList.add('delete-task');
        deleteTaskBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>trash-can-outline</title><path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" /></svg>';
        deleteTaskBtn.addEventListener('click', () => {
            if (currProject === homeProject || currProject === todayProject || currProject === thisWeekProject) {
                for (let i = 0; i < projectList.length; i++) {
                    for (let j = 0; i < projectList[i].tasks.length; j++) {
                        if (currProject.tasks[i] == projectList[i].tasks[j]) {
                            projectList[i].deleteTask(projectList[i].tasks[j]);
                        }
                    }
                } 
            } else {
                currProject.deleteTask(currProject.tasks[i]);    
            }
            displayProject();
            if (currProject === homeProject) {
                showAll();
            } else if (currProject === todayProject) {
                showToday();
            } else if (currProject === thisWeekProject) {
                showThisWeek();
            }
            localStorage.setItem('projects', JSON.stringify(projectList));
        });
        taskRight.appendChild(deleteTaskBtn);
        div.appendChild(taskRight);
        
        task.appendChild(div);
        main.appendChild(task);
    }
}

function showTaskForm() {
    window.addEventListener('click', e => {
        if (e.target != taskForm && e.target == formBackground) {
            formBackground.style.display = 'none';  
            taskForm.reset();  
        }
    });
    formBackground.style.display = 'block';
}

function addTask() {
    if (document.querySelector('#title').value != '' &&
    document.querySelector('#date').value != '') {
        const title = document.querySelector('#title').value;
        const dueDate = new Date(document.querySelector('#date').valueAsDate);
        let priority = '';
        if (document.querySelector('#low').checked) {
            priority = 'low';
        } else if (document.querySelector('#med').checked) {
            priority = 'medium';
        } else {
            priority = 'high';
        }
        const task = new Task(title, dueDate, priority, false);
        currProject.tasks.push(task);
        localStorage.setItem('projects', JSON.stringify(projectList));
        taskForm.reset();
        formBackground.style.display = 'none';
        displayProject(currProject);
    }
}

function boldButtons(button) {
    const sideButtons = document.querySelectorAll('.side-button');
    sideButtons.forEach(button => {
        button.style.fontWeight = 'normal';
    });
    button.style.fontWeight = 'bold';
}

function editTask(task) {
    showTaskForm();
    addTaskBtn.style.display = 'none';
    document.querySelector('#title').value = task._title;
    document.querySelector('#date').valueAsDate = task._dueDate;
    if (task._priority == 'low') {
        document.querySelector('#low').checked = true;
    } else if (task._priority == 'medium') {
        document.querySelector('#med').checked = true;
    } else {
        document.querySelector('#high').checked = true;
    }

    const confirmEditBtn = document.createElement('button');
    confirmEditBtn.setAttribute('id', 'confirm-edit-button');
    confirmEditBtn.textContent = 'Confirm';
    taskForm.appendChild(confirmEditBtn);

    confirmEditBtn.addEventListener('click', () => {
        task._title = document.querySelector('#title').value;
        task._dueDate = new Date(document.querySelector('#date').valueAsDate);
        if (document.querySelector('#low').checked) {
            task._priority = 'low';
        } else if (document.querySelector('#med').checked) {
            task._priority = 'medium';
        } else {
            task._priority = 'high';
        }
        taskForm.reset();
        displayProject(currProject);
        confirmEditBtn.remove();
        addTaskBtn.style.display = 'block';
        formBackground.style.display = 'none';
        localStorage.setItem('projects', JSON.stringify(projectList));
    });

    window.addEventListener('click', e => {
        if (e.target != taskForm && e.target == formBackground) {
            confirmEditBtn.remove(); 
            addTaskBtn.style.display = 'block';
        }
    });
}

function showAll() {
    let allTasks = [];
    for (let i = 0; i < projectList.length; i++) {
        for (let j = 0; j < projectList[i].tasks.length; j++) {
            allTasks.push(projectList[i].tasks[j]);
        }
    } 

    homeProject.tasks = allTasks;
    currProject = homeProject;
    displayProject(currProject);
}

function showToday() {
    let allTasks = [];
    for (let i = 0; i < projectList.length; i++) {
        for (let j = 0; j < projectList[i].tasks.length; j++) {
            allTasks.push(projectList[i].tasks[j]);
        }
    }
    allTasks = allTasks.filter(task => isToday(task.dueDate));

    todayProject.tasks = allTasks;
    currProject = todayProject;
    displayProject();
}

function showThisWeek() {
    let allTasks = [];
    for (let i = 0; i < projectList.length; i++) {
        for (let j = 0; j < projectList[i].tasks.length; j++) {
            allTasks.push(projectList[i].tasks[j]);
        }
    }
    allTasks = allTasks.filter(task => isThisWeek(task.dueDate));

    thisWeekProject.tasks = allTasks;
    currProject = thisWeekProject;
    displayProject();
}

function deleteProject() {
    currProject = homeProject;
    homeBtn.style.fontWeight = 'bold';
    projectList.splice(projectList.indexOf(currProject), 1);
    localStorage.setItem('projects', JSON.stringify(projectList));
    renderProjects();
    showAll();
}