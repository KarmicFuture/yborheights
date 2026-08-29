(function () {
  var mapEl = document.getElementById("neighborhoodMap");
  var listEl = document.getElementById("mapLocationList");
  var filterEl = document.getElementById("mapFilter");
  var countEl = document.getElementById("mapCount");

  if (!mapEl || typeof L === "undefined") return;

  var locations = [
    {
      id: "deviant-libation",
      name: "Deviant Libation",
      category: "neighborhood",
      address: "3800 N. Nebraska Ave, Tampa, FL 33603",
      note: "Brewery & distillery in Ybor Heights — live music and can releases.",
      lat: 27.9791048,
      lng: -82.4517137,
      link: "https://deviantlibation.com/",
      page: "businesses.html"
    },
    {
      id: "cuscaden-park",
      name: "Cuscaden Park & Pool",
      category: "neighborhood",
      address: "Cuscaden Park, Tampa, FL",
      note: "Pool, courts, fields, and green space shared with neighboring V.M. Ybor.",
      lat: 27.9692571,
      lng: -82.4435735,
      link: "https://www.tampa.gov/parks-and-recreation/parks-and-facilities",
      page: "businesses.html"
    },
    {
      id: "ragan-park",
      name: "Ragan Park Community Center",
      category: "neighborhood",
      address: "1200 E Lake Ave, Tampa, FL",
      note: "Home base for Ybor Heights NA & Watch meetings (third Wednesday, 6:30pm).",
      lat: 27.977894,
      lng: -82.446936,
      link: "https://www.tampa.gov/parks-and-recreation",
      page: "community.html"
    },
    {
      id: "columbia",
      name: "Columbia Restaurant",
      category: "ybor",
      address: "2117 E 7th Ave, Tampa, FL 33605",
      note: "Florida’s oldest restaurant — Spanish-Cuban classics on 7th Avenue.",
      lat: 27.9600142,
      lng: -82.4351326,
      link: "https://www.columbiarestaurant.com/",
      page: "businesses.html"
    },
    {
      id: "la-segunda",
      name: "La Segunda Bakery",
      category: "ybor",
      address: "2512 N 15th St, Tampa, FL 33605",
      note: "Cuban bread since 1915 — sandwiches, pastries, and a Tampa staple.",
      lat: 27.9657908,
      lng: -82.4432994,
      link: "https://lasegunda.com/",
      page: "businesses.html"
    },
    {
      id: "coppertail",
      name: "Coppertail Brewing",
      category: "ybor",
      address: "2601 E 2nd Ave, Tampa, FL 33605",
      note: "Craft brewery near Channelside / Ybor — tours and taproom.",
      lat: 27.9561617,
      lng: -82.4301413,
      link: "https://coppertailbrewing.com/",
      page: "businesses.html"
    },
    {
      id: "copper-shaker",
      name: "The Copper Shaker",
      category: "ybor",
      address: "1502 E 7th Ave, Tampa, FL 33605",
      note: "Craft cocktails and shareable plates on E. 7th Avenue.",
      lat: 27.9604043,
      lng: -82.4428391,
      link: "https://www.coppershakerybor.com/",
      page: "businesses.html"
    },
    {
      id: "ybor-museum",
      name: "Ybor City Museum",
      category: "ybor",
      address: "1818 E 9th Ave, Tampa, FL 33605",
      note: "Cigar history exhibits in the historic Ferlita Bakery building.",
      lat: 27.9619193,
      lng: -82.4383459,
      link: "https://www.ybormuseum.org/",
      page: "businesses.html"
    },
    {
      id: "jc-newman",
      name: "J.C. Newman Cigar Co.",
      category: "ybor",
      address: "2701 N 16th St, Tampa, FL 33605",
      note: "Working El Reloj cigar factory and museum.",
      lat: 27.966935,
      lng: -82.4416,
      link: "https://www.jcnewman.com/",
      page: "businesses.html"
    },
    {
      id: "centennial-park",
      name: "Centennial Park / Saturday Market",
      category: "ybor",
      address: "1901 N 19th St, Tampa, FL 33605",
      note: "Ybor City Saturday Market and Night Market host site.",
      lat: 27.9610106,
      lng: -82.4371743,
      link: "https://www.yborcitysaturdaymarket.com/",
      page: "calendar.html"
    },
    {
      id: "centro-asturiano",
      name: "Centro Asturiano Theater",
      category: "ybor",
      address: "1913 N Nebraska Ave, Tampa, FL 33602",
      note: "Venue for Untold Stories film nights and community events.",
      lat: 27.9620169,
      lng: -82.4508352,
      link: "https://vmybor.org/untold-stories",
      page: "calendar.html"
    },
    {
      id: "home-1302",
      name: "1302 E 33rd Ave",
      category: "homes",
      address: "1302 E 33rd Ave, Tampa, FL 33603",
      note: "Listed bungalow near the neighborhood core — see Homes for Sale.",
      lat: 27.9808386,
      lng: -82.4455697,
      link: "https://www.compass.com/homedetails/1302-E-33rd-Ave-Tampa-FL-33603/MZU06_pid/",
      page: "homes.html"
    },
    {
      id: "home-2902",
      name: "2902 Sanchez St",
      category: "homes",
      address: "2902 Sanchez St, Tampa, FL 33605",
      note: "Remodeled historic home near Cuscaden Park.",
      lat: 27.9687945,
      lng: -82.442311,
      link: "https://www.compass.com/homedetails/2902-Sanchez-St-Tampa-FL-33605/NVQ6N_pid/",
      page: "homes.html"
    },
    {
      id: "home-2914",
      name: "2914 N 16th St",
      category: "homes",
      address: "2914 N 16th St, Tampa, FL 33605",
      note: "MLS listing labeled Ybor Heights subdivision.",
      lat: 27.9689937,
      lng: -82.4416646,
      link: "https://www.coldwellbankerhomes.com/fl/tampa/2914-n-16th-st/pid_71500358/",
      page: "homes.html"
    },
    {
      id: "home-3420",
      name: "3420 N 10th St",
      category: "homes",
      address: "3420 N 10th St, Tampa, FL 33605",
      note: "New construction in the Ybor Heights neighborhood.",
      lat: 27.974657,
      lng: -82.4496694,
      link: "https://www.movoto.com/tampa-fl/3420-n-10th-st-tampa-fl-33605/pid_fabe1dp8ah/",
      page: "homes.html"
    },
    {
      id: "home-1209-33rd",
      name: "1209 E 33rd Ave",
      category: "homes",
      address: "1209 E 33rd Ave, Tampa, FL 33603",
      note: "Recently marketed on the 33603 / Ybor Heights edge.",
      lat: 27.98075,
      lng: -82.4468,
      link: "homes.html",
      page: "homes.html"
    },
    {
      id: "home-1209-mlk",
      name: "1209 E Dr Martin Luther King Jr Blvd",
      category: "homes",
      address: "1209 E Dr Martin Luther King Jr Blvd, Tampa, FL 33603",
      note: "Along the MLK corridor that forms the northern boundary.",
      lat: 27.9814257,
      lng: -82.4468443,
      link: "https://www.zillow.com/tampa-fl-33603/",
      page: "homes.html"
    }
  ];

  var categoryLabels = {
    neighborhood: "In the Heights",
    ybor: "Nearby Ybor",
    homes: "Homes for sale"
  };

  // Approximate Ybor Heights bounds: MLK (N), N 15th St (E), E 26th Ave (S), I-275 (W)
  var neighborhoodBounds = [
    [27.9818, -82.4548],
    [27.9818, -82.4428],
    [27.9658, -82.4428],
    [27.9658, -82.4548]
  ];

  var map = L.map(mapEl, {
    scrollWheelZoom: false,
    attributionControl: true
  }).setView([27.9725, -82.4455], 14);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  mapEl.addEventListener("click", function () {
    map.scrollWheelZoom.enable();
  });
  mapEl.addEventListener("mouseleave", function () {
    map.scrollWheelZoom.disable();
  });

  var boundsLayer = L.polygon(neighborhoodBounds, {
    color: "#2a4d3a",
    weight: 2,
    dashArray: "6 6",
    fillColor: "#2a4d3a",
    fillOpacity: 0.08
  }).addTo(map);

  boundsLayer.bindPopup(
    "<strong>Ybor Heights</strong><br>Rough bounds: MLK Blvd · N. 15th St · E. 26th Ave · I-275"
  );

  var markerLayer = L.layerGroup().addTo(map);
  var markersById = {};
  var activeId = null;

  function markerHtml(category) {
    return '<span class="map-pin map-pin-' + category + '" aria-hidden="true"></span>';
  }

  function popupHtml(loc) {
    return (
      '<div class="map-popup">' +
      "<strong>" +
      loc.name +
      "</strong>" +
      '<div class="map-popup-cat">' +
      categoryLabels[loc.category] +
      "</div>" +
      "<p>" +
      loc.address +
      "</p>" +
      "<p>" +
      loc.note +
      "</p>" +
      '<a href="' +
      loc.link +
      '"' +
      (loc.link.indexOf("http") === 0 ? ' target="_blank" rel="noopener noreferrer"' : "") +
      ">Open details</a>" +
      "</div>"
    );
  }

  function filteredLocations() {
    var filter = filterEl ? filterEl.value : "all";
    if (filter === "all") return locations.slice();
    return locations.filter(function (loc) {
      return loc.category === filter;
    });
  }

  function setActive(id) {
    activeId = id;
    if (!listEl) return;
    listEl.querySelectorAll(".map-location").forEach(function (item) {
      item.classList.toggle("is-active", item.getAttribute("data-id") === id);
    });
  }

  function focusLocation(loc, openPopup) {
    setActive(loc.id);
    map.setView([loc.lat, loc.lng], Math.max(map.getZoom(), 15), { animate: true });
    var marker = markersById[loc.id];
    if (marker && openPopup) marker.openPopup();
  }

  function render() {
    var items = filteredLocations();
    markerLayer.clearLayers();
    markersById = {};

    items.forEach(function (loc) {
      var icon = L.divIcon({
        className: "map-marker",
        html: markerHtml(loc.category),
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -10]
      });
      var marker = L.marker([loc.lat, loc.lng], { icon: icon, title: loc.name });
      marker.bindPopup(popupHtml(loc));
      marker.on("click", function () {
        setActive(loc.id);
        var card = listEl && listEl.querySelector('[data-id="' + loc.id + '"]');
        if (card) card.scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
      marker.addTo(markerLayer);
      markersById[loc.id] = marker;
    });

    if (countEl) {
      countEl.textContent = items.length + (items.length === 1 ? " place" : " places");
    }

    if (listEl) {
      if (!items.length) {
        listEl.innerHTML = '<p class="map-empty">No places in this category.</p>';
      } else {
        listEl.innerHTML = items
          .map(function (loc) {
            return (
              '<button type="button" class="map-location' +
              (loc.id === activeId ? " is-active" : "") +
              '" data-id="' +
              loc.id +
              '">' +
              '<span class="map-location-cat cat-' +
              loc.category +
              '">' +
              categoryLabels[loc.category] +
              "</span>" +
              "<h3>" +
              loc.name +
              "</h3>" +
              '<p class="map-location-address">' +
              loc.address +
              "</p>" +
              "<p>" +
              loc.note +
              "</p>" +
              "</button>"
            );
          })
          .join("");
      }
    }

    if (items.length) {
      var group = L.featureGroup(Object.keys(markersById).map(function (id) {
        return markersById[id];
      }));
      map.fitBounds(group.getBounds().extend(boundsLayer.getBounds()).pad(0.12));
    } else {
      map.fitBounds(boundsLayer.getBounds().pad(0.2));
    }
  }

  if (listEl) {
    listEl.addEventListener("click", function (event) {
      var button = event.target.closest(".map-location");
      if (!button) return;
      var loc = locations.find(function (item) {
        return item.id === button.getAttribute("data-id");
      });
      if (loc) focusLocation(loc, true);
    });
  }

  if (filterEl) {
    filterEl.addEventListener("change", function () {
      activeId = null;
      render();
    });
  }

  function requestedLocationId() {
    var params = new URLSearchParams(window.location.search);
    var fromQuery = params.get("loc");
    if (fromQuery) return fromQuery;
    var hash = window.location.hash.replace(/^#/, "");
    return hash || null;
  }

  function applyInitialState() {
    var params = new URLSearchParams(window.location.search);
    var filter = params.get("filter");
    if (filterEl && filter && ["all", "neighborhood", "ybor", "homes"].indexOf(filter) !== -1) {
      filterEl.value = filter;
    }

    var requested = requestedLocationId();
    if (requested) {
      var loc = locations.find(function (item) {
        return item.id === requested;
      });
      if (loc && filterEl) {
        filterEl.value = loc.category;
      }
    }

    render();

    if (requested) {
      var target = locations.find(function (item) {
        return item.id === requested;
      });
      if (target) {
        activeId = target.id;
        render();
        setTimeout(function () {
          focusLocation(target, true);
        }, 120);
      }
    }
  }

  applyInitialState();

  setTimeout(function () {
    map.invalidateSize();
  }, 100);
})();
