const ServiceRequest = require('../models/serviceRequest.model');
const User = require('../models/user.model');
const ServiceTarget = require('../models/serviceTarget.model');

/**
 * Compute performance metrics for a single service engineer (leaf node)
 */
exports.computeActuals = async (userId, period) => {
    // period is "YYYY-MM"
    const start = new Date(`${period}-01T00:00:00Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const tickets = await ServiceRequest.find({
        assignedTechnician: userId,
        createdAt: { $gte: start, $lt: end }
    });

    const closed = tickets.filter(t => ['Resolved', 'Closed'].includes(t.status));

    const totalRevenue = tickets.reduce((sum, t) => sum + (t.serviceCharge || 0) + (t.partsCharge || 0), 0);
    const avgCsat = closed.length ? (closed.reduce((sum, t) => sum + (t.rating || 0), 0) / closed.length) * 20 : 0; // 1-5 to 0-100%
    
    let totalTatHours = 0;
    let resolvedWithTat = 0;
    closed.forEach(t => {
        if (t.resolvedAt) {
            totalTatHours += (new Date(t.resolvedAt) - new Date(t.createdAt)) / 3600000;
            resolvedWithTat++;
        }
    });
    const avgTat = resolvedWithTat ? totalTatHours / resolvedWithTat : 0;

    const jobCloseRate = tickets.length ? (closed.length / tickets.length) * 100 : 0;
    
    const auditedTickets = closed.filter(t => t.qualityAudit && t.qualityAudit.score !== undefined);
    const avgQualityScore = auditedTickets.length ? 
        auditedTickets.reduce((sum, t) => sum + t.qualityAudit.score, 0) / auditedTickets.length : 0;

    let totalResponseMinutes = 0;
    let ticketsWithResponse = 0;
    closed.forEach(t => {
        if (t.firstResponseAt) {
            totalResponseMinutes += (new Date(t.firstResponseAt) - new Date(t.createdAt)) / 60000;
            ticketsWithResponse++;
        }
    });
    const avgResponseTime = ticketsWithResponse ? totalResponseMinutes / ticketsWithResponse : 0;

    return {
        revenue: totalRevenue,
        csat: avgCsat,
        tat: avgTat,
        ticketVolume: tickets.length,
        jobCloseRate,
        qualityScore: avgQualityScore,
        responseTime: avgResponseTime
    };
};

/**
 * Rollup performance metrics for a manager by aggregating their direct reports
 */
exports.computeRollup = async (managerId, period) => {
    const directReports = await User.find({ reportsTo: managerId });
    const reportIds = directReports.map(u => u._id);

    const childTargets = await ServiceTarget.find({
        assignedTo: { $in: reportIds },
        period: period
    });

    if (!childTargets.length) {
        return {
            revenue: 0,
            csat: 0,
            tat: 0,
            ticketVolume: 0,
            jobCloseRate: 0,
            qualityScore: 0,
            responseTime: 0
        };
    }

    const count = childTargets.length;
    return {
        revenue: childTargets.reduce((sum, t) => sum + (t.actuals.revenue || 0), 0),
        csat: childTargets.reduce((sum, t) => sum + (t.actuals.csat || 0), 0) / count,
        tat: childTargets.reduce((sum, t) => sum + (t.actuals.tat || 0), 0) / count,
        ticketVolume: childTargets.reduce((sum, t) => sum + (t.actuals.ticketVolume || 0), 0),
        jobCloseRate: childTargets.reduce((sum, t) => sum + (t.actuals.jobCloseRate || 0), 0) / count,
        qualityScore: childTargets.reduce((sum, t) => sum + (t.actuals.qualityScore || 0), 0) / count,
        responseTime: childTargets.reduce((sum, t) => sum + (t.actuals.responseTime || 0), 0) / count
    };
};

/**
 * Fetch the entire service hierarchy as a tree structure
 */
exports.getHierarchy = async () => {
    const members = await User.find({ serviceRole: { $exists: true } })
        .select('name email serviceRole serviceRegion serviceArea reportsTo')
        .populate('reportsTo', 'name serviceRole');
    
    // Build tree
    const map = {};
    members.forEach(m => {
        map[m._id.toString()] = { ...m._doc, children: [] };
    });
    
    const roots = [];
    members.forEach(m => {
        const reportsToId = m.reportsTo?._id?.toString();
        if (reportsToId && map[reportsToId]) {
            map[reportsToId].children.push(map[m._id.toString()]);
        } else {
            roots.push(map[m._id.toString()]);
        }
    });
    return roots;
};
