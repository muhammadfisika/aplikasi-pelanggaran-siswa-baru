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
// GANTI DENGAN CONFIG FIREBASE ANDA
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

  if (value === null || value === undefined) {
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

  const parts = tanggal.split("-");

  if (parts.length !== 3) {
    return tanggal;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


function formatJenis(jenis) {

  if (!jenis) {
    return "-";
  }

  return jenis.charAt(0).toUpperCase() + jenis.slice(1);
}


function setDisplay(id, display) {

  const element = el(id);

  if (element) {
    element.style.display = display;
  }
}


// =====================================================
// HALAMAN
// =====================================================

function tampilkanLogin() {

  setDisplay("loginPage", "block");
  setDisplay("gdsPage", "none");
  setDisplay("guruPage", "none");
}


function tampilkanGDS() {

  setDisplay("loginPage", "none");
  setDisplay("gdsPage", "block");
  setDisplay("guruPage", "none");
}


function tampilkanGuru() {

  setDisplay("loginPage", "none");
  setDisplay("gdsPage", "none");
  setDisplay("guruPage", "block");
}


// =====================================================
// LOGIN
// =====================================================

async function prosesLogin() {

  const email = el("email")?.value.trim();
  const password = el("password")?.value;

  const errorBox = el("loginError");

  if (errorBox) {
    errorBox.textContent = "";
  }

  if (!email || !password) {

    if (errorBox) {
      errorBox.textContent =
        "Email dan password harus diisi.";
    }

    return;
  }

  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

  } catch (error) {

    console.error(error);

    if (errorBox) {

      errorBox.textContent =
        "Login gagal. Periksa email dan password.";
    }
  }
}


// =====================================================
// LOGOUT
// =====================================================

async function prosesLogout() {

  try {

    await signOut(auth);

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

  const userRef = doc(
    db,
    "users",
    uid
  );

  const snapshot = await getDoc(userRef);

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

onAuthStateChanged(auth, async user => {

  if (!user) {

    currentUser = null;
    currentRole = null;
    currentUserData = null;

    tampilkanLogin();

    return;
  }

  try {

    currentUser = user;

    currentUserData =
      await ambilDataUser(user.uid);

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
      ).toLowerCase();

    // -----------------------------------------------
    // GDS
    // -----------------------------------------------

    if (currentRole === "gds") {

      tampilkanGDS();

      if (el("gdsUserName")) {

        el("gdsUserName").textContent =
          currentUserData.nama ||
          user.email ||
          "Petugas GDS";
      }

      await loadSemuaSiswa();

      await loadRiwayatGDS();

      return;
    }


    // -----------------------------------------------
    // GURU
    // -----------------------------------------------

    if (currentRole === "guru") {

      tampilkanGuru();

      if (el("guruUserName")) {

        el("guruUserName").textContent =
          currentUserData.nama ||
          user.email ||
          "Guru";
      }

      await loadSemuaPelanggaranGuru();

      isiFilterKelas();

      tampilkanRekapGuru();

      return;
    }


    alert(
      "Role pengguna tidak dikenali."
    );

    await signOut(auth);

  } catch (error) {

    console.error(
      "Kesalahan saat memuat pengguna:",
      error
    );

    alert(
      "Gagal memuat data pengguna."
    );
  }

});


// =====================================================
// LOAD SEMUA SISWA
// =====================================================

async function loadSemuaSiswa() {

  try {

    const snapshot =
      await getDocs(
        collection(db, "siswa")
      );

    semuaSiswa = [];

    snapshot.forEach(item => {

      semuaSiswa.push({
        id: item.id,
        ...item.data()
      });

    });

    semuaSiswa.sort((a, b) =>
      String(a.nama || "")
        .localeCompare(
          String(b.nama || ""),
          "id"
        )
    );

  } catch (error) {

    console.error(
      "Gagal mengambil data siswa:",
      error
    );

    alert(
      "Gagal mengambil data siswa dari Firebase."
    );
  }
}


// =====================================================
// PENCARIAN SISWA
// =====================================================

function cariSiswa() {

  const keyword =
    el("cariSiswa")?.value
      .trim()
      .toLowerCase() || "";

  const container =
    el("hasilPencarian");

  if (!container) {
    return;
  }

  if (!keyword) {

    container.innerHTML =
      "<p>Masukkan nama atau NISN siswa.</p>";

    return;
  }

  const hasil =
    semuaSiswa.filter(siswa => {

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
    });


  if (hasil.length === 0) {

    container.innerHTML =
      "<p>Siswa tidak ditemukan.</p>";

    return;
  }


  container.innerHTML =
    hasil.map(siswa => `

      <div class="student-result">

        <div>
          <strong>
            ${escapeHtml(siswa.nama)}
          </strong>

          <div>
            NISN:
            ${escapeHtml(siswa.nisn || "-")}
          </div>

          <div>
            Kelas:
            ${escapeHtml(siswa.kelas || "-")}
          </div>
        </div>

        <button
          type="button"
          class="btn btn-primary"
          onclick="pilihSiswa('${siswa.id}')"
        >
          Pilih
        </button>

      </div>

    `).join("");
}


// =====================================================
// PILIH SISWA
// =====================================================

window.pilihSiswa = function(id) {

  const siswa =
    semuaSiswa.find(
      item => item.id === id
    );

  if (!siswa) {
    return;
  }

  siswaTerpilih = siswa;

  if (el("namaSiswaTerpilih")) {

    el("namaSiswaTerpilih").textContent =
      siswa.nama || "-";
  }

  if (el("detailSiswaTerpilih")) {

    el("detailSiswaTerpilih").innerHTML = `

      NISN:
      <strong>
        ${escapeHtml(siswa.nisn || "-")}
      </strong>

      <br>

      Kelas:
      <strong>
        ${escapeHtml(siswa.kelas || "-")}
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

  if (el("statusSimpan")) {
    el("statusSimpan").textContent = "";
  }
};


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

  if (el("cariSiswa")) {
    el("cariSiswa").focus();
  }
}


// =====================================================
// JENIS PELANGGARAN
// =====================================================

function ubahJenisPelanggaran() {

  const jenis =
    el("jenisPelanggaran")?.value;

  const rincian =
    el("rincianPelanggaran");

  const bobot =
    el("nilaiBobot");


  if (!rincian) {
    return;
  }


  rincian.innerHTML =
    '<option value="">-- Pilih rincian --</option>';


  if (
    jenis &&
    daftarPelanggaran[jenis]
  ) {

    daftarPelanggaran[jenis]
      .forEach(item => {

        const option =
          document.createElement("option");

        option.value = item;
        option.textContent = item;

        rincian.appendChild(option);

      });
  }


  if (bobot) {

    bobot.value =
      jenis
        ? bobotPelanggaran[jenis]
        : "";
  }
}


// =====================================================
// SIMPAN PELANGGARAN
// =====================================================

async function simpanPelanggaran() {

  if (!siswaTerpilih) {

    alert(
      "Silakan pilih siswa terlebih dahulu."
    );

    return;
  }


  const tanggal =
    el("tanggalPelanggaran")?.value;

  const jenis =
    el("jenisPelanggaran")?.value;

  const rincian =
    el("rincianPelanggaran")?.value;

  const waktu =
    el("waktuPelanggaran")?.value;


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
  }


  if (el("statusSimpan")) {

    el("statusSimpan").textContent =
      "Menyimpan...";
  }


  try {

    await addDoc(
      collection(db, "pelanggaran"),
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
          currentUserData.nama ||
          currentUser.email ||
          "",

        createdAt:
          serverTimestamp()
      }
    );


    if (el("statusSimpan")) {

      el("statusSimpan").textContent =
        "Pelanggaran berhasil disimpan.";
    }


    // Reset rincian
    if (el("rincianPelanggaran")) {

      el("rincianPelanggaran").value =
        "";
    }


    await loadRiwayatGDS();


  } catch (error) {

    console.error(
      "Gagal menyimpan pelanggaran:",
      error
    );

    if (el("statusSimpan")) {

      el("statusSimpan").textContent =
        "Gagal menyimpan data.";
    }

    alert(
      "Gagal menyimpan pelanggaran ke Firebase."
    );

  } finally {

    if (tombol) {
      tombol.disabled = false;
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
        collection(db, "pelanggaran")
      );

    const data = [];

    snapshot.forEach(item => {

      data.push({
        id: item.id,
        ...item.data()
      });

    });


    data.sort((a, b) => {

      const waktuA =
        `${a.tanggal || ""} ${a.waktu || ""}`;

      const waktuB =
        `${b.tanggal || ""} ${b.waktu || ""}`;

      return waktuB.localeCompare(waktuA);
    });


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
      data.slice(0, 10)
        .map(item => `

          <div class="violation-item">

            <strong>
              ${escapeHtml(item.namaSiswa)}
            </strong>

            <div>
              Kelas:
              ${escapeHtml(item.kelas || "-")}
            </div>

            <div>
              ${formatTanggal(item.tanggal)}
              -
              ${escapeHtml(item.waktu || "-")}
            </div>

            <div>
              ${escapeHtml(
                formatJenis(item.jenis)
              )}
              :
              ${escapeHtml(item.rincian)}
            </div>

            <div>
              Bobot:
              <strong>
                ${escapeHtml(item.bobot)}
              </strong>
            </div>

          </div>

        `).join("");


  } catch (error) {

    console.error(
      "Gagal memuat riwayat:",
      error
    );
  }
}


// =====================================================
// LOAD DATA PELANGGARAN GURU
// =====================================================

async function loadSemuaPelanggaranGuru() {

  try {

    const snapshot =
      await getDocs(
        collection(db, "pelanggaran")
      );

    semuaPelanggaran = [];

    snapshot.forEach(item => {

      semuaPelanggaran.push({
        id: item.id,
        ...item.data()
      });

    });


  } catch (error) {

    console.error(
      "Gagal mengambil data pelanggaran:",
      error
    );

    alert(
      "Gagal mengambil data pelanggaran."
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


  semuaPelanggaran.forEach(item => {

    if (item.kelas) {
      kelasSet.add(item.kelas);
    }

  });


  const kelas =
    Array.from(kelasSet)
      .sort((a, b) =>
        String(a).localeCompare(
          String(b),
          "id"
        )
      );


  select.innerHTML =
    '<option value="">Semua Kelas</option>';


  kelas.forEach(item => {

    const option =
      document.createElement("option");

    option.value = item;
    option.textContent = item;

    select.appendChild(option);

  });
}


// =====================================================
// AMBIL DATA TERFILTER
// =====================================================

function ambilDataTerfilter() {

  const kelas =
    el("filterKelas")?.value || "";

  const tanggalAwal =
    el("filterTanggalAwal")?.value || "";

  const tanggalAkhir =
    el("filterTanggalAkhir")?.value || "";


  return semuaPelanggaran.filter(item => {

    if (
      kelas &&
      item.kelas !== kelas
    ) {
      return false;
    }


    if (
      tanggalAwal &&
      item.tanggal < tanggalAwal
    ) {
      return false;
    }


    if (
      tanggalAkhir &&
      item.tanggal > tanggalAkhir
    ) {
      return false;
    }


    return true;
  });
}


// =====================================================
// BUAT RANKING
// =====================================================

function buatRanking(data) {

  const kelompok = {};


  data.forEach(item => {

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
      item.jenis === "ringan"
    ) {

      kelompok[key].ringan++;

    } else if (
      item.jenis === "sedang"
    ) {

      kelompok[key].sedang++;

    } else if (
      item.jenis === "berat"
    ) {

      kelompok[key].berat++;
    }


    kelompok[key].totalBobot +=
      Number(item.bobot || 0);


    kelompok[key].pelanggaran.push(item);

  });


  const hasil =
    Object.values(kelompok);


  hasil.sort((a, b) => {

    if (
      b.totalBobot !==
      a.totalBobot
    ) {

      return (
        b.totalBobot -
        a.totalBobot
      );
    }


    return String(a.namaSiswa)
      .localeCompare(
        String(b.namaSiswa),
        "id"
      );
  });


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

  const totalSiswa =
    ranking.length;


  const totalRingan =
    data.filter(
      item => item.jenis === "ringan"
    ).length;


  const totalSedang =
    data.filter(
      item => item.jenis === "sedang"
    ).length;


  const totalBerat =
    data.filter(
      item => item.jenis === "berat"
    ).length;


  const totalBobot =
    data.reduce(
      (total, item) =>
        total + Number(item.bobot || 0),
      0
    );


  if (el("totalSiswa")) {
    el("totalSiswa").textContent =
      totalSiswa;
  }

  if (el("totalRingan")) {
    el("totalRingan").textContent =
      totalRingan;
  }

  if (el("totalSedang")) {
    el("totalSedang").textContent =
      totalSedang;
  }

  if (el("totalBerat")) {
    el("totalBerat").textContent =
      totalBerat;
  }

  if (el("totalBobot")) {
    el("totalBobot").textContent =
      totalBobot;
  }


  if (el("jumlahDataRanking")) {

    el("jumlahDataRanking").textContent =
      `${ranking.length} siswa`;
  }


  // -----------------------------------------------
  // TABEL RANKING
  // -----------------------------------------------

  const tabel =
    el("tabelRanking");

  if (!tabel) {
    return;
  }


  if (ranking.length === 0) {

    tabel.innerHTML = `

      <tr>
        <td colspan="7">
          Belum ada data pelanggaran.
        </td>
      </tr>

    `;

    return;
  }


  tabel.innerHTML =
    ranking.map(item => `

      <tr>

        <td>
          ${item.peringkat}
        </td>

        <td>
          <strong>
            ${escapeHtml(item.namaSiswa)}
          </strong>

          <br>

          <small>
            NISN:
            ${escapeHtml(item.nisn || "-")}
          </small>
        </td>

        <td>
          ${escapeHtml(item.kelas || "-")}
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

          <br>

          <button
            type="button"
            class="btn btn-primary"
            onclick="lihatDetailSiswa('${escapeHtml(item.siswaId)}','${escapeHtml(item.nisn)}')"
          >
            Detail
          </button>

        </td>

      </tr>

    `).join("");
}


// =====================================================
// LIHAT DETAIL SISWA
// =====================================================

window.lihatDetailSiswa =
  function(siswaId, nisn) {

    const data =
      ambilDataTerfilter();


    const siswaData =
      data.filter(item => {

        return (
          (siswaId &&
            item.siswaId === siswaId) ||

          (!siswaId &&
            String(item.nisn || "") ===
            String(nisn || ""))
        );

      });


    if (siswaData.length === 0) {

      alert(
        "Data pelanggaran siswa tidak ditemukan."
      );

      return;
    }


    const nama =
      siswaData[0].namaSiswa || "-";

    const kelas =
      siswaData[0].kelas || "-";

    const nisnSiswa =
      siswaData[0].nisn || "-";


    const ringan =
      siswaData.filter(
        item => item.jenis === "ringan"
      ).length;


    const sedang =
      siswaData.filter(
        item => item.jenis === "sedang"
      ).length;


    const berat =
      siswaData.filter(
        item => item.jenis === "berat"
      ).length;


    const totalBobot =
      siswaData.reduce(
        (total, item) =>
          total + Number(item.bobot || 0),
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
          ${escapeHtml(nisnSiswa)}
        </strong>

        <br>

        Kelas:
        <strong>
          ${escapeHtml(kelas)}
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

      siswaData.sort((a, b) => {

        const waktuA =
          `${a.tanggal || ""} ${a.waktu || ""}`;

        const waktuB =
          `${b.tanggal || ""} ${b.waktu || ""}`;

        return waktuB.localeCompare(waktuA);

      });


      daftar.innerHTML =
        siswaData.map(item => `

          <div
            class="violation-detail-item"
            id="pelanggaran-${item.id}"
          >

            <div>

              <strong>
                ${escapeHtml(item.rincian)}
              </strong>

              <div>
                ${formatTanggal(item.tanggal)}
                |
                ${escapeHtml(item.waktu || "-")}
              </div>

              <div>
                Jenis:
                <strong>
                  ${escapeHtml(
                    formatJenis(item.jenis)
                  )}
                </strong>

                |
                Bobot:
                <strong>
                  ${escapeHtml(item.bobot)}
                </strong>
              </div>

              <div>
                Petugas:
                ${escapeHtml(
                  item.petugasNama || "-"
                )}
              </div>

            </div>


            <!-- TOMBOL HAPUS KHUSUS GURU -->

            <div class="detail-action">

              <button
                type="button"
                class="btn btn-danger"
                onclick="hapusPelanggaran('${item.id}')"
              >
                Hapus
              </button>

            </div>

          </div>

        `).join("");
    }


    // -----------------------------------------------
    // TAMPILKAN PANEL DETAIL
    // -----------------------------------------------

    setDisplay(
      "detailGuru",
      "block"
    );

    const panel =
      el("detailGuru");

    if (panel) {

      panel.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

  };


// =====================================================
// HAPUS PELANGGARAN
// =====================================================

window.hapusPelanggaran =
  async function(pelanggaranId) {

    // -------------------------------------------------
    // KEAMANAN SISI CLIENT
    // -------------------------------------------------

    if (currentRole !== "guru") {

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


    // -------------------------------------------------
    // KONFIRMASI
    // -------------------------------------------------

    const konfirmasi =
      confirm(
        "Apakah Anda yakin ingin menghapus data pelanggaran ini?\n\nData yang sudah dihapus tidak dapat dikembalikan."
      );


    if (!konfirmasi) {
      return;
    }


    try {

      // -------------------------------------------------
      // HAPUS FIRESTORE
      // -------------------------------------------------

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


      // -------------------------------------------------
      // AMBIL ULANG DATA
      // -------------------------------------------------

      await loadSemuaPelanggaranGuru();


      isiFilterKelas();


      tampilkanRekapGuru();


      // Tutup detail
      setDisplay(
        "detailGuru",
        "none"
      );


    } catch (error) {

      console.error(
        "Gagal menghapus pelanggaran:",
        error
      );


      if (
        error.code ===
        "permission-denied"
      ) {

        alert(
          "Firebase menolak penghapusan. Pastikan Firestore Rules sudah diperbarui."
        );

      } else {

        alert(
          "Gagal menghapus data pelanggaran."
        );
      }
    }

  };


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

    // LOGIN
    const btnLogin =
      el("btnLogin");

    if (btnLogin) {

      btnLogin.addEventListener(
        "click",
        prosesLogin
      );
    }


    // LOGOUT GDS
    const btnLogoutGDS = document.getElementById("logoutGds");

if (btnLogoutGDS) {
  btnLogoutGDS.addEventListener(
    "click",
    prosesLogout
  );
}


    // LOGOUT GURU
    const btnLogoutGuru = document.getElementById("logoutGuru");

if (btnLogoutGuru) {
  btnLogoutGuru.addEventListener(
    "click",
    prosesLogout
  );
}


    // CARI SISWA
    const inputCari =
      el("cariSiswa");

    if (inputCari) {

      inputCari.addEventListener(
        "input",
        cariSiswa
      );
    }


    // GANTI SISWA
    const btnGanti =
      el("btnGantiSiswa");

    if (btnGanti) {

      btnGanti.addEventListener(
        "click",
        gantiSiswa
      );
    }


    // JENIS PELANGGARAN
    const jenis =
      el("jenisPelanggaran");

    if (jenis) {

      jenis.addEventListener(
        "change",
        ubahJenisPelanggaran
      );
    }


    // SIMPAN
    const btnSimpan =
      el("btnSimpanPelanggaran");

    if (btnSimpan) {

      btnSimpan.addEventListener(
        "click",
        simpanPelanggaran
      );
    }


    // FILTER REKAP
    const btnRekap =
      el("btnTampilkanRekap");

    if (btnRekap) {

      btnRekap.addEventListener(
        "click",
        tampilkanRekapGuru
      );
    }


    // TUTUP DETAIL
    const btnTutup =
      el("btnTutupDetail");

    if (btnTutup) {

      btnTutup.addEventListener(
        "click",
        tutupDetail
      );
    }


    // TANGGAL DEFAULT GDS
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
        ).padStart(2, "0");

      const hari =
        String(
          sekarang.getDate()
        ).padStart(2, "0");

      tanggal.value =
        `${tahun}-${bulan}-${hari}`;
    }


    // WAKTU DEFAULT
    const waktu =
      el("waktuPelanggaran");

    if (waktu) {

      const sekarang =
        new Date();

      const jam =
        String(
          sekarang.getHours()
        ).padStart(2, "0");

      const menit =
        String(
          sekarang.getMinutes()
        ).padStart(2, "0");

      waktu.value =
        `${jam}:${menit}`;
    }

  }
);



