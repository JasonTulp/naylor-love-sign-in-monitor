import mongoose from 'mongoose';
import { dbConnect } from './db-connect';
import ScanEvent from '@/models/scan-event';
import ScanEvent2 from '@/models/scan-event-2';


export async function migrateEvents() {
    try {
        await dbConnect();

        // Fetch all events from ScanEvent
        const oldEvents = await ScanEvent.find({});
        console.log(`Found ${oldEvents.length} events to migrate`);

        // Convert and insert events
        const newEvents = oldEvents.map((event: typeof ScanEvent): typeof ScanEvent2 => ({
            _id: event._id,
            entryTime: event.time,
            name: event.name,
            entryTurnstile: event.turnstile,
            cardNumber: event.cardNumber,
            cardTechnology: event.cardTechnology
        }));

        // Insert all events into ScanEvent2
        const result = await ScanEvent2.insertMany(newEvents, { ordered: false });
        console.log(`Successfully migrated ${result.length} events`);

        return {
            success: true,
            migratedCount: result.length,
            totalEvents: oldEvents.length
        };

    } catch (error) {
        console.error('Migration failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
} 