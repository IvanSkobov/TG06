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
        
        // Modals
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.exportBtn.addEventListener('click', () => this.exportToTable());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        
        // Close modals when clicking outside or on close button
        window.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) this.closeSettings();
            if (e.target === this.dayEditModal) this.closeDayEditModal();
        });
        
        this.modalCloseBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeSettings();
                this.closeDayEditModal();
            });
        });
        
        // Rate type selection
        this.rateOptions.forEach(option => {
            option.addEventListener('click', () => this.selectRateType(option.dataset.rate));
        });
        
        // Bonus checkbox and custom rate input
        this.bonusCheckbox.addEventListener('change', () => this.updateBonusDisplay());
        this.customRateInput.addEventListener('input', () => this.updateBonusDisplay());
        
        // Save/Delete day buttons
        this.saveDayBtn.addEventListener('click', () => this.saveDay());
        this.deleteDayBtn.addEventListener('click', () => this.deleteDay());
    }

    // Render calendar
    renderCalendar() {
        // Clear the calendar
        this.calendarEl.innerHTML = '';
        
        // Set the current month and year in the header
        const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        this.currentMonthEl.textContent = `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        
        // Get the first day of the month and total days in month
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Adjust for Monday as first day
        const daysInMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();
        
        // Create day headers container
        const daysHeader = document.createElement('div');
        daysHeader.className = 'calendar-days-header';
        
        // Add day headers
        const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            daysHeader.appendChild(dayHeader);
        });
        
        // Add the days header to the calendar
        this.calendarEl.appendChild(daysHeader);
        
        // Create the calendar grid container
        const calendarGrid = document.createElement('div');
        calendarGrid.className = 'calendar-grid';
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day other-month';
            calendarGrid.appendChild(emptyDay);
        }
        
        // Add days of the month to the grid
        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.className = 'day';
            day.innerHTML = `<div class="day-number">${i}</div>`;
            
            const currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), i);
            const dateKey = this.formatDateKey(currentDate);
            const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
            
            // Add weekend class for Saturday (6) or Sunday (0)
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                day.classList.add('weekend');
            }
            
            // Check if day has entries and apply appropriate styling
            if (this.entries[dateKey]) {
                const entry = this.entries[dateKey];
                day.classList.add(entry.rateType);
                
                // Show amount if it's not the standard rate
                if (entry.rateType !== 'standard') {
                    const rate = entry.customRate || this.rates[entry.rateType] || 0;
                    day.innerHTML += `<div class="day-amount">${rate} ₽</div>`;
                }
                
                // Show bonus indicator if applicable
                if (entry.hasBonus) {
                    day.innerHTML += '<div class="bonus-indicator">+20%</div>';
                }
            }
            
            // Add click event
            day.addEventListener('click', () => this.openDayEditModal(currentDate));
            
            calendarGrid.appendChild(day);
        }
        
        // Add the calendar grid to the main container
        this.calendarEl.appendChild(calendarGrid);
        
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
            this.selectRateType(entry.rateType);
            
            if (entry.customRate) {
                this.customRateInput.value = entry.customRate;
            }
            
            if (entry.hasBonus) {
                this.bonusCheckbox.checked = true;
            }
            
            if (entry.salary) {
                this.salaryInput.value = entry.salary;
            }
        }
        
        // Show the modal
        this.dayEditModal.style.display = 'flex';
        this.updateBonusDisplay();
    }
    
    // Close day edit modal
    closeDayEditModal() {
        this.dayEditModal.style.display = 'none';
    }
    
    // Select rate type
    selectRateType(rateType) {
        this.selectedRateType = rateType;
        
        // Update UI
        this.rateOptions.forEach(opt => {
            if (opt.dataset.rate === rateType) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });
        
        this.updateBonusDisplay();
    }
    
    // Update bonus display
    updateBonusDisplay() {
        if (!this.selectedRateType) return;
        
        const standardRate = this.rates.standard || 0;
        const bonusAmount = standardRate * 0.2;
        this.bonusAmountEl.textContent = `+${bonusAmount.toLocaleString()} ₽`;
        
        // Show/hide bonus amount based on checkbox
        this.bonusAmountEl.style.display = this.bonusCheckbox.checked ? 'inline' : 'none';
    }
    
    // Save day entry
    saveDay() {
        if (!this.selectedDate || !this.selectedRateType) return;
        
        const dateKey = this.formatDateKey(this.selectedDate);
        const customRate = this.customRateInput.value ? parseFloat(this.customRateInput.value) : null;
        const salary = this.salaryInput.value ? parseFloat(this.salaryInput.value) : 0;
        
        // Create or update entry
        this.entries[dateKey] = {
            rateType: this.selectedRateType,
            customRate: customRate,
            hasBonus: this.bonusCheckbox.checked,
            salary: salary
        };
        
        // Save to localStorage
        this.saveEntries();
        
        // Update UI
        this.renderCalendar();
        this.closeDayEditModal();
    }
    
    // Delete day entry
    deleteDay() {
        if (!this.selectedDate) return;
        
        const dateKey = this.formatDateKey(this.selectedDate);
        
        // Remove entry if it exists
        if (this.entries[dateKey]) {
            delete this.entries[dateKey];
            this.saveEntries();
            this.renderCalendar();
        }
        
        this.closeDayEditModal();
    }
    
    // Update monthly summary
    updateSummary() {
        let baseTotal = 0;
        let extraTotal = 0;
        const standardRate = this.rates.standard || 0;
        
        // Calculate totals for all entries
        Object.keys(this.entries).forEach(dateKey => {
            const entry = this.entries[dateKey];
            const rate = entry.customRate || this.rates[entry.rateType] || 0;
            let dayTotal = rate;
            
            // Add bonus if applicable
            if (entry.hasBonus) {
                dayTotal += standardRate * 0.2;
            }
            
            // Add salary if exists
            if (entry.salary) {
                dayTotal += entry.salary;
            }
            
            // Add to base or extra total
            if (entry.rateType === 'standard' && !entry.customRate) {
                baseTotal += standardRate;
                extraTotal += (dayTotal - standardRate);
            } else {
                extraTotal += dayTotal;
            }
        });
        
        const monthlyTotal = baseTotal + extraTotal;
        
        // Update UI
        this.baseTotalEl.textContent = `${baseTotal.toLocaleString()} ₽`;
        this.extraTotalEl.textContent = `${extraTotal.toLocaleString()} ₽`;
        this.monthlyTotalEl.textContent = `${monthlyTotal.toLocaleString()} ₽`;
    }
    
    // Change month
    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }
    
    // Open settings modal
    openSettings() {
        // Set current rates in settings form
        document.getElementById('standardRate').value = this.rates.standard || 0;
        document.getElementById('twoOfThreeRate').value = this.rates.twoOfThree || 0;
        document.getElementById('twoOfFourRate').value = this.rates.twoOfFour || 0;
        document.getElementById('withStudentRate').value = this.rates.withStudent || 0;
        
        this.settingsModal.style.display = 'flex';
    }
    
    // Close settings modal
    closeSettings() {
        this.settingsModal.style.display = 'none';
    }
    
    // Save settings
    saveSettings() {
        try {
            this.rates = {
                standard: parseFloat(document.getElementById('standardRate').value) || 0,
                twoOfThree: parseFloat(document.getElementById('twoOfThreeRate').value) || 0,
                twoOfFour: parseFloat(document.getElementById('twoOfFourRate').value) || 0,
                withStudent: parseFloat(document.getElementById('withStudentRate').value) || 0
            };
            
            this.saveRates();
            this.closeSettings();
            this.renderCalendar(); // Refresh calendar to show updated rates
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.textContent = 'Настройки сохранены!';
            document.body.appendChild(successMsg);
            
            // Remove message after 2 seconds
            setTimeout(() => {
                successMsg.remove();
            }, 2000);
            
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Произошла ошибка при сохранении настроек. Пожалуйста, проверьте введенные данные.');
        }
    }
    
    // Export data to CSV
    exportToTable() {
        let csv = 'Дата,Тип ставки,Ставка,Бонус 20%,Оклад,Итого\n';
        
        // Sort dates
        const sortedDates = Object.keys(this.entries).sort();
        
        // Add each day's data
        sortedDates.forEach(dateKey => {
            const entry = this.entries[dateKey];
            const date = new Date(dateKey);
            const formattedDate = date.toLocaleDateString('ru-RU');
            const rateType = this.getRateTypeName(entry.rateType);
            const rate = entry.customRate || this.rates[entry.rateType] || 0;
            const hasBonus = entry.hasBonus ? 'Да' : 'Нет';
            const salary = entry.salary || 0;
            
            // Calculate total
            let total = rate + salary;
            if (entry.hasBonus) {
                total += (this.rates.standard || 0) * 0.2;
            }
            
            csv += `"${formattedDate}","${rateType}",${rate},${hasBonus},${salary},${total.toFixed(2)}\n`;
        });
        
        // Add summary
        const baseTotal = parseFloat(this.baseTotalEl.textContent.replace(/[^0-9.-]+/g, "")) || 0;
        const extraTotal = parseFloat(this.extraTotalEl.textContent.replace(/[^0-9.-]+/g, "")) || 0;
        const monthlyTotal = parseFloat(this.monthlyTotalEl.textContent.replace(/[^0-9.-]+/g, "")) || 0;
        
        csv += `\n"Итоги","","","","",""\n`;
        csv += `"Базовая сумма (стандартная ставка × дни)","","","","",${baseTotal.toFixed(2)}\n`;
        csv += `"Сумма доплат","","","","",${extraTotal.toFixed(2)}\n`;
        csv += `"Итого за месяц","","","","",${monthlyTotal.toFixed(2)}\n`;
        
        // Create and trigger download
        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Отчет_${new Date().toISOString().split('T')[0]}.csv`;
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
    
    // Helper: Calculate total for a day
    calculateDayTotal(dayData) {
        let total = 0;
        let standardRate = 0;
        
        // First, find the standard rate
        if (dayData.standard?.active) {
            standardRate = dayData.standard.customRate || this.rates.standard || 0;
        }
        
        // Add to base or extra total
        if (entry.rateType === 'standard' && !entry.customRate) {
            baseTotal += standardRate;
            extraTotal += (dayTotal - standardRate);
        } else {
            extraTotal += dayTotal;
        }
    });
    
    const monthlyTotal = baseTotal + extraTotal;
    
    // Update UI
    this.baseTotalEl.textContent = `${baseTotal.toLocaleString()} ₽`;
    this.extraTotalEl.textContent = `${extraTotal.toLocaleString()} ₽`;
    this.monthlyTotalEl.textContent = `${monthlyTotal.toLocaleString()} ₽`;
}

    // Change month
    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }

    // Open settings modal
    openSettings() {
        // Set current rates in settings form
        document.getElementById('standardRate').value = this.rates.standard || 0;
        document.getElementById('twoOfThreeRate').value = this.rates.twoOfThree || 0;
        document.getElementById('twoOfFourRate').value = this.rates.twoOfFour || 0;
        }
    }

    // Save entries to localStorage
    saveEntries() {
        try {
            localStorage.setItem('rateCalculatorEntries', JSON.stringify(this.entries));
        } catch (e) {
            console.error('Error saving entries:', e);
        }
    }

    // Load rates from localStorage or use defaults
    loadRates() {
        const defaultRates = {
            standard: 1000,
            twoOfThree: 1200,
            twoOfFour: 1500,
            withStudent: 800
        };
        
        try {
            const saved = localStorage.getItem('rateCalculatorRates');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Ensure all rate types exist
                return { ...defaultRates, ...parsed };
            }
        } catch (e) {
            console.error('Error loading rates:', e);
        }
        
        return { ...defaultRates };
    }

    // Save rates to localStorage
    saveRates() {
        try {
            localStorage.setItem('rateCalculatorRates', JSON.stringify(this.rates));
        } catch (e) {
            console.error('Error saving rates:', e);
        }
    }
    document.getElementById('twoOfFourRate').value = this.rates.twoOfFour;
    document.getElementById('withStudentRate').value = this.rates.withStudent;
    
    // Show modal
    this.settingsModal.style.display = 'flex';
}

// Close settings modal
closeSettings() {
    this.settingsModal.style.display = 'none';
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new RateCalculator();
});
