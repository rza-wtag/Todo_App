let tasks = [];
let taskId = 0;

function openForm() {
    document.getElementById("taskForm").style.display = "flex";
}

function closeForm() {
    document.getElementById("taskForm").style.display = "none";
}

function addTask() {
    const taskTitle = document.getElementById("taskTitle").value;
    if (taskTitle === "") {
        alert("Please enter a task title.");
        return;
    }

    const newTask = {
        id: taskId++,
        title: taskTitle,
        createdAt: new Date().toLocaleDateString(),
        completed: false,
    };

    tasks.push(newTask);
    renderTasks();
    document.getElementById("taskTitle").value = "";
    closeForm();
}

function renderTasks() {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    tasks.forEach(task => {
        const taskCard = document.createElement("div");
        taskCard.className = "task-card";
        taskCard.innerHTML = `
            <p>${task.title}</p>
            <p class="created-at">Created At: ${task.createdAt}</p>
            <div class="task-actions">
                <button class="btn-complete" onclick="completeTask(${task.id})">&#10003;</button>
                <button class="btn-edit" onclick="editTask(${task.id})">&#9998;</button>
                <button class="btn-delete" onclick="deleteTask(${task.id})">&#128465;</button>
            </div>
            ${task.completed ? `<span class="completion-status">Completed</span>` : ''}
        `;
        taskList.appendChild(taskCard);
    });
}

