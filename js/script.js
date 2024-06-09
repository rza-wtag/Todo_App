import { $taskForm, $taskTitle, $taskList, $btnCreate } from '../js/elements.js';

let tasks = [];
let taskId = 0;
const $errorMessage = document.createElement("p");
$errorMessage.className = "error-message";

function openForm() {
    $taskForm.classList.add("show");
}

function closeForm() {
    $taskForm.classList.remove("show");
}

function addTask() {
    const title = $taskTitle.value.trim();
    if (title === "") {
        showError("Please enter a task title.");
        return;
    }

    const newTask = {
        id: taskId++,
        title: title,
        createdAt: new Date().toLocaleDateString(),
        completed: false,
    };

    tasks.push(newTask);
    renderTasks();
    $taskTitle.value = "";
    closeForm();
}

function renderTasks() {
    $taskList.innerHTML = "";

    tasks.forEach(task => {
        const taskCard = document.createElement("div");
        taskCard.className = "task-card";
        taskCard.innerHTML = `
            <p>${task.title}</p>
            <p class="created-at">Created At: ${task.createdAt}</p>
            <button class="btn-edit">Edit</button>
            <button class="btn-delete">Delete</button>
        `;
        $taskList.appendChild(taskCard);
    });
}

function showError(message) {
    $errorMessage.textContent = message;
    $taskForm.insertBefore($errorMessage, $taskTitle);
}

$btnCreate.addEventListener('click', openForm);
$taskForm.querySelector('button:nth-child(2)').addEventListener('click', addTask);
$taskForm.querySelector('button:nth-child(3)').addEventListener('click', closeForm);
