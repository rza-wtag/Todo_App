import { $taskForm, $taskTitle, $taskList, $btnCreate } from '../js/elements.js';

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
    const title = $taskTitle.value.trim();
    if (title === "") {
        showError("Please enter a task title.");
        return;
    }

    const newTask = {
        id: Date.now(), 
        title: title,
        createdAt: new Date().toLocaleDateString(),
        completed: false,
    };

    tasks.push(newTask);
    renderTasks();
    $taskTitle.value = "";
    closeForm();
};

const createTaskCard = task => {
    const taskCard = document.createElement("div");
    taskCard.className = "task-card";
    taskCard.innerHTML = `
        <p>${task.title}</p>
        <p class="created-at">Created At: ${task.createdAt}</p>
        <button class="btn-edit">Edit</button>
        <button class="btn-delete">Delete</button>
    `;
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
$taskForm.querySelector('button:nth-child(2)').addEventListener('click', addTask);
$taskForm.querySelector('button:nth-child(3)').addEventListener('click', closeForm);
