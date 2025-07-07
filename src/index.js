const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

admin.initializeApp();
sgMail.setApiKey('YOUR_SENDGRID_API_KEY');

exports.processPurchase = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { amount } = data;
  const userId = context.auth.uid;

  if (!amount || amount <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid amount.');
  }

  try {
    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);
    const purchaseAmount = parseFloat(amount);
    const points = purchaseAmount * 100;

    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const currentMainBalance = userDoc.exists ? userDoc.data().mainBalance || 10000 : 10000;
      if (currentMainBalance < purchaseAmount) {
        throw new functions.https.HttpsError('failed-precondition', 'Insufficient main balance.');
      }
      transaction.set(userRef, {
        points: (userDoc.exists ? userDoc.data().points || 0 : 0) + points,
        mainBalance: currentMainBalance - purchaseAmount,
      }, { merge: true });

      transaction.set(db.collection('transactions').doc(), {
        userId,
        type: 'purchase',
        amount: purchaseAmount,
        points,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'completed',
      });
    });

    return { success: true, message: `Purchased ${points} points for $${purchaseAmount}` };
  } catch (error) {
    throw new functions.https.HttpsError('internal', `Purchase failed: ${error.message}`);
  }
});

exports.processPropPurchase = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { email } = data;
  const userId = context.auth.uid;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new functions.https.HttpsError('invalid-argument', 'Valid email is required.');
  }

  try {
    const db = admin.firestore();
    const userRef = db.collection('users').doc(userId);
    const purchaseAmount = 5; // قیمت ثابت 5 دلار
    const verificationCode = Math.random().toString(36).substr(2, 8).toUpperCase();

    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const currentMainBalance = userDoc.exists ? userDoc.data().mainBalance || 10000 : 10000;
      if (currentMainBalance < purchaseAmount) {
        throw new functions.https.HttpsError('failed-precondition', 'Insufficient main balance.');
      }
      transaction.set(userRef, { mainBalance: currentMainBalance - purchaseAmount }, { merge: true });

      transaction.set(db.collection('props').doc(), {
        userId,
        amount: purchaseAmount,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'pending',
        verificationCode,
      });
    });

    const msg = {
      to: email,
      from: 'YOUR_VERIFIED_SENDER_EMAIL',
      subject: 'Prop Purchase Verification Code',
      text: `Your verification code for prop purchase is: ${verificationCode}`,
      html: `<p>Your verification code for prop purchase is: <strong>${verificationCode}</strong></p>`,
    };
    await sgMail.send(msg);

    return { success: true, message: `Verification code sent to ${email} for $5 prop purchase.` };
  } catch (error) {
    throw new functions.https.HttpsError('internal', `Prop purchase failed: ${error.message}`);
  }
});

exports.verifyPropCode = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const { code } = data;
  const userId = context.auth.uid;

  if (!code) {
    throw new functions.https.HttpsError('invalid-argument', 'Verification code is required.');
  }

  try {
    const db = admin.firestore();
    const propsRef = db.collection('props');
    const query = propsRef.where('userId', '==', userId).where('verificationCode', '==', code).where('status', '==', 'pending');
    const snapshot = await query.get();

    if (snapshot.empty) {
      throw new functions.https.HttpsError('not-found', 'Invalid or expired verification code.');
    }

    const propDoc = snapshot.docs[0];
    const propData = propDoc.data();
    const userRef = db.collection('users').doc(userId);

    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const currentPropBalance = userDoc.exists ? userDoc.data().propBalance || 0 : 0;
      transaction.set(userRef, {
        propBalance: currentPropBalance + propData.amount,
        propStatus: true,
      }, { merge: true });
      transaction.update(propsRef.doc(propDoc.id), { status: 'active' });
    });

    return { success: true, message: `Prop activated with $${propData.amount} added to prop balance.` };
  } catch (error) {
    throw new functions.https.HttpsError('internal', `Verification failed: ${error.message}`);
  }
});