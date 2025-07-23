// Main application class
class RateCalculator {
    constructor() {
        // DOM Elements
        this.calendarEl = document.getElementById('calendar');
        this.currentMonthEl = document.getElementById('currentMonth');
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.exportBtn = document.getElementById('exportBtn');
        
        // Modal elements
        this.dayEditModal = document.getElementById('dayEditModal');
        this.settingsModal = document.getElementById('settingsModal');
        this.modalCloseBtns = document.querySelectorAll('.close');
        
        // Day edit modal elements
        this.modalDateEl = document.getElementById('modalDate');
        this.rateOptions = document.querySelectorAll('.rate-option');
        this.bonusCheckbox = document.getElementById('bonusCheckbox');
        this.bonusAmountEl = document.getElementById('bonusAmount');
        this.customRateInput = document.getElementById('customRate');
        this.salaryInput = document.getElementById('salaryInput');
        this.saveDayBtn = document.getElementById('saveDayBtn');
        this.deleteDayBtn = document.getElementById('deleteDayBtn');
        
        // Settings modal elements
        this.saveSettingsBtn = document.getElementById('saveSettings');
        
        // Summary elements
        this.baseTotalEl = document.getElementById('baseTotal');
        this.extraTotalEl = document.getElementById('extraTotal');
        this.monthlyTotalEl = document.getElementById('monthlyTotal');
        this.netExtraTotalEl = document.getElementById('netExtraTotal');

        // State
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedRateType = null;
        this.entries = this.loadEntries();
        this.rates = this.loadRates();
        
        // Month picker
        this.monthPicker = document.getElementById('monthPicker');
        this.initMonthPicker();
        
        // Initialize the app
        this.initEventListeners();
        this.renderCalendar();
        this.updateSummary();
        
        console.log('RateCalculator initialized');
    }

    // Initialize event listeners
    initEventListeners() {
        // Navigation
        this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
        this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
        
        // Modal close buttons
        this.modalCloseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.dayEditModal.style.display = 'none';
                this.settingsModal.style.display = 'none';
            });
        });
        
        // Rate type selection
        this.rateOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.rateOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.selectedRateType = option.dataset.rate;
            });
        });
        
        // Save day button
        this.saveDayBtn.addEventListener('click', () => this.saveDay());
        
        // Delete day button
        this.deleteDayBtn.addEventListener('click', () => this.deleteDay());
        
        // Settings button
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        
        // Save settings button
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        
        // Export button
        this.exportBtn.addEventListener('click', () => this.exportToTable());
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.dayEditModal) {
                this.dayEditModal.style.display = 'none';
            }
            if (e.target === this.settingsModal) {
                this.settingsModal.style.display = 'none';
            }
        });
    }

    // Render calendar for current month
    renderCalendar() {
        this.calendarEl.innerHTML = '';
        
        // Set the current month and year in the header
        const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        this.currentMonthEl.textContent = `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        
        // Get first day of month and total days
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1).getDay();
        const daysInMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();
        const daysInPrevMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 0).getDate();
        
        // Calculate days to show from previous month (Monday as first day of week)
        let dayOfWeek = firstDay === 0 ? 6 : firstDay - 1;
        
        // Add empty cells for days before first day of month
        for (let i = 0; i < dayOfWeek; i++) {
            const prevMonthDay = daysInPrevMonth - dayOfWeek + i + 1;
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day empty';
            dayEl.textContent = prevMonthDay;
            this.calendarEl.appendChild(dayEl);
        }
        
        // Add days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            const dateStr = this.formatDate(date);
            const entry = this.entries[dateStr];
            
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            
            // Add weekend class for Saturday and Sunday
            if (date.getDay() === 0 || date.getDay() === 6) {
                dayEl.classList.add('weekend');
            }
            
            // Add day number first
            dayEl.innerHTML = `
                <div class="day-number">${day}</div>
                <div class="day-amount">${entry ? this.formatWithSpaces(entry.customRate || this.rates[entry.rateType] || 0) + ' ₸' : this.formatWithSpaces(0) + ' ₸'}</div>
            `;
            
            // Add entry data if exists
            if (entry) {
                console.log('Entry found for', dateStr, 'with rate type:', entry.rateType);
                // Add rate type class
                const rateClass = entry.rateType; // Use the exact rate type from the entry
                console.log('Adding class:', `rate-${rateClass}`);
                dayEl.classList.add(`rate-${rateClass}`);
                
                // Debug: Log all classes being added
                console.log('Day element classes after adding:', dayEl.className);
                
                // Add bonus indicator
                if (entry.hasBonus) {
                    dayEl.classList.add('has-bonus');
                }
            }
            
            dayEl.addEventListener('click', () => this.openDayEditModal(date));
            this.calendarEl.appendChild(dayEl);
        }
        
        // Update summary after rendering
        this.updateSummary();
    }

    // Open day edit modal
    openDayEditModal(date) {
        this.selectedDate = date;
        const dateKey = this.formatDateKey(date);
        const entry = this.entries[dateKey] || {};
        
        // Update modal header with date
        const options = { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' };
        this.modalDateEl.textContent = date.toLocaleDateString('ru-RU', options);
        
        // Reset form
        this.rateOptions.forEach(opt => opt.classList.remove('selected'));
        this.customRateInput.value = '';
        this.salaryInput.value = '';
        this.bonusCheckbox.checked = false;
        
        // If we have an entry for this date, populate the form
        if (entry.rateType) {
            // Select the rate type
            const selectedOption = Array.from(this.rateOptions).find(opt => opt.dataset.rate === entry.rateType);
            if (selectedOption) {
                selectedOption.classList.add('selected');
                this.selectedRateType = entry.rateType;
            }
            
            // Set custom rate if exists
            if (entry.customRate) {
                this.customRateInput.value = entry.customRate;
            }
            
            // Set bonus checkbox
            if (entry.hasBonus) {
                this.bonusCheckbox.checked = true;
            }
            
            // Set salary if exists
            if (entry.salary) {
                this.salaryInput.value = entry.salary;
            }
        }
        
        // Show the modal
        this.dayEditModal.style.display = 'flex';
    }

    // Save day entry
    saveDay() {
        if (!this.selectedDate || !this.selectedRateType) return;
        
        const dateKey = this.formatDateKey(this.selectedDate);
        const customRate = this.customRateInput.value ? parseFloat(this.customRateInput.value) : null;
        const salary = this.salaryInput.value ? parseFloat(this.salaryInput.value) : null;
        
        this.entries[dateKey] = {
            rateType: this.selectedRateType,
            customRate: customRate,
            hasBonus: this.bonusCheckbox.checked,
            salary: salary,
            date: this.selectedDate.toISOString()
        };
        
        // Save to local storage
        this.saveEntries();
        
        // Update the calendar
        this.renderCalendar();
        
        // Close the modal
        this.dayEditModal.style.display = 'none';
        
        // Show success message
        this.showMessage('Данные сохранены', 'success');
    }
    
    // Delete day entry
    deleteDay() {
        if (!this.selectedDate) return;
        
        const dateKey = this.formatDateKey(this.selectedDate);
        delete this.entries[dateKey];
        
        // Save to local storage
        this.saveEntries();
        
        // Update the calendar
        this.renderCalendar();
        
        // Close the modal
        this.dayEditModal.style.display = 'none';
        
        // Show success message
        this.showMessage('Запись удалена', 'success');
    }
    
    // Update monthly summary
    updateSummary() {
        let baseTotal = 0;
        let extraTotal = 0;
        let bonusTotal = 0;
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const baseRate = this.rates.standard || 0;
        
        // Process each day with entries
        Object.entries(this.entries).forEach(([dateKey, entry]) => {
            const entryDate = new Date(entry.date);
            if (entryDate.getMonth() === month && entryDate.getFullYear() === year) {
                // Always add base rate for marked days
                baseTotal += baseRate;
                
                // Calculate bonus (20% of base rate) if checked
                if (entry.hasBonus) {
                    const bonus = baseRate * 0.2;
                    bonusTotal += bonus;
                }
                
                // Calculate extra payment for non-standard rates
                if (entry.rateType !== 'standard') {
                    const rate = entry.customRate || this.rates[entry.rateType] || 0;
                    const extra = rate - baseRate;
                    extraTotal += extra > 0 ? extra : 0; // Only add positive differences
                }
                
                // Add salary if specified
                if (entry.salary) {
                    extraTotal += parseFloat(entry.salary);
                }
            }
        });
        
        // Calculate totals
        const totalExtras = extraTotal + bonusTotal;
        const netExtra = (totalExtras * 0.625) - 8500;
        const monthlyTotal = baseTotal + netExtra;

        // Update the UI
        this.baseTotalEl.textContent = this.formatWithSpaces(baseTotal) + ' ₸';
        this.extraTotalEl.textContent = this.formatWithSpaces(totalExtras) + ' ₸';
        const netExtraEl = document.getElementById('netExtraTotal');
        if (netExtraEl) {
            netExtraEl.textContent = this.formatWithSpaces(netExtra) + ' ₸';
        }
        this.monthlyTotalEl.textContent = this.formatWithSpaces(monthlyTotal) + ' ₸';
    }
    
    // Change month
    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }
    
    // Open settings
    openSettings() {
        // Populate settings form with current rates
        document.getElementById('standardRate').value = this.rates.standard || '';
        document.getElementById('twoOfThreeRate').value = this.rates.twoOfThree || '';
        document.getElementById('twoOfFourRate').value = this.rates.twoOfFour || '';
        document.getElementById('withStudentRate').value = this.rates.withStudent || '';
        
        // Show the settings modal
        this.settingsModal.style.display = 'flex';
    }
    
    // Save settings
    saveSettings() {
        // Get values from form
        this.rates = {
            standard: parseFloat(document.getElementById('standardRate').value) || 0,
            twoOfThree: parseFloat(document.getElementById('twoOfThreeRate').value) || 0,
            twoOfFour: parseFloat(document.getElementById('twoOfFourRate').value) || 0,
            withStudent: parseFloat(document.getElementById('withStudentRate').value) || 0
        };
        
        // Save to local storage
        localStorage.setItem('rateCalculatorRates', JSON.stringify(this.rates));
        
        // Update the calendar
        this.renderCalendar();
        
        // Close the modal
        this.settingsModal.style.display = 'none';
        
        // Show success message
        this.showMessage('Настройки сохранены', 'success');
    }
    
    // Helper: Format number with 2 decimal places
    formatNumber(num) {
        return parseFloat(num || 0).toFixed(2);
    }
    
    // Helper: Format number with spaces for thousands
    formatWithSpaces(num) {
        return this.formatNumber(num).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    
    // Экспорт только сводной таблицы по ставкам
    exportToTable() {
        // Считаем количество дней по каждой ставке за выбранный месяц
        const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        const month = this.currentDate.getMonth();
        const year = this.currentDate.getFullYear();
        const rateTypes = ['standard', 'twoOfThree', 'twoOfFour', 'withStudent'];
        const rateNames = {
            standard: 'Стандарт',
            twoOfThree: '2 из 3',
            twoOfFour: '2 из 4',
            withStudent: 'Со студентом'
        };
        const counts = { standard: 0, twoOfThree: 0, twoOfFour: 0, withStudent: 0 };

        Object.values(this.entries).forEach(entry => {
            const entryDate = new Date(entry.date);
            if (entryDate.getMonth() === month && entryDate.getFullYear() === year) {
                if (counts[entry.rateType] !== undefined) {
                    counts[entry.rateType]++;
                }
            }
        });

        // Формируем CSV
        let csv = `Отчет по ставкам за ${months[month]} ${year}\n`;
        csv += '\n';
        csv += 'Ставка,Количество дней\n';
        rateTypes.forEach(type => {
            csv += `${rateNames[type]},${counts[type]}\n`;
        });
        csv += '\n';
        // Итоговые суммы
        csv += `Базовая сумма (стандарт):,${this.baseTotalEl.textContent}\n`;
        csv += `Сумма доплат:,${this.extraTotalEl.textContent}\n`;
        const netExtraEl = document.getElementById('netExtraTotal');
        if (netExtraEl) {
            csv += `Чистая сумма доплат:,${netExtraEl.textContent}\n`;
        }
        csv += `Итого за месяц:,${this.monthlyTotalEl.textContent}\n`;

        // Сохраняем как обычный csv-файл с BOM для корректного открытия в Excel
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `rates_summary_${months[month]}_${year}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Helper: Get rate type name
    getRateTypeName(rateType) {
        const names = {
            'standard': 'Стандарт',
            'twoOfThree': '2 из 3',
            'twoOfFour': '2 из 4',
            'withStudent': 'Со студентом'
        };
        return names[rateType] || rateType;
    }
    
    // Helper: Format date as YYYY-MM-DD
    formatDateKey(date) {
        return date.toISOString().split('T')[0];
    }
    
    // Format date as YYYY-MM-DD (alias for formatDateKey for backward compatibility)
    formatDate(date) {
        return this.formatDateKey(date);
    }
    
    // Helper: Show message
    showMessage(message, type = 'info') {
        // You can implement a message system here if needed
        console.log(`[${type}] ${message}`);
    }
    
    // Load entries from local storage
    loadEntries() {
        const saved = localStorage.getItem('rateCalculatorEntries');
        return saved ? JSON.parse(saved) : {};
    }
    
    // Save entries to local storage
    saveEntries() {
        localStorage.setItem('rateCalculatorEntries', JSON.stringify(this.entries));
    }
    
    // Load rates from local storage
    loadRates() {
        const saved = localStorage.getItem('rateCalculatorRates');
        return saved ? JSON.parse(saved) : {
            standard: 0,
            twoOfThree: 0,
            twoOfFour: 0,
            withStudent: 0
        };
    }
    
    // Initialize month picker
    initMonthPicker() {
        const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        const currentYear = this.currentDate.getFullYear();
        this.monthPicker.innerHTML = '';
        months.forEach((month, i) => {
            const option = document.createElement('option');
            option.value = `${currentYear}-${i+1}`;
            option.textContent = `${month} ${currentYear}`;
            if (i === this.currentDate.getMonth()) option.selected = true;
            this.monthPicker.appendChild(option);
        });
        this.monthPicker.addEventListener('change', (e) => {
            const [year, month] = e.target.value.split('-').map(Number);
            this.currentDate = new Date(year, month - 1, 1);
            this.renderCalendar();
            this.updateSummary();
        });
    }
}
