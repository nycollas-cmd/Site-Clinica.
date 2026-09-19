const ADMIN_EMAIL = 'julianamorais00@icloud.com';
const STORAGE_KEY = 'trychoderme-clinic-state-v1';

const defaultState = {
  appointments: [],
  services: [],
  logins: [],
  whatsappMembers: 0,
  currentUser: null,
};

const state = loadState();

const authScreen = document.getElementById('authScreen');
const appPage = document.getElementById('appPage');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const bookingForm = document.getElementById('bookingForm');
const bookingMessage = document.getElementById('bookingMessage');
const bookingService = document.getElementById('bookingService');
const selectedServiceInfo = document.getElementById('selectedServiceInfo');
const serviceForm = document.getElementById('serviceForm');
const serviceNameInput = document.getElementById('serviceName');
const servicePriceInput = document.getElementById('servicePrice');
const serviceIdInput = document.getElementById('serviceId');
const serviceSubmitBtn = document.getElementById('serviceSubmitBtn');
const cancelEditServiceBtn = document.getElementById('cancelEditService');
const adminDashboard = document.getElementById('dashboard');

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultState, ...JSON.parse(saved) } : { ...defaultState };
  } catch (error) {
    return { ...defaultState };
  }
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function isLoggedIn() {
  return Boolean(state.currentUser);
}

function renderAuth() {
  if (isLoggedIn()) {
    authScreen.classList.add('hidden');
    appPage.classList.remove('hidden');
  } else {
    authScreen.classList.remove('hidden');
    appPage.classList.add('hidden');
  }
}

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatTime(timeString) {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function renderServiceCards() {
  const container = document.getElementById('serviceCards');

  if (!state.services.length) {
    container.innerHTML = '<article class="service-card empty-card"><h3>Nenhum serviço cadastrado</h3><p>Cadastre as opções de cabelo, pele, unha e outros serviços no painel administrativo.</p></article>';
    return;
  }

  container.innerHTML = state.services
    .map(
      (service) => `
        <article class="service-card">
          <div class="service-icon">✦</div>
          <h3>${service.name}</h3>
          <p>Serviço disponível</p>
          <span>R$ ${Number(service.price || 0).toFixed(2).replace('.', ',')}</span>
        </article>
      `
    )
    .join('');
}

function renderSelectedServiceInfo() {
  const selectedValue = bookingService.value;
  const service = state.services.find((item) => item.id === selectedValue);

  if (!service) {
    selectedServiceInfo.textContent = 'Selecione um serviço para ver o preço.';
    return;
  }

  selectedServiceInfo.textContent = `Preço: R$ ${Number(service.price || 0).toFixed(2).replace('.', ',')}`;
}

function renderServiceSelect() {
  bookingService.innerHTML = state.services.length
    ? '<option value="">Selecione o serviço</option>' + state.services.map((service) => `<option value="${service.id}">${service.name}</option>`).join('')
    : '<option value="">Cadastre primeiro um serviço</option>';

  renderSelectedServiceInfo();
}

function renderServiceList() {
  const serviceList = document.getElementById('serviceList');

  if (!state.services.length) {
    serviceList.innerHTML = '<li class="empty-row">Nenhuma opção cadastrada.</li>';
    return;
  }

  serviceList.innerHTML = state.services
    .map(
      (service) => `
        <li class="manager-item">
          <div>
            <strong>${service.name}</strong>
            <span>R$ ${Number(service.price || 0).toFixed(2).replace('.', ',')}</span>
          </div>
          <div class="actions">
            <button type="button" data-service-action="edit" data-service-id="${service.id}">Editar</button>
            <button type="button" data-service-action="delete" data-service-id="${service.id}">Excluir</button>
          </div>
        </li>
      `
    )
    .join('');
}

function renderAppointments() {
  const appointmentsList = document.getElementById('appointmentsList');
  const appointmentsCount = document.getElementById('appointmentsCount');
  const todayCount = document.getElementById('todayCount');
  const loginCount = document.getElementById('loginCount');
  const whatsappCount = document.getElementById('whatsappCount');
  const groupMembersValue = document.getElementById('groupMembersValue');

  appointmentsCount.textContent = String(state.appointments.length);
  loginCount.textContent = String(state.logins.length);
  whatsappCount.textContent = String(state.whatsappMembers);
  groupMembersValue.textContent = String(state.whatsappMembers);

  const today = new Date().toISOString().split('T')[0];
  todayCount.textContent = String(state.appointments.filter((appointment) => appointment.date === today).length);

  if (!state.appointments.length) {
    appointmentsList.textContent = 'Nenhum agendamento cadastrado.';
    appointmentsList.classList.add('empty-state');
    return;
  }

  appointmentsList.classList.remove('empty-state');
  appointmentsList.innerHTML = state.appointments
    .slice()
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
    .map(
      (appointment) => `
        <div class="appointment-item">
          <div>
            <strong>${appointment.name}</strong>
            <span>${appointment.service}</span>
          </div>
          <div class="meta">
            <time>${formatDate(appointment.date)} • ${formatTime(appointment.time)}</time>
            <span>${appointment.category}</span>
          </div>
        </div>
      `
    )
    .join('');
}

function renderLoginList() {
  const loginList = document.getElementById('loginList');

  if (!state.logins.length) {
    loginList.innerHTML = '<li class="empty-row">Nenhum login registrado.</li>';
    return;
  }

  loginList.innerHTML = state.logins
    .map(
      (login) => `
        <li class="manager-item small-manager-item">
          <div>
            <strong>${login.email}</strong>
            <span>${login.date}</span>
          </div>
        </li>
      `
    )
    .join('');
}

function resetServiceForm() {
  serviceForm.reset();
  serviceIdInput.value = '';
  serviceSubmitBtn.textContent = 'Adicionar opção';
  cancelEditServiceBtn.classList.add('hidden');
}

function renderAdminDashboard() {
  const isAdmin = state.currentUser === ADMIN_EMAIL;
  adminDashboard.classList.toggle('hidden-admin', !isAdmin);
}

function buildServiceCatalog() {
  renderServiceCards();
  renderServiceList();
  renderServiceSelect();
}

function addLoginEntry(email) {
  const now = new Date();
  const entry = {
    email,
    date: now.toLocaleString('pt-BR'),
  };
  state.logins = [entry, ...state.logins].slice(0, 30);
  persistState();
  renderLoginList();
  renderAppointments();
}

function conflictExists(dateString, timeString, idToIgnore = null) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const newDateTime = new Date(`${dateString}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);

  for (const item of state.appointments) {
    if (idToIgnore && item.id === idToIgnore) continue;
    if (item.date !== dateString) continue;

    const [existingHours, existingMinutes] = item.time.split(':').map(Number);
    const existingDateTime = new Date(`${item.date}T${String(existingHours).padStart(2, '0')}:${String(existingMinutes).padStart(2, '0')}:00`);
    const differenceInMinutes = Math.abs((newDateTime.getTime() - existingDateTime.getTime()) / 60000);

    if (differenceInMinutes <= 90) {
      return true;
    }
  }

  return false;
}

function handleBookingSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('clientName').value.trim();
  const selectedId = bookingService.value;
  const date = document.getElementById('bookingDate').value;
  const time = document.getElementById('bookingTime').value;
  const selectedService = state.services.find((service) => service.id === selectedId);

  if (!name || !selectedId || !date || !time) {
    bookingMessage.textContent = 'Preencha todos os campos antes de confirmar.';
    bookingMessage.classList.add('error');
    return;
  }

  if (!selectedService) {
    bookingMessage.textContent = 'Selecione um serviço válido.';
    bookingMessage.classList.add('error');
    return;
  }

  if (conflictExists(date, time)) {
    bookingMessage.textContent = 'Já existe um agendamento para este horário.';
    bookingMessage.classList.add('error');
    return;
  }

  state.appointments.push({
    id: crypto.randomUUID(),
    name,
    category: 'Serviço',
    service: selectedService.name,
    price: Number(selectedService.price || 0),
    date,
    time,
  });

  persistState();
  renderAppointments();
  bookingForm.reset();
  renderSelectedServiceInfo();
  bookingMessage.textContent = 'Agendamento confirmado com sucesso.';
  bookingMessage.classList.remove('error');
}

function handleLoginSubmit(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value.trim();

  if (!email || !password) {
    loginError.textContent = 'Informe o e-mail e a senha.';
    return;
  }

  state.currentUser = email;
  addLoginEntry(email);
  loginForm.reset();
  loginError.textContent = '';
  renderAuth();
  renderAdminDashboard();
}

function logout() {
  state.currentUser = null;
  persistState();
  renderAuth();
}

function handleServiceFormSubmit(event) {
  event.preventDefault();

  const id = serviceIdInput.value;
  const name = serviceNameInput.value.trim();
  const price = Number(servicePriceInput.value);

  if (!name || !Number.isFinite(price) || price < 0) {
    return;
  }

  if (id) {
    const currentService = state.services.find((item) => item.id === id);
    if (currentService) {
      currentService.name = name;
      currentService.price = Number(price.toFixed(2));
    }
  } else {
    state.services.push({
      id: crypto.randomUUID(),
      name,
      price: Number(price.toFixed(2)),
    });
  }

  persistState();
  buildServiceCatalog();
  resetServiceForm();
}

function handleServiceActions(event) {
  const target = event.target.closest('[data-service-action]');
  if (!target) return;

  const serviceId = target.dataset.serviceId;
  const action = target.dataset.serviceAction;

  const service = state.services.find((item) => item.id === serviceId);
  if (!service) return;

  if (action === 'delete') {
    state.services = state.services.filter((item) => item.id !== serviceId);
    persistState();
    buildServiceCatalog();
    return;
  }

  if (action === 'edit') {
    serviceIdInput.value = service.id;
    serviceNameInput.value = service.name;
    servicePriceInput.value = service.price;
    serviceSubmitBtn.textContent = 'Salvar edição';
    cancelEditServiceBtn.classList.remove('hidden');
    serviceNameInput.focus();
  }
}

bookingService.addEventListener('change', renderSelectedServiceInfo);
bookingForm.addEventListener('submit', handleBookingSubmit);
loginForm.addEventListener('submit', handleLoginSubmit);
logoutBtn.addEventListener('click', () => {
  state.currentUser = null;
  persistState();
  renderAuth();
  renderAdminDashboard();
});
serviceForm.addEventListener('submit', handleServiceFormSubmit);
document.getElementById('serviceList').addEventListener('click', handleServiceActions);
cancelEditServiceBtn.addEventListener('click', resetServiceForm);

renderAuth();
renderAdminDashboard();
renderServiceCards();
renderServiceList();
renderAppointments();
renderLoginList();
renderServiceSelect();
