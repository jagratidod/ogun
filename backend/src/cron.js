const cron = require('node-cron');
const Attendance = require('./models/attendance.model');
const ActiveVisit = require('./models/activeVisit.model');

/**
 * Automate Attendance Tasks
 * 1. Finalize attendance at 7 PM IST daily
 * 2. Cleanup stale active visits
 */
const initCronJobs = () => {
    // 7 PM IST daily
    // '0 19 * * *' in Asia/Kolkata
    // Note: If server time is UTC, 7 PM IST is 1:30 PM UTC.
    cron.schedule('30 13 * * *', async () => {
        console.log('Running 7 PM IST Attendance Finalization...');
        
        const now = new Date();
        const istDate = new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(now).split('/').reverse().join('-');

        try {
            // Close all open visits
            const openVisits = await ActiveVisit.find();
            for (const visit of openVisits) {
                const attendance = await Attendance.findOne({ 
                    salesPerson: visit.salesPerson, 
                    date: istDate 
                });
                
                if (attendance) {
                    const duration = Math.round((visit.lastSeenAt - visit.startTime) / 1000);
                    attendance.visits.push({
                        retailer: visit.retailer,
                        startTime: visit.startTime,
                        endTime: visit.lastSeenAt,
                        duration
                    });
                    await attendance.save();
                }
                await ActiveVisit.deleteOne({ _id: visit._id });
            }

            // Mark today's records as finalized
            await Attendance.updateMany({ date: istDate }, { $set: { isFinalized: true } });
            console.log(`Successfully finalized attendance for ${istDate}`);
        } catch (err) {
            console.error('Attendance cron failed:', err);
        }
    });
};

module.exports = initCronJobs;
