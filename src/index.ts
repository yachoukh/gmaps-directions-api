/*
 * Copyright 2019 Google LLC. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable no-undef, @typescript-eslint/no-unused-vars, no-unused-vars */
import './style.css';

let polyline = require('google-polyline');

let map: google.maps.Map;
let markerArray: google.maps.Marker[] = [];

function initMap(): void {
  // Instantiate a directions service.
  const directionsService = new google.maps.DirectionsService();

  // Create a map and center it on Manhattan.
  map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
    zoom: 13,
    center: { lat: 33.9854893, lng: -5.1813223 },
  });

  // Create a renderer for directions and bind it to the map.
  const directionsRenderer = new google.maps.DirectionsRenderer({ map: map });

  // Instantiate an info window to hold step text.
  const stepDisplay = new google.maps.InfoWindow();

  // Display the route between the initial start and end selections.
  calculateAndDisplayRoute(
    directionsRenderer,
    directionsService,
    markerArray,
    stepDisplay,
    map
  );

  // add event listeners for the buttons
  document
    .getElementById('show-markers')!
    .addEventListener('click', showMarkers);
  document
    .getElementById('hide-markers')!
    .addEventListener('click', hideMarkers);
  document
    .getElementById('delete-markers')!
    .addEventListener('click', deleteMarkers);
}

function calculateAndDisplayRoute(
  directionsRenderer: google.maps.DirectionsRenderer,
  directionsService: google.maps.DirectionsService,
  markerArray: google.maps.Marker[],
  stepDisplay: google.maps.InfoWindow,
  map: google.maps.Map
) {
  // First, remove any existing markers from the map.
  for (let i = 0; i < markerArray.length; i++) {
    markerArray[i].setMap(null);
  }

  // Retrieve the start and end locations and create a DirectionsRequest using
  // WALKING directions.
  directionsService
    .route({
      origin: { lat: 33.9854893, lng: -5.1813223 },
      destination: { lat: 33.8810713, lng: -5.5730396 },
      travelMode: google.maps.TravelMode.DRIVING,
    })
    .then((result: google.maps.DirectionsResult) => {
      // Route the directions and pass the response to a function to create
      // markers for each step.
      directionsRenderer.setDirections(result);
      addPolyline(result);
    })
    .catch((e) => {
      window.alert('Directions request failed due to ' + e);
    });
}

function addPolyline(directionResult: google.maps.DirectionsResult) {
  const polylinePath = directionResult.routes[0].overview_polyline;
  const latlngs = polyline.decode(polylinePath);

  for (let i = 0; i < latlngs.length; i++) {
    if (i % 2 == 0) {
      addMarker(new google.maps.LatLng(latlngs[i][0], latlngs[i][1]));
    }
  }

  console.log(latlngs);
}

// Adds a marker to the map and push to the array.
function addMarker(position: google.maps.LatLng | google.maps.LatLngLiteral) {
  const marker = new google.maps.Marker({
    position,
    map,
  });

  markerArray.push(marker);
}

// Sets the map on all markers in the array.
function setMapOnAll(map: google.maps.Map | null) {
  for (let i = 0; i < markerArray.length; i++) {
    markerArray[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function hideMarkers(): void {
  setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers(): void {
  setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers(): void {
  hideMarkers();
  markerArray = [];
}

export { initMap };
