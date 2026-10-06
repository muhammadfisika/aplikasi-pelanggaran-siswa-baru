// =====================================================
// FIREBASE APP
// =====================================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";


// =====================================================
// AUTH
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
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
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

const auth =
  getAuth(app);

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
// ELEMENT GDS
// =====================================================

const cariSiswa =
  document.getElementById("cariSiswa");

const hasilPencarian =
  document.getElementById("hasilPencarian");

const siswaTerpilih =
  document.getElementById("siswaTerpilih");

const namaSiswaTerpilih =
  document.getElementById("namaSiswaTerpilih");

const detailSiswaTerpilih =
  document.getElementById("detailSiswaTerpilih");

const btnGantiSiswa =
  document.getElementById("btnGantiSiswa");

const formPelanggaran =
  document.getElementById("formPelanggaran");

const tanggalPelanggaran =
  document.getElementById("tanggalPelanggaran");

const jenisPelanggaran =
  document.getElementById("jenisPelanggaran");

const rincianPelanggaran =
  document.getElementById("rincianPelanggaran");

const waktuPelanggaran =
  document.getElementById("waktuPelanggaran");

const nilaiBobot =
  document.getElementById("nilaiBobot");

const btnSimpanPelanggaran =
  document.getElementById(
    "btnSimpanPelanggaran"
  );

const statusSimpan =
  document.getElementById(
    "statusSimpan"
  );

const riwayatPelanggaran =
  document.getElementById(
    "riwayatPelanggaran"
  );


// =====================================================
// DATA PELANGGARAN
// =====================================================

const daftarPelanggaran = {

  ringan: [

    "Datang terlambat",

    "Atribut seragam tidak lengkap",

    "Tidak menggunakan ikat pinggang",

    "Tidak menggunakan kaus kaki sesuai ketentuan",

    "Rambut tidak sesuai ketentuan",

    "Tidak membawa perlengkapan belajar"

  ],


  sedang: [

    "Menggunakan HP saat pembelajaran tanpa izin",

    "Meninggalkan kelas tanpa izin",

    "Mengganggu proses pembelajaran",

    "Berkata tidak sopan",

    "Tidak mengikuti kegiatan sekolah tanpa alasan"

  ],


  berat: [

    "Perundungan",

    "Perkelahian",

    "Merusak fasilitas sekolah dengan sengaja",

    "Membawa barang terlarang",

    "Tindakan yang membahayakan warga sekolah"

  ]

};


// =====================================================
// BOBOT
// =====================================================

const bobotPelanggaran = {

  ringan: 1,

  sedang: 5,

  berat: 10

};


// =====================================================
// DATA SEMENTARA
// =====================================================

let semuaSiswa = [];

let siswaDipilih = null;

let currentUserData = null;


// =====================================================
// PAGE
// =====================================================

function hideAllPages() {

  loginPage.classList.add("hidden");

  gdsPage.classList.add("hidden");

  guruPage.classList.add("hidden");

}


function showLogin() {

  hideAllPages();

  loginPage.classList.remove("hidden");

}


function showGds(userData) {

  hideAllPages();

  gdsPage.classList.remove("hidden");

  gdsUserName.textContent =
    userData.nama ||
    userData.email ||
    "Petugas GDS";

}


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
// AUTH STATE
// =====================================================

onAuthStateChanged(
  auth,
  async function(user) {

    if (!user) {

      currentUserData = null;

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
          "Data pengguna belum tersedia.";

        showLogin();

        return;

      }


      currentUserData =
        userSnap.data();


      currentUserData.uid =
        user.uid;


      if (
        currentUserData.role ===
        "gds"
      ) {

        showGds(
          currentUserData
        );


        await loadSemuaSiswa();

        await loadRiwayatPelanggaran();

        setTanggalDanWaktuDefault();

        return;

      }


      if (
        currentUserData.role ===
        "guru"
      ) {

        showGuru(
          currentUserData
        );

        return;

      }


      await signOut(auth);

      loginError.textContent =
        "Role pengguna tidak dikenali.";

      showLogin();

    }

    catch (error) {

      console.error(
        "Gagal membaca user:",
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
// LOAD SEMUA SISWA
// =====================================================

async function loadSemuaSiswa() {

  try {

    hasilPencarian.innerHTML =
      "";

    const siswaRef =
      collection(
        db,
        "siswa"
      );


    const snapshot =
      await getDocs(
        siswaRef
      );


    semuaSiswa = [];


    snapshot.forEach(
      docSnapshot => {

        const data =
          docSnapshot.data();


        semuaSiswa.push({

          id:
            docSnapshot.id,

          nama:
            data.nama || "",

          nisn:
            data.nisn || "",

          kelas:
            data.kelas || ""

        });

      }
    );


    semuaSiswa.sort(
      (a, b) =>
        a.nama.localeCompare(
          b.nama,
          "id"
        )
    );


    console.log(
      "Jumlah siswa:",
      semuaSiswa.length
    );

  }

  catch (error) {

    console.error(
      "Gagal mengambil siswa:",
      error
    );

    hasilPencarian.innerHTML =

      `<div class="search-item">
        Gagal mengambil data siswa.
      </div>`;

  }

}


// =====================================================
// PENCARIAN SISWA
// =====================================================

cariSiswa.addEventListener(
  "input",
  function() {

    const keyword =
      cariSiswa.value
        .trim()
        .toLowerCase();


    hasilPencarian.innerHTML =
      "";


    if (!keyword) {

      return;

    }


    const hasil =
      semuaSiswa
        .filter(siswa => {

          return (

            siswa.nama
              .toLowerCase()
              .includes(keyword)

            ||

            siswa.nisn
              .toLowerCase()
              .includes(keyword)

          );

        })
        .slice(0, 20);


    if (
      hasil.length === 0
    ) {

      hasilPencarian.innerHTML =

        `<div class="search-item">
          Siswa tidak ditemukan.
        </div>`;

      return;

    }


    hasil.forEach(
      siswa => {

        const item =
          document.createElement(
            "div"
          );


        item.className =
          "search-item";


        item.innerHTML = `

          <strong>
            ${escapeHtml(siswa.nama)}
          </strong>

          <span>
            ${escapeHtml(siswa.nisn)}
            ·
            Kelas ${escapeHtml(siswa.kelas)}
          </span>

        `;


        item.addEventListener(
          "click",
          () => pilihSiswa(siswa)
        );


        hasilPencarian.appendChild(
          item
        );

      }
    );

  }
);


// =====================================================
// PILIH SISWA
// =====================================================

function pilihSiswa(siswa) {

  siswaDipilih =
    siswa;


  namaSiswaTerpilih.textContent =
    siswa.nama;


  detailSiswaTerpilih.textContent =

    `NISN ${siswa.nisn} · Kelas ${siswa.kelas}`;


  siswaTerpilih.classList.remove(
    "hidden"
  );


  formPelanggaran.classList.remove(
    "hidden"
  );


  cariSiswa.value =
    "";


  hasilPencarian.innerHTML =
    "";

}


// =====================================================
// GANTI SISWA
// =====================================================

btnGantiSiswa.addEventListener(
  "click",
  function() {

    siswaDipilih = null;

    siswaTerpilih.classList.add(
      "hidden"
    );

    formPelanggaran.classList.add(
      "hidden"
    );

    resetFormPelanggaran();

    cariSiswa.focus();

  }
);


// =====================================================
// JENIS PELANGGARAN BERUBAH
// =====================================================

jenisPelanggaran.addEventListener(
  "change",
  function() {

    const jenis =
      jenisPelanggaran.value;


    rincianPelanggaran.innerHTML =
      "";


    nilaiBobot.textContent =
      bobotPelanggaran[jenis] || 0;


    if (!jenis) {

      rincianPelanggaran.disabled =
        true;


      rincianPelanggaran.innerHTML =

        `<option value="">
          Pilih jenis pelanggaran terlebih dahulu
        </option>`;

      return;

    }


    rincianPelanggaran.disabled =
      false;


    rincianPelanggaran.innerHTML =

      `<option value="">
        -- Pilih Rincian Pelanggaran --
      </option>`;


    daftarPelanggaran[jenis]
      .forEach(
        rincian => {

          const option =
            document.createElement(
              "option"
            );


          option.value =
            rincian;

          option.textContent =
            rincian;


          rincianPelanggaran
            .appendChild(
              option
            );

        }
      );

  }
);


// =====================================================
// SIMPAN PELANGGARAN
// =====================================================

btnSimpanPelanggaran.addEventListener(
  "click",
  async function() {

    statusSimpan.textContent =
      "";

    statusSimpan.className =
      "status-message";


    if (!siswaDipilih) {

      tampilkanStatus(
        "Pilih siswa terlebih dahulu.",
        "error"
      );

      return;

    }


    const tanggal =
      tanggalPelanggaran.value;

    const jenis =
      jenisPelanggaran.value;

    const rincian =
      rincianPelanggaran.value;

    const waktu =
      waktuPelanggaran.value;


    if (!tanggal) {

      tampilkanStatus(
        "Tanggal wajib diisi.",
        "error"
      );

      return;

    }


    if (!jenis) {

      tampilkanStatus(
        "Jenis pelanggaran wajib dipilih.",
        "error"
      );

      return;

    }


    if (!rincian) {

      tampilkanStatus(
        "Rincian pelanggaran wajib dipilih.",
        "error"
      );

      return;

    }


    if (!waktu) {

      tampilkanStatus(
        "Waktu kejadian wajib diisi.",
        "error"
      );

      return;

    }


    const bobot =
      bobotPelanggaran[jenis];


    btnSimpanPelanggaran.disabled =
      true;


    btnSimpanPelanggaran.textContent =
      "Menyimpan...";


    try {

      await addDoc(
        collection(
          db,
          "pelanggaran"
        ),
        {

          siswaId:
            siswaDipilih.id,

          namaSiswa:
            siswaDipilih.nama,

          nisn:
            siswaDipilih.nisn,

          kelas:
            siswaDipilih.kelas,

          tanggal:
            tanggal,

          waktu:
            waktu,

          jenis:
            jenis,

          rincian:
            rincian,

          bobot:
            bobot,

          petugasId:
            currentUserData.uid,

          petugasNama:
            currentUserData.nama ||
            currentUserData.email,

          createdAt:
            serverTimestamp()

        }
      );


      tampilkanStatus(
        "Pelanggaran berhasil disimpan.",
        "success"
      );


      resetFormPelanggaran();


      await loadRiwayatPelanggaran();

    }

    catch (error) {

      console.error(
        "Gagal menyimpan:",
        error
      );


      tampilkanStatus(
        "Gagal menyimpan data pelanggaran.",
        "error"
      );

    }

    finally {

      btnSimpanPelanggaran.disabled =
        false;

      btnSimpanPelanggaran.textContent =
        "Simpan Pelanggaran";

    }

  }
);


// =====================================================
// RESET FORM
// =====================================================

function resetFormPelanggaran() {

  jenisPelanggaran.value =
    "";

  rincianPelanggaran.innerHTML =

    `<option value="">
      Pilih jenis pelanggaran terlebih dahulu
    </option>`;

  rincianPelanggaran.disabled =
    true;

  waktuPelanggaran.value =
    "";

  nilaiBobot.textContent =
    "0";

}


// =====================================================
// TANGGAL & WAKTU DEFAULT
// =====================================================

function setTanggalDanWaktuDefault() {

  const sekarang =
    new Date();


  const tahun =
    sekarang.getFullYear();


  const bulan =
    String(
      sekarang.getMonth() + 1
    ).padStart(2, "0");


  const hari =
    String(
      sekarang.getDate()
    ).padStart(2, "0");


  tanggalPelanggaran.value =
    `${tahun}-${bulan}-${hari}`;


  const jam =
    String(
      sekarang.getHours()
    ).padStart(2, "0");


  const menit =
    String(
      sekarang.getMinutes()
    ).padStart(2, "0");


  waktuPelanggaran.value =
    `${jam}:${menit}`;

}


// =====================================================
// RIWAYAT PELANGGARAN
// =====================================================

async function loadRiwayatPelanggaran() {

  riwayatPelanggaran.innerHTML =
    "Memuat data...";


  try {

    const q =
      query(

        collection(
          db,
          "pelanggaran"
        ),

        orderBy(
          "createdAt",
          "desc"
        ),

        limit(10)

      );


    const snapshot =
      await getDocs(q);


    if (
      snapshot.empty
    ) {

      riwayatPelanggaran.innerHTML =

        `<p>
          Belum ada data pelanggaran.
        </p>`;

      return;

    }


    riwayatPelanggaran.innerHTML =
      "";


    snapshot.forEach(
      docSnapshot => {

        const data =
          docSnapshot.data();


        const item =
          document.createElement(
            "div"
          );


        item.className =
          "riwayat-item";


        item.innerHTML = `

          <strong>
            ${escapeHtml(
              data.namaSiswa || "-"
            )}
          </strong>

          <div class="riwayat-detail">

            Kelas:
            ${escapeHtml(
              data.kelas || "-"
            )}

            <br>

            ${escapeHtml(
              data.tanggal || "-"
            )}
            ·
            ${escapeHtml(
              data.waktu || "-"
            )}

            <br>

            <span class="badge
              badge-${escapeHtml(
                data.jenis || "ringan"
              )}">

              ${escapeHtml(
                (data.jenis || "")
                  .toUpperCase()
              )}

            </span>

            Bobot:
            ${Number(
              data.bobot || 0
            )}

            <br>

            ${escapeHtml(
              data.rincian || "-"
            )}

          </div>

        `;


        riwayatPelanggaran
          .appendChild(item);

      }
    );

  }

  catch (error) {

    console.error(
      "Gagal memuat riwayat:",
      error
    );


    riwayatPelanggaran.innerHTML =

      `<p>
        Data riwayat belum dapat dimuat.
      </p>`;

  }

}


// =====================================================
// STATUS
// =====================================================

function tampilkanStatus(
  pesan,
  tipe
) {

  statusSimpan.textContent =
    pesan;


  statusSimpan.className =
    "status-message";


  if (tipe === "success") {

    statusSimpan.classList.add(
      "status-success"
    );

  }


  if (tipe === "error") {

    statusSimpan.classList.add(
      "status-error"
    );

  }

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(value) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    String(value ?? "");


  return div.innerHTML;

}


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
