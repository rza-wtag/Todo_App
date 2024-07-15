import {
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
} from "../js/elements.js";
import { stripSanitizedParts } from "../js/utils/stripSanitizedParts.js";
import { formatDate } from "../js/helpers/formatDate.js";
import { debounce } from "./utils/addDebounce.js";
import { checkSVG, editSVG, deleteSVG } from "./utils/constants.js";
import { calculateCompletionTime } from "./utils/utils.js";
import {
  TASK_PER_PAGE,
  ALL,
  COMPLETE,
  IN_COMPLETE,
  TASKS,
} from "./helpers/constants.js";

let tasks = [];
let page_current = 1;
let currentFilter = ALL;
let newTaskBeingEdited = false;
let newTaskId = null;

const loadTasksFromLocalStorage = () => {
  const storedTasks = localStorage.getItem(TASKS);
  if (storedTasks) {
    tasks = JSON.parse(storedTasks);
  }
};

const saveTasksToLocalStorage = () => {
  localStorage.setItem(TASKS, JSON.stringify(tasks));
};

const openNewTaskCard = () => {
  if (newTaskBeingEdited) {
    tasks = tasks.filter((task) => task.id !== newTaskId);
    newTaskBeingEdited = false;
    renderTasks(currentFilter);
    saveTasksToLocalStorage();
    return;
  }

  const newTask = {
    id: Date.now(),
    title: "",
    createdAt: formatDate(new Date()),
    isCompleted: false,
    isBeingEdited: true,
  };
  tasks.unshift(newTask);
  newTaskBeingEdited = true;
  newTaskId = newTask.id;
  renderTasks(currentFilter);
  saveTasksToLocalStorage();
};

const addTask = (taskId, newTitle) => {
  const sanitizedTitle = stripSanitizedParts(newTitle.trim());
  const taskIndex = tasks.findIndex((task) => task.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].title = sanitizedTitle;
    tasks[taskIndex].isBeingEdited = false;
    newTaskBeingEdited = false;
    renderTasks(currentFilter);
    saveTasksToLocalStorage();
  }
};

const updateTask = (taskId, newTitle) => {
  const sanitizedTitle = stripSanitizedParts(newTitle.trim());
  const taskIndex = tasks.findIndex((task) => task.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].title = sanitizedTitle;
    tasks[taskIndex].isBeingEdited = false;
    renderTasks(currentFilter);
    saveTasksToLocalStorage();
  }
};

const deleteTask = (taskId) => {
  tasks = tasks.filter((task) => task.id !== taskId);
  renderTasks(currentFilter);
  saveTasksToLocalStorage();
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
    saveButton.className = "button button--secondary";
    saveButton.textContent = task.id === newTaskId ? "Add Task" : "Save";
    saveButton.addEventListener("click", () => {
      if (inputElement.value.trim() === "") return;
      if (task.id === newTaskId) {
        addTask(task.id, inputElement.value);
      } else {
        updateTask(task.id, inputElement.value);
      }
    });
    actionsContainer.appendChild(saveButton);

    const deleteButton = document.createElement("button");
    deleteButton.className = "task-card__button";
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

    const checkButton = document.createElement("div");
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
      saveTasksToLocalStorage();
    });
    buttonsContainer.appendChild(checkButton);

    const editButton = document.createElement("button");
    editButton.className = "task-card__button";
    editButton.innerHTML = editSVG;
    editButton.addEventListener("click", () => {
      task.isBeingEdited = true;
      renderTasks(currentFilter);
      saveTasksToLocalStorage();
    });
    buttonsContainer.appendChild(editButton);

    const deleteButton = document.createElement("div");
    deleteButton.className = "task-card__button task-card__button--delete";
    deleteButton.innerHTML = deleteSVG;
    deleteButton.addEventListener("click", () => {
      deleteTask(task.id);
      saveTasksToLocalStorage();
    });
    buttonsContainer.appendChild(deleteButton);

    actionsContainer.appendChild(buttonsContainer);
    taskCard.appendChild(actionsContainer);
  }

  return taskCard;
};

const filterTasks = (searchText, filter) => {
  return tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchText);
    const matchesFilter =
      filter === ALL ||
      (filter === COMPLETE && task.isCompleted) ||
      (filter === IN_COMPLETE && !task.isCompleted);
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
  const startIndex = (page_current - 1) * TASK_PER_PAGE;
  const paginatedTasks = filteredTasks.slice(
    startIndex,
    startIndex + TASK_PER_PAGE
  );
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
  if (page_current * TASK_PER_PAGE >= totalTasks) {
    $btnLoadMore.style.display = "none";
  } else {
    $btnLoadMore.classList.add("show");
    $btnLoadMore.classList.remove("hide");
  }

  if (page_current > 1) {
    $btnShowLess.classList.add("show");
    $btnShowLess.classList.remove("hide");
  } else {
    $btnShowLess.classList.add("hide");
    $btnShowLess.classList.remove("show");
  }
};

const handlePagination = () => {
  page_current++;
  renderTasks(currentFilter, true);
  $btnLoadMore.classList.add("hide");
  $btnShowLess.classList.remove("hide");
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

$searchInput.addEventListener(
  "input",
  debounce(() => renderTasks(currentFilter), 500)
);

$filterAll.addEventListener("click", () => {
  currentFilter = ALL;
  renderTasks(ALL);
});
$filterComplete.addEventListener("click", () => {
  currentFilter = COMPLETE;
  renderTasks(COMPLETE);
});
$filterIncomplete.addEventListener("click", () => {
  currentFilter = IN_COMPLETE;
  renderTasks(IN_COMPLETE);
});
$btnCreate.addEventListener("click", openNewTaskCard);
$btnLoadMore.addEventListener("click", handlePagination);
$btnShowLess.addEventListener("click", () => {
  page_current = 1;
  renderTasks(currentFilter);
  $btnShowLess.classList.add("hide");
  $btnLoadMore.classList.remove("hide");
});
$searchIcon.addEventListener("click", handleSearchIconClick);

loadTasksFromLocalStorage();
renderTasks();
