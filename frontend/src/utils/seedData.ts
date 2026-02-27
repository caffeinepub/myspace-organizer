import { db } from '../db/db';

export async function seedDatabase(): Promise<void> {
  try {
    const noteCount = await db.notes.count();
    const recordCount = await db.records.count();
    const streakCount = await db.streak.count();
    const quoteCount = await db.quotes.count();
    const routineCount = await db.routines.count();

    if (noteCount === 0) {
      await db.notes.bulkAdd([
        {
          type: 'text',
          title: 'Welcome to MyOrganizer Pro! 🎉',
          content: 'This is your personal organizer. Use it to track streaks, manage routines, take notes, and log records. Tap any note to edit it.',
          checklistItems: [],
          imageRefs: [],
          color: '#fff9c4',
          labels: ['welcome'],
          pinned: true,
          archived: false,
          trashed: false,
          reminderAt: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          type: 'checklist',
          title: 'Getting Started Checklist',
          content: '',
          checklistItems: [
            { id: '1', text: 'Check in your first streak', checked: false },
            { id: '2', text: 'Add a morning routine', checked: false },
            { id: '3', text: 'Write your first record', checked: false },
            { id: '4', text: 'Customize your theme in Settings', checked: false },
          ],
          imageRefs: [],
          color: '#e8f5e9',
          labels: ['welcome'],
          pinned: false,
          archived: false,
          trashed: false,
          reminderAt: null,
          createdAt: Date.now() - 1000,
          updatedAt: Date.now() - 1000,
        },
      ]);
    }

    if (recordCount === 0) {
      await db.records.bulkAdd([
        {
          title: 'First Log Entry',
          content: 'Started using MyOrganizer Pro today. Feeling motivated to build better habits!',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ]);
    }

    if (streakCount === 0) {
      await db.streak.add({
        count: 0,
        lastCheckIn: null,
        history: [],
      });
    }

    if (quoteCount === 0) {
      await db.quotes.add({
        text: 'The secret of getting ahead is getting started.',
        author: 'Mark Twain',
        alignment: 'center',
        fontFamily: 'Inter',
        fontSize: 20,
        fontColor: '#1e293b',
        backgroundBlur: false,
        isActive: true,
        rotateMode: 'none',
        quoteList: [
          { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
          { text: "It always seems impossible until it's done.", author: 'Nelson Mandela' },
          { text: "Don't watch the clock; do what it does. Keep going.", author: 'Sam Levenson' },
          { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
        ],
        lastRotated: Date.now(),
      });
    }

    if (routineCount === 0) {
      await db.routines.bulkAdd([
        {
          profileType: 'weekday',
          items: [
            { id: 'w1', time: '06:30', title: 'Wake Up & Stretch', tag: 'health', icon: '🌅', duration: 10, completed: false, order: 0 },
            { id: 'w2', time: '07:00', title: 'Morning Workout', tag: 'fitness', icon: '💪', duration: 30, completed: false, order: 1 },
            { id: 'w3', time: '07:45', title: 'Breakfast', tag: 'nutrition', icon: '🥗', duration: 20, completed: false, order: 2 },
            { id: 'w4', time: '08:30', title: 'Deep Work Session', tag: 'work', icon: '💻', duration: 90, completed: false, order: 3 },
            { id: 'w5', time: '12:00', title: 'Lunch Break', tag: 'nutrition', icon: '🍱', duration: 45, completed: false, order: 4 },
            { id: 'w6', time: '17:00', title: 'Evening Walk', tag: 'health', icon: '🚶', duration: 30, completed: false, order: 5 },
            { id: 'w7', time: '22:00', title: 'Read & Wind Down', tag: 'mindfulness', icon: '📚', duration: 30, completed: false, order: 6 },
          ],
        },
        {
          profileType: 'weekend',
          items: [
            { id: 'e1', time: '08:00', title: 'Slow Morning', tag: 'mindfulness', icon: '☕', duration: 30, completed: false, order: 0 },
            { id: 'e2', time: '09:00', title: 'Yoga / Meditation', tag: 'health', icon: '🧘', duration: 45, completed: false, order: 1 },
            { id: 'e3', time: '11:00', title: 'Brunch', tag: 'nutrition', icon: '🥞', duration: 60, completed: false, order: 2 },
            { id: 'e4', time: '14:00', title: 'Personal Project', tag: 'creative', icon: '🎨', duration: 120, completed: false, order: 3 },
            { id: 'e5', time: '18:00', title: 'Social Time', tag: 'social', icon: '👥', duration: 120, completed: false, order: 4 },
            { id: 'e6', time: '21:00', title: 'Weekly Review', tag: 'planning', icon: '📋', duration: 30, completed: false, order: 5 },
          ],
        },
      ]);
    }

    const labelCount = await db.labels.count();
    if (labelCount === 0) {
      await db.labels.bulkAdd([
        { name: 'welcome', color: '#f59e0b', createdAt: Date.now() },
        { name: 'work', color: '#3b82f6', createdAt: Date.now() },
        { name: 'personal', color: '#10b981', createdAt: Date.now() },
        { name: 'ideas', color: '#8b5cf6', createdAt: Date.now() },
      ]);
    }
  } catch {
    // Seed errors are non-fatal
  }
}
