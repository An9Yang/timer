// 子计时器类
class SubTimer {
    constructor(id, name, parentTimer) {
        this.id = id;
        this.name = name;
        this.parentTimer = parentTimer;
        this.startTime = null;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.interval = null;
        this.startParentTime = 0; // 记录开始时父计时器的时间
        this.element = null; // DOM元素引用
    }

    start() {
        if (!this.isRunning && this.parentTimer.isRunning) {
            this.startTime = Date.now() - this.elapsedTime;
            this.startParentTime = this.parentTimer.elapsedTime;
            this.isRunning = true;
            this.interval = setInterval(() => this.update(), 10);
        }
    }

    stop() {
        if (this.isRunning) {
            clearInterval(this.interval);
            this.isRunning = false;
            this.update();
        }
    }

    update() {
        if (this.isRunning) {
            this.elapsedTime = Date.now() - this.startTime;
            // 只更新时间显示，不重新渲染整个列表
            if (this.element) {
                const timeDisplay = this.element.querySelector('.sub-timer-time');
                if (timeDisplay) {
                    timeDisplay.textContent = this.formatTime(this.elapsedTime);
                }
            }
        }
    }

    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const ms = Math.floor((milliseconds % 1000) / 10);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
}

// 主计时器类
class Timer {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.startTime = null;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.interval = null;
        this.subTimers = [];
        this.element = null;
    }

    start() {
        if (!this.isRunning) {
            this.startTime = Date.now() - this.elapsedTime;
            this.isRunning = true;
            this.isPaused = false;
            this.interval = setInterval(() => this.update(), 10);
        }
    }

    pause() {
        if (this.isRunning && !this.isPaused) {
            clearInterval(this.interval);
            this.isPaused = true;
            this.isRunning = false;
            // 暂停所有子计时器
            this.subTimers.forEach(subTimer => {
                if (subTimer.isRunning) {
                    subTimer.stop();
                }
            });
        }
    }

    reset() {
        clearInterval(this.interval);
        this.isRunning = false;
        this.isPaused = false;
        this.elapsedTime = 0;
        // 停止并清除所有子计时器
        this.subTimers.forEach(subTimer => {
            if (subTimer.isRunning) {
                clearInterval(subTimer.interval);
            }
        });
        this.subTimers = [];
        this.updateDisplay();
        this.updateSubTimersDisplay();
    }

    update() {
        this.elapsedTime = Date.now() - this.startTime;
        this.updateDisplay();
    }

    updateDisplay() {
        if (this.element) {
            const display = this.element.querySelector('.timer-display');
            display.textContent = this.formatTime(this.elapsedTime);
        }
    }

    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const ms = Math.floor((milliseconds % 1000) / 10);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }

    addSubTimer() {
        const subTimerNumber = this.subTimers.length + 1;
        const subTimer = new SubTimer(Date.now() + Math.random(), `步骤 ${subTimerNumber}`, this);
        this.subTimers.push(subTimer);
        // 先开始子计时器，再更新显示，这样按钮状态才正确
        subTimer.start();
        this.updateSubTimersDisplay();
        return subTimer;
    }

    removeSubTimer(id) {
        const index = this.subTimers.findIndex(st => st.id === id);
        if (index !== -1) {
            const subTimer = this.subTimers[index];
            if (subTimer.isRunning) {
                clearInterval(subTimer.interval);
            }
            this.subTimers.splice(index, 1);
            this.updateSubTimersDisplay();
        }
    }

    updateSubTimersDisplay() {
        if (this.element) {
            const subTimersList = this.element.querySelector('.sub-timer-list');
            
            // 只添加新的子计时器，不重新渲染所有
            this.subTimers.forEach(subTimer => {
                if (!subTimer.element) {
                    const subTimerElement = document.createElement('div');
                    subTimerElement.className = 'sub-timer';
                    subTimerElement.dataset.id = subTimer.id;
                    
                    // 创建DOM结构
                    const infoDiv = document.createElement('div');
                    infoDiv.className = 'sub-timer-info';
                    infoDiv.innerHTML = `
                        <span class="sub-timer-name">${subTimer.name}</span>
                        <span class="sub-timer-parent-time">@${this.formatTime(subTimer.startParentTime)}</span>
                    `;
                    
                    const controlsDiv = document.createElement('div');
                    controlsDiv.className = 'sub-timer-controls';
                    
                    const timeSpan = document.createElement('span');
                    timeSpan.className = 'sub-timer-time';
                    timeSpan.textContent = subTimer.formatTime(subTimer.elapsedTime);
                    
                    const toggleBtn = document.createElement('button');
                    toggleBtn.className = subTimer.isRunning ? 'btn-tiny btn-danger' : 'btn-tiny btn-success';
                    toggleBtn.textContent = subTimer.isRunning ? '停止' : '开始';
                    
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'btn-tiny btn-secondary sub-timer-delete';
                    deleteBtn.textContent = '×';
                    
                    controlsDiv.appendChild(timeSpan);
                    controlsDiv.appendChild(toggleBtn);
                    controlsDiv.appendChild(deleteBtn);
                    
                    subTimerElement.appendChild(infoDiv);
                    subTimerElement.appendChild(controlsDiv);
                    
                    // 保存元素引用
                    subTimer.element = subTimerElement;
                    
                    // 绑定事件
                    toggleBtn.addEventListener('click', () => {
                        if (subTimer.isRunning) {
                            subTimer.stop();
                            toggleBtn.textContent = '开始';
                            toggleBtn.className = 'btn-tiny btn-success';
                        } else {
                            subTimer.start();
                            toggleBtn.textContent = '停止';
                            toggleBtn.className = 'btn-tiny btn-danger';
                        }
                    });
                    
                    deleteBtn.addEventListener('click', () => {
                        if (confirm(`确定要删除子计时器"${subTimer.name}"吗？`)) {
                            this.removeSubTimer(subTimer.id);
                        }
                    });
                    
                    subTimersList.appendChild(subTimerElement);
                }
            });
            
            // 清理已删除的子计时器元素
            const existingElements = subTimersList.querySelectorAll('.sub-timer');
            existingElements.forEach(element => {
                const id = parseFloat(element.dataset.id);
                if (!this.subTimers.find(st => st.id === id)) {
                    element.remove();
                }
            });
        }
    }
}

// 应用主类
class TimerApp {
    constructor() {
        this.tabs = [];
        this.activeTimers = [];
        this.initializeElements();
        this.loadData();
        this.attachEventListeners();
    }

    initializeElements() {
        this.tabPool = document.getElementById('tab-pool');
        this.activeTimersContainer = document.getElementById('active-timers');
        this.addTabBtn = document.getElementById('add-tab-btn');
        this.tabModal = document.getElementById('tab-modal');
        this.tabNameInput = document.getElementById('tab-name-input');
        this.saveTabBtn = document.getElementById('save-tab-btn');
        this.cancelTabBtn = document.getElementById('cancel-tab-btn');
        this.modalClose = document.querySelector('.close');
    }

    attachEventListeners() {
        this.addTabBtn.addEventListener('click', () => this.showTabModal());
        this.saveTabBtn.addEventListener('click', () => this.saveTab());
        this.cancelTabBtn.addEventListener('click', () => this.hideTabModal());
        this.modalClose.addEventListener('click', () => this.hideTabModal());
        
        window.addEventListener('click', (e) => {
            if (e.target === this.tabModal) {
                this.hideTabModal();
            }
        });

        this.tabNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveTab();
            }
        });
    }

    showTabModal() {
        this.tabModal.style.display = 'block';
        this.tabNameInput.value = '';
        this.tabNameInput.focus();
    }

    hideTabModal() {
        this.tabModal.style.display = 'none';
    }

    saveTab() {
        const name = this.tabNameInput.value.trim();
        if (name) {
            this.addTab(name);
            this.hideTabModal();
        }
    }

    addTab(name) {
        const tab = {
            id: Date.now(),
            name: name
        };
        this.tabs.push(tab);
        this.renderTabs();
        this.saveData();
    }

    deleteTab(id) {
        this.tabs = this.tabs.filter(tab => tab.id !== id);
        // 同时删除相关的活动计时器
        this.activeTimers = this.activeTimers.filter(timer => {
            if (timer.id === id) {
                clearInterval(timer.interval);
                return false;
            }
            return true;
        });
        this.renderTabs();
        this.renderActiveTimers();
        this.saveData();
    }

    renderTabs() {
        this.tabPool.innerHTML = '';
        this.tabs.forEach(tab => {
            const tabElement = document.createElement('div');
            tabElement.className = 'tab';
            tabElement.innerHTML = `
                <span class="tab-name">${tab.name}</span>
                <button class="tab-delete" onclick="event.stopPropagation()">×</button>
            `;
            
            tabElement.addEventListener('click', () => this.activateTab(tab));
            tabElement.querySelector('.tab-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`确定要删除标签"${tab.name}"吗？`)) {
                    this.deleteTab(tab.id);
                }
            });
            
            this.tabPool.appendChild(tabElement);
        });
    }

    activateTab(tab) {
        // 检查是否已经有此标签的活动计时器
        const existingTimer = this.activeTimers.find(timer => timer.id === tab.id);
        if (!existingTimer) {
            const timer = new Timer(tab.id, tab.name);
            // 先开始计时，这样创建元素时按钮状态就是正确的
            timer.start();
            this.activeTimers.push(timer);
            this.renderActiveTimers();
        }
    }

    renderActiveTimers() {
        // 使用增量更新而不是清空重建
        // 1. 标记现有元素
        const existingElements = new Map();
        this.activeTimersContainer.querySelectorAll('.timer-unit').forEach(element => {
            const timerId = parseFloat(element.dataset.timerId);
            existingElements.set(timerId, element);
        });
        
        // 2. 更新或添加计时器
        this.activeTimers.forEach(timer => {
            if (existingElements.has(timer.id)) {
                // 计时器已存在，只需更新显示
                timer.element = existingElements.get(timer.id);
                timer.updateDisplay();
                existingElements.delete(timer.id); // 标记为已处理
            } else {
                // 新计时器，需要创建
                const timerElement = this.createTimerElement(timer);
                timer.element = timerElement;
                timerElement.dataset.timerId = timer.id;
                this.activeTimersContainer.appendChild(timerElement);
                timer.updateDisplay();
                timer.updateSubTimersDisplay();
            }
        });
        
        // 3. 移除不再需要的元素
        existingElements.forEach(element => {
            element.remove();
        });
    }

    createTimerElement(timer) {
        const element = document.createElement('div');
        element.className = 'timer-unit';
        element.innerHTML = `
            <div class="timer-header">
                <h3 class="timer-title">${timer.name}</h3>
                <div class="timer-controls">
                    <button class="btn-small btn-primary timer-toggle">${timer.isRunning ? '暂停' : '开始'}</button>
                    <button class="btn-small btn-secondary timer-reset">重置</button>
                    <button class="btn-small btn-danger timer-close">×</button>
                </div>
            </div>
            <div class="timer-display">00:00.00</div>
            <div class="sub-timers-section">
                <div class="sub-timers-header">
                    <h4>子计时器</h4>
                    <button class="btn-small btn-primary add-sub-timer">+ 新建子计时</button>
                </div>
                <div class="sub-timer-list"></div>
            </div>
        `;

        // 绑定控制按钮事件
        const toggleBtn = element.querySelector('.timer-toggle');
        const resetBtn = element.querySelector('.timer-reset');
        const closeBtn = element.querySelector('.timer-close');
        const addSubTimerBtn = element.querySelector('.add-sub-timer');

        toggleBtn.addEventListener('click', () => {
            if (timer.isRunning) {
                timer.pause();
                toggleBtn.textContent = '开始';
                toggleBtn.classList.remove('btn-secondary');
                toggleBtn.classList.add('btn-primary');
            } else {
                timer.start();
                toggleBtn.textContent = '暂停';
                toggleBtn.classList.remove('btn-primary');
                toggleBtn.classList.add('btn-secondary');
            }
        });

        resetBtn.addEventListener('click', () => {
            if (confirm('确定要重置此计时器吗？所有子计时器也将被清除。')) {
                timer.reset();
                toggleBtn.textContent = '开始';
                toggleBtn.classList.remove('btn-secondary');
                toggleBtn.classList.add('btn-primary');
            }
        });

        closeBtn.addEventListener('click', () => {
            if (confirm('确定要关闭此计时器吗？')) {
                this.removeActiveTimer(timer.id);
            }
        });

        addSubTimerBtn.addEventListener('click', () => {
            // 如果父计时器还没开始，自动开始
            if (!timer.isRunning) {
                timer.start();
                toggleBtn.textContent = '暂停';
                toggleBtn.classList.remove('btn-primary');
                toggleBtn.classList.add('btn-secondary');
            }
            timer.addSubTimer();
        });

        return element;
    }

    removeActiveTimer(id) {
        const index = this.activeTimers.findIndex(timer => timer.id === id);
        if (index !== -1) {
            const timer = this.activeTimers[index];
            // 清理主计时器
            clearInterval(timer.interval);
            // 清理所有子计时器
            timer.subTimers.forEach(subTimer => {
                if (subTimer.interval) {
                    clearInterval(subTimer.interval);
                }
            });
            this.activeTimers.splice(index, 1);
            this.renderActiveTimers();
        }
    }

    saveData() {
        const data = {
            tabs: this.tabs
        };
        localStorage.setItem('timerAppData', JSON.stringify(data));
    }

    loadData() {
        const savedData = localStorage.getItem('timerAppData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.tabs = data.tabs || [];
            this.renderTabs();
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new TimerApp();
});