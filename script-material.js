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
        this.startParentTime = 0;
        this.element = null;
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
            if (this.element) {
                const timeDisplay = this.element.querySelector('.sub-timer-display');
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
            
            this.subTimers.forEach(subTimer => {
                if (!subTimer.element) {
                    const subTimerElement = document.createElement('div');
                    subTimerElement.className = 'sub-timer-item';
                    subTimerElement.dataset.id = subTimer.id;
                    
                    subTimerElement.innerHTML = `
                        <div class="sub-timer-info">
                            <span class="sub-timer-name">${subTimer.name}</span>
                            <span class="sub-timer-start-time">@${this.formatTime(subTimer.startParentTime)}</span>
                        </div>
                        <div class="sub-timer-controls">
                            <span class="sub-timer-display">${subTimer.formatTime(subTimer.elapsedTime)}</span>
                            <button class="mdc-icon-button mdc-icon-button--small material-icons sub-timer-toggle">
                                ${subTimer.isRunning ? 'pause' : 'play_arrow'}
                            </button>
                            <button class="mdc-icon-button mdc-icon-button--small material-icons sub-timer-delete">
                                close
                            </button>
                        </div>
                    `;
                    
                    subTimer.element = subTimerElement;
                    
                    const toggleBtn = subTimerElement.querySelector('.sub-timer-toggle');
                    const deleteBtn = subTimerElement.querySelector('.sub-timer-delete');
                    
                    const ripple = new mdc.ripple.MDCRipple(toggleBtn);
                    ripple.unbounded = true;
                    const deleteRipple = new mdc.ripple.MDCRipple(deleteBtn);
                    deleteRipple.unbounded = true;
                    
                    toggleBtn.addEventListener('click', () => {
                        if (subTimer.isRunning) {
                            subTimer.stop();
                            toggleBtn.textContent = 'play_arrow';
                        } else {
                            subTimer.start();
                            toggleBtn.textContent = 'pause';
                        }
                    });
                    
                    deleteBtn.addEventListener('click', () => {
                        this.removeSubTimer(subTimer.id);
                    });
                    
                    subTimersList.appendChild(subTimerElement);
                }
            });
            
            const existingElements = subTimersList.querySelectorAll('.sub-timer-item');
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
        this.mdcComponents = {};
        this.initializeMDC();
        this.initializeElements();
        this.loadData();
        this.attachEventListeners();
    }

    initializeMDC() {
        // Initialize dialog
        const dialogEl = document.querySelector('.mdc-dialog');
        this.mdcComponents.dialog = new mdc.dialog.MDCDialog(dialogEl);
        
        // Initialize text field
        const textFieldEl = document.querySelector('.mdc-text-field');
        this.mdcComponents.textField = new mdc.textField.MDCTextField(textFieldEl);
        
        // Initialize FAB
        const fabEl = document.querySelector('.mdc-fab');
        new mdc.ripple.MDCRipple(fabEl);
        
        // Initialize snackbar
        const snackbarEl = document.querySelector('.mdc-snackbar');
        this.mdcComponents.snackbar = new mdc.snackbar.MDCSnackbar(snackbarEl);
    }

    initializeElements() {
        this.tabPool = document.getElementById('tab-pool');
        this.activeTimersContainer = document.getElementById('active-timers');
        this.addTabBtn = document.getElementById('add-tab-btn');
        this.tabNameInput = document.getElementById('tab-name-input');
    }

    attachEventListeners() {
        this.addTabBtn.addEventListener('click', () => this.showTabDialog());
        
        this.mdcComponents.dialog.listen('MDCDialog:closed', (event) => {
            if (event.detail.action === 'save') {
                this.saveTab();
            }
        });

        this.tabNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.mdcComponents.dialog.close('save');
            }
        });
    }

    showTabDialog() {
        this.tabNameInput.value = '';
        this.mdcComponents.dialog.open();
        setTimeout(() => this.tabNameInput.focus(), 100);
    }

    saveTab() {
        const name = this.tabNameInput.value.trim();
        if (name) {
            this.addTab(name);
            this.showSnackbar(`标签 "${name}" 已创建`);
        }
    }

    showSnackbar(message) {
        this.mdcComponents.snackbar.labelText = message;
        this.mdcComponents.snackbar.open();
    }

    addTab(name) {
        // 计算颜色索引，循环使用12种颜色
        const colorIndex = this.tabs.length % 12;
        
        const tab = {
            id: Date.now(),
            name: name,
            colorIndex: colorIndex
        };
        this.tabs.push(tab);
        this.renderTabs();
        this.saveData();
    }

    deleteTab(id) {
        const tab = this.tabs.find(t => t.id === id);
        this.tabs = this.tabs.filter(t => t.id !== id);
        this.activeTimers = this.activeTimers.filter(timer => {
            if (timer.id === id) {
                clearInterval(timer.interval);
                timer.subTimers.forEach(st => {
                    if (st.interval) clearInterval(st.interval);
                });
                return false;
            }
            return true;
        });
        this.renderTabs();
        this.renderActiveTimers();
        this.saveData();
        this.showSnackbar(`标签 "${tab.name}" 已删除`);
    }

    renderTabs() {
        this.tabPool.innerHTML = '';
        if (this.tabs.length === 0) {
            this.tabPool.innerHTML = `
                <div class="empty-state">
                    <i class="material-icons">label_off</i>
                    <p class="empty-state-text">暂无标签，点击右上角按钮创建</p>
                </div>
            `;
            return;
        }
        
        this.tabs.forEach(tab => {
            const tabElement = document.createElement('div');
            tabElement.className = 'tab-chip';
            // 设置颜色索引，如果旧数据没有colorIndex，则根据位置分配
            const colorIndex = tab.colorIndex !== undefined ? tab.colorIndex : this.tabs.indexOf(tab) % 12;
            tabElement.setAttribute('data-color', colorIndex);
            
            tabElement.innerHTML = `
                <span class="tab-chip-text">${tab.name}</span>
                <button class="tab-chip-delete">
                    <i class="material-icons">close</i>
                </button>
            `;
            
            tabElement.addEventListener('click', (e) => {
                if (!e.target.closest('.tab-chip-delete')) {
                    this.activateTab(tab);
                }
            });
            
            tabElement.querySelector('.tab-chip-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteTab(tab.id);
            });
            
            this.tabPool.appendChild(tabElement);
        });
    }

    activateTab(tab) {
        const existingTimer = this.activeTimers.find(timer => timer.id === tab.id);
        if (!existingTimer) {
            const timer = new Timer(tab.id, tab.name);
            // 传递颜色信息到计时器
            timer.colorIndex = tab.colorIndex !== undefined ? tab.colorIndex : this.tabs.indexOf(tab) % 12;
            timer.start();
            this.activeTimers.push(timer);
            this.renderActiveTimers();
            this.showSnackbar(`计时器 "${tab.name}" 已启动`);
        }
    }

    renderActiveTimers() {
        const existingElements = new Map();
        this.activeTimersContainer.querySelectorAll('.timer-card').forEach(element => {
            const timerId = parseFloat(element.dataset.timerId);
            existingElements.set(timerId, element);
        });
        
        if (this.activeTimers.length === 0 && existingElements.size === 0) {
            this.activeTimersContainer.innerHTML = `
                <div class="empty-state">
                    <i class="material-icons">timer_off</i>
                    <p class="empty-state-text">点击标签开始计时</p>
                </div>
            `;
            return;
        }
        
        const emptyState = this.activeTimersContainer.querySelector('.empty-state');
        if (emptyState) emptyState.remove();
        
        this.activeTimers.forEach(timer => {
            if (existingElements.has(timer.id)) {
                timer.element = existingElements.get(timer.id);
                timer.updateDisplay();
                existingElements.delete(timer.id);
            } else {
                const timerElement = this.createTimerElement(timer);
                timer.element = timerElement;
                timerElement.dataset.timerId = timer.id;
                this.activeTimersContainer.appendChild(timerElement);
                timer.updateDisplay();
                timer.updateSubTimersDisplay();
            }
        });
        
        existingElements.forEach(element => {
            element.remove();
        });
    }

    createTimerElement(timer) {
        const element = document.createElement('div');
        element.className = 'mdc-card timer-card';
        // 设置颜色属性
        if (timer.colorIndex !== undefined) {
            element.setAttribute('data-color', timer.colorIndex);
        }
        element.innerHTML = `
            <div class="timer-card-header">
                <h3 class="timer-card-title">${timer.name}</h3>
                <div class="timer-card-actions">
                    <button class="mdc-icon-button material-icons timer-close" aria-label="关闭">
                        close
                    </button>
                </div>
            </div>
            <div class="timer-card-content">
                <div class="timer-display">00:00.00</div>
                <div class="timer-controls">
                    <button class="mdc-button mdc-button--raised timer-toggle">
                        <span class="mdc-button__ripple"></span>
                        <i class="mdc-button__icon material-icons">pause</i>
                        <span class="mdc-button__label">暂停</span>
                    </button>
                    <button class="mdc-button mdc-button--outlined timer-reset">
                        <span class="mdc-button__ripple"></span>
                        <i class="mdc-button__icon material-icons">replay</i>
                        <span class="mdc-button__label">重置</span>
                    </button>
                </div>
                <div class="sub-timers-section">
                    <div class="sub-timers-header">
                        <h4 class="sub-timers-title">子计时器</h4>
                        <button class="mdc-button mdc-button--outlined add-sub-timer">
                            <span class="mdc-button__ripple"></span>
                            <i class="mdc-button__icon material-icons">add</i>
                            <span class="mdc-button__label">新建子计时</span>
                        </button>
                    </div>
                    <div class="sub-timer-list"></div>
                </div>
            </div>
        `;

        // Initialize Material components
        element.querySelectorAll('.mdc-button').forEach(btn => {
            new mdc.ripple.MDCRipple(btn);
        });
        
        element.querySelectorAll('.mdc-icon-button').forEach(btn => {
            const ripple = new mdc.ripple.MDCRipple(btn);
            ripple.unbounded = true;
        });

        // Bind events
        const toggleBtn = element.querySelector('.timer-toggle');
        const resetBtn = element.querySelector('.timer-reset');
        const closeBtn = element.querySelector('.timer-close');
        const addSubTimerBtn = element.querySelector('.add-sub-timer');

        toggleBtn.addEventListener('click', () => {
            if (timer.isRunning) {
                timer.pause();
                toggleBtn.querySelector('.material-icons').textContent = 'play_arrow';
                toggleBtn.querySelector('.mdc-button__label').textContent = '开始';
            } else {
                timer.start();
                toggleBtn.querySelector('.material-icons').textContent = 'pause';
                toggleBtn.querySelector('.mdc-button__label').textContent = '暂停';
            }
        });

        resetBtn.addEventListener('click', () => {
            timer.reset();
            toggleBtn.querySelector('.material-icons').textContent = 'play_arrow';
            toggleBtn.querySelector('.mdc-button__label').textContent = '开始';
            this.showSnackbar('计时器已重置');
        });

        closeBtn.addEventListener('click', () => {
            this.removeActiveTimer(timer.id);
            this.showSnackbar('计时器已关闭');
        });

        addSubTimerBtn.addEventListener('click', () => {
            if (!timer.isRunning) {
                timer.start();
                toggleBtn.querySelector('.material-icons').textContent = 'pause';
                toggleBtn.querySelector('.mdc-button__label').textContent = '暂停';
            }
            timer.addSubTimer();
        });

        return element;
    }

    removeActiveTimer(id) {
        const index = this.activeTimers.findIndex(timer => timer.id === id);
        if (index !== -1) {
            const timer = this.activeTimers[index];
            clearInterval(timer.interval);
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