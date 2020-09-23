
var strAPIKey = "c0a33413999e48a90c147ca5b83f5dc1";
var strCurrentDisplay;
var strPreviousDisplay;



// Function to make a request for current weather data.
function getWeatherData(location) {


	// Build the query URL for getting current weather.
	let strQueryURL = `https://api.openweathermap.org/data/2.5/weather?appid=${strAPIKey}&units=metric&q=${location}`



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

			// Call updateHistory to add the city to the list.
			updateHistory("add", location);

		},
		error: function (objRequest) {

			if (objRequest.status === 404) {
				showError(404);
			}
			else {
				showError("fail");
			}

		}

	});


}


// Function to request forecast and uv index data.
function getForecast(lat, lon) {


	let strQueryURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&units=metric&appid=${strAPIKey}`


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


		},
		error: function (objRequest) {

			if (objRequest.status === 404) {
				showError(404);
			}
			else {
				showError("fail");
			}

		}


	});


}


// Render current weather data on the page.
function renderCurrent(type, data) {


	// Update strCurrentDisplay and show/hide divs.
	if (strCurrentDisplay) {$(strCurrentDisplay).hide();}
	$("#weatherDisplay").show();
	strCurrentDisplay = "#weatherDisplay";


	if (type === "weather") {

		// $("#current").text(JSON.stringify(data));
		$("#city-name").text(data.city);
		$("#current-date").text(`${data.day} ${data.date}`);
		$("#current-temp").text(data.temp);
		$("#cur-humidity").text(`${data.humidity} %`);
		$("#cur-wind").text(`${data.windspeed} km/h`);

		// Build a URL for the weather icon and then udpate the img tag.
		let strIconURL = "https://openweathermap.org/img/wn/" + data.icon + "@2x.png"
		$("#current-icon").attr("src", strIconURL);

	}
	else if (type === "uvi") {

		// Check the value of the UV index and colour the badge accordingly by updating css.
		switch (true) {

			case (data < 3):
				$("#cur-uvi").css("background-color", "#006600");
				$("#cur-uvi").css("color", "#bfbfbf");
				break;
			case (data < 6):
				$("#cur-uvi").css("background-color", "#ffcc33");
				$("#cur-uvi").css("color", "#1a1a1a");
				break;
			case (data < 8):
				$("#cur-uvi").css("background-color", "#ff8000");
				$("#cur-uvi").css("color", "#1a1a1a");
				break;
			case (data < 11):
				$("#cur-uvi").css("background-color", "#b30000");
				$("#cur-uvi").css("color", "#bfbfbf");
				break;
			case (data >= 11):
				$("#cur-uvi").css("background-color", "#660066");
				$("#cur-uvi").css("color", "#bfbfbf");

		}

		$("#cur-uvi").text(data)

	}


}


// Render forecast and uv index data on the page.
function renderForecast(forecastData) {


	// Loop through the array and display data for each object.
	forecastData.forEach(function (day, i) {


		// Put a couple of jQuery selectors into strings to make calling easier.
		let strDiv = `#fcast-${i}`
		let strFcastDiv = `#fcast-data-${i}`

		// Convert some of the numerical data to strings and add some formatting.
		let strIconURL = "https://openweathermap.org/img/wn/" + day.icon + "@2x.png"
		let strMax = `${day.temp_max}`
		let strMin = `${day.temp_min}`
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


// Function to update the list of previously searched cities in localstorage.
function updateHistory(operation, city) {


	// Try and get items from storage. An array will be returned but it will be empty if there was nothing
	// in storage.
	let arrHistory = getHistory();


	// Add or remove the city.
	if (operation === "add") {

		// First set the MRU in localstorage
		localStorage.setItem("wdMRU", city);

		// Add the new value to the array if it doesn't exist.
		if (arrHistory.includes(city) === false) {

			arrHistory.push(city);

		}

		// Save back to localstorage.
		saveHistory(arrHistory);

	}
	else if (operation === "remove") {

		// Filter the array to remove the city.
		arrHistory = arrHistory.filter(item => item !== city)

		// If there's nothing left in the array, remove the entries from localstorage and search list.
		if (arrHistory.length === 0) {

			// Remove entries from localstorage.
			localStorage.removeItem("wdMRU");
			localStorage.removeItem("wdCities");

			// Disable the history button.
			$("#historyBtn").prop("disabled", true);

		}
		else {

			// Save back to localstorage.
			saveHistory(arrHistory);

		}

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


	let arrCities = localStorage.getItem("wdCities");

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


	// Save to local storage.
	localStorage.setItem("wdCities", JSON.stringify(arrCities));

	// Enable the history button now that there's something in localstorage.
	// Only if it wasn't already enabled.
	if ($("#historyBtn").prop("disabled")){

		$("#historyBtn").prop("disabled", false);

	}

}


// Function to retrieve the most recently searched city from storage.
function getMRU() {

	let mruCity = localStorage.getItem("wdMRU");
	return mruCity;

}


// Function to display something when something goes wrong with the search.
function showError(error) {

	let strErrorText;

	if (error === "fail") {

		strErrorText = "There was a problem completing your request. Please try again.";

	}
	else if (error === 404) {

		strErrorText = "That city could not be found. Please try again.";

	}

	$("#errorText").text(strErrorText);
	$(strCurrentDisplay).hide();
	$("#errorDisplay").show();
	strCurrentDisplay = "#errorDisplay"


}


// This function displays the history screen.
function showHistory() {


	// Populate the history list from localstorage.
	let arrCities = getHistory();

	arrCities.forEach(function (city) {

		// Add a new li to the list.
		// First create the new li, add classes and text.
		let newLI = $("<li>")
		newLI.addClass("list-group-item d-flex align-items-left history-item");
		newLI.text(city);

		// Add the search and remove buttons to the li.
		newLI.append(`<button class="btn btn-sm btn-primary ml-auto hist-search">Search</button>`);
		newLI.append(`<button class="btn btn-sm btn-danger ml-2 hist-remove">Remove</button>`);

		// Append the new history entry to the list.
		$("#historyList").append(newLI);

	})

	// If there are entries to show, also show the remove all button.
	if (arrCities.length > 0) {
		$("#btnRemoveAll").show();
	}

	// Show/hide the right screens.
	$(strCurrentDisplay).hide();
	strPreviousDisplay = strCurrentDisplay;
	$("#historyDisplay").show();
	strCurrentDisplay = "#historyDisplay";

	// Change the button appearance.
	$("#historyBtn").addClass("btn-warning");


}


// This function hides the history screen and displays the screen that was showing prior
// to it being opened.
function hideHistory() {


	$(strCurrentDisplay).hide();
	$(strPreviousDisplay).show();
	strCurrentDisplay = strPreviousDisplay;

	// Change the button appearance.
	$("#historyBtn").removeClass("btn-warning");

	// Remove items from the history ul.
	$(".history-item").remove();


}


// Function that runs when the page is first loaded. Check for the most recent city and
// if there is one, load data for it.
function loadWeatherScreen() {


	let city = getMRU();

	if (city) {

		// Get weather data.
		getWeatherData(city);

		// Populate options in the search list.
		updateSearchList();

		// Enable the history button.
		$("#historyBtn").prop("disabled", false);

	}
	else {

		// Show the welcome screen and update strCurrentDisplay.
		$("#welcomeDisplay").show();
		strCurrentDisplay = "#welcomeDisplay";

	}


}


// Listener for the search field
$("#citysearch").on("submit", function (event) {

	event.preventDefault();
	let selectedCity = $("#cityselect").val().trim().toLowerCase();

	// Clear the search box.
	$("#cityselect").val("");



	// Call getWeatherData to start collecting.
	getWeatherData(selectedCity);

});


// Listener for the history button. This button toggles the history screen.
$("#historyBtn").on("click", function (event) {


	event.preventDefault();


	// Toggle visibility of the history screen.
	if (strCurrentDisplay === "#historyDisplay") {

		hideHistory();

	}
	else {

		showHistory();

	}


});


// Listener for the search and remove buttons on the history screen.
$("#historyList").on("click", "button", function (event) {


	event.preventDefault();


	// Get the name of the selected item
	let strCityName = $(this).parent().contents()[0].textContent;


	// Call getWeatherData if the search button was clicked or remove the item
	// if the remove button was clicked.
	if ($(this).hasClass("hist-search")) {

		hideHistory();
		getWeatherData(strCityName);

	}
	else if ($(this).hasClass("hist-remove")) {

		// Call updateHistory to remove the item from storage and the options list.
		updateHistory("remove", strCityName);

		// Remove the item from the list.
		$(this).parent().remove();

		// If it was the last one, change the value of strPreviousDisplay so we go back
		// to the welcome screen after close. Also hide the remove all button.
		if ($(".history-item").length === 0) {

			strPreviousDisplay = $("#welcomeDisplay");
			$("#btnRemoveAll").hide();

		}

	}


});


// Listener for the remove all button on the history screen.
$("#btnRemoveAll").on("click", function (event) {


	event.preventDefault();

	// Remove entries from localstorage.
	localStorage.removeItem("wdMRU");
	localStorage.removeItem("wdCities");

	// Call updateSearchList to clean up search options.
	updateSearchList();

	// Remove items from the history screen list.
	$(".history-item").remove();

	// Hide the remove all button and disable the history button.
	$("#btnRemoveAll").hide();
	$("#historyBtn").prop("disabled", true);


	// Change the value of strPreviousDisplay so we go back to the welcome screen after close.
	strPreviousDisplay = $("#welcomeDisplay");


});


// Listener for the close button on the history screen.
$("#btnHistClose").on("click", function (event) {

	event.preventDefault();
	hideHistory();

})


// When the page loads, call loadWeatherScreen to render the page.
loadWeatherScreen();
