const db = firebase.database();
const tasksRef = db.ref('tasks');

const modal = document.getElementById('taskModal');
const addTaskBtn = document.getElementById('addTaskBtn');
const closeBtn = document.querySelector('.close');
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const statusFilter = document.getElementById('statusFilter');
const priorityFilter = document.getElementById('priorityFilter');
const developerFilter = document.getElementById('developerFilter');
const searchTask = document.getElementById('searchTask');
const taskStatus = document.getElementById('taskStatus');
const taskComments = document.getElementById('taskComments');

let tasks = [];

addTaskBtn.addEventListener('click', () => {
    modal.style.display = 'block';
    taskForm.reset();
    taskStatus.value = 'Awaiting Development';
    taskStatus.disabled = true;
    taskComments.disabled = false;
    if (!taskForm.dataset.editId) {
        document.getElementById('assignedTo').value = 'Anyone';
        document.getElementById('taskPriority').value = 'Medium';
    }
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    taskForm.dataset.editId = '';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        taskForm.dataset.editId = '';
    }
});

function initializeDeveloperFilter() {
    const developers = ['Anyone', ...new Set(tasks.map(task => task.assignedTo))];
    developerFilter.innerHTML = '<option value="all">All Developers</option>';
    developers.forEach(developer => {
        if (developer) {
            developerFilter.innerHTML += `<option value="${developer}">${developer}</option>`;
        }
    });
}

statusFilter.addEventListener('change', renderTasks);
priorityFilter.addEventListener('change', renderTasks);
developerFilter.addEventListener('change', renderTasks);
searchTask.addEventListener('input', renderTasks);

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newTask = {
        id: taskForm.dataset.editId || Date.now().toString(),
        title: document.getElementById('taskTitle').value.trim(),
        priority: document.getElementById('taskPriority').value || 'Medium',
        assignedTo: document.getElementById('assignedTo').value,
        status: taskForm.dataset.editId ? document.getElementById('taskStatus').value : 'Awaiting Development',
        comments: document.getElementById('taskComments').value.trim() || '',
        dateAdded: taskForm.dataset.editId ? tasks.find(t => t.id === taskForm.dataset.editId)?.dateAdded : new Date().toLocaleDateString('en-GB'),
        lastUpdated: new Date().toISOString()
    };

    tasksRef.child(newTask.id).set(newTask)
        .then(() => {
            taskForm.reset();
            modal.style.display = 'none';
            taskForm.dataset.editId = '';
        })
        .catch((error) => {
            console.error("Error saving task: ", error);
            alert('Error saving task. Please try again.');
        });
});

function getStatusClass(status) {
    const statusMap = {
        'Complete': 'complete',
        'Current (Project)': 'current',
        'Awaiting Development': 'awaiting',
        'On Hold': 'onhold'
    };
    return statusMap[status] || '';
}

function getPriorityClass(priority) {
    if (!priority) return 'priority-medium';
    return `priority-${priority.toLowerCase()}`;
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    document.getElementById('taskTitle').value = task.title || '';
    document.getElementById('taskPriority').value = task.priority || 'Medium';
    document.getElementById('assignedTo').value = task.assignedTo || 'Anyone';
    document.getElementById('taskStatus').value = task.status || 'Awaiting Development';
    document.getElementById('taskComments').value = task.comments || '';
    
    taskStatus.disabled = false;
    taskComments.disabled = false;
    
    taskForm.dataset.editId = id;
    modal.style.display = 'block';
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasksRef.child(id).remove()
            .catch((error) => {
                console.error("Error deleting task: ", error);
                alert('Error deleting task. Please try again.');
            });
    }
}

function renderTasks() {
    const statusValue = statusFilter.value;
    const priorityValue = priorityFilter.value;
    const developerValue = developerFilter.value;
    const searchValue = searchTask.value.toLowerCase();

    const filteredTasks = tasks.filter(task => {
        const matchStatus = statusValue === 'all' || task.status.toLowerCase().includes(statusValue);
        const matchPriority = priorityValue === 'all' || (task.priority && task.priority.toLowerCase() === priorityValue);
        const matchDeveloper = developerValue === 'all' || task.assignedTo === developerValue;
        const matchSearch = (task.title && task.title.toLowerCase().includes(searchValue)) ||
                          (task.comments && task.comments.toLowerCase().includes(searchValue));

        return matchStatus && matchPriority && matchDeveloper && matchSearch;
    });

    filteredTasks.sort((a, b) => {
        const dateA = new Date(a.dateAdded.split('/').reverse().join('-'));
        const dateB = new Date(b.dateAdded.split('/').reverse().join('-'));
        return dateB - dateA;
    });

    taskList.innerHTML = filteredTasks.map(task => `
        <tr>
            <td>${task.dateAdded}</td>
            <td>${task.title || ''}</td>
            <td><span class="priority ${getPriorityClass(task.priority)}">${task.priority || 'Medium'}</span></td>
            <td>${task.assignedTo || 'Anyone'}</td>
            <td><span class="status-${getStatusClass(task.status)}">${task.status || 'Awaiting Development'}</span></td>
            <td>${task.comments || ''}</td>
            <td class="action-buttons">
                <button onclick="editTask('${task.id}')" class="btn-edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteTask('${task.id}')" class="btn-delete"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

tasksRef.on('value', (snapshot) => {
    tasks = [];
    snapshot.forEach((childSnapshot) => {
        tasks.push(childSnapshot.val());
    });
    initializeDeveloperFilter();
    renderTasks();
});
