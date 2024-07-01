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
import { debounce } from "./utils/addDebounce.js";

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let page_current = 1;
const page_load = 9;
let currentFilter = "all";

const saveTasksToLocalStorage = () => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

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

  const newTask = {
    id: Date.now(),
    title: taskTitle,
    createdAt: formatDate(new Date()),
    isCompleted: false,
    isBeingEdited: false,
  };
  tasks.unshift(newTask);

  saveTasksToLocalStorage();
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

  saveTasksToLocalStorage();
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
    taskCard.classList.add("task-completed");
  }

  if (task.isBeingEdited) {
    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.value = task.title;
    inputElement.className = "edit-input";
    taskCard.appendChild(inputElement);

    const actionsContainer = document.createElement("div");
    actionsContainer.className = "edit-actions";

    const saveButton = document.createElement("button");
    saveButton.className = "btn-save";
    saveButton.textContent = "Save";
    saveButton.addEventListener("click", () => {
      updateTask(task.id, inputElement.value);
      renderTasks(currentFilter);
    });
    actionsContainer.appendChild(saveButton);

    const deleteButton = document.createElement("button");
    deleteButton.className = "btn-delete";
    deleteButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M19 24H5C3.896 24 3 23.104 3 22V6H21V22C21 23.104 20.104 24 19 24ZM10 10C10 9.448 9.552 9 9 9C8.448 9 8 9.448 8 10V19C8 19.552 8.448 20 9 20C9.552 20 10 19.552 10 19V10ZM16 10C16 9.448 15.552 9 15 9C14.448 9 14 9.448 14 10V19C14 19.552 14.448 20 15 20C15.552 20 16 19.552 16 19V10ZM22 5H2V3H8V1.5C8 0.673 8.673 0 9.5 0H14.5C15.325 0 16 0.671 16 1.5V3H22V5ZM10 3H14V2H10V3Z" fill="#BBBDD0"/>
      </svg>
    `;
    deleteButton.addEventListener("click", () => {
      deleteTask(task.id);
    });
    actionsContainer.appendChild(deleteButton);

    taskCard.appendChild(actionsContainer);
  } else {
    const titleElement = document.createElement("p");
    titleElement.textContent = task.title;
    titleElement.classList.toggle("line-through", task.isCompleted);
    taskCard.appendChild(titleElement);

    const createdAtElement = document.createElement("p");
    createdAtElement.className = "created-at";
    createdAtElement.textContent = `Created At: ${task.createdAt}`;
    taskCard.appendChild(createdAtElement);

    const actionsContainer = document.createElement("div");
    actionsContainer.className = "task-actions";

    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "task-buttons";

    const checkButton = document.createElement("button");
    checkButton.className = "btn-check";
    checkButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.285 2L9 13.567L3.714 8.556L0 12.272L9 21L24 5.715L20.285 2Z" fill="#BBBDD0"/>
      </svg>
    `;
    checkButton.addEventListener("click", () => {
      task.isCompleted = !task.isCompleted;
      taskCard.classList.toggle("task-completed");
      saveTasksToLocalStorage();
      renderTasks(currentFilter);
    });
    buttonsContainer.appendChild(checkButton);

    const editButton = document.createElement("button");
    editButton.className = "btn-edit";
    editButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_3_35)">
          <path d="M7.127 22.562L0 24L1.438 16.872L7.127 22.562ZM8.541 21.148L19.769 9.923L14.079 4.231L2.852 15.458L8.541 21.148ZM18.309 0L15.493 2.817L21.184 8.508L24 5.689L18.309 0V0Z" fill="#BBBDD0"/>
        </g>
        <defs>
          <clipPath id="clip0_3_35">
            <rect width="24" height="24" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    `;
    editButton.addEventListener("click", () => {
      task.isBeingEdited = true;
      renderTasks(currentFilter);
    });
    buttonsContainer.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.className = "btn-delete";
    deleteButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M19 24H5C3.896 24 3 23.104 3 22V6H21V22C21 23.104 20.104 24 19 24ZM10 10C10 9.448 9.552 9 9 9C8.448 9 8 9.448 8 10V19C8 19.552 8.448 20 9 20C9.552 20 10 19.552 10 19V10ZM16 10C16 9.448 15.552 9 15 9C14.448 9 14 9.448 14 10V19C14 19.552 14.448 20 15 20C15.552 20 16 19.552 16 19V10ZM22 5H2V3H8V1.5C8 0.673 8.673 0 9.5 0H14.5C15.325 0 16 0.671 16 1.5V3H22V5ZM10 3H14V2H10V3Z" fill="#BBBDD0"/>
      </svg>
    `;
    deleteButton.addEventListener("click", () => {
      deleteTask(task.id);
    });
    buttonsContainer.appendChild(deleteButton);

    actionsContainer.appendChild(buttonsContainer);

    if (task.isCompleted) {
      const completedTag = document.createElement("div");
      completedTag.className = "completed-tag";
      completedTag.textContent = "Completed in 3 days";
      actionsContainer.appendChild(completedTag);
    }

    taskCard.appendChild(actionsContainer);
  }

  return taskCard;
};

const deleteTask = (taskId) => {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasksToLocalStorage();
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

  if (tasks.length === 0) {
    document.getElementById("no-tasks").style.display = "block";
  } else {
    document.getElementById("no-tasks").style.display = "none";
  }
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

const handleSearchIconClick = () => {
  if (
    $searchInput.style.display === "none" ||
    $searchInput.style.display === ""
  ) {
    $searchInput.style.display = "block";
    $searchInput.focus();
  } else {
    $searchInput.style.display = "none";
  }
};

$searchInput.addEventListener(
  "input",
  debounce(() => renderTasks(currentFilter), 500)
);

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
document
  .getElementById("searchIcon")
  .addEventListener("click", handleSearchIconClick);
document.getElementById("btnAddTask").addEventListener("click", saveTask);
document.getElementById("btnCloseForm").addEventListener("click", closeForm);

renderTasks();
