import { $taskForm, $taskTitle, $taskList, $btnCreate } from '../js/elements.js';
import { stripSanitizedParts } from '../js/utils/stripSanitizedParts.js';

let tasks = [];

const openForm = () => {
    $taskForm.classList.add("show");
};

const closeForm = () => {
    $taskForm.classList.remove("show");
    $taskTitle.value = "";
};

const formatDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear() % 100;
    return `${day < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}.${year < 10 ? '0' : ''}${year}`;
};

const addTask = () => {
    const title = $taskTitle.value.trim();
    if (title === "") {
        showError("Please enter a task title.");
        return;
    }

    const taskTitle = stripSanitizedParts(title);

    const editedTaskIndex = tasks.findIndex(task => task.isBeingEdited === true);
    if (editedTaskIndex !== -1) {
        tasks[editedTaskIndex].title = taskTitle;
        tasks[editedTaskIndex].isBeingEdited = false;
        renderTasks();
        closeForm();
        return;
    }

    const newTask = {
        id: Date.now(),
        title: taskTitle,
        createdAt: formatDate(new Date()),
        isCompleted: false,
        isBeingEdited: false
    };

    tasks.unshift(newTask);
    renderTasks();
    closeForm();
};

const editTask = taskId => {
    const taskToEdit = tasks.find(task => task.id === taskId);
    if (taskToEdit) {
        taskToEdit.isBeingEdited = true;
        const taskCard = document.querySelector(`.task-card[data-id="${taskId}"]`);
        const $taskTitle = taskCard.querySelector('p');
        const $editInput = document.createElement('input');
        $editInput.type = 'text';
        $editInput.value = taskToEdit.title;
        const $saveButton = document.createElement('button');
        $saveButton.textContent = 'Save';
        
        $saveButton.addEventListener('click', () => {
            const newTaskTitle = $editInput.value.trim();
            if (newTaskTitle) {
                taskToEdit.title = newTaskTitle;
                $taskTitle.textContent = newTaskTitle;
                taskToEdit.isBeingEdited = false;
                renderTasks();
            }
        });

        taskCard.replaceChild($editInput, $taskTitle);
        taskCard.querySelector('.btn-edit').replaceWith($saveButton);
    }
};

const createTaskCard = task => {
    const taskCard = document.createElement("div");
    taskCard.className = "task-card";
    taskCard.setAttribute("data-id", task.id);
    if (task.isCompleted) {
        taskCard.classList.add('isCompleted');
    }

    const titleElement = document.createElement("p");
    titleElement.textContent = task.title;
    taskCard.appendChild(titleElement);

    const createdAtElement = document.createElement("p");
    createdAtElement.className = "created-at";
    createdAtElement.textContent = `Created At: ${task.createdAt}`;
    taskCard.appendChild(createdAtElement);

    const editButton = document.createElement("button");
    editButton.className = "btn-edit";
    editButton.textContent = "Edit";
    editButton.addEventListener('click', () => {
        editTask(task.id);
    });
    taskCard.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.className = "btn-delete";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener('click', () => {
        deleteTask(task.id);
    });
    taskCard.appendChild(deleteButton);

    const checkButton = document.createElement('button');
    checkButton.className = 'btn-check';
    checkButton.textContent = '✔️';
    checkButton.addEventListener('click', () => {
        task.isCompleted = !task.isCompleted;
        taskCard.classList.toggle('isCompleted');
        renderTasks();
    });
    taskCard.appendChild(checkButton);

    const completedDiv = document.createElement("div");
    completedDiv.textContent = "Completed";
    completedDiv.style.display = task.isCompleted ? "block" : "none";
    taskCard.appendChild(completedDiv);
    return taskCard;
};

const deleteTask = taskId => {
    tasks = tasks.filter(task => task.id !== taskId);
    renderTasks();
};

const renderTasks = () => {
    $taskList.innerHTML = "";

    tasks.forEach(task => {
        const taskCard = createTaskCard(task);
        $taskList.appendChild(taskCard);
    });
};

const showError = message => {
    const $errorMessage = document.createElement("p");
    $errorMessage.className = "error-message";
    $errorMessage.textContent = message;
    $taskForm.insertBefore($errorMessage, $taskTitle);
};

$btnCreate.addEventListener('click', openForm);
document.getElementById('btnAddTask').addEventListener('click', addTask);
document.getElementById('btnCloseForm').addEventListener('click', closeForm);