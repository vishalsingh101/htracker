// app.js
import firebase from './firebase-config.js'; // Import Firebase module

const auth = firebase.auth();
const db = firebase.firestore();

const signInButton = document.getElementById('sign-in-btn');
const signOutButton = document.getElementById('sign-out-btn');
const habitGrid = document.getElementById('habit-grid');

let currentUser = null;

signInButton.addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        currentUser = result.user;
        signInButton.style.display = 'none';
        signOutButton.style.display = 'block';
        renderHabitGrid();
    } catch (error) {
        console.error(error.message);
    }
});

signOutButton.addEventListener('click', async () => {
    try {
        await auth.signOut();
        currentUser = null;
        signInButton.style.display = 'block';
        signOutButton.style.display = 'none';
        habitGrid.innerHTML = '';
    } catch (error) {
        console.error(error.message);
    }
});

function renderHabitGrid() {
    if (!currentUser) return;
    db.collection('habits').where('userId', '==', currentUser.uid).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const habitData = doc.data();
                const habitCell = document.createElement('div');
                habitCell.classList.add('habit-cell');
                habitCell.style.backgroundColor = habitData.completed ? 'green' : 'transparent';
                habitCell.addEventListener('click', () => toggleHabitCompletion(doc.id, !habitData.completed));
                habitGrid.appendChild(habitCell);
            });
        })
        .catch(error => console.error(error));
}

function toggleHabitCompletion(habitId, completed) {
    db.collection('habits').doc(habitId).update({ completed })
        .then(() => renderHabitGrid())
        .catch(error => console.error(error));
}
