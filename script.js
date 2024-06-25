'use strict';

class Workout {
  date = new Date();
  id = Date.now().toString().slice(-10);
  clicks = 0;
  constructor(coords, distance, duration) {
    //this.date
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
  _setDescription() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
  click() {
    this.clicks++;
  }
}
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calPace();
    this._setDescription();
  }

  calPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this._setDescription();
  }
  calSpeed() {
    this.speed = this.distance / (this.distance / 60);
    return speed;
  }
}

const run1 = new Running([30, -12], 5.2, 24, 178);
const cycle1 = new Cycling([30, -12], 5.2, 98, 523);

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map;
  #MapZoomLevel = 13;
  #mapEvent;
  #workouts = [];
  constructor() {
    //Get user's position
    this._getPosition();

    //Get data from local storage
    this._getLocalStorage();
    // Attach event handler
    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._ToggleElveationField);

    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your postion');
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // console.log(latitude, longitude);
    //console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    if (!this.#map)
      this.#map = L.map('map').setView(coords, this.#MapZoomLevel);

    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));
    this.#workouts.forEach(work => {
      this.renderWorkoutMaker(work);
    });
  }

  _showForm(mape) {
    this.#mapEvent = mape;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  //Hide form + Clear input data
  _hideForm() {
    inputDistance.value =
      inputDistance.value =
      inputCadence.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _ToggleElveationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const ValidInputs = (...inputs) =>
      inputs.every(ing => Number.isFinite(ing));
    const allPositive = (...inputs) => inputs.every(nbr => nbr > 0);
    e.preventDefault();

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let cadence = 0,
      elevation = 0;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    //if workout running, create running object

    if (type === 'running') {
      cadence = +inputCadence.value;

      if (
        !ValidInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert(`Input have to be postive numbers!`);

      workout = new Running({ lat, lng }, distance, duration, cadence);
      this.#workouts.push(workout);
    }

    //Check if data is valid

    //If workout cycling create cycling object
    if (type === 'cycling') {
      elevation = +inputElevation.value;

      if (
        !ValidInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert(`Input have to be postive numbers!`);

      workout = new Cycling({ lat, lng }, distance, duration, elevation);
    }
    this.#workouts.push(workout);
    //console.log(workout);

    // Render workout on map as marker
    this.renderWorkoutMaker(workout);

    //Render workout on map
    this.renderWorkout(workout);

    //Hide the form + clear input fields
    this._hideForm();

    //Set local storage to all workout
    this._setLocalStorage();
  }
  renderWorkoutMaker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 50,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }
  renderWorkout(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title"${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
       `;

    if (workout.type === 'running') {
      html += `
           <div class="workout__details">
           <span class="workout__icon">⚡️</span>
         <span class="workout__value">${workout.pace.toFixed(1)}</span>
           <span class="workout__unit">min/km</span>
          </div>
         <div class="workout__details">
           <span class="workout__icon">🦶🏼</span>
           <sp  an class="workout__value">${workout.cadence}</span>
           <span class="workout__unit">spm</span>
         </div>
       </li>
         `;
    }
    if (workout === 'cycling') {
      html += `
         <div class="workout__details">
         <span class="workout__icon">⚡️</span>
         <span class="workout__value">${workout.speed.toFixed(1)}</span>
         <span class="workout__unit">km/h</span>
         </div>
       <div class="workout__details">
         <span class="workout__icon">⛰</span>
         <span class="workout__value">${workout.elevation}</span>
         <span class="workout__unit">m</span>
       </div>
       </li>
       `;
    }
    form.insertAdjacentHTML('afterend', html);
  }
  _moveToPopup(e) {
    if (!this.#map) return;
    const workoutEl = e.target.closest('.workout');
    //console.log(workoutEl);

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );

    //console.log(this.#workouts.find(work => work.id === workoutEl.dataset.id));
    this.#map.setView(workout.coords, this.#MapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    //using the public interface
    workout.click;
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    console.log(data);

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach(work => {
      this.renderWorkout(work);
    });
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}
const app = new App();
app._getPosition();
