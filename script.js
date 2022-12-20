// "use strict";

const btn = document.querySelector(".btn-country");
const btnTry = document.querySelector(".btn-try");
const countriesContainer = document.querySelector(".countries");
const textContainer = document.querySelector(".text");

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

const renderError = function (msg) {
  countriesContainer.insertAdjacentText("beforeend", msg);
};

const resError = function (response, msg) {
  if (!response.ok) throw new Error(`${msg} (${response.status})`);
};

const getPosition = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        whereAmI(`${latitude}`, `${longitude}`);
      },
      function () {
        renderError(
          `Turn on Location service, to allow to determine your location`
        );
        countriesContainer.style.opacity = "1";
      }
    );
  }
};

const whereAmI = function (lat, lng) {
  fetch(`https://geocode.xyz/${lat},${lng}?geoit=json`)
    .then((response) => {
      resError(response, "Problem with geocoding!");
      return response.json();
    })
    .then((data) => {
      textContainer.insertAdjacentText(
        "afterbegin",
        `You are in ${data.city}, ${data.country}`
      );

      return fetch(`https://restcountries.com/v3.1/name/${data.country}`);
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
    .catch((err) => {
      console.error(err);
      renderError(`Something went wrong ${err.message}, Try again!`);

      btn.style.display = "none";
      btnTry.style.visibility = "visible";
    })
    .finally(() => {
      countriesContainer.style.opacity = "1";
    });
};

btn.addEventListener("click", function () {
  getPosition();
});

btnTry.addEventListener("click", function () {
  location.reload();
});
