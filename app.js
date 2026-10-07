// =====================================================
// FIREBASE APP
// APLIKASI PELANGGARAN SISWA
// SMAN 2 RANGKASBITUNG
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  deleteDoc,
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

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


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


const bobotPelanggaran = {

  ringan: 1,

  sedang: 5,

  berat: 10

};


// =====================================================
// VARIABEL GLOBAL
// =====================================================

let currentUser = null;

let currentRole = null;

let currentUserData = null;

let semuaSiswa = [];

let semuaPelanggaran = [];

let siswaTerpilih = null;


// =====================================================
// HELPER
// =====================================================

function el(id) {

  return document.getElementById(id);

}


function escapeHtml(value) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }

  return String(value)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}


function formatTanggal(tanggal) {

  if (!tanggal) {

    return "-";

  }

  const parts =
    String(tanggal).split("-");

  if (parts.length !== 3) {

    return tanggal;

  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;

}


function formatJenis(jenis) {

  if (!jenis) {

    return "-";

  }

  return (
    String(jenis).charAt(0).toUpperCase() +
    String(jenis).slice(1)
  );

}


function setDisplay(id, display) {

  const element = el(id);

  if (element) {

    element.style.display = display;

  }

}


// =====================================================
// TAMPILKAN HALAMAN LOGIN
// =====================================================

function tampilkanLogin() {
   console.log("Menampilkan halaman login");

  setDisplay(
    "loginPage",
    "block"
  );

  setDisplay(
    "gdsPage",
    "none"
  );

  setDisplay(
    "guruPage",
    "none"
  );

}


// =====================================================
// TAMPILKAN HALAMAN GDS
// =====================================================

function tampilkanGDS() {

  setDisplay(
    "loginPage",
    "none"
  );

  setDisplay(
    "gdsPage",
    "block"
  );

  setDisplay(
    "guruPage",
    "none"
  );

}


// =====================================================
// TAMPILKAN HALAMAN GURU
// =====================================================

function tampilkanGuru() {

  setDisplay(
    "loginPage",
    "none"
  );

  setDisplay(
    "gdsPage",
    "none"
  );

  setDisplay(
    "guruPage",
    "block"
  );

}


// =====================================================
// LOGIN
// =====================================================

async function prosesLogin() {

  const emailElement =
    el("email");

  const passwordElement =
    el("password");

  const errorBox =
    el("loginError");


  const email =
    emailElement
      ? emailElement.value.trim()
      : "";


  const password =
    passwordElement
      ? passwordElement.value
      : "";


  if (errorBox) {

    errorBox.textContent = "";

  }


  if (!email) {

    if (errorBox) {

      errorBox.textContent =
        "Email harus diisi.";

    }

    return;

  }


  if (!password) {

    if (errorBox) {

      errorBox.textContent =
        "Password harus diisi.";

    }

    return;

  }


  const tombol =
    document.querySelector(
      '#loginForm button[type="submit"]'
    );


  if (tombol) {

    tombol.disabled = true;

    tombol.textContent =
      "Memproses...";

  }


  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );


  } catch (error) {

    console.error(
      "LOGIN ERROR:",
      error
    );


    let pesan =
      "Login gagal. Periksa email dan password.";


    if (
      error.code ===
      "auth/invalid-credential"
    ) {

      pesan =
        "Email atau password salah.";

    }


    if (
      error.code ===
      "auth/user-not-found"
    ) {

      pesan =
        "Akun pengguna tidak ditemukan.";

    }


    if (
      error.code ===
      "auth/wrong-password"
    ) {

      pesan =
        "Password salah.";

    }


    if (
      error.code ===
      "auth/too-many-requests"
    ) {

      pesan =
        "Terlalu banyak percobaan login. Silakan coba lagi nanti.";

    }


    if (
      error.code ===
      "auth/network-request-failed"
    ) {

      pesan =
        "Koneksi internet bermasalah.";

    }


    if (errorBox) {

      errorBox.textContent =
        pesan;

    }


  } finally {

    if (tombol) {

      tombol.disabled = false;

      tombol.textContent =
        "Login";

    }

  }

}


// =====================================================
// LOGOUT
// =====================================================

async function prosesLogout() {

  try {

    await signOut(auth);

    siswaTerpilih = null;

    semuaSiswa = [];

    semuaPelanggaran = [];

  } catch (error) {

    console.error(
      "Gagal logout:",
      error
    );

  }

}


// =====================================================
// AMBIL DATA USER
// =====================================================

async function ambilDataUser(uid) {

  const userRef =
    doc(
      db,
      "users",
      uid
    );


  const snapshot =
    await getDoc(userRef);


  if (!snapshot.exists()) {

    return null;

  }


  return {

    id: snapshot.id,

    ...snapshot.data()

  };

}


// =====================================================
// AUTH STATE
// =====================================================

onAuthStateChanged(
  auth,
  async user => {

    try {

      // -----------------------------------------------
      // BELUM LOGIN
      // -----------------------------------------------

      if (!user) {

        currentUser = null;

        currentRole = null;

        currentUserData = null;

        tampilkanLogin();

        return;

      }


      // -----------------------------------------------
      // USER LOGIN
      // -----------------------------------------------

      currentUser = user;


      currentUserData =
        await ambilDataUser(
          user.uid
        );


      if (!currentUserData) {

        alert(
          "Data pengguna tidak ditemukan di Firestore."
        );

        await signOut(auth);

        return;

      }


      currentRole =
        String(
          currentUserData.role || ""
        )
          .trim()
          .toLowerCase();


      // -----------------------------------------------
      // ROLE GDS
      // -----------------------------------------------

      if (
        currentRole === "gds"
      ) {

        tampilkanGDS();


        const nama =
          el("gdsUserName");


        if (nama) {

          nama.textContent =
            currentUserData.nama ||
            user.email ||
            "Petugas GDS";

        }


        await loadSemuaSiswa();

        await loadRiwayatGDS();

        return;

      }


      // -----------------------------------------------
      // ROLE GURU
      // -----------------------------------------------

      if (
        currentRole === "guru"
      ) {

        tampilkanGuru();


        const nama =
          el("guruUserName");


        if (nama) {

          nama.textContent =
            currentUserData.nama ||
            user.email ||
            "Guru";

        }


        await loadSemuaPelanggaranGuru();

        isiFilterKelas();

        tampilkanRekapGuru();

        return;

      }


      // -----------------------------------------------
      // ROLE TIDAK DIKENAL
      // -----------------------------------------------

      alert(
        "Role pengguna tidak dikenali: " +
        currentRole
      );


      await signOut(auth);


    } catch (error) {

      console.error(
        "AUTH STATE ERROR:",
        error
      );


      tampilkanLogin();


      const errorBox =
        el("loginError");


      if (errorBox) {

        errorBox.textContent =
          "Gagal memuat data pengguna. Periksa koneksi dan Firestore Rules.";

      }

    }

  }
);


// =====================================================
// LOAD SEMUA SISWA
// =====================================================

async function loadSemuaSiswa() {

  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          "siswa"
        )
      );


    semuaSiswa = [];


    snapshot.forEach(
      item => {

        semuaSiswa.push({

          id: item.id,

          ...item.data()

        });

      }
    );


    semuaSiswa.sort(
      (a, b) => {

        return String(
          a.nama || ""
        ).localeCompare(
          String(b.nama || ""),
          "id"
        );

      }
    );


  } catch (error) {

    console.error(
      "GAGAL LOAD SISWA:",
      error
    );


    alert(
      "Gagal mengambil data siswa dari Firebase."
    );

  }

}


// =====================================================
// CARI SISWA
// =====================================================

function cariSiswa() {

  const input =
    el("cariSiswa");


  const container =
    el("hasilPencarian");


  if (!input || !container) {

    return;

  }


  const keyword =
    input.value
      .trim()
      .toLowerCase();


  if (!keyword) {

    container.innerHTML =
      "<p>Masukkan nama atau NISN siswa.</p>";

    return;

  }


  const hasil =
    semuaSiswa.filter(
      siswa => {

        const nama =
          String(
            siswa.nama || ""
          ).toLowerCase();


        const nisn =
          String(
            siswa.nisn || ""
          ).toLowerCase();


        return (
          nama.includes(keyword) ||
          nisn.includes(keyword)
        );

      }
    );


  if (hasil.length === 0) {

    container.innerHTML =
      "<p>Siswa tidak ditemukan.</p>";

    return;

  }


  container.innerHTML =
    hasil
      .slice(0, 30)
      .map(
        siswa => `

        <div class="student-result">

          <div>

            <strong>
              ${escapeHtml(siswa.nama)}
            </strong>

            <div>
              NISN:
              ${escapeHtml(
                siswa.nisn || "-"
              )}
            </div>

            <div>
              Kelas:
              ${escapeHtml(
                siswa.kelas || "-"
              )}
            </div>

          </div>

          <button
            type="button"
            class="btn btn-primary btn-pilih-siswa"
            data-id="${escapeHtml(siswa.id)}"
          >
            Pilih
          </button>

        </div>

      `
      )
      .join("");


  // Event tombol pilih
  container
    .querySelectorAll(
      ".btn-pilih-siswa"
    )
    .forEach(
      tombol => {

        tombol.addEventListener(
          "click",
          () => {

            pilihSiswa(
              tombol.dataset.id
            );

          }
        );

      }
    );

}


// =====================================================
// PILIH SISWA
// =====================================================

function pilihSiswa(id) {

  const siswa =
    semuaSiswa.find(
      item => item.id === id
    );


  if (!siswa) {

    alert(
      "Data siswa tidak ditemukan."
    );

    return;

  }


  siswaTerpilih = siswa;


  const nama =
    el("namaSiswaTerpilih");


  if (nama) {

    nama.textContent =
      siswa.nama || "-";

  }


  const detail =
    el("detailSiswaTerpilih");


  if (detail) {

    detail.innerHTML = `

      NISN:
      <strong>
        ${escapeHtml(
          siswa.nisn || "-"
        )}
      </strong>

      <br>

      Kelas:
      <strong>
        ${escapeHtml(
          siswa.kelas || "-"
        )}
      </strong>

    `;

  }


  setDisplay(
    "siswaTerpilih",
    "block"
  );


  setDisplay(
    "formPelanggaran",
    "block"
  );


  const hasil =
    el("hasilPencarian");


  if (hasil) {

    hasil.innerHTML = "";

  }


  const cari =
    el("cariSiswa");


  if (cari) {

    cari.value = "";

  }


  const status =
    el("statusSimpan");


  if (status) {

    status.textContent = "";

  }

}


// =====================================================
// GANTI SISWA
// =====================================================

function gantiSiswa() {

  siswaTerpilih = null;


  setDisplay(
    "siswaTerpilih",
    "none"
  );


  setDisplay(
    "formPelanggaran",
    "none"
  );


  const rincian =
    el("rincianPelanggaran");


  if (rincian) {

    rincian.innerHTML =
      '<option value="">Pilih jenis terlebih dahulu</option>';

    rincian.disabled = true;

  }


  const jenis =
    el("jenisPelanggaran");


  if (jenis) {

    jenis.value = "";

  }


  const bobot =
    el("nilaiBobot");


  if (bobot) {

    bobot.textContent = "0";

  }


  const cari =
    el("cariSiswa");


  if (cari) {

    cari.focus();

  }

}


// =====================================================
// JENIS PELANGGARAN
// =====================================================

function ubahJenisPelanggaran() {

  const jenisElement =
    el("jenisPelanggaran");


  const rincian =
    el("rincianPelanggaran");


  const bobot =
    el("nilaiBobot");


  if (!jenisElement || !rincian) {

    return;

  }


  const jenis =
    jenisElement.value;


  rincian.innerHTML =
    '<option value="">-- Pilih rincian --</option>';


  if (
    jenis &&
    daftarPelanggaran[jenis]
  ) {

    daftarPelanggaran[jenis]
      .forEach(
        item => {

          const option =
            document.createElement(
              "option"
            );


          option.value = item;

          option.textContent = item;


          rincian.appendChild(
            option
          );

        }
      );


    rincian.disabled = false;

  } else {

    rincian.disabled = true;

  }


  if (bobot) {

    bobot.textContent =
      jenis
        ? bobotPelanggaran[jenis]
        : "0";

  }

}


// =====================================================
// SIMPAN PELANGGARAN
// =====================================================

async function simpanPelanggaran() {

  if (!currentUser) {

    alert(
      "Sesi login tidak ditemukan."
    );

    return;

  }


  if (
    currentRole !== "gds"
  ) {

    alert(
      "Hanya Petugas GDS yang dapat mencatat pelanggaran."
    );

    return;

  }


  if (!siswaTerpilih) {

    alert(
      "Silakan pilih siswa terlebih dahulu."
    );

    return;

  }


  const tanggal =
    el("tanggalPelanggaran")?.value || "";


  const jenis =
    el("jenisPelanggaran")?.value || "";


  const rincian =
    el("rincianPelanggaran")?.value || "";


  const waktu =
    el("waktuPelanggaran")?.value || "";


  if (
    !tanggal ||
    !jenis ||
    !rincian ||
    !waktu
  ) {

    alert(
      "Lengkapi semua data pelanggaran."
    );

    return;

  }


  const bobot =
    bobotPelanggaran[jenis];


  if (!bobot) {

    alert(
      "Jenis pelanggaran tidak valid."
    );

    return;

  }


  const tombol =
    el("btnSimpanPelanggaran");


  if (tombol) {

    tombol.disabled = true;

    tombol.textContent =
      "Menyimpan...";

  }


  const status =
    el("statusSimpan");


  if (status) {

    status.textContent =
      "Menyimpan data...";

  }


  try {

    await addDoc(
      collection(
        db,
        "pelanggaran"
      ),
      {

        siswaId:
          siswaTerpilih.id,

        namaSiswa:
          siswaTerpilih.nama || "",

        nisn:
          siswaTerpilih.nisn || "",

        kelas:
          siswaTerpilih.kelas || "",

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
          currentUser.uid,

        petugasNama:
          currentUserData?.nama ||
          currentUser.email ||
          "",

        createdAt:
          serverTimestamp()

      }
    );


    if (status) {

      status.textContent =
        "Pelanggaran berhasil disimpan.";

    }


    // Reset form
    const rincianElement =
      el("rincianPelanggaran");


    if (rincianElement) {

      rincianElement.innerHTML =
        '<option value="">Pilih jenis terlebih dahulu</option>';

      rincianElement.disabled = true;

    }


    const jenisElement =
      el("jenisPelanggaran");


    if (jenisElement) {

      jenisElement.value = "";

    }


    const bobotElement =
      el("nilaiBobot");


    if (bobotElement) {

      bobotElement.textContent =
        "0";

    }


    await loadRiwayatGDS();


  } catch (error) {

    console.error(
      "GAGAL SIMPAN PELANGGARAN:",
      error
    );


    if (status) {

      status.textContent =
        "Gagal menyimpan data.";

    }


    if (
      error.code ===
      "permission-denied"
    ) {

      alert(
        "Firebase menolak penyimpanan. Periksa Firestore Rules."
      );

    } else {

      alert(
        "Gagal menyimpan pelanggaran ke Firebase."
      );

    }


  } finally {

    if (tombol) {

      tombol.disabled = false;

      tombol.textContent =
        "Simpan Pelanggaran";

    }

  }

}


// =====================================================
// LOAD RIWAYAT GDS
// =====================================================

async function loadRiwayatGDS() {

  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          "pelanggaran"
        )
      );


    const data = [];


    snapshot.forEach(
      item => {

        data.push({

          id: item.id,

          ...item.data()

        });

      }
    );


    data.sort(
      (a, b) => {

        const waktuA =
          `${a.tanggal || ""} ${a.waktu || ""}`;


        const waktuB =
          `${b.tanggal || ""} ${b.waktu || ""}`;


        return waktuB.localeCompare(
          waktuA
        );

      }
    );


    const container =
      el("riwayatPelanggaran");


    if (!container) {

      return;

    }


    if (data.length === 0) {

      container.innerHTML =
        "<p>Belum ada data pelanggaran.</p>";

      return;

    }


    container.innerHTML =
      data
        .slice(0, 10)
        .map(
          item => `

          <div class="violation-item">

            <strong>
              ${escapeHtml(
                item.namaSiswa || "-"
              )}
            </strong>

            <div>
              Kelas:
              ${escapeHtml(
                item.kelas || "-"
              )}
            </div>

            <div>
              ${formatTanggal(
                item.tanggal
              )}
              -
              ${escapeHtml(
                item.waktu || "-"
              )}
            </div>

            <div>
              ${escapeHtml(
                formatJenis(
                  item.jenis
                )
              )}
              :
              ${escapeHtml(
                item.rincian || "-"
              )}
            </div>

            <div>
              Bobot:
              <strong>
                ${escapeHtml(
                  item.bobot ?? 0
                )}
              </strong>
            </div>

          </div>

        `
        )
        .join("");


  } catch (error) {

    console.error(
      "GAGAL LOAD RIWAYAT:",
      error
    );

  }

}


// =====================================================
// LOAD PELANGGARAN GURU
// =====================================================

async function loadSemuaPelanggaranGuru() {

  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          "pelanggaran"
        )
      );


    semuaPelanggaran = [];


    snapshot.forEach(
      item => {

        semuaPelanggaran.push({

          id: item.id,

          ...item.data()

        });

      }
    );


  } catch (error) {

    console.error(
      "GAGAL LOAD PELANGGARAN GURU:",
      error
    );


    semuaPelanggaran = [];


    alert(
      "Gagal mengambil data pelanggaran dari Firebase."
    );

  }

}


// =====================================================
// FILTER KELAS
// =====================================================

function isiFilterKelas() {

  const select =
    el("filterKelas");


  if (!select) {

    return;

  }


  const kelasSet =
    new Set();


  semuaPelanggaran.forEach(
    item => {

      if (item.kelas) {

        kelasSet.add(
          String(item.kelas)
        );

      }

    }
  );


  const kelas =
    Array.from(
      kelasSet
    ).sort(
      (a, b) =>
        a.localeCompare(
          b,
          "id"
        )
    );


  select.innerHTML =
    '<option value="">Semua Kelas</option>';


  kelas.forEach(
    item => {

      const option =
        document.createElement(
          "option"
        );


      option.value = item;

      option.textContent = item;


      select.appendChild(
        option
      );

    }
  );

}


// =====================================================
// DATA TERFILTER
// =====================================================

function ambilDataTerfilter() {

  const kelas =
    el("filterKelas")?.value || "";


  const tanggalAwal =
    el("filterTanggalAwal")?.value || "";


  const tanggalAkhir =
    el("filterTanggalAkhir")?.value || "";


  return semuaPelanggaran.filter(
    item => {

      if (
        kelas &&
        String(item.kelas || "") !==
        String(kelas)
      ) {

        return false;

      }


      if (
        tanggalAwal &&
        String(item.tanggal || "") <
        tanggalAwal
      ) {

        return false;

      }


      if (
        tanggalAkhir &&
        String(item.tanggal || "") >
        tanggalAkhir
      ) {

        return false;

      }


      return true;

    }
  );

}


// =====================================================
// BUAT RANKING
// =====================================================

function buatRanking(data) {

  const kelompok = {};


  data.forEach(
    item => {

      const key =
        item.siswaId ||
        `${item.nisn || ""}_${item.namaSiswa || ""}`;


      if (!kelompok[key]) {

        kelompok[key] = {

          siswaId:
            item.siswaId || "",

          namaSiswa:
            item.namaSiswa || "",

          nisn:
            item.nisn || "",

          kelas:
            item.kelas || "",

          ringan: 0,

          sedang: 0,

          berat: 0,

          totalBobot: 0,

          pelanggaran: []

        };

      }


      if (
        item.jenis ===
        "ringan"
      ) {

        kelompok[key].ringan++;

      }


      if (
        item.jenis ===
        "sedang"
      ) {

        kelompok[key].sedang++;

      }


      if (
        item.jenis ===
        "berat"
      ) {

        kelompok[key].berat++;

      }


      kelompok[key].totalBobot +=
        Number(
          item.bobot || 0
        );


      kelompok[key].pelanggaran.push(
        item
      );

    }
  );


  const hasil =
    Object.values(
      kelompok
    );


  hasil.sort(
    (a, b) => {

      if (
        b.totalBobot !==
        a.totalBobot
      ) {

        return (
          b.totalBobot -
          a.totalBobot
        );

      }


      return String(
        a.namaSiswa
      ).localeCompare(
        String(b.namaSiswa),
        "id"
      );

    }
  );


  hasil.forEach(
    (item, index) => {

      item.peringkat =
        index + 1;

    }
  );


  return hasil;

}


// =====================================================
// TAMPILKAN REKAP GURU
// =====================================================

function tampilkanRekapGuru() {

  const data =
    ambilDataTerfilter();


  const ranking =
    buatRanking(data);


  // -----------------------------------------------
  // SUMMARY
  // -----------------------------------------------

  if (el("totalSiswa")) {

    el("totalSiswa").textContent =
      ranking.length;

  }


  if (el("totalRingan")) {

    el("totalRingan").textContent =
      data.filter(
        item =>
          item.jenis === "ringan"
      ).length;

  }


  if (el("totalSedang")) {

    el("totalSedang").textContent =
      data.filter(
        item =>
          item.jenis === "sedang"
      ).length;

  }


  if (el("totalBerat")) {

    el("totalBerat").textContent =
      data.filter(
        item =>
          item.jenis === "berat"
      ).length;

  }


  if (el("totalBobot")) {

    el("totalBobot").textContent =
      data.reduce(
        (total, item) =>
          total +
          Number(
            item.bobot || 0
          ),
        0
      );

  }


  if (el("jumlahDataRanking")) {

    el("jumlahDataRanking").textContent =
      `${ranking.length} siswa`;

  }


  // -----------------------------------------------
  // TABEL
  // -----------------------------------------------

  const tabel =
    el("tabelRanking");


  if (!tabel) {

    return;

  }


  if (ranking.length === 0) {

    tabel.innerHTML = `

      <div class="empty-state">

        Belum ada data pelanggaran.

      </div>

    `;

    return;

  }


  tabel.innerHTML = `

    <table>

      <thead>

        <tr>

          <th>
            No
          </th>

          <th>
            Nama Siswa
          </th>

          <th>
            Kelas
          </th>

          <th>
            Ringan
          </th>

          <th>
            Sedang
          </th>

          <th>
            Berat
          </th>

          <th>
            Total Bobot
          </th>

          <th>
            Aksi
          </th>

        </tr>

      </thead>

      <tbody>

        ${ranking
          .map(
            item => `

            <tr>

              <td>
                ${item.peringkat}
              </td>

              <td>

                <strong>
                  ${escapeHtml(
                    item.namaSiswa
                  )}
                </strong>

                <br>

                <small>
                  NISN:
                  ${escapeHtml(
                    item.nisn || "-"
                  )}
                </small>

              </td>

              <td>
                ${escapeHtml(
                  item.kelas || "-"
                )}
              </td>

              <td>
                ${item.ringan}
              </td>

              <td>
                ${item.sedang}
              </td>

              <td>
                ${item.berat}
              </td>

              <td>

                <strong>
                  ${item.totalBobot}
                </strong>

              </td>

              <td>

                <button
                  type="button"
                  class="btn btn-primary btn-detail-siswa"
                  data-siswa-id="${escapeHtml(
                    item.siswaId
                  )}"
                  data-nisn="${escapeHtml(
                    item.nisn || ""
                  )}"
                >
                  Detail
                </button>

              </td>

            </tr>

          `
          )
          .join("")}

      </tbody>

    </table>

  `;


  // Event tombol Detail
  tabel
    .querySelectorAll(
      ".btn-detail-siswa"
    )
    .forEach(
      tombol => {

        tombol.addEventListener(
          "click",
          () => {

            lihatDetailSiswa(
              tombol.dataset.siswaId,
              tombol.dataset.nisn
            );

          }
        );

      }
    );

}


// =====================================================
// DETAIL SISWA
// =====================================================

function lihatDetailSiswa(
  siswaId,
  nisn
) {

  const data =
    ambilDataTerfilter();


  const siswaData =
    data.filter(
      item => {

        if (siswaId) {

          return (
            item.siswaId ===
            siswaId
          );

        }


        return (
          String(
            item.nisn || ""
          ) ===
          String(
            nisn || ""
          )
        );

      }
    );


  if (
    siswaData.length === 0
  ) {

    alert(
      "Data pelanggaran siswa tidak ditemukan."
    );

    return;

  }


  const nama =
    siswaData[0].namaSiswa ||
    "-";


  const kelas =
    siswaData[0].kelas ||
    "-";


  const nisnSiswa =
    siswaData[0].nisn ||
    "-";


  const ringan =
    siswaData.filter(
      item =>
        item.jenis ===
        "ringan"
    ).length;


  const sedang =
    siswaData.filter(
      item =>
        item.jenis ===
        "sedang"
    ).length;


  const berat =
    siswaData.filter(
      item =>
        item.jenis ===
        "berat"
    ).length;


  const totalBobot =
    siswaData.reduce(
      (total, item) =>
        total +
        Number(
          item.bobot || 0
        ),
      0
    );


  // -----------------------------------------------
  // IDENTITAS
  // -----------------------------------------------

  if (el("detailNamaSiswa")) {

    el("detailNamaSiswa").textContent =
      nama;

  }


  if (el("detailIdentitas")) {

    el("detailIdentitas").innerHTML = `

      NISN:
      <strong>
        ${escapeHtml(
          nisnSiswa
        )}
      </strong>

      <br>

      Kelas:
      <strong>
        ${escapeHtml(
          kelas
        )}
      </strong>

    `;

  }


  if (el("detailRingan")) {

    el("detailRingan").textContent =
      ringan;

  }


  if (el("detailSedang")) {

    el("detailSedang").textContent =
      sedang;

  }


  if (el("detailBerat")) {

    el("detailBerat").textContent =
      berat;

  }


  if (el("detailTotalBobot")) {

    el("detailTotalBobot").textContent =
      totalBobot;

  }


  // -----------------------------------------------
  // DAFTAR PELANGGARAN
  // -----------------------------------------------

  const daftar =
    el("detailDaftarPelanggaran");


  if (daftar) {

    const dataUrut =
      [...siswaData].sort(
        (a, b) => {

          const waktuA =
            `${a.tanggal || ""} ${a.waktu || ""}`;


          const waktuB =
            `${b.tanggal || ""} ${b.waktu || ""}`;


          return waktuB.localeCompare(
            waktuA
          );

        }
      );


    daftar.innerHTML =
      dataUrut
        .map(
          item => `

          <div
            class="violation-detail-item"
            data-id="${escapeHtml(
              item.id
            )}"
          >

            <div>

              <strong>
                ${escapeHtml(
                  item.rincian ||
                  "-"
                )}
              </strong>

              <div>

                ${formatTanggal(
                  item.tanggal
                )}

                |

                ${escapeHtml(
                  item.waktu ||
                  "-"
                )}

              </div>

              <div>

                Jenis:

                <strong>
                  ${escapeHtml(
                    formatJenis(
                      item.jenis
                    )
                  )}
                </strong>

                |

                Bobot:

                <strong>
                  ${escapeHtml(
                    item.bobot ??
                    0
                  )}
                </strong>

              </div>

              <div>

                Petugas:

                ${escapeHtml(
                  item.petugasNama ||
                  "-"
                )}

              </div>

            </div>


            <div class="detail-action">

              <button
                type="button"
                class="btn btn-danger btn-hapus-pelanggaran"
                data-id="${escapeHtml(
                  item.id
                )}"
              >
                Hapus
              </button>

            </div>

          </div>

        `
        )
        .join("");


    // Event tombol Hapus
    daftar
      .querySelectorAll(
        ".btn-hapus-pelanggaran"
      )
      .forEach(
        tombol => {

          tombol.addEventListener(
            "click",
            () => {

              hapusPelanggaran(
                tombol.dataset.id
              );

            }
          );

        }
      );

  }


  // -----------------------------------------------
  // TAMPILKAN DETAIL
  // -----------------------------------------------

  setDisplay(
    "detailGuru",
    "block"
  );


  const panel =
    el("detailGuru");


  if (panel) {

    setTimeout(
      () => {

        panel.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      },
      100
    );

  }

}


// =====================================================
// HAPUS PELANGGARAN
// KHUSUS GURU
// =====================================================

async function hapusPelanggaran(
  pelanggaranId
) {

  if (
    currentRole !== "guru"
  ) {

    alert(
      "Hanya pengguna Guru yang dapat menghapus data."
    );

    return;

  }


  if (!pelanggaranId) {

    alert(
      "ID pelanggaran tidak ditemukan."
    );

    return;

  }


  const konfirmasi =
    confirm(
      "Apakah Anda yakin ingin menghapus data pelanggaran ini?\n\nData yang sudah dihapus tidak dapat dikembalikan."
    );


  if (!konfirmasi) {

    return;

  }


  try {

    await deleteDoc(
      doc(
        db,
        "pelanggaran",
        pelanggaranId
      )
    );


    alert(
      "Data pelanggaran berhasil dihapus."
    );


    // -----------------------------------------------
    // LOAD ULANG
    // -----------------------------------------------

    await loadSemuaPelanggaranGuru();


    isiFilterKelas();


    tampilkanRekapGuru();


    setDisplay(
      "detailGuru",
      "none"
    );


  } catch (error) {

    console.error(
      "GAGAL HAPUS PELANGGARAN:",
      error
    );


    if (
      error.code ===
      "permission-denied"
    ) {

      alert(
        "Firebase menolak penghapusan. Periksa Firestore Rules."
      );

    } else {

      alert(
        "Gagal menghapus data pelanggaran."
      );

    }

  }

}


// =====================================================
// TUTUP DETAIL
// =====================================================

function tutupDetail() {

  setDisplay(
    "detailGuru",
    "none"
  );

}


// =====================================================
// EVENT LISTENER
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    // -----------------------------------------------
    // LOGIN FORM
    // -----------------------------------------------

    const loginForm =
      el("loginForm");


    if (loginForm) {

      loginForm.addEventListener(
        "submit",
        event => {

           console.log("DOM siap");

    tampilkanLogin();

          event.preventDefault();

          prosesLogin();

        }
      );

    }


    // -----------------------------------------------
    // LOGOUT GDS
    // -----------------------------------------------

    const logoutGds =
      el("logoutGds");


    if (logoutGds) {

      logoutGds.addEventListener(
        "click",
        prosesLogout
      );

    }


    // -----------------------------------------------
    // LOGOUT GURU
    // -----------------------------------------------

    const logoutGuru =
      el("logoutGuru");


    if (logoutGuru) {

      logoutGuru.addEventListener(
        "click",
        prosesLogout
      );

    }


    // -----------------------------------------------
    // CARI SISWA
    // -----------------------------------------------

    const cari =
      el("cariSiswa");


    if (cari) {

      cari.addEventListener(
        "input",
        cariSiswa
      );

    }


    // -----------------------------------------------
    // GANTI SISWA
    // -----------------------------------------------

    const ganti =
      el("btnGantiSiswa");


    if (ganti) {

      ganti.addEventListener(
        "click",
        gantiSiswa
      );

    }


    // -----------------------------------------------
    // JENIS PELANGGARAN
    // -----------------------------------------------

    const jenis =
      el("jenisPelanggaran");


    if (jenis) {

      jenis.addEventListener(
        "change",
        ubahJenisPelanggaran
      );

    }


    // -----------------------------------------------
    // SIMPAN
    // -----------------------------------------------

    const simpan =
      el("btnSimpanPelanggaran");


    if (simpan) {

      simpan.addEventListener(
        "click",
        simpanPelanggaran
      );

    }


    // -----------------------------------------------
    // FILTER
    // -----------------------------------------------

    const rekap =
      el("btnTampilkanRekap");


    if (rekap) {

      rekap.addEventListener(
        "click",
        tampilkanRekapGuru
      );

    }


    // -----------------------------------------------
    // TUTUP DETAIL
    // -----------------------------------------------

    const tutup =
      el("btnTutupDetail");


    if (tutup) {

      tutup.addEventListener(
        "click",
        tutupDetail
      );

    }


    // -----------------------------------------------
    // DEFAULT TANGGAL
    // -----------------------------------------------

    const tanggal =
      el("tanggalPelanggaran");


    if (tanggal) {

      const sekarang =
        new Date();


      const tahun =
        sekarang.getFullYear();


      const bulan =
        String(
          sekarang.getMonth() + 1
        ).padStart(
          2,
          "0"
        );


      const hari =
        String(
          sekarang.getDate()
        ).padStart(
          2,
          "0"
        );


      tanggal.value =
        `${tahun}-${bulan}-${hari}`;

    }


    // -----------------------------------------------
    // DEFAULT WAKTU
    // -----------------------------------------------

    const waktu =
      el("waktuPelanggaran");


    if (waktu) {

      const sekarang =
        new Date();


      const jam =
        String(
          sekarang.getHours()
        ).padStart(
          2,
          "0"
        );


      const menit =
        String(
          sekarang.getMinutes()
        ).padStart(
          2,
          "0"
        );


      waktu.value =
        `${jam}:${menit}`;

    }


    // -----------------------------------------------
    // INIT TAMPILAN
    // -----------------------------------------------

    // Jangan menyembunyikan login
    // pada saat halaman pertama kali dibuka.

    if (
      !auth.currentUser
    ) {

      tampilkanLogin();

    }

  }
);


// =====================================================
// SERVICE WORKER
// =====================================================

if (
  "serviceWorker" in navigator
) {

  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register("./sw.js")
        .then(
          registration => {

            console.log(
              "Service Worker berhasil:",
              registration.scope
            );

          }
        )
        .catch(
          error => {

            console.error(
              "Service Worker gagal:",
              error
            );

          }
        );

    }
  );

}


// =====================================================
// DEBUG
// =====================================================

console.log(
  "Aplikasi Pelanggaran Siswa berhasil memuat app.js"
);
