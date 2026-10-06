// =====================================================
// FIREBASE APP
// =====================================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";


// =====================================================
// FIREBASE AUTHENTICATION
// =====================================================

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";


// =====================================================
// FIRESTORE
// =====================================================

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


// =====================================================
// FIREBASE CONFIG
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
// INITIALIZE FIREBASE
// =====================================================

const app =
  initializeApp(firebaseConfig);


// =====================================================
// INITIALIZE AUTH
// =====================================================

const auth =
  getAuth(app);


// =====================================================
// INITIALIZE FIRESTORE
// =====================================================

const db =
  getFirestore(app);


// =====================================================
// ELEMENT
// =====================================================

const loginPage =
  document.getElementById("loginPage");

const gdsPage =
  document.getElementById("gdsPage");

const guruPage =
  document.getElementById("guruPage");

const loginForm =
  document.getElementById("loginForm");

const emailInput =
  document.getElementById("email");

const passwordInput =
  document.getElementById("password");

const loginError =
  document.getElementById("loginError");

const gdsUserName =
  document.getElementById("gdsUserName");

const guruUserName =
  document.getElementById("guruUserName");

const logoutGds =
  document.getElementById("logoutGds");

const logoutGuru =
  document.getElementById("logoutGuru");


// =====================================================
// HIDE ALL PAGE
// =====================================================

function hideAllPages() {

  loginPage.classList.add("hidden");

  gdsPage.classList.add("hidden");

  guruPage.classList.add("hidden");

}


// =====================================================
// SHOW LOGIN
// =====================================================

function showLogin() {

  hideAllPages();

  loginPage.classList.remove("hidden");

}


// =====================================================
// SHOW GDS
// =====================================================

function showGds(userData) {

  hideAllPages();

  gdsPage.classList.remove("hidden");

  gdsUserName.textContent =
    userData.nama ||
    userData.email ||
    "Petugas GDS";

}


// =====================================================
// SHOW GURU
// =====================================================

function showGuru(userData) {

  hideAllPages();

  guruPage.classList.remove("hidden");

  guruUserName.textContent =
    userData.nama ||
    userData.email ||
    "Guru";

}


// =====================================================
// LOGIN
// =====================================================

loginForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();

    loginError.textContent = "";

    const email =
      emailInput.value.trim();

    const password =
      passwordInput.value;


    if (!email || !password) {

      loginError.textContent =
        "Email dan password wajib diisi.";

      return;

    }


    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    }

    catch (error) {

      console.error(
        "Login error:",
        error
      );

      let message =
        "Login gagal.";

      if (
        error.code ===
        "auth/invalid-credential"
      ) {

        message =
          "Email atau password salah.";

      }

      else if (
        error.code ===
        "auth/user-not-found"
      ) {

        message =
          "Akun tidak ditemukan.";

      }

      else if (
        error.code ===
        "auth/wrong-password"
      ) {

        message =
          "Password salah.";

      }

      else if (
        error.code ===
        "auth/invalid-email"
      ) {

        message =
          "Format email tidak valid.";

      }

      loginError.textContent =
        message;

    }

  }
);


// =====================================================
// CEK USER LOGIN
// =====================================================

onAuthStateChanged(
  auth,
  async function(user) {

    if (!user) {

      showLogin();

      return;

    }


    try {

      const userRef =
        doc(
          db,
          "users",
          user.uid
        );


      const userSnap =
        await getDoc(userRef);


      if (!userSnap.exists()) {

        await signOut(auth);

        loginError.textContent =
          "Data role pengguna belum tersedia.";

        showLogin();

        return;

      }


      const userData =
        userSnap.data();


      console.log(
        "Data pengguna:",
        userData
      );


      // ==========================================
      // ROLE GDS
      // ==========================================

      if (
        userData.role === "gds"
      ) {

        showGds(userData);

        return;

      }


      // ==========================================
      // ROLE GURU
      // ==========================================

      if (
        userData.role === "guru"
      ) {

        showGuru(userData);

        return;

      }


      // ==========================================
      // ROLE TIDAK DIKENAL
      // ==========================================

      await signOut(auth);

      loginError.textContent =
        "Role pengguna tidak dikenali.";

      showLogin();

    }

    catch (error) {

      console.error(
        "Gagal mengambil data pengguna:",
        error
      );

      await signOut(auth);

      loginError.textContent =
        "Gagal membaca data pengguna.";

      showLogin();

    }

  }
);


// =====================================================
// LOGOUT GDS
// =====================================================

logoutGds.addEventListener(
  "click",
  async function() {

    try {

      await signOut(auth);

    }

    catch (error) {

      console.error(
        "Logout error:",
        error
      );

    }

  }
);


// =====================================================
// LOGOUT GURU
// =====================================================

logoutGuru.addEventListener(
  "click",
  async function() {

    try {

      await signOut(auth);

    }

    catch (error) {

      console.error(
        "Logout error:",
        error
      );

    }

  }
);
