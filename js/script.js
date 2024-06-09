import { $taskForm, $taskTitle, $taskList, $btnCreate } from '../js/elements.js';

let tasks = [];
let taskId = 0;

function openForm() {
    $taskForm.classList.add("show");
}

function closeForm() {
    $taskForm.classList.remove("show");
}

function addTask() {
    const title = $taskTitle.value;
    if (title === "") {
        alert("Please enter a task title.");
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

$btnCreate.addEventListener('click', openForm);
$taskForm.querySelector('button:nth-child(2)').addEventListener('click', addTask);
$taskForm.querySelector('button:nth-child(3)').addEventListener('click', closeForm);
