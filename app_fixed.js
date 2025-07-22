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
        
        // Settings
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.exportBtn.addEventListener('click', () => this.exportToTable());
        
        // Modal close buttons
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
        
        // Form controls
        this.bonusCheckbox.addEventListener('change', () => this.updateBonusDisplay());
        this.customRateInput.addEventListener('input', () => this.updateBonusDisplay());
        
        // Action buttons
        this.saveDayBtn.addEventListener('click', () => this.saveDay());
        this.deleteDayBtn.addEventListener('click', () => this.deleteDay());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
    }

    // Render the calendar
    renderCalendar() {
        // Clear the calendar
        this.calendarEl.innerHTML = '';
        
        // Set the current month and year in the header
        const options = { month: 'long', year: 'numeric' };
        this.currentMonthEl.textContent = this.currentDate.toLocaleDateString('ru-RU', options);
        
        // Get the first day of the month and the number of days
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Add day headers
        const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            this.calendarEl.appendChild(dayHeader);
        });
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay.getDay() - 1; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            this.calendarEl.appendChild(emptyDay);
        }
        
        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.className = 'day';
            day.innerHTML = `<div class="day-number">${i}</div>`;
            
            // Check if there's an entry for this day
            const currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), i);
            const dateKey = this.formatDateKey(currentDate);
            
            if (this.entries[dateKey]) {
                const entry = this.entries[dateKey];
                day.classList.add(entry.rateType);
                
                // Show rate if it's not the standard rate
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
            
            this.calendarEl.appendChild(day);
        }
        
        // Update the summary
        this.updateSummary();
    }

    // Open day edit modal
    openDayEditModal(date) {
        this.selectedDate = date;
        const dateKey = this.formatDateKey(date);
        const entry = this.entries[dateKey] || {};
        
        // Format the date for display
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        this.modalDateEl.textContent = date.toLocaleDateString('ru-RU', options);
        
        // Reset form
        this.rateOptions.forEach(opt => opt.classList.remove('selected'));
        this.customRateInput.value = '';
        this.salaryInput.value = '';
        this.bonusCheckbox.checked = false;
        
        // Populate form if there's an entry
        if (entry.rateType) {
            this.selectRateType(entry.rateType);
            if (entry.customRate) this.customRateInput.value = entry.customRate;
            if (entry.salary) this.salaryInput.value = entry.salary;
            if (entry.hasBonus) this.bonusCheckbox.checked = true;
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
        if (this.bonusCheckbox.checked) {
            const bonusAmount = (this.rates.standard || 0) * 0.2;
            this.bonusAmountEl.textContent = `+${bonusAmount.toFixed(2)} ₽`;
        } else {
            this.bonusAmountEl.textContent = '';
        }
    }

    // Save day entry
    saveDay() {
        if (!this.selectedDate || !this.selectedRateType) return;
        
        const dateKey = this.formatDateKey(this.selectedDate);
        const customRate = parseFloat(this.customRateInput.value) || null;
        const salary = parseFloat(this.salaryInput.value) || 0;
        
        this.entries[dateKey] = {
            rateType: this.selectedRateType,
            customRate: customRate,
            salary: salary,
            hasBonus: this.bonusCheckbox.checked
        };
        
        this.saveEntries();
        this.renderCalendar();
        this.closeDayEditModal();
    }

    // Delete day entry
    deleteDay() {
        if (!this.selectedDate) return;
        
        const dateKey = this.formatDateKey(this.selectedDate);
        delete this.entries[dateKey];
        
        this.saveEntries();
        this.renderCalendar();
        this.closeDayEditModal();
    }

    // Update monthly summary
    updateSummary() {
        let baseTotal = 0;
        let extraTotal = 0;
        
        // Calculate totals for the current month
        Object.entries(this.entries).forEach(([dateKey, entry]) => {
            // Check if the entry is in the current month
            const entryDate = new Date(dateKey);
            if (entryDate.getMonth() === this.currentDate.getMonth() && 
                entryDate.getFullYear() === this.currentDate.getFullYear()) {
                
                const rate = entry.customRate || this.rates[entry.rateType] || 0;
                const bonus = entry.hasBonus ? (this.rates.standard || 0) * 0.2 : 0;
                
                if (entry.rateType === 'standard' && !entry.customRate && !entry.hasBonus && !entry.salary) {
                    baseTotal += rate;
                } else {
                    extraTotal += (rate - (this.rates.standard || 0)) + bonus + (entry.salary || 0);
                }
            }
        });
        
        // Update the UI
        this.baseTotalEl.textContent = baseTotal.toLocaleString('ru-RU') + ' ₽';
        this.extraTotalEl.textContent = extraTotal.toLocaleString('ru-RU') + ' ₽';
        this.monthlyTotalEl.textContent = (baseTotal + extraTotal).toLocaleString('ru-RU') + ' ₽';
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
            }
        }
    });
    
        // Export data to CSV with a simple summary
    exportToTable() {
        // Count days for each rate type
        const rateCounts = {
            standard: { count: 0, label: 'Стандарт' },
            twoOfThree: { count: 0, label: '2 из 3' },
            twoOfFour: { count: 0, label: '2 из 4' },
            withStudent: { count: 0, label: 'Со студентом' }
        };

        // Count each rate type
        Object.values(this.entries).forEach(entry => {
            if (rateCounts[entry.rateType]) {
                rateCounts[entry.rateType].count++;
            }
        });

        // Calculate totals
        const { baseTotal, extraTotal, monthlyTotal } = this.calculateTotals();
        
        // Create CSV content
        let csv = '\uFEFF'; // BOM for UTF-8
        
        // Add header
        csv += 'Тип ставки,Количество дней,Сумма (₸)\n';
        
        // Add rate type rows
        for (const [key, stat] of Object.entries(rateCounts)) {
            if (stat.count > 0) {
                const rate = this.rates[key] || 0;
                const total = rate * stat.count;
                csv += `"${stat.label}",${stat.count},${total.toFixed(2)}\n`;
            }
        }
        
        // Add summary
        csv += '\n';
        csv += `"Всего дней",,${Object.values(rateCounts).reduce((sum, stat) => sum + stat.count, 0)}\n`;
        csv += `"Базовая сумма",,${baseTotal.toFixed(2)}\n`;
        csv += `"Доплаты",,${extraTotal.toFixed(2)}\n`;
        csv += `"Итого за месяц",,${monthlyTotal.toFixed(2)}\n`;
        
        // Create and trigger download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Отчет_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
        document.body.removeChild(link);
    }

    // Helper: Format date as YYYY-MM-DD
    formatDateKey(date) {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    // Helper: Get rate type name in Russian
    getRateTypeName(rateType) {
        const names = {
            'standard': 'Стандарт',
            'twoOfThree': '2 из 3',
            'twoOfFour': '2 из 4',
            'withStudent': 'Со студентом'
        };
        return names[rateType] || rateType;
    }

    // Load entries from localStorage
    loadEntries() {
        try {
            const saved = localStorage.getItem('rateCalculatorEntries');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error('Error loading entries:', e);
            return {};
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
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        const app = new RateCalculator();
        window.app = app; // Make it available globally for debugging
    } catch (error) {
        console.error('Error initializing app:', error);
        alert('Произошла ошибка при загрузке приложения. Пожалуйста, обновите страницу.');
    }
});
