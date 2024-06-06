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

function renderTasks(filter = 'all') {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true;
        if (filter === 'incomplete') return !task.completed;
        if (filter === 'complete') return task.completed;
    });

    filteredTasks.forEach(task => {
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

function completeTask(taskId) {
    const task = tasks.find(task => task.id === taskId);
    task.completed = true;
    renderTasks();
}

function editTask(taskId) {
    const task = tasks.find(task => task.id === taskId);
    const newTitle = prompt("Edit task title:", task.title);
    if (newTitle !== null) {
        task.title = newTitle;
        renderTasks();
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    renderTasks();
}

