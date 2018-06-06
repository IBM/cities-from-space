/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/* eslint-env browser */

"use strict";

/**
 * Add detected object info as a row in the table.
 * @param {Object} table
 * @param {string} cellType
 * @param {[]} values
 * @param {string} classname
 */
function addRow(table, cellType, values, classname) {
  const row = document.createElement('tr');
  if (classname) {
    row.className = classname
  }
  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    const cell = document.createElement(cellType);
    const text = document.createTextNode(val);
    cell.appendChild(text);
    row.appendChild(cell);
  }
  table.appendChild(row);
}

/**
 * Create and populate a table to show the result details.
 * @param {[]} detectedObjects
 * @param {Object} parent
 */
function detectedObjectsTable(detectedObjects, parent) {
  let max = 0;
  if (detectedObjects.length > 0) {
    const table = document.createElement('table');

    addRow(table, 'th', ['Class', 'Confidence Score']);

    for (let i = 0; i < detectedObjects.length; i++) {
      const obj = detectedObjects[i];
      const label = obj['class'];
      const score = obj['score'].toFixed(3)
      const conf = score;
      if (score > max) {
        if (max > 0) {
          table.getElementsByClassName('maximum')[0].classList.remove('maximum')
        }
        max = score
        addRow(table, 'td', [label, conf], 'maximum');
      } else {
        addRow(table, 'td', [label, conf]);
      }
    }
    parent.appendChild(table);
  }
}

/**
 * Display the provided image {src} in the #image-preview div.
 * @param {string} src
 */
function showImagePreview(src) {
  clearArticle()
  // modify the src of the imagepreview <div> element
  const imagePreview = document.getElementById('image-preview');
  imagePreview.src = src;
  imagePreview.style = "display: block;";
}

/**
 * Populate the article/table with formatted results from Watson VisRec.
 * @param {Object} jsonResult
 */
function populateArticle(jsonResult) {
  // hide the loading message for Watson VisRec
  ToggleLoadingMessage('none')
  clearArticle()

  const article = document.querySelector('article');

  if (jsonResult.hasOwnProperty('data')) {

    let classified = jsonResult.data.classes;
    const myCount = document.createElement('h3');
    myCount.textContent = "Watson sees...";
    article.appendChild(myCount);
    detectedObjectsTable(classified, article);
  } else {
    const myDiv = document.createElement('div');
    myDiv.className = 'error';
    myDiv.id = 'error-div';
    const myTitle = document.createElement('h3');
    myTitle.textContent = 'ERROR';
    myDiv.appendChild(myTitle);
    // Dump keys/values to show error info
    for (const key in jsonResult) {
      if (jsonResult.hasOwnProperty(key)) {
        const myP = document.createElement('p');
        myP.textContent = key + ':  ' + jsonResult[key];
        myDiv.appendChild(myP);
      }
    }
    article.appendChild(myDiv);
  }
}

/**
 * Clear the content of the article/table
 */
function clearArticle() {
  const article = document.querySelector('article');
  // Remove previous results
  article.innerHTML = '';
}

window.addEventListener('load', function() {
  // When upload results are loaded (hidden), use them build the results.
  const raw = top.frames['mytarget'];
  const myTarget = document.getElementById('mytarget');
  if (myTarget) { // optional for tests
    myTarget.addEventListener('load', function() {
      let rawContent = raw.document.body.innerText;
      console.log(rawContent);
      let rawJson = JSON.parse(rawContent);
      console.log(rawJson);
      populateArticle(rawJson);
    });
  }

  // image preview
  document.getElementById("foo").addEventListener("change", imagePreview);
  function imagePreview() {
    let input = document.querySelector('input[type=file]');
    if (input.files && input.files[0]) {
      let fileReader = new FileReader();
      fileReader.onload = function () {
        showImagePreview(fileReader.result)
      };

      fileReader.readAsDataURL(input.files[0]);
    }
  }
});

/**
 * Push a sample image file to Watson VisualRecognition for a given city.
 * @param {string} city
 */
function loadSampleImage(city) {
  console.log(city);
  showImagePreview('./img/test/' + city + '_test.jpg')
  // show the loading message for Watson VisRec
  ToggleLoadingMessage('block')
  // Clear any existing file seleciton
  document.getElementById("foo").value = "";
  // ready the HTTP Request
  var xhttp = new XMLHttpRequest();
  // what should we do on response?
  xhttp.onreadystatechange = function() {
    // if request is completed and received a 200 OK HTTP response
    if (this.readyState == 4 && this.status == 200) {
      console.log(this.responseText)
      populateArticle(JSON.parse(this.responseText))
    }
  };
  // define the URL to call
  xhttp.open("GET", "/sample/" + city, true);
  // send the request
  xhttp.send()
}

/**
 * Show the Watson VisRec loading message
  * @param {string} display - should equal <block> or <none>
 */
function ToggleLoadingMessage(display) {
  var message = document.getElementsByClassName('loading-message')[0]
  message.style = "display: " + display
}
