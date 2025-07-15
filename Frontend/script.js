const cities = ["Bangalore", "Mumbai", "Pune", "Delhi"];
const container = document.getElementById("cities-container");

cities.forEach(city => {
  const card = document.createElement("div");
  card.className = "city-card";
  card.textContent = city;
  card.onclick = () => {
    window.location.href = `workshops.html?city=${encodeURIComponent(city)}`;
  };
  container.appendChild(card);
});

      const query = new URLSearchParams(window.location.search);
      const city = query.get("city");
  
      const workshopTimes = [
        "8:30 AM - 10:30 AM",
        "12:00 PM - 2:00 PM",
        "2:30 PM - 4:30 PM",
        "5:00 PM - 7:00 PM"
      ];
  
      document.getElementById("title").textContent = `${city} Workshops`;
  
      const containers = document.getElementById("workshops");

      workshopTimes.forEach((slot, index) => {
        const div = document.createElement("div");
        div.className = "workshop-card";
        div.innerHTML = `
          <h3>Show ${index + 1}</h3>
          <div class="slot">
            <span>${slot}</span>
            <span>Seats Available: <strong>80</strong></span>
            <button onclick="bookSlot('${city}', ${index})">Book Now</button>
          </div>
        `;
        containers.appendChild(div);
      });
  
      function bookSlot(city, index) {
        window.location.href = `payment.html?city=${encodeURIComponent(city)}&show=${index + 1}`;
      }
  
  