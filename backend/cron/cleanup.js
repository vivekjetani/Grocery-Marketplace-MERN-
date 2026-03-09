import cron from 'node-cron';
import User from '../models/user.model.js';
import Address from '../models/address.model.js';
import Review from '../models/review.model.js';

// Run cleanup every day at midnight server time (0 0 * * *)
const startCleanupJob = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log('--- Running Daily Unverified Account Cleanup Job ---');
        try {
            // Calculate date 30 days ago
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // Find users who are not verified and their account is older than 30 days
            const unverifiedOldUsers = await User.find({
                isVerified: false,
                createdAt: { $lte: thirtyDaysAgo }
            });

            if (unverifiedOldUsers.length === 0) {
                console.log('No unverified accounts older than 30 days found for cleanup.');
                return;
            }

            console.log(`Found ${unverifiedOldUsers.length} unverified account(s) older than 30 days. Initiating cleanup...`);

            // Extract IDs for cascade deletion
            const userIds = unverifiedOldUsers.map(user => user._id);

            // 1. Delete associated Addresses
            const addressDeleteResult = await Address.deleteMany({ userId: { $in: userIds } });
            console.log(`Deleted ${addressDeleteResult.deletedCount} associated addresses.`);

            // 2. Delete associated Reviews
            const reviewDeleteResult = await Review.deleteMany({ userId: { $in: userIds } });
            console.log(`Deleted ${reviewDeleteResult.deletedCount} associated reviews.`);

            // (Note: Optional: We don't delete Orders to preserve historical financial data, 
            // but unverified users typically shouldn't have successful orders anyway due to the login block).

            // 3. Delete the Unverified Users
            const userDeleteResult = await User.deleteMany({ _id: { $in: userIds } });
            console.log(`Successfully deleted ${userDeleteResult.deletedCount} unverified users.`);

            console.log('--- Cleanup Job Completed Successfully ---');
        } catch (error) {
            console.error('Error during unverified account cleanup job:', error);
        }
    });

    console.log('Cron job initialized: Unverified account cleanup scheduled (Daily at midnight).');
};

export default startCleanupJob;
