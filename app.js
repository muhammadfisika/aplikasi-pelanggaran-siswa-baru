// =====================================================
// FIREBASE
// =====================================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

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
// INITIALIZE
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
// GDS ELEMENT
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
// GURU ELEMENT
// =====================================================

const filterKelas =
  document.getElementById("filterKelas");

const filterTanggalAwal =
  document.getElementById(
    "filterTanggalAwal"
  );

const filterTanggalAkhir =
  document.getElementById(
    "filterTanggalAkhir"
  );

const btnTampilkanRekap =
  document.getElementById(
    "btnTampilkanRekap"
  );

const statusRekap =
  document.getElementById(
    "statusRekap"
  );

const totalSiswa =
  document.getElementById(
    "totalSiswa"
  );

const totalRingan =
  document.getElementById(
    "totalRingan"
  );

const totalSedang =
  document.getElementById(
    "totalSedang"
  );

const totalBerat =
  document.getElementById(
    "totalBerat"
  );

const totalBobot =
  document.getElementById(
    "totalBobot"
  );

const jumlahDataRanking =
  document.getElementById(
    "jumlahDataRanking"
  );

const tabelRanking =
  document.getElementById(
    "tabelRanking"
  );

const detailGuru =
  document.getElementById(
    "detailGuru"
  );

const detailNamaSiswa =
  document.getElementById(
    "detailNamaSiswa"
  );

const detailIdentitas =
  document.getElementById(
    "detailIdentitas"
  );

const detailRingan =
  document.getElementById(
    "detailRingan"
  );

const detailSedang =
  document.getElementById(
    "detailSedang"
  );

const detailBerat =
  document.getElementById(
    "detailBerat"
  );

const detailTotalBobot =
  document.getElementById(
    "detailTotalBobot"
  );

const detailDaftarPelanggaran =
  document.getElementById(
    "detailDaftarPelanggaran"
  );

const btnTutupDetail =
  document.getElementById(
    "btnTutupDetail"
  );


// =====================================================
// DATA
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


let semuaSiswa = [];

let semuaPelanggaran = [];

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


function showGds(data) {

  hideAllPages();

  gdsPage.classList.remove("hidden");

  gdsUserName.textContent =
    data.nama ||
    data.email ||
    "Petugas GDS";

}


function showGuru(data) {

  hideAllPages();

  guruPage.classList.remove("hidden");

  guruUserName.textContent =
    data.nama ||
    data.email ||
    "Guru";

}


// =====================================================
// LOGIN
// =====================================================

loginForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    loginError.textContent = "";

    const email =
      emailInput.value.trim();

    const password =
      passwordInput.value;


    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    }

    catch (error) {

      console.error(
        error
      );

      loginError.textContent =
        "Email atau password salah.";

    }

  }
);


// =====================================================
// AUTH STATE
// =====================================================

onAuthStateChanged(
  auth,
  async user => {

    if (!user) {

      currentUserData = null;

      showLogin();

      return;

    }


    try {

      const userSnap =
        await getDoc(
          doc(
            db,
            "users",
            user.uid
          )
        );


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
        currentUserData.role === "gds"
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
        currentUserData.role === "guru"
      ) {

        showGuru(
          currentUserData
        );

        await loadDataGuru();

        return;

      }


      await signOut(auth);

      showLogin();

    }

    catch (error) {

      console.error(
        error
      );

      await signOut(auth);

      showLogin();

    }

  }
);


// =====================================================
// LOAD SISWA
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

        const data =
          item.data();


        semuaSiswa.push({

          id:
            item.id,

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

  }

  catch (error) {

    console.error(
      error
    );

  }

}


// =====================================================
// SEARCH SISWA
// =====================================================

cariSiswa.addEventListener(
  "input",
  () => {

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
        .filter(
          siswa =>
            siswa.nama
              .toLowerCase()
              .includes(keyword)
            ||
            siswa.nisn
              .toLowerCase()
              .includes(keyword)
        )
        .slice(0, 20);


    if (!hasil.length) {

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
            · Kelas
            ${escapeHtml(siswa.kelas)}
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
  () => {

    siswaDipilih = null;

    siswaTerpilih.classList.add(
      "hidden"
    );

    formPelanggaran.classList.add(
      "hidden"
    );

  }
);


// =====================================================
// JENIS PELANGGARAN
// =====================================================

jenisPelanggaran.addEventListener(
  "change",
  () => {

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
        `<option>
          Pilih jenis terlebih dahulu
        </option>`;

      return;

    }


    rincianPelanggaran.disabled =
      false;


    rincianPelanggaran.innerHTML =
      `<option value="">
        -- Pilih Rincian --
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
            .appendChild(option);

        }
      );

  }
);


// =====================================================
// SIMPAN PELANGGARAN
// =====================================================

btnSimpanPelanggaran.addEventListener(
  "click",
  async () => {

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


    if (
      !tanggal ||
      !jenis ||
      !rincian ||
      !waktu
    ) {

      tampilkanStatus(
        "Lengkapi semua data.",
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

          tanggal,

          waktu,

          jenis,

          rincian,

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


      await loadRiwayatPelanggaran();

    }

    catch (error) {

      console.error(
        error
      );

      tampilkanStatus(
        "Gagal menyimpan pelanggaran.",
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
// RIWAYAT GDS
// =====================================================

async function loadRiwayatPelanggaran() {

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
      (a, b) =>
        getTanggalUrut(b)
        -
        getTanggalUrut(a)
    );


    const dataTerbaru =
      data.slice(0, 10);


    if (!dataTerbaru.length) {

      riwayatPelanggaran.innerHTML =
        "<p>Belum ada data.</p>";

      return;

    }


    riwayatPelanggaran.innerHTML =
      "";


    dataTerbaru.forEach(
      data => {

        const item =
          document.createElement(
            "div"
          );


        item.className =
          "riwayat-item";


        item.innerHTML = `

          <strong>
            ${escapeHtml(
              data.namaSiswa
            )}
          </strong>

          <div class="riwayat-detail">

            Kelas:
            ${escapeHtml(
              data.kelas
            )}

            <br>

            ${escapeHtml(
              data.tanggal
            )}
            ·
            ${escapeHtml(
              data.waktu
            )}

            <br>

            <span class="badge
              badge-${escapeHtml(
                data.jenis
              )}">

              ${escapeHtml(
                data.jenis
              ).toUpperCase()}

            </span>

            Bobot:
            ${Number(data.bobot || 0)}

            <br>

            ${escapeHtml(
              data.rincian
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
      error
    );

    riwayatPelanggaran.innerHTML =
      "<p>Gagal memuat data.</p>";

  }

}


// =====================================================
// GURU - LOAD DATA
// =====================================================

async function loadDataGuru() {

  try {

    statusRekap.textContent =
      "Memuat data...";


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

          id:
            item.id,

          ...item.data()

        });

      }
    );


    isiFilterKelas();

    tampilkanRanking();


    statusRekap.textContent =
      "";

  }

  catch (error) {

    console.error(
      error
    );

    statusRekap.textContent =
      "Gagal mengambil data pelanggaran.";

    statusRekap.className =
      "status-message status-error";

  }

}


// =====================================================
// FILTER KELAS
// =====================================================

function isiFilterKelas() {

  const kelasSet =
    new Set();


  semuaPelanggaran.forEach(
    data => {

      if (data.kelas) {

        kelasSet.add(
          data.kelas
        );

      }

    }
  );


  const kelasArray =
    Array.from(kelasSet)
      .sort(
        (a, b) =>
          a.localeCompare(
            b,
            "id"
          )
      );


  filterKelas.innerHTML =
    `<option value="">
      Semua Kelas
    </option>`;


  kelasArray.forEach(
    kelas => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        kelas;

      option.textContent =
        kelas;

      filterKelas.appendChild(
        option
      );

    }
  );

}


// =====================================================
// TAMPILKAN RANKING
// =====================================================

function tampilkanRanking() {

  const dataFilter =
    ambilDataTerfilter();


  const ranking =
    buatRanking(
      dataFilter
    );


  updateRingkasan(
    dataFilter,
    ranking
  );


  renderRanking(
    ranking
  );

}


// =====================================================
// AMBIL DATA FILTER
// =====================================================

function ambilDataTerfilter() {

  const kelas =
    filterKelas.value;

  const tanggalAwal =
    filterTanggalAwal.value;

  const tanggalAkhir =
    filterTanggalAkhir.value;


  return semuaPelanggaran
    .filter(
      data => {

        if (
          kelas &&
          data.kelas !== kelas
        ) {

          return false;

        }


        if (
          tanggalAwal &&
          data.tanggal < tanggalAwal
        ) {

          return false;

        }


        if (
          tanggalAkhir &&
          data.tanggal > tanggalAkhir
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

  const map =
    new Map();


  data.forEach(
    item => {

      const key =
        item.siswaId ||
        `${item.nisn}_${item.namaSiswa}`;


      if (!map.has(key)) {

        map.set(
          key,
          {

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

            detail: []

          }
        );

      }


      const siswa =
        map.get(key);


      const jenis =
        item.jenis;


      if (
        jenis === "ringan"
      ) {

        siswa.ringan++;

      }

      else if (
        jenis === "sedang"
      ) {

        siswa.sedang++;

      }

      else if (
        jenis === "berat"
      ) {

        siswa.berat++;

      }


      siswa.totalBobot +=
        Number(
          item.bobot || 0
        );


      siswa.detail.push(
        item
      );

    }
  );


  const hasil =
    Array.from(
      map.values()
    );


  hasil.forEach(
    siswa => {

      siswa.detail.sort(
        (a, b) =>
          getTanggalUrut(b)
          -
          getTanggalUrut(a)
      );

    }
  );


  hasil.sort(
    (a, b) => {

      if (
        b.totalBobot !==
        a.totalBobot
      ) {

        return (
          b.totalBobot
          -
          a.totalBobot
        );

      }


      return a.namaSiswa
        .localeCompare(
          b.namaSiswa,
          "id"
        );

    }
  );


  hasil.forEach(
    (siswa, index) => {

      siswa.ranking =
        index + 1;

    }
  );


  return hasil;

}


// =====================================================
// RINGKASAN
// =====================================================

function updateRingkasan(
  data,
  ranking
) {

  let ringan = 0;

  let sedang = 0;

  let berat = 0;

  let bobot = 0;


  data.forEach(
    item => {

      if (
        item.jenis === "ringan"
      ) {

        ringan++;

      }

      if (
        item.jenis === "sedang"
      ) {

        sedang++;

      }

      if (
        item.jenis === "berat"
      ) {

        berat++;

      }


      bobot +=
        Number(
          item.bobot || 0
        );

    }
  );


  totalSiswa.textContent =
    ranking.length;

  totalRingan.textContent =
    ringan;

  totalSedang.textContent =
    sedang;

  totalBerat.textContent =
    berat;

  totalBobot.textContent =
    bobot;

  jumlahDataRanking.textContent =
    `${ranking.length} siswa`;

}


// =====================================================
// RENDER RANKING
// =====================================================

function renderRanking(
  ranking
) {

  if (!ranking.length) {

    tabelRanking.innerHTML =

      `<div class="empty-data">
        Tidak ada data pelanggaran
        sesuai filter.
      </div>`;

    return;

  }


  let html = `

    <table class="ranking-table">

      <thead>

        <tr>

          <th>
            Ranking
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

        </tr>

      </thead>

      <tbody>
  `;


  ranking.forEach(
    siswa => {

      html += `

        <tr>

          <td>
            <span class="rank-number">
              ${siswa.ranking}
            </span>
          </td>

          <td>

            <span
              class="student-name"
              data-siswa-id="${escapeHtml(
                siswa.siswaId
              )}">

              ${escapeHtml(
                siswa.namaSiswa
              )}

            </span>

          </td>

          <td>
            ${escapeHtml(
              siswa.kelas
            )}
          </td>

          <td>
            ${siswa.ringan}
          </td>

          <td>
            ${siswa.sedang}
          </td>

          <td>
            ${siswa.berat}
          </td>

          <td>

            <span class="total-score">

              ${siswa.totalBobot}

            </span>

          </td>

        </tr>

      `;

    }
  );


  html += `

      </tbody>

    </table>

  `;


  tabelRanking.innerHTML =
    html;


  document
    .querySelectorAll(
      ".student-name"
    )
    .forEach(
      element => {

        element.addEventListener(
          "click",
          () => {

            const id =
              element.dataset.siswaId;


            const siswa =
              ranking.find(
                item =>
                  item.siswaId === id
              );


            if (siswa) {

              tampilkanDetailSiswa(
                siswa
              );

            }

          }
        );

      }
    );

}


// =====================================================
// DETAIL SISWA
// =====================================================

function tampilkanDetailSiswa(
  siswa
) {

  detailGuru.classList.remove(
    "hidden"
  );


  detailNamaSiswa.textContent =
    siswa.namaSiswa;


  detailIdentitas.textContent =
    `NISN ${siswa.nisn} · Kelas ${siswa.kelas}`;


  detailRingan.textContent =
    siswa.ringan;

  detailSedang.textContent =
    siswa.sedang;

  detailBerat.textContent =
    siswa.berat;

  detailTotalBobot.textContent =
    siswa.totalBobot;


  detailDaftarPelanggaran
    .innerHTML = "";


  if (!siswa.detail.length) {

    detailDaftarPelanggaran.innerHTML =
      "<p>Tidak ada detail.</p>";

    return;

  }


  siswa.detail.forEach(
    item => {

      const div =
        document.createElement(
          "div"
        );


      div.className =
        "detail-item";


      div.innerHTML = `

        <strong>

          ${escapeHtml(
            item.rincian || "-"
          )}

        </strong>


        <small>

          ${escapeHtml(
            item.tanggal || "-"
          )}

          ·

          ${escapeHtml(
            item.waktu || "-"
          )}

          ·

          ${escapeHtml(
            item.jenis || "-"
          ).toUpperCase()}

          · Bobot

          ${Number(
            item.bobot || 0
          )}

        </small>

      `;


      detailDaftarPelanggaran
        .appendChild(div);

    }
  );


  detailGuru.scrollIntoView({
    behavior: "smooth"
  });

}


// =====================================================
// FILTER BUTTON
// =====================================================

btnTampilkanRekap.addEventListener(
  "click",
  () => {

    const awal =
      filterTanggalAwal.value;

    const akhir =
      filterTanggalAkhir.value;


    if (
      awal &&
      akhir &&
      awal > akhir
    ) {

      statusRekap.textContent =
        "Tanggal awal tidak boleh lebih besar dari tanggal akhir.";

      statusRekap.className =
        "status-message status-error";

      return;

    }


    statusRekap.textContent =
      "";


    tampilkanRanking();

  }
);


// =====================================================
// CLOSE DETAIL
// =====================================================

btnTutupDetail.addEventListener(
  "click",
  () => {

    detailGuru.classList.add(
      "hidden"
    );

  }
);


// =====================================================
// DEFAULT DATE
// =====================================================

function setTanggalDanWaktuDefault() {

  const now =
    new Date();


  const tanggal =
    now.toISOString()
      .slice(0, 10);


  const waktu =
    now.toTimeString()
      .slice(0, 5);


  if (
    tanggalPelanggaran
  ) {

    tanggalPelanggaran.value =
      tanggal;

  }


  if (
    waktuPelanggaran
  ) {

    waktuPelanggaran.value =
      waktu;

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


  if (
    tipe === "success"
  ) {

    statusSimpan.classList.add(
      "status-success"
    );

  }


  if (
    tipe === "error"
  ) {

    statusSimpan.classList.add(
      "status-error"
    );

  }

}


// =====================================================
// TANGGAL URUT
// =====================================================

function getTanggalUrut(
  data
) {

  const tanggal =
    data.tanggal || "1970-01-01";

  const waktu =
    data.waktu || "00:00";


  return new Date(
    `${tanggal}T${waktu}:00`
  ).getTime();

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(
  value
) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    String(
      value ?? ""
    );


  return div.innerHTML;

}


// =====================================================
// LOGOUT
// =====================================================

logoutGds.addEventListener(
  "click",
  async () => {

    await signOut(auth);

  }
);


logoutGuru.addEventListener(
  "click",
  async () => {

    await signOut(auth);

  }
);
