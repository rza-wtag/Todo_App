import {
  $taskForm,
  $taskTitle,
  $taskList,
  $btnCreate,
} from "../js/elements.js";
import { stripSanitizedParts } from "../js/utils/stripSanitizedParts.js";
import { formatDate } from "../js/helpers/formatDate.js";
let tasks = [];

const openForm = () => {
  $taskForm.classList.add("show");
};

const closeForm = () => {
  $taskForm.classList.remove("show");
  $taskTitle.value = "";
  tasks.forEach((task) => (task.isBeingEdited = false));
};

const addTask = () => {
  const title = $taskTitle.value.trim();

  if (title === "") {
    showError("Please enter a task title.");
    return;
  }

  const taskTitle = stripSanitizedParts(title);

  const editedTaskIndex = tasks.findIndex((task) => task.isBeingEdited);
  if (editedTaskIndex !== -1) {
    tasks[editedTaskIndex].title = taskTitle;
    tasks[editedTaskIndex].createdAt = formatDate(new Date());
    tasks[editedTaskIndex].isBeingEdited = false;
  } else {
    const newTask = {
      id: Date.now(),
      title: taskTitle,
      createdAt: formatDate(new Date()),
      isBeingEdited: false,
    };
    tasks.unshift(newTask);
  }

  renderTasks();
  $taskTitle.value = "";
  closeForm();
};

const createTaskCard = (task) => {
  const taskCard = document.createElement("div");
  taskCard.className = "task-card";
  taskCard.setAttribute("data-id", task.id);

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
  editButton.addEventListener("click", () => {
    editTask(task.id);
  });
  taskCard.appendChild(editButton);

  const deleteButton = document.createElement("button");
  deleteButton.className = "btn-delete";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    deleteTask(task.id);
  });
  taskCard.appendChild(deleteButton);

  return taskCard;
};

const deleteTask = (taskId) => {
  tasks = tasks.filter((task) => task.id !== taskId);
  renderTasks();
};

const editTask = (taskId) => {
  const taskToEdit = tasks.find((task) => task.id === taskId);
  if (taskToEdit) {
    $taskTitle.value = taskToEdit.title;
    taskToEdit.isBeingEdited = true;
    openForm();
  }
};

const renderTasks = () => {
  $taskList.innerHTML = "";

  tasks.forEach((task) => {
    const taskCard = createTaskCard(task);
    $taskList.appendChild(taskCard);
  });
};

const showError = (message) => {
  const $errorMessage = document.createElement("p");
  $errorMessage.className = "error-message";
  $errorMessage.textContent = message;
  $taskForm.insertBefore($errorMessage, $taskTitle);
};

$btnCreate.addEventListener("click", openForm);
document.getElementById("btnAddTask").addEventListener("click", addTask);
document.getElementById("btnCloseForm").addEventListener("click", closeForm);
