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

// Load tasks from localStorage on startup
window.addEventListener('DOMContentLoaded', loadTasks);

function loadTasks() {
  const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  savedTasks.forEach(task => addTaskToCategory(task));
}

function saveTasksToLocalStorage() {
  const allTasks = [];
  categories.forEach(cat => {
    const list = document.getElementById(`${cat}-tasks`);
    list.querySelectorAll('.task-item').forEach(task => {
      const title = task.querySelector('.task-title')?.textContent;
      const desc = task.querySelector('.task-desc')?.textContent;
      const priority = task.querySelector('.task-priority')?.textContent.toLowerCase();
      const dueDate = task.querySelector('.task-date')?.textContent.replace('Due: ', '');
      const checked = task.querySelector('.task-check')?.checked;

      allTasks.push({ title, desc, priority, dueDate, category: cat, checked });
    });
  });

  localStorage.setItem('tasks', JSON.stringify(allTasks));
}


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

  // Save after task is added
  saveTasksToLocalStorage();

  taskModal.classList.add('hidden');
  clearModalInputs();
  alert('Task added successfully!');
});


// ✅ Add the filter button functionality HERE
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');

    const filterType = e.target.textContent.trim().toLowerCase();
    filterTasks(filterType);
  });
});

function filterTasks(filterType) {
  const allTasks = document.querySelectorAll('.task-item');
  allTasks.forEach(task => {
    const dueText = task.querySelector('.task-date')?.textContent || "";
    const today = new Date().toISOString().split('T')[0];

    if (filterType === 'all') {
      task.style.display = '';
    } else if (filterType === 'today') {
      task.style.display = dueText.includes(today) ? '' : 'none';
    } else if (filterType === 'upcoming') {
      task.style.display = dueText && dueText.split('Due: ')[1] > today ? '' : 'none';
    } else if (filterType === 'important') {
      const priority = task.querySelector('.task-priority')?.textContent.toLowerCase();
      task.style.display = priority === 'high' ? '' : 'none';
    }
  });
}
document.getElementById('sortBy').addEventListener('change', (e) => {
  const sortType = e.target.value;
  sortTasks(sortType);
});

function sortTasks(type) {
  const allCategories = ['work', 'personal', 'study', 'health'];
  allCategories.forEach(cat => {
    const list = document.getElementById(`${cat}-tasks`);
    const tasks = Array.from(list.children);

    tasks.sort((a, b) => {
      if (type === 'date') {
        const aDate = new Date(a.querySelector('.task-date')?.textContent.replace('Due: ', ''));
        const bDate = new Date(b.querySelector('.task-date')?.textContent.replace('Due: ', ''));
        return aDate - bDate;
      } else if (type === 'priority') {
        const priorities = { high: 1, medium: 2, low: 3 };
        const aPri = priorities[a.querySelector('.task-priority')?.textContent.toLowerCase()];
        const bPri = priorities[b.querySelector('.task-priority')?.textContent.toLowerCase()];
        return aPri - bPri;
      } else if (type === 'status') {
        const aChecked = a.querySelector('.task-check').checked;
        const bChecked = b.querySelector('.task-check').checked;
        return aChecked - bChecked;
      }
    });

    list.innerHTML = '';
    tasks.forEach(t => list.appendChild(t));
  });
}



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
  const editBtn = taskClone.querySelector('.edit-task');

  taskTitleEl.textContent = title;
  taskDescEl.textContent = desc || '';
  taskPriorityEl.textContent = capitalize(priority);
  taskPriorityEl.className = `task-priority ${priority}`;
  taskDateEl.textContent = dueDate ? `Due: ${dueDate}` : '';

  // Checkbox complete toggle
  checkbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      taskItem.style.opacity = '0.6';
      taskTitleEl.style.textDecoration = 'line-through';
    } else {
      taskItem.style.opacity = '1';
      taskTitleEl.style.textDecoration = 'none';
    }
    saveTasksToLocalStorage();
  });

  // Delete button
  deleteBtn.addEventListener('click', () => {
    taskItem.remove();
    saveTasksToLocalStorage();
  });

  // Edit button
  editBtn.addEventListener('click', () => {
    taskTitleInput.value = title;
    taskDescInput.value = desc;
    taskCategorySelect.value = category;
    taskDueDateInput.value = dueDate;
    taskPrioritySelect.value = priority;

    taskItem.remove();
    saveTasksToLocalStorage();
    taskModal.classList.remove('hidden');
  });

  taskList.appendChild(taskClone);
  saveTasksToLocalStorage();
}


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

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
// Close modal on outside click
window.addEventListener('click', (e) => {
  if (e.target === taskModal) {
    taskModal.classList.add('hidden');
    clearModalInputs();
  }
});
