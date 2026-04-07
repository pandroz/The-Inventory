// ── State ──────────────────────────────────────────────────────────────
const today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth(); // 0-indexed
let currentDay = today.getDate();
let currentView = 'month';

// ── Helpers ────────────────────────────────────────────────────────────
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

function eventCoversDate(ev, date) {
    const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999);

    let evStart, evEnd;

    if (isEventAllDay(ev)) {
        evStart = new Date(ev.start.date);          // inclusive
        evEnd = new Date(ev.end.date);            // exclusive per Google spec
        evEnd.setDate(evEnd.getDate() - 1);         // make inclusive
        evEnd.setHours(23, 59, 59, 999);
    } else {
        evStart = new Date(ev.start.dateTime);
        evEnd = new Date(ev.end.dateTime);
    }

    return evStart <= dayEnd && evEnd >= dayStart;
}

// Returns the Monday of the week containing the given date
function getWeekStart(year, month, day) {
    const d = new Date(year, month, day);
    const dow = d.getDay(); // 0 = Sun
    const diff = dow === 0 ? -6 : 1 - dow;
    return new Date(year, month, day + diff);
}

// ── View Switch ────────────────────────────────────────────────────────
function switchView(view) {
    currentView = view;

    document.getElementById('monthGrid').style.display = view === 'month' ? 'grid' : 'none';
    document.getElementById('weekGrid').style.display = view === 'week' ? 'flex' : 'none';
    document.getElementById('dayGrid').style.display = view === 'day' ? 'flex' : 'none';

    if (view === 'month') renderMonth(currentYear, currentMonth);
    if (view === 'week') renderWeek(currentYear, currentMonth, currentDay);
    if (view === 'day') renderDay(currentYear, currentMonth, currentDay);
}

// ── Toolbar label helper ────────────────────────────────────────────────
function setToolbarLabel(text, year) {
    document.getElementById('monthLabel').textContent = text;
    document.getElementById('yearLabel').textContent = year !== undefined ? year : '';
}

// ── Main Calendar Render ───────────────────────────────────────────────
function renderMonth(year, month) {
    setToolbarLabel(MONTHS[month], year);

    const grid = document.getElementById('monthGrid');
    const headers = Array.from(grid.querySelectorAll('.weekday-header'));
    grid.innerHTML = '';
    headers.forEach(h => grid.appendChild(h));

    let startOffset = new Date(year, month, 1).getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
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
            ev.status !== 'cancelled' && eventCoversDate(ev, cellDate)
        );

        const MAX_VISIBLE = 3;
        dayEvents.slice(0, MAX_VISIBLE).forEach(ev => {
            if (ev.status === 'cancelled') return;
            const pill = document.createElement('div');
            pill.className = 'cal-event google';
            pill.title = ev.summary;
            const evStartDate = new Date(isEventAllDay(ev) ? ev.start.date : ev.start.dateTime);
            const isContinuation = evStartDate.toDateString() !== cellDate.toDateString();
            pill.textContent = (isContinuation ? '◀ ' : (isEventAllDay(ev) ? '' : formatTime(getEventDate(ev)) + ' ')) + ev.summary;
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

// ── Week View Render ───────────────────────────────────────────────────
function renderWeek(year, month, day) {
    currentYear = year; currentMonth = month; currentDay = day;

    const weekStart = getWeekStart(year, month, day);
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);

    // Toolbar: show range, e.g. "April – May 2025" or "April 2025"
    if (weekStart.getMonth() === weekEnd.getMonth()) {
        setToolbarLabel(MONTHS[weekStart.getMonth()], weekStart.getFullYear());
    } else {
        setToolbarLabel(
            MONTHS[weekStart.getMonth()].slice(0, 3) + ' – ' + MONTHS[weekEnd.getMonth()].slice(0, 3),
            weekEnd.getFullYear()
        );
    }

    const container = document.getElementById('weekGrid');
    container.innerHTML = '';

    const COL_TEMPLATE = '56px repeat(7, 1fr)';

    // ── Header row ──
    const headerRow = document.createElement('div');
    headerRow.className = 'time-view-header';
    headerRow.style.gridTemplateColumns = COL_TEMPLATE;

    const corner = document.createElement('div');
    corner.className = 'corner';
    headerRow.appendChild(corner);

    // Mon…Sun labels, index 0=Mon in our display but getDay() 1=Mon
    const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon…Sun
    DAY_ORDER.forEach((_, i) => {
        const d = new Date(weekStart); d.setDate(weekStart.getDate() + i);
        const isToday = d.toDateString() === today.toDateString();

        const hdr = document.createElement('div');
        hdr.className = 'week-day-header';

        const nameEl = document.createElement('span');
        nameEl.className = 'wdh-name';
        nameEl.textContent = DAYS_SHORT[d.getDay()];

        const numEl = document.createElement('span');
        numEl.className = 'wdh-num' + (isToday ? ' today-num' : '');
        numEl.textContent = d.getDate();

        hdr.appendChild(nameEl);
        hdr.appendChild(numEl);

        // Clicking the day number drills into day view
        hdr.style.cursor = 'pointer';
        hdr.addEventListener('click', () => {
            currentYear = d.getFullYear(); currentMonth = d.getMonth(); currentDay = d.getDate();
            document.querySelectorAll('.view-tab').forEach(t => t.classList.toggle('active', t.dataset.view === 'day'));
            switchView('day');
        });

        headerRow.appendChild(hdr);
    });
    container.appendChild(headerRow);

    // ── All-day row (only if any all-day events exist this week) ──
    const allDayThisWeek = serverEvents.filter(ev => {
        if (ev.status === 'cancelled') return false;
        // Treat timed events that span >1 day as all-day for row display
        if (!isEventAllDay(ev)) {
            const s = new Date(ev.start.dateTime);
            const e = new Date(ev.end.dateTime);
            const spansDays = s.toDateString() !== e.toDateString();
            if (!spansDays) return false;
        }
        // Check the event overlaps any day in this week
        return eventCoversDate(ev, weekStart) || eventCoversDate(ev, weekEnd) ||
            (new Date(isEventAllDay(ev) ? ev.start.date : ev.start.dateTime) >= weekStart &&
                new Date(isEventAllDay(ev) ? ev.start.date : ev.start.dateTime) <= weekEnd);
    });

    if (allDayThisWeek.length) {
        const allDayRow = document.createElement('div');
        allDayRow.style.cssText = `display:grid; grid-template-columns:${COL_TEMPLATE}; border-bottom:1px solid var(--cal-border); background:var(--cal-surface);`;

        const adCorner = document.createElement('div');
        adCorner.style.cssText = 'border-right:1px solid var(--cal-border); font-size:9px; color:var(--cal-muted); padding:4px 6px; text-align:right; font-family:"DM Mono",monospace;';
        adCorner.textContent = 'all-day';
        allDayRow.appendChild(adCorner);

        DAY_ORDER.forEach((_, i) => {
            const d = new Date(weekStart); d.setDate(weekStart.getDate() + i);
            const cell = document.createElement('div');
            cell.style.cssText = 'border-right:1px solid var(--cal-border); padding:2px 4px; min-height:24px;';

            allDayThisWeek.filter(ev => eventCoversDate(ev, d))
                .forEach(ev => {
                    const pill = document.createElement('div');
                    pill.className = 'cal-event google';
                    pill.textContent = ev.summary;
                    pill.onclick = (e) => { e.stopPropagation(); openEventModal(ev.id); };
                    cell.appendChild(pill);
                });

            allDayRow.appendChild(cell);
        });
        container.appendChild(allDayRow);
    }

    // ── Scrollable time grid ──
    const scroll = document.createElement('div');
    scroll.className = 'time-scroll';

    const grid = document.createElement('div');
    grid.className = 'time-grid';
    grid.style.gridTemplateColumns = COL_TEMPLATE;

    for (let h = 0; h < 24; h++) {
        // Time label cell
        const label = document.createElement('div');
        label.className = 'time-label';
        label.textContent = h.toString().padStart(2, '0') + ':00';
        grid.appendChild(label);

        // One slot per day of the week
        DAY_ORDER.forEach((_, i) => {
            const d = new Date(weekStart); d.setDate(weekStart.getDate() + i);

            const slot = document.createElement('div');
            slot.className = 'time-slot time-slot-week';

            serverEvents
                .filter(ev => {
                    if (isEventAllDay(ev) || ev.status === 'cancelled') return false;
                    const s = new Date(ev.start.dateTime);
                    const e = new Date(ev.end.dateTime);
                    if (s.toDateString() !== e.toDateString()) return false; // multi-day → all-day row
                    return s.toDateString() === d.toDateString() && s.getHours() === h;
                })
                .forEach(ev => {
                    const pill = document.createElement('div');
                    pill.className = 'cal-event google';
                    pill.textContent = formatTime(ev.start.dateTime) + ' ' + ev.summary;
                    pill.onclick = (e) => { e.stopPropagation(); openEventModal(ev.id); };
                    slot.appendChild(pill);
                });

            slot.addEventListener('click', () => {
                const start = new Date(d); start.setHours(h, 0, 0, 0);
                const end = new Date(start); end.setHours(h + 1, 0, 0, 0);
                openNewEventModal(start, end);
            });

            grid.appendChild(slot);
        });
    }

    scroll.appendChild(grid);
    container.appendChild(scroll);

    // Scroll to 08:00 on open
    requestAnimationFrame(() => { scroll.scrollTop = 48 * 8; });
}

// ── Day View Render ────────────────────────────────────────────────────
function renderDay(year, month, day) {
    currentYear = year; currentMonth = month; currentDay = day;

    const d = new Date(year, month, day);
    const isToday = d.toDateString() === today.toDateString();

    setToolbarLabel(MONTHS[month], year);

    const container = document.getElementById('dayGrid');
    container.innerHTML = '';

    // ── Date header ──
    const dateHeader = document.createElement('div');
    dateHeader.className = 'day-view-date-header';

    const nameEl = document.createElement('span');
    nameEl.className = 'dv-name';
    nameEl.textContent = DAYS_LONG[d.getDay()];

    const numEl = document.createElement('span');
    numEl.className = 'dv-num' + (isToday ? ' today-num' : '');
    numEl.textContent = day;

    dateHeader.appendChild(nameEl);
    dateHeader.appendChild(numEl);
    container.appendChild(dateHeader);

    // ── All-day events ──
    const allDayEvs = serverEvents.filter(ev => {
        if (ev.status === 'cancelled') return false;
        if (isEventAllDay(ev)) return eventCoversDate(ev, d);
        // Also surface timed events that span into this day
        const s = new Date(ev.start.dateTime);
        const e = new Date(ev.end.dateTime);
        return s.toDateString() !== e.toDateString() && eventCoversDate(ev, d);
    });

    if (allDayEvs.length) {
        const allDayRow = document.createElement('div');
        allDayRow.className = 'day-allday-row';
        allDayEvs.forEach(ev => {
            const pill = document.createElement('div');
            pill.className = 'cal-event google';
            pill.textContent = ev.summary;
            pill.onclick = () => openEventModal(ev.id);
            allDayRow.appendChild(pill);
        });
        container.appendChild(allDayRow);
    }

    // ── Scrollable time grid ──
    const scroll = document.createElement('div');
    scroll.className = 'time-scroll';

    const grid = document.createElement('div');
    grid.className = 'time-grid';
    grid.style.gridTemplateColumns = '56px 1fr';

    for (let h = 0; h < 24; h++) {
        const label = document.createElement('div');
        label.className = 'time-label';
        label.textContent = h.toString().padStart(2, '0') + ':00';
        grid.appendChild(label);

        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.style.borderRight = 'none';

        serverEvents
            .filter(ev => {
                if (isEventAllDay(ev) || ev.status === 'cancelled') return false;
                const s = new Date(ev.start.dateTime);
                const e = new Date(ev.end.dateTime);
                if (s.toDateString() !== e.toDateString()) return false; // multi-day → all-day row
                return s.toDateString() === d.toDateString() && s.getHours() === h;
            })
            .forEach(ev => {
                const pill = document.createElement('div');
                pill.className = 'cal-event google';
                pill.textContent = formatTime(ev.start.dateTime) + ' ' + ev.summary;
                pill.onclick = (e) => { e.stopPropagation(); openEventModal(ev.id); };
                slot.appendChild(pill);
            });

        slot.addEventListener('click', () => {
            const start = new Date(d); start.setHours(h, 0, 0, 0);
            const end = new Date(start); end.setHours(h + 1, 0, 0, 0);
            openNewEventModal(start, end);
        });

        grid.appendChild(slot);
    }

    scroll.appendChild(grid);
    container.appendChild(scroll);

    requestAnimationFrame(() => { scroll.scrollTop = 48 * 8; });
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
        el.onclick = () => {
            currentYear = d.getFullYear();
            currentMonth = d.getMonth();
            currentDay = d.getDate();
            if (currentView === 'month') renderMonth(currentYear, currentMonth);
            if (currentView === 'week') renderWeek(currentYear, currentMonth, currentDay);
            if (currentView === 'day') renderDay(currentYear, currentMonth, currentDay);
        };
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

// ── Navigation (view-aware) ────────────────────────────────────────────
function navigate(direction) {
    // direction: +1 or -1
    if (currentView === 'month') {
        currentMonth += direction;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderMonth(currentYear, currentMonth);
        renderMini(currentYear, currentMonth);

    } else if (currentView === 'week') {
        const ws = getWeekStart(currentYear, currentMonth, currentDay);
        ws.setDate(ws.getDate() + direction * 7);
        currentYear = ws.getFullYear();
        currentMonth = ws.getMonth();
        currentDay = ws.getDate();
        renderWeek(currentYear, currentMonth, currentDay);
        renderMini(currentYear, currentMonth);

    } else if (currentView === 'day') {
        const d = new Date(currentYear, currentMonth, currentDay + direction);
        currentYear = d.getFullYear();
        currentMonth = d.getMonth();
        currentDay = d.getDate();
        renderDay(currentYear, currentMonth, currentDay);
        renderMini(currentYear, currentMonth);
    }
}

document.getElementById('prevMonth').onclick = () => navigate(-1);
document.getElementById('nextMonth').onclick = () => navigate(+1);

document.getElementById('goToday').onclick = () => {
    currentYear = today.getFullYear();
    currentMonth = today.getMonth();
    currentDay = today.getDate();
    if (currentView === 'month') renderMonth(currentYear, currentMonth);
    if (currentView === 'week') renderWeek(currentYear, currentMonth, currentDay);
    if (currentView === 'day') renderDay(currentYear, currentMonth, currentDay);
    renderMini(currentYear, currentMonth);
};

// ── View Tabs ──────────────────────────────────────────────────────────
document.querySelectorAll('.view-tab').forEach(tab => {
    tab.onclick = () => {
        document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        switchView(tab.dataset.view);
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






// ── Save Event ─────────────────────────────────────────────────────────
async function saveEvent() {
    const id = document.getElementById('eventId').value;
    const isNew = !id;

    const payload = {
        title: document.getElementById('eventTitle').value.trim(),
        description: document.getElementById('eventDescription').value.trim(),
        location: document.getElementById('eventLocation').value.trim(),
    };

    const isAllDay = document.getElementById('eventAllDay').checked;

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
        switchView(currentView); // re-render current view
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
        switchView(currentView); // re-render current view
        toastMessage('success', 'Event Deleted', 'Event deleted.');
    } catch (err) {
        toastMessage('error', 'Error', 'Could not delete event. Please try again.');
    } finally {
        setSyncing(false);
    }
}






// ── All-day toggle ─────────────────────────────────────────────────────
const allDayCheckbox = document.getElementById('eventAllDay');
allDayCheckbox.addEventListener('change', function () {
    const eventStart = document.getElementById('eventStart');
    const eventEnd = document.getElementById('eventEnd');
    const prevStart = eventStart.value;
    const prevEnd = eventEnd.value;

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







// ── All-day date sync ──────────────────────────────────────────────────
document.getElementById('eventStart').addEventListener('change', function () {
    if (allDayCheckbox.checked) document.getElementById('eventEnd').value = this.value;
});








// ── Google Calendar Disconnect ─────────────────────────────────────────
document.getElementById('btn-google-disconnect').addEventListener('click', async () => {
    if (!confirm('Disconnecting will remove all calendar events from this app. Are you sure?')) return;

    try {
        const res = await fetch('/calendar/google/disconnect', { method: 'POST' });
        if (!res.ok) throw new Error('Disconnect failed');
        toastMessage('success', 'Disconnected', 'Google Calendar disconnected. All events removed from this app.');
        setTimeout(() => location.reload(), 500);
    } catch (err) {
        toastMessage('error', 'Error', 'Could not disconnect. Please try again.');
    }
});

// ── Init ───────────────────────────────────────────────────────────────
// Hide week/day containers; month is shown by default via CSS (display:grid)
document.getElementById('weekGrid').style.display = 'none';
document.getElementById('dayGrid').style.display = 'none';

renderMonth(currentYear, currentMonth);
renderMini(currentYear, currentMonth);
