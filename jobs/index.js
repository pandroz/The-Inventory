const Agenda = require('./agenda');
const defineJobDailyReport = require('./definitions/dailyReport');
const defineJobReminders = require('./definitions/reminders');
const mongoose = require('mongoose');

var agenda;

async function initJobs() {

    agenda = Agenda.initAgenda();
    // console.log('agenda initialized', agenda);

    // Register all job definitions
    defineJobDailyReport(agenda);
    defineJobReminders(agenda);

    // Start the agenda scheduler
    await agenda.start();
    console.log('Agenda scheduler started');

    // await agenda.now('Daily Report for Items Close to expiry');
    // agenda.schedule('in 3 seconds', 'Daily Report', {});
    await agenda.schedule('in 3 seconds', 'Reminders', {});
    await agenda.every('0 8 * * *', 'Daily Report', {});
    console.log('Scheduled Daily Report job');

}

// Graceful shutdown — important so Agenda can finish running jobs
async function stopJobs() {
    await agenda.stop();
    await mongoose.disconnect();
    process.exit(0);
}

const getAgenda = () => {
    console.log('Getting agenda instance');
    if (!agenda) throw new Error('Agenda not initialized.');
    return agenda;
};

module.exports = { initJobs, stopJobs, getAgenda };