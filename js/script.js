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
  $emptyState,
  $searchIcon,
  $btnAddTask,
  $btnCloseForm,
} from "../js/elements.js";
import { stripSanitizedParts } from "../js/utils/stripSanitizedParts.js";
import { formatDate } from "../js/helpers/formatDate.js";
import { checkSVG, editSVG, deleteSVG } from "./utils/constants.js";
import { calculateCompletionTime } from "./utils/utils.js";

let tasks = [];
let pageCurrent = 1;
const pageLoad = 9;
let currentFilter = "all";

const openForm = () => {
  $taskForm.classList.add("show");
  $taskForm.classList.remove("hide");
};

const closeForm = () => {
  $taskForm.classList.add("hide");
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

  const newTask = {
    id: Date.now(),
    title: taskTitle,
    createdAt: formatDate(new Date()),
    isCompleted: false,
    isBeingEdited: false,
  };
  tasks.unshift(newTask);

  renderTasks(currentFilter);
  $taskTitle.value = "";
  closeForm();
};

const updateTask = (taskId, newTitle) => {
  const taskIndex = tasks.findIndex((task) => task.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].title = newTitle;
    tasks[taskIndex].isBeingEdited = false;
  }
};

const saveTask = () => {
  const title = $taskTitle.value.trim();
  const editedTaskIndex = tasks.findIndex((task) => task.isBeingEdited);

  if (editedTaskIndex !== -1) {
    updateTask(tasks[editedTaskIndex].id, title);
  } else {
    addTask();
  }

  renderTasks(currentFilter);
  $taskTitle.value = "";
  closeForm();
};

const createTaskCard = (task) => {
  const taskCard = document.createElement("div");
  taskCard.className = "task-card";
  if (task.isCompleted) {
    taskCard.classList.add("task-card--completed");
  }

  if (task.isBeingEdited) {
    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.value = task.title;
    inputElement.className = "edit-input";
    taskCard.appendChild(inputElement);

    const actionsContainer = document.createElement("div");
    actionsContainer.className = "task-card__edit-actions";

    const saveButton = document.createElement("button");
    saveButton.className = "task-card__edit-button--save";
    saveButton.textContent = "Save";
    saveButton.addEventListener("click", () => {
      updateTask(task.id, inputElement.value);
      renderTasks(currentFilter);
    });
    actionsContainer.appendChild(saveButton);

    const deleteButton = document.createElement("button");
    deleteButton.className = "task-card__button task-card__button--delete";
    deleteButton.innerHTML = deleteSVG;
    deleteButton.addEventListener("click", () => {
      deleteTask(task.id);
    });
    actionsContainer.appendChild(deleteButton);

    taskCard.appendChild(actionsContainer);
  } else {
    const titleElement = document.createElement("p");
    titleElement.className = "task-card__title";
    titleElement.textContent = task.title;
    titleElement.classList.toggle("task-card__line-through", task.isCompleted);
    taskCard.appendChild(titleElement);

    const createdAtElement = document.createElement("p");
    createdAtElement.className = "task-card__created-at";
    createdAtElement.textContent = `Created At: ${task.createdAt}`;
    taskCard.appendChild(createdAtElement);

    const actionsContainer = document.createElement("div");
    actionsContainer.className = "task-card__task-actions";

    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "task-card__task-buttons";

    const checkButton = document.createElement("button");
    checkButton.className = "task-card__button task-card__button--check";
    checkButton.innerHTML = checkSVG;
    checkButton.addEventListener("click", () => {
      task.isCompleted = true;
      taskCard.classList.add("task-card--completed");
      checkButton.classList.add("hide");
      editButton.classList.add("hide");

      const completedTag = document.createElement("div");
      completedTag.className = "task-card__completed-tag";
      completedTag.textContent = calculateCompletionTime(task.createdAt);
      actionsContainer.appendChild(completedTag);
    });
    buttonsContainer.appendChild(checkButton);

    const editButton = document.createElement("button");
    editButton.className = "task-card__button task-card__button--edit";
    editButton.innerHTML = editSVG;
    editButton.addEventListener("click", () => {
      task.isBeingEdited = true;
      renderTasks(currentFilter);
    });
    buttonsContainer.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.className = "task-card__button task-card__button--delete";
    deleteButton.innerHTML = deleteSVG;
    deleteButton.addEventListener("click", () => {
      deleteTask(task.id);
    });
    buttonsContainer.appendChild(deleteButton);

    actionsContainer.appendChild(buttonsContainer);

    taskCard.appendChild(actionsContainer);
  }

  return taskCard;
};

const deleteTask = (taskId) => {
  tasks = tasks.filter((task) => task.id !== taskId);
  renderTasks(currentFilter);
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
    pageCurrent = 1;
  }

  const filteredTasks = filterTasks(searchText, filter);
  const startIndex = (pageCurrent - 1) * pageLoad;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + pageLoad);

  paginatedTasks.forEach((task) => {
    const taskCard = createTaskCard(task);
    $taskList.appendChild(taskCard);
  });

  updatePaginationButtons(filteredTasks.length);

  if (tasks.length === 0) {
    $emptyState.classList.add("show");
    $emptyState.classList.remove("hide");
  } else {
    $emptyState.classList.add("hide");
    $emptyState.classList.remove("show");
  }
};

const updatePaginationButtons = (totalTasks) => {
  if (pageCurrent * pageLoad >= totalTasks) {
    $btnLoadMore.classList.add("hide");
    $btnLoadMore.classList.remove("show");
  } else {
    $btnLoadMore.classList.add("show");
    $btnLoadMore.classList.remove("hide");
  }

  if (pageCurrent > 1) {
    $btnShowLess.classList.add("show");
    $btnShowLess.classList.remove("hide");
  } else {
    $btnShowLess.classList.add("hide");
    $btnShowLess.classList.remove("show");
  }
};

const showError = (message) => {
  const $errorMessage = document.createElement("p");
  $errorMessage.className = "error-message";
  $errorMessage.textContent = message;
  $taskForm.insertBefore($errorMessage, $taskTitle);
};

const handlePagination = () => {
  pageCurrent++;
  renderTasks(currentFilter, true);
};

const handleSearchIconClick = () => {
  if (
    $searchInput.classList.contains("hide") ||
    !$searchInput.classList.contains("show")
  ) {
    $searchInput.classList.add("show");
    $searchInput.classList.remove("hide");
    $searchInput.focus();
  } else {
    $searchInput.classList.add("hide");
    $searchInput.classList.remove("show");
  }
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
  pageCurrent = 1;
  renderTasks(currentFilter);
});
$searchIcon.addEventListener("click", handleSearchIconClick);
$btnAddTask.addEventListener("click", saveTask);
$btnCloseForm.addEventListener("click", closeForm);

renderTasks();
