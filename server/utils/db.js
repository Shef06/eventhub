// Utility function to get next sequence value for auto-incrementing IDs
export async function getNextSequence(db, name) {
  const count = await db.collection(name).countDocuments();
  return count + 1;
}

// Utility function to create timestamps
export function getTimestamps() {
  const now = new Date();
  return {
    createdAt: now,
    updatedAt: now
  };
}

// Utility function to update timestamp
export function updateTimestamp() {
  return {
    updatedAt: new Date()
  };
}