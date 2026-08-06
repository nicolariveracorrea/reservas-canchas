const toast = document.getElementById("toast");
const waNumberInput = document.getElementById("waNumber");
const bookingForm = document.getElementById("bookingForm");
const bookingDateInput = document.getElementById("bookingDate");
const courtSelect = document.getElementById("courtSelect");
const timeSelect = document.getElementById("timeSelect");
const customerNameInput = document.getElementById("customerName");
const customerPhoneInput = document.getElementById("customerPhone");
const customerEmailInput = document.getElementById("customerEmail");
const totalReservationsEl = document.getElementById("totalReservations");
const availableCourtsEl = document.getElementById("availableCourts");
const availabilityList = document.getElementById("availabilityList");
const reserveMainBtn = document.getElementById("reserveMainBtn");
const reservationsChart = document.getElementById("reservationsChart");
const n8nWebhookUrl = window.RESERVAS_CONFIG?.n8nWebhookUrl?.trim() || "";

const PRICE = 100000;
const OPEN_HOUR = 8;
const CLOSE_HOUR = 22;
const TOTAL_COURTS = 10;

const courtState = Array.from({ length: TOTAL_COURTS }, (_, idx) => ({
  number: idx + 1,
  reservations: [],
}));
let reservationCount = 0;
const reservationsByHour = {};

for (let hour = OPEN_HOUR; hour < CLOSE_HOUR; hour += 1) {
  reservationsByHour[hour] = 0;
}

const formatPrice = (value) =>
  value.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

const sanitizePhone = (phone) => phone.replace(/\D/g, "");
const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

const notifyN8n = (reservation) => {
  if (!n8nWebhookUrl) return;

  fetch(n8nWebhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reservation),
  }).catch(() => {
    showToast("La reserva fue enviada por WhatsApp. No fue posible notificar a n8n.");
  });
};

const getSelectedDate = () => bookingDateInput.value;
const getSelectedHour = () => Number(timeSelect.value);
const isCourtReserved = (court, bookingDate, selectedHour) =>
  court.reservations.some(
    (reservation) =>
      reservation.date === bookingDate && reservation.hour === selectedHour
  );

const toHourLabel = (hour) => {
  const suffix = hour >= 12 ? "p.m." : "a.m.";
  let normalHour = hour % 12;
  if (normalHour === 0) normalHour = 12;
  return `${normalHour}:00 ${suffix}`;
};

const buildHourOptions = () => {
  const options = [];
  for (let hour = OPEN_HOUR; hour < CLOSE_HOUR; hour += 1) {
    options.push({
      value: String(hour),
      label: `${toHourLabel(hour)} - ${toHourLabel(hour + 1)}`,
    });
  }
  return options;
};

const setupDateField = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const today = `${yyyy}-${mm}-${dd}`;

  bookingDateInput.min = today;
  bookingDateInput.value = today;
};

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
};

const renderTimeOptions = () => {
  const options = buildHourOptions();
  timeSelect.innerHTML = options
    .map((option) => `<option value="${option.value}">${option.label}</option>`)
    .join("");
};

const renderCourtOptions = () => {
  const selectedCourtNumber = Number(courtSelect.value);
  const bookingDate = getSelectedDate();
  const selectedHour = getSelectedHour();
  const available = courtState.filter(
    (court) => !isCourtReserved(court, bookingDate, selectedHour)
  );
  courtSelect.innerHTML = available
    .map((court) => `<option value="${court.number}">Cancha ${court.number}</option>`)
    .join("");

  if (available.some((court) => court.number === selectedCourtNumber)) {
    courtSelect.value = String(selectedCourtNumber);
  }

  const allReserved = available.length === 0;
  courtSelect.disabled = allReserved;
  timeSelect.disabled = allReserved;
  reserveMainBtn.disabled = allReserved;

  if (allReserved) {
    courtSelect.innerHTML = '<option value="">No hay canchas disponibles</option>';
  }
};

const renderAvailability = () => {
  const bookingDate = getSelectedDate();
  const selectedHour = getSelectedHour();
  const range = `${toHourLabel(selectedHour)} - ${toHourLabel(selectedHour + 1)}`;

  availabilityList.innerHTML = courtState
    .map((court) => {
      if (!isCourtReserved(court, bookingDate, selectedHour)) {
        return `<article class="availability-item available">Cancha ${court.number}<small>Disponible: ${range}</small></article>`;
      }
      return `<article class="availability-item reserved">Cancha ${court.number}<small>Reservada: ${range}</small></article>`;
    })
    .join("");
};

const updateDashboard = () => {
  const bookingDate = getSelectedDate();
  const selectedHour = getSelectedHour();
  const availableCount = courtState.filter(
    (court) => !isCourtReserved(court, bookingDate, selectedHour)
  ).length;
  totalReservationsEl.textContent = String(reservationCount);
  availableCourtsEl.textContent = String(availableCount);
};

const renderReservationsChart = () => {
  const hours = Object.keys(reservationsByHour).map(Number);
  const maxReservations = Math.max(1, ...Object.values(reservationsByHour));

  if (hours.length === 0) {
    reservationsChart.innerHTML = '<p class="line-empty">Sin datos de reservas.</p>';
    return;
  }

  const width = 780;
  const height = 230;
  const padLeft = 24;
  const padRight = 16;
  const padTop = 20;
  const padBottom = 34;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;
  const stepX = hours.length > 1 ? plotWidth / (hours.length - 1) : 0;

  const points = hours.map((hour, index) => {
    const value = reservationsByHour[hour];
    const x = padLeft + index * stepX;
    const y = padTop + (1 - value / maxReservations) * plotHeight;
    return { hour, value, x, y };
  });

  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(" ");

  const grid = [0, 0.25, 0.5, 0.75, 1]
    .map((ratio) => {
      const y = padTop + ratio * plotHeight;
      return `<line class="line-grid" x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}" />`;
    })
    .join("");

  const pointNodes = points
    .map(
      (point) => `
      <circle class="line-point" cx="${point.x}" cy="${point.y}" r="4" />
      <text class="line-point-label" x="${point.x}" y="${point.y - 8}" text-anchor="middle">${point.value}</text>
      <text class="line-x-label" x="${point.x}" y="${height - 10}" text-anchor="middle">${toHourLabel(point.hour).replace(":00 ", "")}</text>
    `
    )
    .join("");

  reservationsChart.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Grafico de lineas de personas reservadas por horario">
      ${grid}
      <line class="line-axis" x1="${padLeft}" y1="${height - padBottom}" x2="${width - padRight}" y2="${height - padBottom}" />
      <polyline class="line-path" points="${polylinePoints}" />
      ${pointNodes}
    </svg>
  `;
};

const openWhatsAppReservation = (
  courtNumber,
  selectedHour,
  bookingDate,
  customerName,
  customerPhone,
  customerEmail
) => {
  const waNumber = sanitizePhone(waNumberInput.value || "");

  if (!waNumber || waNumber.length < 10) {
    showToast("Ingresa un numero de WhatsApp valido (ejemplo: 573001112233)");
    waNumberInput.focus();
    return;
  }

  const range = `${toHourLabel(selectedHour)} - ${toHourLabel(selectedHour + 1)}`;
  const message = [
    "Hola, quiero reservar una cancha.",
    `Persona: ${reservationCount + 1}`,
    `Nombre: ${customerName}`,
    `Fecha: ${bookingDate}`,
    `Cancha: ${courtNumber}`,
    `Horario: ${range}`,
    `Telefono: ${customerPhone}`,
    `Correo: ${customerEmail}`,
    `Precio: ${formatPrice(PRICE)} por hora`,
  ].join("\n");

  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, "_blank", "noopener,noreferrer");
  return range;
};

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedCourtNumber = Number(courtSelect.value);
  const selectedHour = Number(timeSelect.value);
  const bookingDate = bookingDateInput.value;
  const customerName = (customerNameInput.value || "").trim();
  const customerPhone = sanitizePhone(customerPhoneInput.value || "");
  const customerEmail = (customerEmailInput.value || "").trim();
  const selectedCourt = courtState.find((court) => court.number === selectedCourtNumber);

  if (!bookingDate) {
    showToast("Selecciona una fecha para reservar.");
    bookingDateInput.focus();
    return;
  }

  if (!customerName) {
    showToast("Ingresa tu nombre.");
    customerNameInput.focus();
    return;
  }

  if (!customerPhone || customerPhone.length < 7) {
    showToast("Ingresa un telefono valido.");
    customerPhoneInput.focus();
    return;
  }

  if (!isValidEmail(customerEmail)) {
    showToast("Ingresa un correo valido.");
    customerEmailInput.focus();
    return;
  }

  const reservationDateTime = new Date(`${bookingDate}T${String(selectedHour).padStart(2, "0")}:00:00`);
  const now = new Date();
  const fifteenMinutesMs = 15 * 60 * 1000;

  if (reservationDateTime.getTime() - now.getTime() < fifteenMinutesMs) {
    showToast("Debes reservar con minimo 15 minutos de anticipacion.");
    return;
  }

  if (!selectedCourt || isCourtReserved(selectedCourt, bookingDate, selectedHour)) {
    showToast("Esa cancha ya no esta disponible, elige otra.");
    renderCourtOptions();
    return;
  }

  const range = openWhatsAppReservation(
    selectedCourtNumber,
    selectedHour,
    bookingDate,
    customerName,
    customerPhone,
    customerEmail
  );
  if (!range) {
    return;
  }

  selectedCourt.reservations.push({ date: bookingDate, hour: selectedHour });
  reservationCount += 1;
  reservationsByHour[selectedHour] += 1;
  notifyN8n({
    event: "reservation.created",
    reservationId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    customerName,
    customerPhone,
    customerEmail,
    courtNumber: selectedCourtNumber,
    bookingDate,
    startHour: selectedHour,
    endHour: selectedHour + 1,
    price: PRICE,
  });

  renderCourtOptions();
  renderAvailability();
  updateDashboard();
  renderReservationsChart();
  showToast(`Reserva enviada para Cancha ${selectedCourtNumber}`);
});

bookingDateInput.addEventListener("change", () => {
  renderCourtOptions();
  renderAvailability();
  updateDashboard();
});
timeSelect.addEventListener("change", () => {
  renderCourtOptions();
  renderAvailability();
  updateDashboard();
});

setupDateField();
renderTimeOptions();
renderCourtOptions();
renderAvailability();
updateDashboard();
renderReservationsChart();
