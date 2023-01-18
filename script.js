// "use strict";

const btn = document.querySelector(".btn-country");
const countriesContainer = document.querySelector(".countries");
const textContainer = document.querySelector(".text");
const countdown = document.getElementById("countdown");
const loader = document.querySelector("#loading");

const renderCountry = function (data, className = "") {
  const flags = Object.values(data.flags)[0];
  const name = data.name.common;
  const region = data.region;
  const population = (+data.population / 1000000).toFixed(1);
  const [language] = Object.values(data.languages);
  const currencies = Object.values(data.currencies)[0].name;
  const symbol = Object.values(data.currencies)[0].symbol;

  const html = `
    <article class="country ${className}">
     <img class="country__img" src="${flags}" />
     <div class="country__data">
       <h3 class="country__name">${name}</h3>
       <h4 class="country__region">${region}</h4>
       <p class="country__row">
         <span>👫</span>${population}M
       </p>
       <p class="country__row">
         <span>🗣️</span>${language}
       </p>
       <p class="country__row">
         <span>💰</span>${currencies} (${symbol})
       </p>
     </div>
   </article>
   `;
  countriesContainer.insertAdjacentHTML("beforeend", html);
  // countriesContainer.style.opacity = 1;
};

// wait function
const wait = function (seconds) {
  return new Promise(function (resolve) {
    setTimeout(resolve, seconds * 1000);
  });
};

// showing loading animation
function displayLoading() {
  loader.classList.add("display");
}

// hiding loading animation
function hideLoading() {
  loader.classList.remove("display");
}

//count down timer
const count = () => {
  let timeleft = 5;

  const downloadTimer = setInterval(function () {
    if (timeleft <= 0) {
      clearInterval(downloadTimer);

      btn.classList.remove("hidden");
      countdown.innerHTML = null;
      window.location.reload();
    } else {
      countdown.innerHTML = `Try again in ${timeleft} seconds`;
    }
    timeleft -= 1;
  }, 1000);
};

// render error function
const renderError = (msg) => {
  countriesContainer.insertAdjacentText("beforeend", msg);
};

//response error function
const resError = function (response, msg) {
  if (!response.ok) {
    throw new Error(`${msg} (${response.status})`);
  }
};

// getting position coordinated
const getPosition = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

// Main App Function
const whereAmI = async () => {
  try {
    displayLoading();

    // consuming position cordinates
    const position = await getPosition().catch(() => {
      throw new Error(`Turn on Location Service`);
    });
    const { latitude, longitude } = position.coords;

    // reverse geocoding
    const geo = await fetch(
      ` https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
    );
    if (!geo.ok) {
      resError(geo, "Problem with geocoding!");
    }
    const geoData = await geo.json();

    // fetching country Data
    const country = await fetch(
      `https://restcountries.com/v3.1/name/${geoData.address.country}`
    );
    if (!country.ok) {
      resError(country, "Country not found!!");
    }
    const countryData = await country.json();

    // insert region Text
    textContainer.insertAdjacentText(
      "afterbegin",
      `You are in ${geoData.display_name}`
    );

    // rendering country
    renderCountry(countryData[0]);

    // hiding button
    btn.classList.add("hidden");

    // catching errors
  } catch (error) {
    renderError(`${error.message}`);
    btn.classList.add("hidden");
    count();
  }
  //finally
  hideLoading();
  countriesContainer.style.opacity = "1";
};

btn.addEventListener("click", whereAmI);
