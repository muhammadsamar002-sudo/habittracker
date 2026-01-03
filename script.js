/**
 * HABIT OS PRO - ENGINE V9 (Responsive + Fixed PDF)
 */

const CONFIG = {
    colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    daysShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
};

let app = {
    currentMonth: 0,
    year: 2026,
    user: { name: "Samar", xp: 0, level: 1, theme: '#6366f1' },
    data: {} 
};

function init() {
    loadData();
    applyTheme();
    if (!localStorage.getItem('habitOS_Pro_Data')) {
        app.currentMonth = new Date().getMonth();
    }
    renderAll();
}

function loadData() {
    const saved = localStorage.getItem('habitOS_Pro_Data');
    if (saved) {
        app = JSON.parse(saved);
        if (!app.user.name) app.user.name = "Samar";
        for(let i=0; i<12; i++) {
            if(!app.data[i]) app.data[i] = { habits: [], sleep: {}, todos: [], note: "" };
            if(!app.data[i].todos) app.data[i].todos = [];
        }
    } else {
        for (let i = 0; i < 12; i++) {
            app.data[i] = {
                habits: [
                    { id: 1, name: "Deep Work", checks: [] },
                    { id: 2, name: "Exercise", checks: [] },
                    { id: 3, name: "Reading", checks: [] },
                    { id: 4, name: "No Sugar", checks: [] }
                ],
                sleep: {}, todos: [], note: ""
            };
        }
    }
}

function saveData() { localStorage.setItem('habitOS_Pro_Data', JSON.stringify(app)); updateStats(); }

function hardReset() {
    if(confirm("DANGER: This will delete ALL data. Are you sure?")) {
        localStorage.removeItem('habitOS_Pro_Data');
        location.reload();
    }
}

function renderAll() { updateUserUI(); renderDashboard(); renderTodos(); updateStats(); }

function updateUserUI() {
    document.getElementById('displayUsername').innerText = app.user.name;
    document.getElementById('inputUsername').value = app.user.name;
    document.getElementById('userLevel').innerText = app.user.level;
    document.getElementById('xpText').innerText = app.user.xp + " XP";
    const maxXP = app.user.level * 100;
    const pct = Math.min(100, (app.user.xp / maxXP) * 100);
    document.getElementById('xpFill').style.width = pct + "%";
}

function renderDashboard() {
    const monthData = app.data[app.currentMonth];
    const daysInMonth = new Date(app.year, app.currentMonth + 1, 0).getDate();

    document.getElementById('monthDisplay').innerText = `${CONFIG.months[app.currentMonth].toUpperCase()} ${app.year}`;
    document.getElementById('quickNote').value = monthData.note || "";

    const headerRow = document.getElementById('daysHeader');
    headerRow.innerHTML = `<div class="col-name">PROTOCOLS <button class="icon-btn" style="margin-left:auto; font-size:0.8rem" onclick="openModal()">+</button></div>`;
    
    for(let d=1; d<=daysInMonth; d++) {
        const dayName = CONFIG.daysShort[new Date(app.year, app.currentMonth, d).getDay()];
        headerRow.innerHTML += `<div class="col-day"><span>${dayName}</span><span>${d}</span></div>`;
    }

    const container = document.getElementById('habitsContainer');
    container.innerHTML = '';
    
    monthData.habits.forEach((h, hIdx) => {
        const row = document.createElement('div');
        row.className = 'habit-row';
        const color = CONFIG.colors[hIdx % CONFIG.colors.length];
        const nameDiv = document.createElement('div');
        nameDiv.innerHTML = `<input class="habit-input" value="${h.name}" onchange="updateHabitName(${hIdx}, this.value)">`;
        row.appendChild(nameDiv);

        for(let d=1; d<=daysInMonth; d++) {
            const cell = document.createElement('div');
            cell.className = `check-cell ${h.checks.includes(d) ? 'done' : ''}`;
            cell.style.setProperty('--habit-c', color);
            cell.innerHTML = `<div class="check-indicator"></div>`;
            cell.onclick = () => toggleCheck(hIdx, d);
            row.appendChild(cell);
        }
        container.appendChild(row);
    });

    const sleepCon = document.getElementById('sleepContainer');
    sleepCon.innerHTML = '';
    [9,8,7,6,5].forEach(hour => {
        const row = document.createElement('div');
        row.className = 'sleep-row';
        row.innerHTML = `<div class="sleep-label">${hour} hrs</div>`;
        for(let d=1; d<=daysInMonth; d++) {
            const cell = document.createElement('div');
            cell.className = `sleep-cell ${monthData.sleep[d] === hour ? 'active' : ''}`;
            cell.onclick = () => toggleSleep(d, hour);
            row.appendChild(cell);
        }
        sleepCon.appendChild(row);
    });
}

function renderTodos() {
    const list = document.getElementById('todoList');
    const todos = app.data[app.currentMonth].todos || [];
    list.innerHTML = '';

    todos.forEach((todo, idx) => {
        const item = document.createElement('div');
        item.className = `todo-item ${todo.done ? 'done' : ''}`;
        let badgeClass = todo.intensity; let badgeText = todo.intensity.toUpperCase();

        item.innerHTML = `
            <div class="t-check" onclick="toggleTodo(${idx})"></div>
            <div class="t-text" contenteditable="true" onblur="editTodoText(${idx}, this.innerText)">${todo.text}</div>
            <div class="t-badge ${badgeClass}" onclick="cycleIntensity(${idx})">${badgeText}</div>
            <button class="t-del" onclick="deleteTodo(${idx})">×</button>
        `;
        list.appendChild(item);
    });
}

function handleTodoKey(e) { if(e.key === 'Enter') addTodo(); }
function addTodo() {
    const input = document.getElementById('todoInput');
    const intensity = document.getElementById('todoIntensity').value;
    const text = input.value.trim();
    if(text) {
        if(!app.data[app.currentMonth].todos) app.data[app.currentMonth].todos = [];
        app.data[app.currentMonth].todos.push({ text: text, intensity: intensity, done: false });
        input.value = ''; saveData(); renderTodos();
    }
}
function toggleTodo(idx) {
    const t = app.data[app.currentMonth].todos[idx]; t.done = !t.done; saveData(); renderTodos();
}
function editTodoText(idx, val) {
    app.data[app.currentMonth].todos[idx].text = val; saveData();
}
function deleteTodo(idx) {
    app.data[app.currentMonth].todos.splice(idx, 1); saveData(); renderTodos();
}
function cycleIntensity(idx) {
    const t = app.data[app.currentMonth].todos[idx];
    const order = ['low', 'med', 'high'];
    let next = order.indexOf(t.intensity) + 1;
    if(next >= order.length) next = 0;
    t.intensity = order[next]; saveData(); renderTodos();
}

function updateStats() {
    const data = app.data[app.currentMonth];
    const daysInMonth = new Date(app.year, app.currentMonth + 1, 0).getDate();
    let totalChecks = 0; let maxChecks = data.habits.length * daysInMonth;
    data.habits.forEach((h) => { totalChecks += h.checks.length; });
    const rate = maxChecks > 0 ? Math.round((totalChecks / maxChecks) * 100) : 0;
    
    document.getElementById('headerRate').innerText = rate + "%";
    document.getElementById('statsScore').innerText = rate + "%";
    document.getElementById('statsReps').innerText = totalChecks;
    
    let longestStreak = 0; let currentStreak = 0;
    if(data.habits.length > 0) {
        for(let d=1; d<=daysInMonth; d++) {
            let anyDone = data.habits.some(h => h.checks.includes(d));
            if(anyDone) currentStreak++; else currentStreak = 0;
            if(currentStreak > longestStreak) longestStreak = currentStreak;
        }
    }
    document.getElementById('statsStreak').innerText = longestStreak + " Days";

    const list = document.getElementById('habitStatsList');
    list.innerHTML = '';
    data.habits.forEach((h, idx) => {
        const pct = Math.round((h.checks.length / daysInMonth) * 100);
        const color = CONFIG.colors[idx % CONFIG.colors.length];
        list.innerHTML += `
            <div class="stat-bar-row">
                <div class="stat-name">${h.name}</div>
                <div class="stat-track">
                    <div class="stat-fill" style="width:${pct}%; background:${color}"></div>
                </div>
                <div style="width:40px; text-align:right">${pct}%</div>
            </div>
        `;
    });
}

function switchView(viewName, btn) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.content-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`view-${viewName}`).classList.add('active');
    const titles = { 'dashboard': 'DASHBOARD', 'todos': 'TASK COMMAND', 'analytics': 'ANALYTICS', 'system': 'SYSTEM' };
    document.getElementById('viewTitle').innerText = titles[viewName];
    // Close sidebar on mobile after clicking
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('collapsed');
    }
}

function toggleSidebar() { 
    // In mobile CSS, 'collapsed' actually means OPEN (translateX(0))
    document.getElementById('sidebar').classList.toggle('collapsed'); 
}

function changeMonth(dir) {
    app.currentMonth += dir;
    if(app.currentMonth < 0) app.currentMonth = 0;
    if(app.currentMonth > 11) app.currentMonth = 11;
    renderAll();
}
function toggleCheck(hIdx, day) {
    const checks = app.data[app.currentMonth].habits[hIdx].checks;
    const i = checks.indexOf(day);
    if(i === -1) { checks.push(day); app.user.xp += 10; if(app.user.xp >= app.user.level * 100) app.user.level++; } 
    else { checks.splice(i, 1); app.user.xp -= 10; }
    saveData(); renderAll();
}
function toggleSleep(day, hr) {
    const sleep = app.data[app.currentMonth].sleep;
    if(sleep[day] === hr) delete sleep[day]; else sleep[day] = hr;
    saveData(); renderDashboard();
}
function updateHabitName(idx, val) { app.data[app.currentMonth].habits[idx].name = val; saveData(); }
function saveQuickNote(val) { app.data[app.currentMonth].note = val; saveData(); }
function updateUsername() {
    const val = document.getElementById('inputUsername').value;
    if(val) { app.user.name = val; saveData(); updateUserUI(); alert("Profile Updated"); }
}
function setAccent(color) {
    app.user.theme = color; document.documentElement.style.setProperty('--accent', color); document.documentElement.style.setProperty('--accent-glow', color + '40'); saveData();
}
function applyTheme() {
    if(app.user.theme) { document.documentElement.style.setProperty('--accent', app.user.theme); document.documentElement.style.setProperty('--accent-glow', app.user.theme + '40'); }
}
function openModal() { document.getElementById('addModal').style.display = 'flex'; document.getElementById('newHabitName').focus(); }
function closeModal() { document.getElementById('addModal').style.display = 'none'; }
function confirmAddHabit() {
    const name = document.getElementById('newHabitName').value;
    if(name) { app.data[app.currentMonth].habits.push({ id: Date.now(), name: name, checks: [] }); saveData(); renderAll(); closeModal(); document.getElementById('newHabitName').value = ""; }
}

function exportData() {
    let csv = "Date,Habit,Status\n";
    const m = app.data[app.currentMonth];
    const daysInMonth = new Date(app.year, app.currentMonth + 1, 0).getDate();
    
    m.habits.forEach(h => {
        for(let d=1; d<=daysInMonth; d++) {
            const status = h.checks.includes(d) ? 'Completed' : 'Missed';
            csv += `${CONFIG.months[app.currentMonth]} ${d},${h.name},${status}\n`;
        }
    });

    if(m.todos && m.todos.length > 0) {
        csv += "\nTask Name,Priority,Status\n";
        m.todos.forEach(t => {
            csv += `${t.text},${t.intensity},${t.done ? 'Done' : 'Pending'}\n`;
        });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HabitOS_FullReport_${CONFIG.months[app.currentMonth]}.csv`;
    a.click();
}

function exportPDF() {
    const gridOriginal = document.getElementById('gridWrapper');
    const todoOriginal = document.getElementById('todoWrapper');
    const analyticsOriginal = document.querySelector('#view-analytics .analytics-grid'); 
    const hiddenContainer = document.getElementById('pdf-generator-container');
    
    hiddenContainer.innerHTML = '';
    
    const title = document.createElement('div');
    title.className = 'pdf-title';
    title.innerText = `HABIT OS REPORT - ${CONFIG.months[app.currentMonth].toUpperCase()} ${app.year}`;
    hiddenContainer.appendChild(title);

    const gridClone = gridOriginal.cloneNode(true);
    hiddenContainer.appendChild(gridClone);
    
    const analyticsTitle = document.createElement('h3');
    analyticsTitle.innerText = "MONTHLY PERFORMANCE";
    analyticsTitle.className = 'pdf-section-title';
    hiddenContainer.appendChild(analyticsTitle);

    const analyticsClone = analyticsOriginal.cloneNode(true);
    hiddenContainer.appendChild(analyticsClone);

    const taskTitle = document.createElement('h3');
    taskTitle.innerText = "TASK COMMAND";
    taskTitle.className = 'pdf-section-title';
    hiddenContainer.appendChild(taskTitle);

    const todoClone = todoOriginal.cloneNode(true);
    hiddenContainer.appendChild(todoClone);

    const watermark = document.createElement('div');
    watermark.className = 'pdf-watermark';
    watermark.innerHTML = `<div class="watermark-line"></div><div class="watermark-text">HABIT OS | SYSTEM BY SAMAR</div>`;
    hiddenContainer.appendChild(watermark);

    hiddenContainer.style.display = 'block';
    hiddenContainer.classList.add('pdf-mode');

    const opt = {
      margin:       [10, 10, 10, 10],
      filename:     `HabitOS_${CONFIG.months[app.currentMonth]}_${app.year}.pdf`,
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { 
          scale: 2, 
          useCORS: true, 
          backgroundColor: '#050505', 
          windowWidth: 2500 // Ensures full width capture
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(hiddenContainer).save().then(() => {
        hiddenContainer.style.display = 'none';
        hiddenContainer.innerHTML = '';
        hiddenContainer.classList.remove('pdf-mode');
    });
}

init();
