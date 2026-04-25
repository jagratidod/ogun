const User = require('../models/user.model');
const RewardConfig = require('../models/rewardConfig.model');

class RewardService {
    /**
     * Credit points to a user based on a specific action and role
     * @param {string} userId - User to credit points to
     * @param {string} role - role of the user (retailer, distributor, salesExecutive)
     * @param {string} ruleKey - the key in earningRules (e.g., 'perProductSale')
     * @param {string} reason - description for the history
     * @param {number} multiplier - multiplier for points (default: 1)
     */
    static async creditPoints(userId, role, ruleKey, reason, multiplier = 1) {
        try {
            // Get current reward config
            const config = await RewardConfig.findOne({ key: 'global' });
            if (!config || !config.systemConfig.pointsEnabled) return;

            // Normalize role key for config access
            let configRoleKey = role;
            if (role === 'sales_executive') configRoleKey = 'salesExecutive';

            const basePoints = config.earningRules[configRoleKey]?.[ruleKey] || 0;
            const points = basePoints * multiplier;
            if (points === 0) return;

            // Update User
            await User.findByIdAndUpdate(userId, {
                $inc: { rewardPoints: points },
                $push: {
                    pointHistory: {
                        $each: [{ amount: points, reason, type: 'credit', timestamp: new Date() }],
                        $position: 0 // Keep newest at top
                    }
                }
            });

            console.log(`[REWARDS] Credited ${points} points to user ${userId} for ${reason}`);
        } catch (error) {
            console.error('[REWARDS ERROR] Failed to credit points:', error);
        }
    }
}

module.exports = RewardService;
