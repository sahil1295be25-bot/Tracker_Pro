document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('attendance-form');
    const dateInput = document.getElementById('date');
    const subjectInput = document.getElementById('subject');
    const deliveredInput = document.getElementById('delivered');
    const attendedInput = document.getElementById('attended');
    const attendanceList = document.getElementById('attendance-list');
    

    const livePercentageEl = document.getElementById('live-percentage');

    // Set today's date as default
    dateInput.valueAsDate = new Date();

    let records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];

    function updateLivePercentage() {
        const delivered = parseInt(deliveredInput.value, 10);
        const attended = parseInt(attendedInput.value, 10);
        
        if (!isNaN(delivered) && !isNaN(attended) && delivered > 0) {
            if (attended > delivered) {
                livePercentageEl.textContent = "Invalid: Attended > Delivered";
                livePercentageEl.style.color = 'var(--danger)';
            } else {
                const percentage = Math.round((attended / delivered) * 100);
                livePercentageEl.textContent = `Your Percentage: ${percentage}%`;
                livePercentageEl.style.color = percentage >= 75 ? 'var(--success)' : 'var(--danger)';
            }
        } else {
            livePercentageEl.textContent = '';
        }
    }

    deliveredInput.addEventListener('input', updateLivePercentage);
    attendedInput.addEventListener('input', updateLivePercentage);



    function renderRecords() {
        attendanceList.innerHTML = '';

        if (records.length === 0) {
            attendanceList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No records found. Start adding some!</p>';
            return;
        }

        // Sort by date descending
        const sortedRecords = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedRecords.forEach(record => {
            const recordEl = document.createElement('div');
            recordEl.classList.add('record-item');
            
            let delivered = record.delivered;
            let attended = record.attended;
            let absent = record.absent;

            // Handle legacy records
            if (record.status) {
                delivered = 1;
                attended = record.status === 'Present' ? 1 : 0;
                absent = record.status === 'Absent' ? 1 : 0;
            }

            const percentage = delivered > 0 ? Math.round((attended / delivered) * 100) : 0;
            const statusClass = percentage >= 75 ? 'status-present' : 'status-absent';

            recordEl.innerHTML = `
                <div class="record-info">
                    <div class="record-title">${record.subject}</div>
                    <div class="record-meta">${new Date(record.date).toLocaleDateString()}</div>
                    <div class="record-meta" style="margin-top: 0.25rem;">
                        Delivered: ${delivered} | Attended: ${attended} | Absent: ${absent}
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="status-badge ${statusClass}">${percentage}%</div>
                    <button class="btn btn-danger" onclick="deleteRecord('${record.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;

            attendanceList.appendChild(recordEl);
        });


    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const delivered = parseInt(deliveredInput.value, 10);
        const attended = parseInt(attendedInput.value, 10);

        if (attended > delivered) {
            alert("Classes attended cannot be greater than classes delivered!");
            return;
        }

        const newRecord = {
            id: Date.now().toString(),
            date: dateInput.value,
            subject: subjectInput.value.trim(),
            delivered: delivered,
            attended: attended,
            absent: delivered - attended
        };

        records.push(newRecord);
        localStorage.setItem('attendanceRecords', JSON.stringify(records));
        
        subjectInput.value = '';
        deliveredInput.value = '';
        attendedInput.value = '';
        livePercentageEl.textContent = '';
        renderRecords();
    });

    window.deleteRecord = (id) => {
        records = records.filter(record => record.id !== id);
        localStorage.setItem('attendanceRecords', JSON.stringify(records));
        renderRecords();
    };

    // Initial render
    renderRecords();
});
