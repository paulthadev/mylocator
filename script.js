// "use strict";

const btn = document.querySelector(".btn-country");
const btnTry = document.querySelector(".btn-try");
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

// showing loading
function displayLoading() {
  loader.classList.add("display");
}

// hiding loading
function hideLoading() {
  loader.classList.remove("display");
}

//count down
const count = () => {
  let timeleft = 5;

  const downloadTimer = setInterval(function () {
    if (timeleft <= 0) {
      clearInterval(downloadTimer);

      window.location.reload();
    } else {
      countdown.innerHTML = `Try again in ${timeleft} seconds`;
    }
    timeleft -= 1;
  }, 1000);
};

const renderError = function (msg) {
  countriesContainer.insertAdjacentText("beforeend", msg);
};

const resError = function (response, msg) {
  if (!response.ok) {
    throw new Error(`${msg} (${response.status})`);
  }
};

const getPosition = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error)
    );
  });
};

const whereAmI = function () {
  getPosition()
    .then((position) => {
      displayLoading();

      const { latitude, longitude } = position.coords;

      return fetch(`https://geocode.xyz/${latitude},${longitude}?geoit=json`);
    })
    .then((response) => {
      resError(response, "Problem with geocoding!");
      return response.json();
    })
    .then((data) => {
      textContainer.insertAdjacentText(
        "afterbegin",
        `You are in ${data.region}`
      );

      return fetch(`https://restcountries.com/v3.1/alpha/${data.prov}`);
    })
    .then((response) => {
      resError(response, "Country not found!");
      return response.json();
    })
    .then((data) => {
      data = data[0];
      renderCountry(data);
      btn.style.visibility = "hidden";
    })
    .catch((error) => {
      renderError(`${error.message}`);

      btn.style.display = "none";
      count();
    })
    .finally(() => {
      hideLoading();
      countriesContainer.style.opacity = "1";
    });
};

btn.addEventListener("click", whereAmI);
