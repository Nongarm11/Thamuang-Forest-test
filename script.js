const SUPABASE_URL = "https://jqmztdkvovkoiteoxtfq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9npyP88HRER20i0wwpjIhg_PaT6AIJM";
const DEV_EMAIL = "armlnwza227@gmail.com";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let surveys = [], isDeveloper = false, schoolMap, selectedMarker;

function initializeMap() {
  schoolMap = L.map("schoolMap").setView([13.96, 99.64], 16);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(schoolMap);
  schoolMap.on("click", (e) => {
    if(selectedMarker) schoolMap.removeLayer(selectedMarker);
    selectedMarker = L.marker(e.latlng).addTo(schoolMap);
    document.getElementById("latitude").value = e.latlng.lat;
    document.getElementById("longitude").value = e.latlng.lng;
  });
}

async function loadSurveys() {
  const { data } = await supabaseClient.from("tree_surveys").select("*");
  surveys = data || [];
  document.getElementById("totalTrees").innerText = surveys.length;
  renderTable();
}

function renderTable() {
  const body = document.getElementById("treeTableBody");
  body.innerHTML = surveys.map(t => `
    <tr>
      <td>${t.tree_name}</td><td>${t.tree_type}</td><td>${t.survey_area}</td>
      <td>${t.latitude ? `<a href="https://maps.google.com/?q=${t.latitude},${t.longitude}" target="_blank">ดู</a>` : "-"}</td>
      <td>${t.surveyed_by}</td>
      <td>${isDeveloper ? `<button class="delete-btn" onclick="deleteTree(${t.id})">ลบ</button>` : "-"}</td>
    </tr>
  `).join("");
}

document.getElementById("surveyForm").onsubmit = async (e) => {
  e.preventDefault();
  const data = {
    tree_name: document.getElementById("treeName").value,
    tree_type: document.getElementById("treeType").value,
    survey_area: document.getElementById("surveyArea").value,
    surveyed_by: document.getElementById("surveyedBy").value,
    latitude: document.getElementById("latitude").value,
    longitude: document.getElementById("longitude").value
  };
  await supabaseClient.from("tree_surveys").insert([data]);
  loadSurveys();
  alert("บันทึกข้อมูลเรียบร้อย");
};

document.getElementById("developerLoginForm").onsubmit = async (e) => {
  e.preventDefault();
  const { data } = await supabaseClient.auth.signInWithPassword({
    email: document.getElementById("developerEmail").value,
    password: document.getElementById("developerPassword").value
  });
  if(data.user?.email === DEV_EMAIL) {
    isDeveloper = true;
    document.getElementById("developerModal").classList.remove("show");
    renderTable();
  } else alert("ไม่ใช่บัญชี Dev");
};

async function deleteTree(id) {
  await supabaseClient.from("tree_surveys").delete().eq("id", id);
  loadSurveys();
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(btn.dataset.page).classList.add('active');
  };
});

document.getElementById("developerButton").onclick = () => document.getElementById("developerModal").classList.add("show");
document.getElementById("developerLogoutButton").onclick = () => { supabaseClient.auth.signOut(); isDeveloper = false; location.reload(); };

initializeMap();
loadSurveys();
