import { $taskForm, $taskTitle, $taskList, $btnCreate } from '../js/elements.js';
import { stripSanitizedParts } from '../js/utils/utilities.js';

let tasks = [];
const $errorMessage = document.createElement("p");
$errorMessage.className = "error-message";

const openForm = () => {
    $taskForm.classList.add("show");
};

const closeForm = () => {
    $taskForm.classList.remove("show");
};

const addTask = () => {
    let title = $taskTitle.value.trim();
    if (title === "") {
        showError("Please enter a task title.");
        return;
    }

    const displayTitle = stripSanitizedParts(title);

    const newTask = {
        id: Date.now(), 
        title: displayTitle,
        createdAt: new Date().toLocaleDateString(),
        completed: false,
    };

    tasks.unshift(newTask);
    renderTasks();
    $taskTitle.value = "";
    closeForm();
};

const createTaskCard = task => {
    const taskCard = document.createElement("div");
    taskCard.className = "task-card";

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
    taskCard.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.className = "btn-delete";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener('click', () => {
        deleteTask(task.id);
    });
    taskCard.appendChild(deleteButton);

    return taskCard;
};

const renderTasks = () => {
    $taskList.innerHTML = "";

    tasks.forEach(task => {
        const taskCard = createTaskCard(task);
        $taskList.appendChild(taskCard);
    });
};

const showError = message => {
    $errorMessage.textContent = message;
    $taskForm.insertBefore($errorMessage, $taskTitle);
};

$btnCreate.addEventListener('click', openForm);
document.getElementById('btnAddTask').addEventListener('click', addTask);
document.getElementById('btnCloseForm').addEventListener('click', closeForm);
