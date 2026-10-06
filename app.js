import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


// =====================================================
// FIREBASE CONFIGURATION
// =====================================================

const firebaseConfig = {
  apiKey: "AIzaSyDV1sMCsrQKF1l02pOhKkCbNEL19erk2b0",
  authDomain: "data-pelanggaran-siswa-dcc1c.firebaseapp.com",
  projectId: "data-pelanggaran-siswa-dcc1c",
  storageBucket: "data-pelanggaran-siswa-dcc1c.firebasestorage.app",
  messagingSenderId: "36989542207",
  appId: "1:36989542207:web:317a68b9bf624720df3d8a"
};


// =====================================================
// INISIALISASI FIREBASE
// =====================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// =====================================================
// STATUS FIREBASE
// =====================================================

const statusFirebase =
  document.getElementById("statusFirebase");

if (statusFirebase) {

  statusFirebase.textContent =
    "Firebase berhasil terhubung.";

  statusFirebase.style.background =
    "#dcfce7";

  statusFirebase.style.color =
    "#166534";
}


// =====================================================
// EXPORT
// =====================================================

export {
  app,
  auth,
  db
};
