import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

/**
 * Helper function to delete all documents in a collection in batches.
 * @param {admin.firestore.CollectionReference} collectionRef The collection to delete.
 * @param {number} batchSize The number of documents to delete in each batch.
 */
const deleteCollection = async (
  collectionRef: admin.firestore.CollectionReference,
  batchSize: number,
) => {
  const query = collectionRef.limit(batchSize);
  let snapshot = await query.get();

  while (snapshot.size > 0) {
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    snapshot = await query.get();
  }
};


/**
 * Triggered on new user creation to initialize their profile in Firestore.
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const userRef = db.collection("users").doc(user.uid);
  return userRef.set({
    uid: user.uid,
    email: user.email,
    name: user.displayName || "New User",
    profileComplete: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    preferences: {},
    subscriptionRole: "free",
    trialEndsAt: null,
  });
});


/**
 * Scheduled function to check for expired trials and downgrade users.
 */
export const checkTrialExpirations = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const query = db.collection("users")
      .where("trialEndsAt", "<=", now)
      .where("subscriptionRole", "==", "pro");

    const expiredTrialsSnapshot = await query.get();
    if (expiredTrialsSnapshot.empty) {
      functions.logger.log("No expired trials found.");
      return null;
    }

    const batch = db.batch();
    expiredTrialsSnapshot.forEach((doc) => {
      functions.logger.log(`Deactivating trial for user ${doc.id}`);
      batch.update(doc.ref, {subscriptionRole: "free"});
    });

    await batch.commit();
    return null;
  });


/**
 * Firestore trigger to copy a roadmap to a public collection when it's shared.
 */
export const onRoadmapShare = functions.firestore
  .document("tracks/{userId}/roadmaps/{roadmapId}")
  .onWrite(async (change, context) => {
    const {roadmapId} = context.params;
    const beforeData = change.before.data();
    const afterData = change.after.data();

    const publicRoadmapRef = db.collection("publicRoadmaps").doc(roadmapId);

    // If roadmap is made public, copy it and its milestones
    if (afterData?.isPublic && !beforeData?.isPublic) {
      functions.logger.log(`Making roadmap ${roadmapId} public.`);

      const milestonesSnapshot = await change.after.ref.collection("milestones").get();
      const batch = db.batch();

      // Copy roadmap data, excluding sensitive or user-specific fields
      const {createdAt, updatedAt, status, ...publicData} = afterData;
      batch.set(publicRoadmapRef, publicData);

      milestonesSnapshot.forEach((doc) => {
        const publicMilestoneRef = publicRoadmapRef.collection("milestones").doc(doc.id);
        batch.set(publicMilestoneRef, doc.data());
      });

      return batch.commit();
    }

    // If roadmap is made private, delete it from public collection
    if (!afterData?.isPublic && beforeData?.isPublic) {
      functions.logger.log(`Making roadmap ${roadmapId} private.`);
      const publicMilestones = await publicRoadmapRef.collection("milestones").get();
      const batch = db.batch();
      publicMilestones.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      return publicRoadmapRef.delete();
    }

    // If a public roadmap is updated, re-sync the public copy
    if (afterData?.isPublic && beforeData?.isPublic) {
      functions.logger.log(`Updating public roadmap ${roadmapId}.`);
      const {createdAt, updatedAt, status, ...publicData} = afterData;
      return publicRoadmapRef.update(publicData);
    }

    return null;
  });


export const sendProgressEmail = functions.pubsub
  .schedule("every monday 09:00")
  .onRun(async (context) => {
    console.log("This is a placeholder for sending weekly progress emails.");
    return null;
  });
