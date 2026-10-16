emailjs.init({ publicKey: "Iiw4shCYDWsBmcH21" });
const SERVICE_ID = "service_r7gvdkp";
const TEMPLATE_ID = "template_r4rclbq";

const movies = [
  { name: "Space Odyssey", price: 150, times: ["10:00 AM", "6:00 PM"] },
  { name: "Laugh Out Loud", price: 120, times: ["11:00 AM", "7:30 PM"] },
  { name: "Midnight Chase", price: 200, times: ["12:00 PM", "9:00 PM"] }
];
let bookings = [];
let nextId = 1;

const movieEl = document.getElementById("movie");
const timeEl = document.getElementById("time");
const qtyEl = document.getElementById("qty");
const emailEl = document.getElementById("email");
const totalEl = document.getElementById("total");
const msgEl = document.getElementById("msg");
const listEl = document.getElementById("list");

function showMsg(text, type) {
  msgEl.textContent = text;
  msgEl.className = type;
}

// Fill movie dropdown
movies.forEach((m, i) => movieEl.add(new Option(m.name + " - ₹" + m.price, i)));

// Fill showtimes for selected movie
function fillTimes() {
  timeEl.innerHTML = "";
  movies[movieEl.value].times.forEach(t => timeEl.add(new Option(t, t)));
  updateTotal();
}

// Quantity must be a positive whole number
function getQty() {
  const text = qtyEl.value.trim();
  return /^[1-9]\d*$/.test(text) ? Number(text) : null;
}

function updateTotal() {
  const qty = getQty();
  const total = qty ? qty * movies[movieEl.value].price : 0;
  totalEl.textContent = "Total: ₹" + total;
}

function showBookings() {
  const term = document.getElementById("search").value.toLowerCase();
  listEl.innerHTML = "";
  bookings
    .filter(b => (b.movie + b.time + b.email).toLowerCase().includes(term))
    .forEach(b => {
      const div = document.createElement("div");
      div.className = "booking";
      div.textContent = `#${b.id} ${b.movie} | ${b.time} | ${b.qty} tickets | ₹${b.total} | ${b.email}`;
      const btn = document.createElement("button");
      btn.textContent = "Cancel";
      btn.onclick = () => {
        bookings = bookings.filter(x => x.id !== b.id);
        showBookings();
        showMsg("Booking cancelled.", "success");
      };
      div.appendChild(btn);
      listEl.appendChild(div);
    });
  document.getElementById("count").textContent = bookings.length;
}

movieEl.addEventListener("change", fillTimes);
qtyEl.addEventListener("input", updateTotal);
document.getElementById("search").addEventListener("input", showBookings);

document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("form").reset();
  fillTimes();
  showMsg("", "");
});

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const qty = getQty();
  const email = emailEl.value.trim();

  if (qty === null) return showMsg("Tickets must be a positive whole number.", "error");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showMsg("Enter a valid email.", "error");

  const movie = movies[movieEl.value];
  const booking = { id: nextId, movie: movie.name, time: timeEl.value, qty, total: qty * movie.price, email };

  const btn = document.getElementById("bookBtn");
  btn.disabled = true;
  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      to_email: email,
      movie: booking.movie,
      showtime: booking.time,
      quantity: qty,
      total_price: "₹" + booking.total
    });
    bookings.push(booking);
    nextId++;
    showBookings();
    document.getElementById("form").reset();
    fillTimes();
    showMsg("Booked! Confirmation email sent.", "success");
} catch (err) {
console.log(err.status, err.text);
  showMsg("Email failed: " + (err.text || err.message), "error");
} 
  btn.disabled = false;
});

fillTimes();