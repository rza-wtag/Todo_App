import { $taskForm, $taskTitle, $taskList, $btnCreate } from '../js/elements.js';

let tasks = [];
let editingTaskId = null;
const $errorMessage = document.createElement("p");
$errorMessage.className = "error-message";

const openForm = () => {
    $taskForm.classList.add("show");
};

const closeForm = () => {
    $taskForm.classList.remove("show");
    $taskTitle.value = ""; 
    editingTaskId = null; 
};

const stripSanitizedParts = (input) => {
    return input.replace(/<[^>]*>/g, '');
};

const addTask = () => {
    let title = $taskTitle.value.trim();
    if (title === "") {
        showError("Please enter a task title.");
        return;
    }

    const displayTitle = stripSanitizedParts(title);

    if (editingTaskId !== null) {
        const editedTaskIndex = tasks.findIndex(task => task.id === editingTaskId);
        if (editedTaskIndex !== -1) {
            tasks[editedTaskIndex].title = displayTitle;
            renderTasks();
            closeForm();
            return;
        }
    }

    const newTask = {
        id: Date.now(), 
        title: displayTitle,
        createdAt: new Date().toLocaleDateString(),
        completed: false,
    };

    tasks.unshift(newTask);
    renderTasks();
    closeForm();
};

const editTask = taskId => {
    const taskToEdit = tasks.find(task => task.id === taskId);
    if (taskToEdit) {
        $taskTitle.value = taskToEdit.title; 
        editingTaskId = taskId; 
        openForm(); 
    }
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

    return taskCard;
};

const deleteTask = taskId => {
    const index = tasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
        tasks.splice(index, 1);
        renderTasks();
    }
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
$taskForm.querySelector('button:nth-child(2)').addEventListener('click', addTask);
$taskForm.querySelector('button:nth-child(3)').addEventListener('click', closeForm);
