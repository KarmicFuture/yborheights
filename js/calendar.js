(function () {
  var monthLabel = document.getElementById("calMonthLabel");
  var grid = document.getElementById("calGrid");
  var list = document.getElementById("calEventList");
  var prevBtn = document.getElementById("calPrev");
  var nextBtn = document.getElementById("calNext");
  var filterSelect = document.getElementById("calFilter");
  var selectedDateEl = document.getElementById("calSelectedDate");

  if (!monthLabel || !grid || !list) return;

  var MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  var WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var viewYear = today.getFullYear();
  var viewMonth = today.getMonth();
  var selectedKey = formatKey(today);

  var oneOffEvents = [
    {
      date: "2026-07-26",
      title: "Untold Stories walking tour",
      time: "9:00 AM",
      place: "Cuscaden Pool front lawn",
      category: "nearby",
      note: "Historian-led walk of V.M. Ybor / shared park edge. Free; limited to 25.",
      link: "https://vmybor.org/untold-stories"
    },
    {
      date: "2026-07-30",
      title: "Untold Stories film & story booth",
      time: "6:00–9:30 PM",
      place: "Centro Asturiano Theater, 1913 N. Nebraska Ave",
      category: "nearby",
      note: "Documentary screening plus community discussion and story booth.",
      link: "https://vmybor.org/untold-stories"
    },
    {
      date: "2026-06-02",
      title: "Land Development Code community meeting",
      time: "6:30–7:30 PM",
      place: "Ragan Park Community Center",
      category: "civic",
      note: "City of Tampa interactive meeting hosted with Ybor Heights NA context.",
      link: "https://www.tampa.gov/events/land-development-code-update-interactive-community-meeting/190951"
    }
  ];

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function formatKey(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function parseKey(key) {
    var parts = key.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function nthWeekdayOfMonth(year, month, weekday, n) {
    var count = 0;
    for (var day = 1; day <= 31; day++) {
      var d = new Date(year, month, day);
      if (d.getMonth() !== month) break;
      if (d.getDay() === weekday) {
        count += 1;
        if (count === n) return d;
      }
    }
    return null;
  }

  function buildRecurring(startYear, startMonth, monthSpan) {
    var events = [];
    for (var i = 0; i < monthSpan; i++) {
      var d0 = new Date(startYear, startMonth + i, 1);
      var y = d0.getFullYear();
      var m = d0.getMonth();

      var na = nthWeekdayOfMonth(y, m, 3, 3);
      if (na) {
        events.push({
          date: formatKey(na),
          title: "Ybor Heights NA & Watch meeting",
          time: "6:30 PM",
          place: "Ragan Park Community Center, 1200 E Lake Ave",
          category: "neighborhood",
          note: "Monthly civic & safety meeting — third Wednesday. Confirm via yborheightsna@gmail.com.",
          link: "https://yborheightsna.mailchimpsites.com/"
        });
      }

      var night = nthWeekdayOfMonth(y, m, 5, 3);
      if (night) {
        events.push({
          date: formatKey(night),
          title: "Ybor City Night Market",
          time: "6:00–10:00 PM",
          place: "Centennial Park / historic Ybor",
          category: "market",
          note: "Third Friday evening market with food vendors and makers. Verify dates on Ybor channels.",
          link: "https://www.ybor.org/"
        });
      }

      var day = 1;
      while (true) {
        var sat = new Date(y, m, day);
        if (sat.getMonth() !== m) break;
        if (sat.getDay() === 6) {
          var summer = m >= 4 && m <= 8;
          events.push({
            date: formatKey(sat),
            title: "Ybor City Saturday Market",
            time: summer ? "9:00 AM–1:00 PM" : "9:00 AM–3:00 PM",
            place: "Centennial Park, 1901 N 19th St",
            category: "market",
            note: "Produce, crafts, baked goods — short trip from Ybor Heights.",
            link: "https://ybormarket.com/"
          });
        }
        day += 1;
      }
    }
    return events;
  }

  var allEvents = oneOffEvents.concat(buildRecurring(2026, 5, 8));

  function activeFilter() {
    return filterSelect ? filterSelect.value : "all";
  }

  function eventsForDate(key) {
    var filter = activeFilter();
    return allEvents
      .filter(function (ev) {
        return ev.date === key && (filter === "all" || ev.category === filter);
      })
      .sort(function (a, b) {
        return a.title.localeCompare(b.title);
      });
  }

  function eventsInMonth(year, month) {
    var filter = activeFilter();
    var prefix = year + "-" + pad(month + 1);
    return allEvents
      .filter(function (ev) {
        return ev.date.indexOf(prefix) === 0 && (filter === "all" || ev.category === filter);
      })
      .sort(function (a, b) {
        if (a.date === b.date) return a.title.localeCompare(b.title);
        return a.date < b.date ? -1 : 1;
      });
  }

  function categoryLabel(cat) {
    return (
      {
        neighborhood: "Neighborhood",
        market: "Market",
        nearby: "Nearby",
        civic: "Civic",
        nightlife: "Nightlife"
      }[cat] || cat
    );
  }

  function renderMonth() {
    monthLabel.textContent = MONTHS[viewMonth] + " " + viewYear;
    grid.innerHTML = "";

    WEEKDAYS.forEach(function (label) {
      var el = document.createElement("div");
      el.className = "cal-weekday";
      el.textContent = label;
      grid.appendChild(el);
    });

    var first = new Date(viewYear, viewMonth, 1);
    var startPad = first.getDay();
    var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (var i = 0; i < startPad; i++) {
      var empty = document.createElement("div");
      empty.className = "cal-day is-empty";
      empty.setAttribute("aria-hidden", "true");
      grid.appendChild(empty);
    }

    for (var day = 1; day <= daysInMonth; day++) {
      var key = viewYear + "-" + pad(viewMonth + 1) + "-" + pad(day);
      var dayEvents = eventsForDate(key);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cal-day";
      btn.dataset.date = key;
      if (key === formatKey(today)) btn.classList.add("is-today");
      if (key === selectedKey) btn.classList.add("is-selected");
      if (dayEvents.length) btn.classList.add("has-events");

      var num = document.createElement("span");
      num.className = "cal-day-num";
      num.textContent = String(day);
      btn.appendChild(num);

      if (dayEvents.length) {
        var dots = document.createElement("span");
        dots.className = "cal-day-dots";
        dots.setAttribute("aria-hidden", "true");
        var shown = Math.min(dayEvents.length, 3);
        for (var d = 0; d < shown; d++) {
          var dot = document.createElement("i");
          dot.className = "cal-dot cat-" + dayEvents[d].category;
          dots.appendChild(dot);
        }
        btn.appendChild(dots);
        btn.setAttribute("aria-label", dayEvents.length + " events on " + key);
      } else {
        btn.setAttribute("aria-label", key);
      }

      btn.addEventListener("click", function () {
        selectedKey = this.dataset.date;
        renderMonth();
        renderList();
      });

      grid.appendChild(btn);
    }
  }

  function renderEventCard(ev) {
    var article = document.createElement("article");
    article.className = "cal-event";
    article.innerHTML =
      '<div class="cal-event-when">' +
      "<strong>" +
      formatDisplayDate(ev.date) +
      "</strong>" +
      "<span>" +
      ev.time +
      "</span>" +
      "</div>" +
      '<div class="cal-event-body">' +
      '<span class="cal-event-cat cat-' +
      ev.category +
      '">' +
      categoryLabel(ev.category) +
      "</span>" +
      "<h3>" +
      ev.title +
      "</h3>" +
      "<p class=\"cal-event-place\">" +
      ev.place +
      "</p>" +
      "<p>" +
      ev.note +
      "</p>" +
      (ev.link
        ? '<a class="btn btn-outline" href="' +
          ev.link +
          '" target="_blank" rel="noopener noreferrer">Details</a>'
        : "") +
      "</div>";
    return article;
  }

  function formatDisplayDate(key) {
    var d = parseKey(key);
    return WEEKDAYS[d.getDay()] + ", " + MONTHS[d.getMonth()] + " " + d.getDate();
  }

  function renderList() {
    list.innerHTML = "";
    var mode = document.querySelector('input[name="calView"]:checked');
    var view = mode ? mode.value : "day";
    var events = view === "month" ? eventsInMonth(viewYear, viewMonth) : eventsForDate(selectedKey);

    if (selectedDateEl) {
      selectedDateEl.textContent =
        view === "month"
          ? "All events in " + MONTHS[viewMonth] + " " + viewYear
          : formatDisplayDate(selectedKey);
    }

    if (!events.length) {
      var empty = document.createElement("p");
      empty.className = "cal-empty";
      empty.textContent =
        view === "month"
          ? "No listed events this month for the selected filter."
          : "No listed events on this day. Try another date or view the full month.";
      list.appendChild(empty);
      return;
    }

    events.forEach(function (ev) {
      list.appendChild(renderEventCard(ev));
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      viewMonth -= 1;
      if (viewMonth < 0) {
        viewMonth = 11;
        viewYear -= 1;
      }
      renderMonth();
      renderList();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      viewMonth += 1;
      if (viewMonth > 11) {
        viewMonth = 0;
        viewYear += 1;
      }
      renderMonth();
      renderList();
    });
  }

  if (filterSelect) {
    filterSelect.addEventListener("change", function () {
      renderMonth();
      renderList();
    });
  }

  document.querySelectorAll('input[name="calView"]').forEach(function (input) {
    input.addEventListener("change", renderList);
  });

  renderMonth();
  renderList();
})();
