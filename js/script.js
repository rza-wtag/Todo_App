import {
  $taskForm,
  $taskTitle,
  $taskList,
  $btnCreate,
  $searchInput,
  $filterAll,
  $filterComplete,
  $filterIncomplete,
  $btnLoadMore,
  $btnShowLess,
} from "../js/elements.js";
import { stripSanitizedParts } from "../js/utils/stripSanitizedParts.js";
import { formatDate } from "../js/helpers/formatDate.js";

let tasks = [];
let page_current = 1;
const page_load = 9;
let currentFilter = "all";

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
    tasks[editedTaskIndex].isBeingEdited = false;
  } else {
    const newTask = {
      id: Date.now(),
      title: taskTitle,
      createdAt: formatDate(new Date()),
      isCompleted: false,
      isBeingEdited: false,
    };
    tasks.unshift(newTask);
  }

  renderTasks(currentFilter);
  $taskTitle.value = "";
  closeForm();
};

const createTaskCard = (task) => {
  const taskCard = document.createElement("div");
  taskCard.className = "task-card";
  if (task.isCompleted) {
    taskCard.classList.add("task-completed");
  }

  const titleElement = document.createElement("p");
  titleElement.textContent = task.title;
  taskCard.appendChild(titleElement);

  const createdAtElement = document.createElement("div");
  createdAtElement.className = "created-at";
  createdAtElement.textContent = `Created At: ${task.createdAt}`;
  taskCard.appendChild(createdAtElement);

  const editButton = document.createElement("button");
  editButton.className = "btn-edit";
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    editTask(task.id);
  });
  if (task.isCompleted) {
    editButton.classList.add("hidden");
  }
  taskCard.appendChild(editButton);

  const deleteButton = document.createElement("button");
  deleteButton.className = "btn-delete";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    deleteTask(task.id);
  });
  taskCard.appendChild(deleteButton);

  if (!task.isCompleted) {
    const checkButton = document.createElement("button");
    checkButton.className = "btn-check";
    checkButton.textContent = "✔️";
    checkButton.addEventListener("click", () => {
      task.isCompleted = true;
      taskCard.classList.add("task-completed");
      renderTasks();
    });
    taskCard.appendChild(checkButton);
  }

  const completedDiv = document.createElement("div");
  completedDiv.className = "completed-tag";
  if (!task.isCompleted) {
    completedDiv.classList.add("hidden");
  }
  taskCard.appendChild(completedDiv);

  return taskCard;
};

const deleteTask = (taskId) => {
  tasks = tasks.filter((task) => task.id !== taskId);
  renderTasks(currentFilter);
};

const editTask = (taskId) => {
  const taskToEdit = tasks.find((task) => task.id === taskId);
  if (taskToEdit) {
    $taskTitle.value = taskToEdit.title;
    taskToEdit.isBeingEdited = true;
    openForm();
  }
};

const filterTasks = (searchText, filter) => {
  return tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchText);
    const matchesFilter =
      filter === "all" ||
      (filter === "complete" && task.isCompleted) ||
      (filter === "incomplete" && !task.isCompleted);
    return matchesSearch && matchesFilter;
  });
};

const renderTasks = (filter = currentFilter, append = false) => {
  currentFilter = filter;
  const searchText = $searchInput.value.toLowerCase();
  if (!append) {
    $taskList.innerHTML = "";
    page_current = 1;
  }

  const filteredTasks = filterTasks(searchText, filter);
  const startIndex = (page_current - 1) * page_load;
  const paginatedTasks = filteredTasks.slice(
    startIndex,
    startIndex + page_load
  );

  paginatedTasks.forEach((task) => {
    const taskCard = createTaskCard(task);
    $taskList.appendChild(taskCard);
  });

  updatePaginationButtons(filteredTasks.length);
};

const updatePaginationButtons = (totalTasks) => {
  if (page_current * page_load >= totalTasks) {
    $btnLoadMore.style.display = "none";
  } else {
    $btnLoadMore.style.display = "block";
  }

  if (page_current > 1) {
    $btnShowLess.style.display = "block";
  } else {
    $btnShowLess.style.display = "none";
  }
};

const showError = (message) => {
  const $errorMessage = document.createElement("p");
  $errorMessage.className = "error-message";
  $errorMessage.textContent = message;
  $taskForm.insertBefore($errorMessage, $taskTitle);
};

const handlePagination = () => {
  page_current++;
  renderTasks(currentFilter, true);
};

$searchInput.addEventListener("input", () => renderTasks(currentFilter));
$filterAll.addEventListener("click", () => {
  currentFilter = "all";
  renderTasks("all");
});
$filterComplete.addEventListener("click", () => {
  currentFilter = "complete";
  renderTasks("complete");
});
$filterIncomplete.addEventListener("click", () => {
  currentFilter = "incomplete";
  renderTasks("incomplete");
});
$btnCreate.addEventListener("click", openForm);
$btnLoadMore.addEventListener("click", handlePagination);
$btnShowLess.addEventListener("click", () => {
  page_current = 1;
  renderTasks(currentFilter);
});
document.getElementById("btnAddTask").addEventListener("click", addTask);
document.getElementById("btnCloseForm").addEventListener("click", closeForm);
