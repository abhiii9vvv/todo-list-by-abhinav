// Elements (declared once)
const addTaskBtn = document.getElementById('addTaskBtn');
const taskModal = document.getElementById('taskModal');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const cancelTaskBtn = document.getElementById('cancelTaskBtn');

const taskTitleInput = document.getElementById('taskTitle');
const taskDescInput = document.getElementById('taskDescription');
const taskCategorySelect = document.getElementById('taskCategory');
const taskDueDateInput = document.getElementById('taskDueDate');
const taskPrioritySelect = document.getElementById('taskPriority');

const taskTemplate = document.getElementById('taskTemplate');
const categories = ['work', 'personal', 'study', 'health', 'other'];

// Open modal
addTaskBtn.addEventListener('click', () => {
  taskModal.classList.remove('hidden');
  clearModalInputs();
});

// Close modal
cancelTaskBtn.addEventListener('click', () => {
  taskModal.classList.add('hidden');
  clearModalInputs();
});

function clearModalInputs() {
  taskTitleInput.value = '';
  taskDescInput.value = '';
  taskCategorySelect.value = 'work';
  taskDueDateInput.value = '';
  taskPrioritySelect.value = 'medium';
}

saveTaskBtn.addEventListener('click', () => {
  const title = taskTitleInput.value.trim();
  if (!title) {
    alert('Task title is required');
    return;
  }

  const desc = taskDescInput.value.trim();
  const category = taskCategorySelect.value;
  const dueDate = taskDueDateInput.value;
  const priority = taskPrioritySelect.value;

  addTaskToCategory({ title, desc, category, dueDate, priority });

  taskModal.classList.add('hidden');
  clearModalInputs();
});

function addTaskToCategory({ title, desc, category, dueDate, priority }) {
  if (!categories.includes(category)) {
    console.warn(`Unknown category "${category}"`);
    return;
  }

  const taskList = document.getElementById(`${category}-tasks`);
  if (!taskList) return;

  const taskClone = taskTemplate.content.cloneNode(true);
  const taskItem = taskClone.querySelector('li');
  const taskTitleEl = taskClone.querySelector('.task-title');
  const taskDescEl = taskClone.querySelector('.task-desc');
  const taskPriorityEl = taskClone.querySelector('.task-priority');
  const taskDateEl = taskClone.querySelector('.task-date');
  const checkbox = taskClone.querySelector('.task-check');
  const deleteBtn = taskClone.querySelector('.delete-task');

  taskTitleEl.textContent = title;
  taskDescEl.textContent = desc || '';
  taskPriorityEl.textContent = capitalize(priority);
  taskPriorityEl.className = `task-priority ${priority}`;
  taskDateEl.textContent = dueDate ? `Due: ${dueDate}` : '';

  checkbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      taskItem.style.opacity = '0.6';
      taskTitleEl.style.textDecoration = 'line-through';
    } else {
      taskItem.style.opacity = '1';
      taskTitleEl.style.textDecoration = 'none';
    }
  });

  deleteBtn.addEventListener('click', () => {
    taskItem.remove();
  });

  taskList.appendChild(taskClone);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
