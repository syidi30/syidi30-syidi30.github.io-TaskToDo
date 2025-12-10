


const HARDCODE = { username: 'Rusyaidi', password: 'abc123' };

function showAlert(message, type='danger') {
  const ph = document.getElementById('alert-placeholder');
  if(!ph) return;
  ph.innerHTML = `<div class="alert alert-${type} alert-dismissible">${message}<button class="btn-close" data-bs-dismiss="alert"></button></div>`;
}

function handleLogin(e){
  e.preventDefault();
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value;
  if(u === HARDCODE.username && p === HARDCODE.password){
    sessionStorage.setItem('authenticated', '1');
    sessionStorage.setItem('username', u);
    window.location.href = 'dashboard.html';
  } else {
    showAlert('Invalid username or password.', 'danger');
  }
  return false;
}

function logout(){
  sessionStorage.removeItem('authenticated');
  sessionStorage.removeItem('username');
  window.location.href = 'index.html';
}


const SAMPLE_TASKS = [
  { id: 1, title: 'IMS560 Individual Assignment', due: '2025-12-04', status: 'completed' },
  { id: 2, title: 'IMS564 Individual Assignment', due: '2025-12-04', status: 'Completed' },
  { id: 3, title: 'IMS565 Individual Assignment', due: '2025-11-22', status: 'Completed' },
  { id: 4, title: 'IMS566 Individual Assignment', due: '2025-12-04', status: 'Completed' }
];

function getTasks(){
  const raw = localStorage.getItem('stm_tasks');
  if(!raw){
    localStorage.setItem('stm_tasks', JSON.stringify(SAMPLE_TASKS));
    return SAMPLE_TASKS.slice();
  }
  try { return JSON.parse(raw); } catch(e){ return []; }
}

function saveTasks(tasks){
  localStorage.setItem('stm_tasks', JSON.stringify(tasks));
}

function renderDashboard(){
  const tasks = getTasks();
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const pending = total - completed;
  document.getElementById('totalTasks').textContent = total;
  document.getElementById('completedTasks').textContent = completed;
  document.getElementById('pendingTasks').textContent = pending;

  const ctx = document.getElementById('taskChart').getContext('2d');
  if(window._taskChart) window._taskChart.destroy();
  window._taskChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Completed','Pending'],
      datasets: [{ data: [completed, pending ], backgroundColor:  ['#0000ff', '#ff0000'] }]
    },
    options: { responsive: true }
  });
}

function initTasksPage(){
  const addBtn = document.getElementById('addTaskBtn');
  const formArea = document.getElementById('taskFormArea');
  const form = document.getElementById('taskForm');
  const tableBody = document.querySelector('#tasksTable tbody');

  function refreshTable(){
    const tasks = getTasks();
    tableBody.innerHTML = '';
    tasks.forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${t.title}</td>
                      <td>${t.due}</td>
                      <td>${t.status}</td>
                      <td>
                        ${t.status !== 'Completed' ? '<button class="btn btn-sm btn-success mark-complete">Complete</button>' : ''}
                        <button class="btn btn-sm btn-danger ms-1 delete-task">Delete</button>
                      </td>`;
      tr.querySelectorAll('.mark-complete').forEach(btn => {
        btn.addEventListener('click', () => {
          t.status = 'Completed'; saveTasks(tasks); refreshTable();
        });
      });
      tr.querySelectorAll('.delete-task').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = tasks.findIndex(x=>x.id===t.id);
          if(idx>-1){ tasks.splice(idx,1); saveTasks(tasks); refreshTable(); }
        });
      });
      tableBody.appendChild(tr);
    });
    
    if(document.getElementById('taskChart')) renderDashboard();
  }

  document.getElementById("taskForm").addEventListener("submit", function(e){
    e.preventDefault();

    // existing save code ...
    
    showToast(); // 👉 panggil notification
});


  addBtn.addEventListener('click', ()=> formArea.classList.toggle('d-none'));
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const tasks = getTasks();
    const newTask = {
      id: Date.now(),
      title: document.getElementById('taskTitle').value,
      due: document.getElementById('taskDue').value,
      status: 'Pending'
    };
    tasks.push(newTask); saveTasks(tasks); form.reset(); formArea.classList.add('d-none'); refreshTable();
  });

  refreshTable();
}

function renderCompleted(){
  const container = document.getElementById('completedList');
  const tasks = getTasks().filter(t => t.status === 'Completed');
  container.innerHTML = '';
  tasks.forEach(t => {
    const col = document.createElement('div');
    col.className = 'col-md-6';
    col.innerHTML = `<div class="card p-3"><h5>${t.title}</h5><p class="mb-1"><strong>Due:</strong> ${t.due}</p></div>`;
    container.appendChild(col);
  });
}
