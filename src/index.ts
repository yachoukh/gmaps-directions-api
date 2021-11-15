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

var polyline = require('google-polyline');

function initMap(): void {
  const markerArray: google.maps.Marker[] = [];

  // Instantiate a directions service.
  const directionsService = new google.maps.DirectionsService();

  // Create a map and center it on Manhattan.
  const map = new google.maps.Map(
    document.getElementById('map') as HTMLElement,
    {
      zoom: 13,
      center: { lat: 40.771, lng: -73.974 },
    }
  );

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

  // Listen to change events from the start and end lists.
  const onChangeHandler = function () {
    calculateAndDisplayRoute(
      directionsRenderer,
      directionsService,
      markerArray,
      stepDisplay,
      map
    );
  };

  (document.getElementById('start') as HTMLElement).addEventListener(
    'change',
    onChangeHandler
  );
  (document.getElementById('end') as HTMLElement).addEventListener(
    'change',
    onChangeHandler
  );
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
      travelMode: google.maps.TravelMode.WALKING,
    })
    .then((result: google.maps.DirectionsResult) => {
      // Route the directions and pass the response to a function to create
      // markers for each step.
      (document.getElementById('warnings-panel') as HTMLElement).innerHTML =
        '<b>' + result.routes[0].warnings + '</b>';
      directionsRenderer.setDirections(result);
      showSteps(result, markerArray, stepDisplay, map);
      addPolyline(result, map);
    })
    .catch((e) => {
      window.alert('Directions request failed due to ' + e);
    });
}

function showSteps(
  directionResult: google.maps.DirectionsResult,
  markerArray: google.maps.Marker[],
  stepDisplay: google.maps.InfoWindow,
  map: google.maps.Map
) {
  // For each step, place a marker, and add the text to the marker's infowindow.
  // Also attach the marker to an array so we can keep track of it and remove it
  // when calculating new routes.
  const myRoute = directionResult!.routes[0]!.legs[0]!;

  for (let i = 0; i < myRoute.steps.length; i++) {
    const marker = (markerArray[i] =
      markerArray[i] || new google.maps.Marker());

    marker.setMap(map);
    marker.setPosition(myRoute.steps[i].start_location);
    attachInstructionText(
      stepDisplay,
      marker,
      myRoute.steps[i].instructions,
      map
    );
  }
}

function attachInstructionText(
  stepDisplay: google.maps.InfoWindow,
  marker: google.maps.Marker,
  text: string,
  map: google.maps.Map
) {
  google.maps.event.addListener(marker, 'click', () => {
    // Open an info window when the marker is clicked on, containing the text
    // of the step.
    stepDisplay.setContent(text);
    stepDisplay.open(map, marker);
  });
}

function addPolyline(
  directionResult: google.maps.DirectionsResult,
  map: google.maps.Map
) {
  const polylinePath = directionResult.routes[0].overview_polyline;

  const latlngs = polyline.decode(polylinePath);

  let i, marker;

  for (i = 0; i < latlngs.length; i++) {
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(latlngs[i][0], latlngs[i][1]),
      map: map,
    });
  }

  console.log(latlngs);
}

export { initMap };
