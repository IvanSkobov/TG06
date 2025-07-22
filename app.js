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

        // State
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedRateType = null;
        this.entries = this.loadEntries();
        this.rates = this.loadRates();
        
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
                <div class="day-amount">${entry ? this.formatCurrency(entry.customRate || this.rates[entry.rateType] || 0) : this.formatCurrency(0)}</div>
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
        const monthlyTotal = baseTotal + totalExtras;
        
        // Update the UI
        this.baseTotalEl.textContent = baseTotal.toFixed(2);
        this.extraTotalEl.textContent = totalExtras.toFixed(2);
        this.monthlyTotalEl.textContent = monthlyTotal.toFixed(2);
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
    
    // Export to table
    exportToTable() {
        // Create CSV content
        let csvContent = 'data:text/csv;charset=utf-8,';
        
        // Add headers
        csvContent += 'Дата,Тип ставки,Ставка,Надбавка,Зарплата,Итого\n';
        
        // Add data rows
        Object.entries(this.entries)
            .sort((a, b) => new Date(a[1].date) - new Date(b[1].date))
            .forEach(([date, entry]) => {
                const entryDate = new Date(entry.date);
                const rateType = this.getRateTypeName(entry.rateType);
                const rate = entry.customRate || this.rates[entry.rateType] || 0;
                const bonus = entry.hasBonus ? (this.rates.standard || 0) * 0.2 : 0;
                const salary = entry.salary || 0;
                const total = rate + bonus + parseFloat(salary);
                
                csvContent += `${entryDate.toLocaleDateString('ru-RU')},${rateType},${rate},${bonus.toFixed(2)},${salary},${total.toFixed(2)}\n`;
            });
        
        // Add summary row
        const baseTotal = parseFloat(this.baseTotalEl.textContent) || 0;
        const extraTotal = parseFloat(this.extraTotalEl.textContent) || 0;
        csvContent += `\nБазовый оклад,,,,${baseTotal.toFixed(2)}\n`;
        csvContent += `Доплаты,,,,${extraTotal.toFixed(2)}\n`;
        csvContent += `Итого,,,,${(baseTotal + extraTotal).toFixed(2)}\n`;
        
        // Create download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `rate_calculator_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        
        // Trigger download
        link.click();
        
        // Cleanup
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
    
    // Format number as currency (Kazakhstani Tenge)
    formatCurrency(amount) {
        return new Intl.NumberFormat('kk-KZ', {
            style: 'currency',
            currency: 'KZT',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            currencyDisplay: 'symbol'
        }).format(amount).replace('KZT', '₸');
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
}
