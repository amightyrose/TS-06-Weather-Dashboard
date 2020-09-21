

var strAPIKey = "c0a33413999e48a90c147ca5b83f5dc1";




function getWeatherData(location) {


	// Build the query URL for getting current weather.
	let strQueryURL = `http://api.openweathermap.org/data/2.5/weather?appid=${strAPIKey}&units=metric&q=${location}`



	// Make an ajax call.
	$.ajax({

		type: "GET",
		url: strQueryURL,
		success: function (response) {


			let strDay = moment.unix(response.dt).format("dddd");
			let strDate = moment.unix(response.dt).format("D/MM/YY");
			let strTemp = response.main.temp.toFixed(1).toString();
			let strWindSpeed = (response.wind.speed * 3.6).toFixed(1).toString();


			// If it's the current weather, get some values from the response and put them into the
			// objCurrentWeather object.
			let objCurrentWeather = {

				"day": strDay,
				"date": strDate,
				"city": response.name,
				"temp": strTemp,
				"humidity": response.main.humidity,
				"windspeed": strWindSpeed,
				"icon": response.weather[0].icon

			}

			renderCurrent("weather", objCurrentWeather);


			// Get latitude and longitude from the response then call getForecast to get the remaining data.
			getForecast(response.coord.lat, response.coord.lon);


		}

	});


}


function getForecast(lat, lon) {


	let strQueryURL = `http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&units=metric&appid=${strAPIKey}`


	// Make an ajax call.
	$.ajax({

		type: "GET",
		url: strQueryURL,
		success: function (response) {


			let intUVIndex = response.current.uvi.toFixed(1);
			renderCurrent("uvi", intUVIndex);

			let arrDailyData = [];

			// Loop through the daily results and get the info we need.
			response.daily.forEach(function (day) {

				let strDay = moment.unix(day.dt).format("dddd");
				let strDate = moment.unix(day.dt).format("D/MM/YY");
				let strMin = Math.round(day.temp.min).toString();
				let strMax = Math.round(day.temp.max).toString();

				arrDailyData.push({

					"dt": day.dt,
					"day": strDay,
					"date": strDate,
					"temp_min": strMin,
					"temp_max": strMax,
					"humidity": day.humidity,
					"rain_chance": day.pop,
					"short_desc": day.weather[0].main,
					"icon": day.weather[0].icon

				})

			})


			// Sort the array by date to make sure it's in the right order.
			arrDailyData.sort(function (a, b) {

				return a.dt - b.dt;

			});


			// Reduce the array length to 5 because that's all we need
			arrDailyData.length = 5


			// Call renderForecast to display the data.
			renderForecast(arrDailyData);


		}

	});


}


function renderCurrent(type, data) {


	if (type === "weather") {

		// $("#current").text(JSON.stringify(data));
		$("#city-name").text(data.city);
		$("#current-date").text(`${data.day} ${data.date}`);
		$("#current-temp").text(data.temp);
		$("#cur-humidity").text(`${data.humidity} %`);
		$("#cur-wind").text(`${data.windspeed} km/h`);



		// Build a URL for the weather icon and then udpate the img tag.
		let strIconURL = "http://openweathermap.org/img/wn/" + data.icon + "@2x.png"
		$("#current-icon").attr("src", strIconURL);

	}
	else if (type === "uvi") {

		$("#cur-uvi").text(data)

	}


}


function renderForecast(forecastData) {


	// Loop through the array and display data for each object.
	forecastData.forEach(function (day, i) {


		// Put a couple of jQuery selectors into strings to make calling easier.
		let strDiv = `#fcast-${i}`
		let strFcastDiv = `#fcast-data-${i}`

		// Convert some of the numerical data to strings and add some formatting.
		let strIconURL = "http://openweathermap.org/img/wn/" + day.icon + "@2x.png"
		let strDegree = String.fromCharCode(176);
		let strMax = `${day.temp_max}${strDegree}`
		let strMin = `${day.temp_min}${strDegree}`
		let strHumidity = `${day.humidity}%`
		let strPOP = Math.floor(day.rain_chance * 100).toString() + "%";


		// Write values to the document.
		$(`${strDiv} .fcast-day`).text(day.day);
		$(`${strDiv} .fcast-max`).text(strMax);
		$(`${strFcastDiv} .fcast-date`).text(day.date);
		$(`${strFcastDiv} .fcast-img`).attr("src", strIconURL);
		$(`${strFcastDiv} .fcast-min`).text(strMin);
		$(`${strFcastDiv} .fcast-humidity`).text(strHumidity);
		$(`${strFcastDiv} .fcast-pop`).text(strPOP);


	})


}


// Function to update the list of previously searched cities.
function updateHistory(city) {


	// First set the MRU in localstorage
	localStorage.setItem("weatherMRU", city);


	// Try and get items from storage. An array will be returned but it will be empty if there was nothing
	// in storage.
	let arrHistory = getHistory();


	// Add the new value to the array if it doesn't exist.
	if (arrHistory.includes(city) === false) {

		arrHistory.push(city);

		// Save back to localstorage.
		saveHistory(arrHistory);

	}


	// Update the list we use for prepopulating the search box.
	updateSearchList();

}


// Function to update the list used to add options to the search box.
function updateSearchList() {


	// Clear the existing options list just in case.
	$("#history").html("");


	// Try and get list from localstorage.
	let arrCities = getHistory();


	// If there are any cities in the array, loop through and add them to the option list.
	if (arrCities.length > 0) {

		arrCities.forEach(function (city) {

			elNewOption = $("<option>");
			elNewOption.attr("value", city);
			$("#history").append(elNewOption);

		})

	}


}

// This function gets items from storage and returns an array. If there was nothing in storage the array
// is returned empty.
function getHistory() {


	let arrCities = localStorage.getItem("cities");

	if (arrCities === null) {

		arrCities = [];

	}
	else {

		arrCities = JSON.parse(arrCities);
	}

	return arrCities;

}


// Saves the search history to localstorage
function saveHistory(arrCities) {

	localStorage.setItem("cities", JSON.stringify(arrCities));

}


// Function to retrieve the most recently searched city from storage.
function getMRU() {

	let mruCity = localStorage.getItem("weatherMRU");
	return mruCity;

}


// Function that runs when the page is first loaded. Check for the most recent city and
// if there is one, load data for it.
function loadWeatherScreen() {


	let city = getMRU();

	if (city) {
		getWeatherData(city);
	}

	updateSearchList();


}



// Listener for the search field
$("#citysearch").on("submit", function (event) {

	event.preventDefault();
	let selectedCity = $("#cityselect").val().trim().toLowerCase();


	// Call updateHistory to add the submitted value to the list.
	updateHistory(selectedCity);

	// Call getWeatherData to start collecting.
	getWeatherData(selectedCity);

	// Clear the search box.
	$("#cityselect").val("");

});



// When the page loads, call loadWeatherScreen to render the page. If there is a MRU city in storage
// it will load the data for it.
loadWeatherScreen();