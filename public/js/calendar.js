// ── State ──────────────────────────────────────────────────────────────
const today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth(); // 0-indexed

// ── Helpers ────────────────────────────────────────────────────────────
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function toLocalISO(date) {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
}

function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function setSyncing(active) {
    document.getElementById('syncSpinner').parentElement.classList.toggle('syncing', active);
}

function getEventDate(ev, dateKey = 'start') {
    return _.get(ev, `${dateKey}.dateTime`, _.get(ev, `${dateKey}.date`));
}

function isEventAllDay(ev) {
    return !!ev.start.date && !ev.start.dateTime;
}








// ── Main Calendar Render ───────────────────────────────────────────────
function renderMonth(year, month) {
    document.getElementById('monthLabel').textContent = MONTHS[month];
    document.getElementById('yearLabel').textContent = year;

    const grid = document.getElementById('monthGrid');
    // Remove old day cells (keep 7 weekday headers)
    const headers = grid.querySelectorAll('.weekday-header');
    grid.innerHTML = '';
    headers.forEach(h => grid.appendChild(h));

    // First day of the month (adjust so Mon = 0)
    const firstDay = new Date(year, month, 1);
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    // Filter events for this month view window
    const windowStart = new Date(year, month, 1 - startOffset);
    const windowEnd = new Date(year, month, daysInMonth + (totalCells - startOffset - daysInMonth));

    const visibleEvents = serverEvents.filter(ev => {
        const d = new Date(_.get(ev, 'start.dateTime', _.get(ev, 'start.date')));
        return d >= windowStart && d <= windowEnd;
    });

    for (let i = 0; i < totalCells; i++) {
        const cellDate = new Date(year, month, 1 - startOffset + i);
        const isCurrentMonth = cellDate.getMonth() === month;
        const isToday = cellDate.toDateString() === today.toDateString();

        const cell = document.createElement('div');
        cell.className = 'cal-day' + (isCurrentMonth ? '' : ' other-month') + (isToday ? ' today' : '');
        cell.dataset.date = cellDate.toISOString().split('T')[0];

        // Day number
        const dayNum = document.createElement('div');
        dayNum.className = 'day-number';
        dayNum.textContent = cellDate.getDate();
        cell.appendChild(dayNum);

        // Events for this day
        const dayEvents = visibleEvents.filter(ev =>
            new Date(getEventDate(ev)).toDateString() === cellDate.toDateString()
        );

        const MAX_VISIBLE = 3;
        dayEvents.slice(0, MAX_VISIBLE).forEach(ev => {
            if (ev.status === 'cancelled') return;
            const pill = document.createElement('div');
            pill.className = `cal-event google`;
            pill.title = ev.summary;
            pill.textContent = (isEventAllDay(ev) ? '' : formatTime(getEventDate(ev)) + ' ') + ev.summary;
            pill.onclick = (e) => { e.stopPropagation(); openEventModal(ev.id); };
            cell.appendChild(pill);
        });

        if (dayEvents.length > MAX_VISIBLE) {
            const more = document.createElement('div');
            more.className = 'more-events';
            more.textContent = `+${dayEvents.length - MAX_VISIBLE} more`;
            cell.appendChild(more);
        }

        // Click empty cell to create event
        cell.addEventListener('click', () => {
            const d = new Date(cellDate);
            d.setHours(9, 0, 0, 0);
            const end = new Date(d); end.setHours(10, 0, 0, 0);
            openNewEventModal(d, end);
        });

        grid.appendChild(cell);
    }
}









// ── Mini Calendar ──────────────────────────────────────────────────────
let miniYear = currentYear, miniMonth = currentMonth;

function renderMini(year, month) {
    miniYear = year; miniMonth = month;
    document.getElementById('miniMonthLabel').textContent = MONTHS[month].slice(0, 3) + ' ' + year;

    const grid = document.getElementById('miniGrid');
    grid.innerHTML = '';
    ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach(d => {
        const el = document.createElement('div');
        el.className = 'day-label'; el.textContent = d;
        grid.appendChild(el);
    });

    let startOffset = new Date(year, month, 1).getDay() - 1;
    if (startOffset < 0) startOffset = 6;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
        const d = new Date(year, month, 1 - startOffset + i);
        const el = document.createElement('div');
        el.className = 'mini-day';
        el.textContent = d.getDate();
        if (d.getMonth() !== month) el.classList.add('other-month');
        if (d.toDateString() === today.toDateString()) el.classList.add('today');
        el.onclick = () => { currentYear = d.getFullYear(); currentMonth = d.getMonth(); renderMonth(currentYear, currentMonth); };
        grid.appendChild(el);
    }
}

document.getElementById('miniPrev').onclick = () => {
    if (miniMonth === 0) { miniMonth = 11; miniYear--; } else miniMonth--;
    renderMini(miniYear, miniMonth);
};
document.getElementById('miniNext').onclick = () => {
    if (miniMonth === 11) { miniMonth = 0; miniYear++; } else miniMonth++;
    renderMini(miniYear, miniMonth);
};









// ── Navigation ─────────────────────────────────────────────────────────
document.getElementById('prevMonth').onclick = () => {
    if (currentMonth === 0) { currentMonth = 11; currentYear--; } else currentMonth--;
    renderMonth(currentYear, currentMonth);
    renderMini(currentYear, currentMonth);
};
document.getElementById('nextMonth').onclick = () => {
    if (currentMonth === 11) { currentMonth = 0; currentYear++; } else currentMonth++;
    renderMonth(currentYear, currentMonth);
    renderMini(currentYear, currentMonth);
};
document.getElementById('goToday').onclick = () => {
    currentYear = today.getFullYear(); currentMonth = today.getMonth();
    renderMonth(currentYear, currentMonth);
    renderMini(currentYear, currentMonth);
};









// ── View Tabs (stub — extend with week/day views as needed) ────────────
document.querySelectorAll('.view-tab').forEach(tab => {
    tab.onclick = () => {
        document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        // TODO: swap in week/day view render here
        console.log(`Switched to ${tab.dataset.view} view (not implemented yet)`);
    };
});







// ── Modal: New Event ───────────────────────────────────────────────────
function openNewEventModal(startDate, endDate) {
    document.getElementById('eventModalLabel').textContent = 'New Event';
    document.getElementById('eventId').value = '';
    document.getElementById('eventGoogleId').value = '';
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDescription').value = '';
    document.getElementById('eventLocation').value = '';
    document.getElementById('eventAllDay').checked = false;
    document.getElementById('deleteEventBtn').classList.add('d-none');
    document.getElementById('eventSourceBadge').classList.add('d-none');

    const s = startDate || new Date();
    const e = endDate || new Date(s.getTime() + 3600000);
    document.getElementById('eventStart').value = toLocalISO(s);
    document.getElementById('eventEnd').value = toLocalISO(e);

    new bootstrap.Modal(document.getElementById('eventModal')).show();
}





// ── Modal: Edit Existing Event ─────────────────────────────────────────
function openEventModal(eventId) {
    const ev = serverEvents.find(e => e.id === eventId);
    if (!ev) return;

    let allDay = isEventAllDay(ev);

    document.getElementById('eventModalLabel').textContent = 'Edit Event';
    document.getElementById('eventId').value = ev.id;
    document.getElementById('eventGoogleId').value = ev.googleEventId || '';
    document.getElementById('eventTitle').value = ev.summary || '';
    document.getElementById('eventDescription').value = ev.description || '';
    document.getElementById('eventLocation').value = ev.location || '';
    document.getElementById('eventAllDay').checked = allDay;
    document.getElementById('eventStart').type = allDay ? 'date' : 'datetime-local';
    document.getElementById('eventEnd').type = allDay ? 'date' : 'datetime-local';
    document.getElementById('eventStart').value = allDay ? getEventDate(ev, 'start') : toLocalISO(ev.start.dateTime);
    document.getElementById('eventEnd').value = allDay ? getEventDate(ev, 'end') : toLocalISO(ev.end.dateTime);

    const badge = document.getElementById('eventSourceBadge');
    badge.textContent = ev.source === 'google' ? 'Google Calendar' : 'This app';
    badge.className = `event-source-badge ${ev.source}`;
    badge.classList.remove('d-none');

    document.getElementById('deleteEventBtn').classList.remove('d-none');

    new bootstrap.Modal(document.getElementById('eventModal')).show();
}






// ── Save Event (POST or PUT to your Express API) ───────────────────────
async function saveEvent() {
    const id = document.getElementById('eventId').value;
    const isNew = !id;

    const payload = {
        title: document.getElementById('eventTitle').value.trim(),
        description: document.getElementById('eventDescription').value.trim(),
        location: document.getElementById('eventLocation').value.trim()
    };

    let isAllDay = document.getElementById('eventAllDay').checked;

    if (isAllDay) {
        payload.start = { date: document.getElementById('eventStart').value };
        payload.end = { date: document.getElementById('eventEnd').value };
        payload.isAllDay = true;
    } else {
        payload.start = { dateTime: new Date(document.getElementById('eventStart').value).toISOString(), timeZone: 'Europe/Rome' };
        payload.end = { dateTime: new Date(document.getElementById('eventEnd').value).toISOString(), timeZone: 'Europe/Rome' };
    }

    if (!payload.title) { alert('Please add a title.'); return; }

    setSyncing(true);
    try {
        const res = await fetch(isNew ? '/calendar/events' : `/calendar/events/${id}`, {
            method: isNew ? 'POST' : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('Request failed');

        const saved = await res.json();

        // Update local state without a full page reload
        if (isNew) {
            serverEvents.push(saved);
        } else {
            const idx = serverEvents.findIndex(e => e.id === id);
            if (idx !== -1) serverEvents[idx] = saved;
        }

        bootstrap.Modal.getInstance(document.getElementById('eventModal')).hide();
        renderMonth(currentYear, currentMonth);
        toastMessage('success', 'Event Saved', isNew ? 'Event created and synced to Google Calendar.' : 'Event updated.');
    } catch (err) {
        toastMessage('error', 'Error', 'Something went wrong. Please try again.');
    } finally {
        setSyncing(false);
    }
}






// ── Delete Event ───────────────────────────────────────────────────────
async function deleteEvent() {
    const id = document.getElementById('eventId').value;
    if (!id || !confirm('Delete this event? It will also be removed from Google Calendar.')) return;

    setSyncing(true);
    try {
        const res = await fetch(`/calendar/events/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');

        const idx = serverEvents.findIndex(e => e.id === id);
        if (idx !== -1) serverEvents.splice(idx, 1);

        bootstrap.Modal.getInstance(document.getElementById('eventModal')).hide();
        renderMonth(currentYear, currentMonth);
        toastMessage('success', 'Event Deleted', 'Event deleted.');
    } catch (err) {
        toastMessage('error', 'Error', 'Could not delete event. Please try again.');
    } finally {
        setSyncing(false);
    }
}






// ── All-day toggle ─────────────────────────────────────────────────────
let allDayCheckbox = document.getElementById('eventAllDay');
allDayCheckbox.addEventListener('change', function () {
    let eventStart = document.getElementById('eventStart');
    let eventEnd = document.getElementById('eventEnd');

    let prevStart = eventStart.value;
    let prevEnd = eventEnd.value;

    eventStart.type = this.checked ? 'date' : 'datetime-local';
    eventEnd.type = this.checked ? 'date' : 'datetime-local';
    
    if (this.checked) {
        eventStart.value = prevStart.split('T')[0];
        eventEnd.value = prevEnd.split('T')[0];
    } else {
        if (prevStart.length === 10) eventStart.value = prevStart + 'T09:00';
        if (prevEnd.length === 10) eventEnd.value = prevEnd + 'T10:00';
    }
});







// ── All-day sync ─────────────────────────────────────────────────────
document.getElementById('eventStart').addEventListener('change', function () {
    if (allDayCheckbox.checked) {
        document.getElementById('eventEnd').value = this.value;
    }
});
document.getElementById('eventEnd').addEventListener('change', function () {
    if (allDayCheckbox.checked) {
        document.getElementById('eventStart').value = this.value;
    }
});








// ── Google Calendar Disconnect ────────────────────────────────────────
document.getElementById('btn-google-disconnect').addEventListener('click', async () => {
    if (!confirm('Disconnecting will remove all calendar events from this app. Are you sure?')) return

    try {
        const res = await fetch('/calendar/google/disconnect', { method: 'POST' });
        if (!res.ok) throw new Error('Disconnect failed');
        toastMessage('success', 'Disconnected', 'Google Calendar disconnected. All events removed from this app.');
        setTimeout(() => location.reload(), 500);
    } catch (err) {
        toastMessage('error', 'Error', 'Could not disconnect. Please try again.');
    }
})
// ── Init ───────────────────────────────────────────────────────────────
renderMonth(currentYear, currentMonth);
renderMini(currentYear, currentMonth);