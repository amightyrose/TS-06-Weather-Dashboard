# TS-06-Weather-Dashboard

<div align="center">
	<img src="https://user-images.githubusercontent.com/69242373/93987013-6355a600-fdca-11ea-840c-51373370614a.png">
</div>

## Introduction

Weather Dashboard is an application that can display current and forecast weather for a given location.

The application can be accessed here: <https://timsilby.github.io/TS-06-Weather-Dashboard/>

## Features

The application features the following functionality:

* Search weather for major world cities.
* Display current temperature, wind speed, humidity and uv index for the city.
* Display the forecast for the next 5 days, including minimum and maximum temperatures, humidity and chance of precipitation.
* Searches are saved into a search history which is available in the search box.
* Search history can be displayed on a separate screen.
* From the history screen it is possible to search from history items or remove history items.
* When the application is started, data is automatically shown for the most recently searched city.

## Usage

1. Open a web browswer and go to <https://timsilby.github.io/TS-06-Weather-Dashboard/>.
2. Enter a city name in the search box and click the search button (or press Enter).
3. View results.
4. To access the search history, click the "Search History" button on the navbar.
   * Click the "Search" button on any history item to repeat the search for that city.
   * Click the "Remove" button to remove an item from history. This will also remove it from the history list in the search box.
   * Click the "Remove All" button to clear the history entirely. The user will then be shown the welcome on closing or reloading.

## Screenshots

#### The welcome screen

<div align="center">
	<img src="https://user-images.githubusercontent.com/69242373/93987013-6355a600-fdca-11ea-840c-51373370614a.png">
</div>

#### The weather display

<div align="center">
	<img src="https://user-images.githubusercontent.com/69242373/93989180-ef68cd00-fdcc-11ea-8da5-c5a6bfb7c5be.png">
</div>

#### History list shown at the search box

<div align="center">
	<img src="https://user-images.githubusercontent.com/69242373/93989340-20490200-fdcd-11ea-944f-73346dc2372f.png">
</div>

#### The history screen

<div align="center">
	<img src="https://user-images.githubusercontent.com/69242373/93989400-33f46880-fdcd-11ea-890d-7b83655be30a.png">
</div>


## Technical Details

The application was written in JavaScript and uses jQuery. It uses localstorage to save the search history.

Styling was done with BootSwatch using the Darkly theme.

Time display uses moment.js.

---

#### Author

Tim Silby (tim.silby@gmail.com)