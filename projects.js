const db = firebase.database();
const projectsRef = db.ref('projects');
let projects = [];


const currentUser = sessionStorage.getItem('currentUser');
const userAvatars = {
    'Ross': 'https://ui-avatars.com/api/?name=Ross&background=4f46e5&color=fff',
    'Jack': 'https://ui-avatars.com/api/?name=Jack&background=818cf8&color=fff',
    'Jasper': 'https://ui-avatars.com/api/?name=Jasper&background=3730a3&color=fff',
    'Charlie': 'https://ui-avatars.com/api/?name=Charlie&background=6366f1&color=fff',
    'Connor': 'https://ui-avatars.com/api/?name=Connor&background=4338ca&color=fff'
};

const userRoles = {
    'Ross': 'Car Developer',
    'Jack': 'Development Manager',
    'Jasper': 'Script Developer',
    'Charlie': 'Script Developer',
    'Connor': 'Script Developer'
};

document.getElementById('userAvatar').src = userAvatars[currentUser] || 'https://ui-avatars.com/api/?name=User';
document.getElementById('sidebarUserName').textContent = currentUser;
document.getElementById('userDisplay').textContent = currentUser;
document.querySelector('.text-muted').textContent = userRoles[currentUser] || 'Developer';

function signOut() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

function renderProjects() {
    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = projects.map(project => `
        <div class="project-card ${project.status === 'Complete' ? 'project-complete' : ''}">
            <div class="project-header">
                <h3>${project.name}</h3>
                <div class="project-actions">
                    <select class="project-status" onchange="updateProjectStatus('${project.id}', this.value)">
                        <option value="Starting Development" ${project.status === 'Starting Development' ? 'selected' : ''}>Starting Development</option>
                        <option value="Bug Testing" ${project.status === 'Bug Testing' ? 'selected' : ''}>Bug Testing</option>
                        <option value="Finishing Touches" ${project.status === 'Finishing Touches' ? 'selected' : ''}>Finishing Touches</option>
                        <option value="Complete" ${project.status === 'Complete' ? 'selected' : ''}>Complete</option>
                    </select>
                    <button onclick="deleteProject('${project.id}')" class="btn-delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <p>${project.description}</p>
            <div class="project-status-badge status-${project.status?.toLowerCase().replace(/\s+/g, '-')}">
                <i class="fas ${getStatusIcon(project.status)}"></i>
                ${project.status}
            </div>
            <div class="project-team">
                <h4>Project Team:</h4>
                <div class="team-members">
                    ${project.developers.map(dev => `
                        <div class="team-member">
                            <img src="${userAvatars[dev]}" alt="${dev}">
                            <span>${dev} (${userRoles[dev]})</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="project-date">Created: ${project.dateCreated}</div>
        </div>
    `).join('');
}

function updateProjectStatus(projectId, newStatus) {
    projectsRef.child(projectId).update({
        status: newStatus,
        lastUpdated: new Date().toISOString()
    });
}

function deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
        projectsRef.child(projectId).remove()
            .catch((error) => {
                console.error("Error deleting project: ", error);
                alert('Error deleting project. Please try again.');
            });
    }
}

function getStatusIcon(status) {
    const iconMap = {
        'Starting Development': 'fa-code',
        'Bug Testing': 'fa-bug',
        'Finishing Touches': 'fa-paint-brush',
        'Complete': 'fa-check-circle'
    };
    return iconMap[status] || 'fa-info-circle';
}

projectsRef.on('value', (snapshot) => {
    projects = [];
    snapshot.forEach((childSnapshot) => {
        const project = childSnapshot.val();
        project.id = childSnapshot.key;
        projects.push(project);
    });
    renderProjects();
});


const projectModal = document.getElementById('projectModal');
const addProjectBtn = document.getElementById('addProjectBtn');
const projectClose = document.querySelector('.project-close');
const projectForm = document.getElementById('projectForm');

addProjectBtn.addEventListener('click', () => {
    projectModal.style.display = 'block';
    projectForm.reset();
});

projectClose.addEventListener('click', () => {
    projectModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === projectModal) {
        projectModal.style.display = 'none';
    }
});

projectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const selectedDevs = Array.from(document.querySelectorAll('#projectDevs input:checked'))
        .map(checkbox => checkbox.value);

    const newProject = {
        id: Date.now().toString(),
        name: document.getElementById('projectName').value.trim(),
        description: document.getElementById('projectDescription').value.trim(),
        developers: selectedDevs,
        dateCreated: new Date().toLocaleDateString('en-GB'),
        status: 'Starting Development',
        lastUpdated: new Date().toISOString()
    };

    projectsRef.child(newProject.id).set(newProject)
        .then(() => {
            projectForm.reset();
            projectModal.style.display = 'none';
        })
        .catch((error) => {
            console.error("Error saving project: ", error);
            alert('Error saving project. Please try again.');
        });
});