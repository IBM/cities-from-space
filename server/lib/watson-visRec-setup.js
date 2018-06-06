/**
 * Copyright 2017 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

'use strict';

//require('dotenv').classifier({
//  silent: true
//});

const download = require('download');
const fs = require('fs'); // file system for loading training pictures


/**
 * Download training images from Box if we did not find a sample .zip.
 * We assume that if the file Houston_postive_examples.zip exists,
 * then we've already dowloaded all image files.
 * @return {Promise}
 */
WatsonVisRecSetup.prototype.downloadImages = function() {
  if (fs.existsSync('./data/Houston_positive_examples.zip')) {
    console.log('Image for Houston exists');
    return Promise.resolve();
  }
  // One zip file missing, so assume all need to be downloaded
  console.log('Downloading Image zip files...');
  return Promise.all([
         'https://ibm.box.com/shared/static/0lvqvc76bx3vw8bfn8vw9gw4x6w4hp5r.zip',
         'https://ibm.box.com/shared/static/ekdm5g8oqg8rpwx283yce32rg607xk1k.zip',
         'https://ibm.box.com/shared/static/yc652frh0t7tdp1741dpea5tvkynb7yw.zip',
         'https://ibm.box.com/shared/static/nog506nneb5f9wiex74rnb2s1tr91ea6.zip',
         'https://ibm.box.com/shared/static/d4sv71jkomye84sfi1nnh6xa8i5lfpgb.zip'
        ].map(x => download(x, './data'))).then(() => {
	console.log('files downloaded!');
        });
};

/**
 * Setup for Watson VisualRecognition.
 *
 * @param {Object} vizRecClient- VisualRecognition client
 * @constructor
 */
function WatsonVisRecSetup(vizRecClient) {
  this.vizRecClient = vizRecClient;
}

/**
 * Get the existing VisualRecognition Classifier.
 * classifier.name must match 'cities_from_space'.
 * @param {Object} params - VisualRecognition params so far.
 * @return {Promise} Promise with resolve({enhanced discovery params})
 * Note that we don't want to reject err, just carry on and create
 *  the custom classifier.
 */
WatsonVisRecSetup.prototype.getVisRecList = function(params) {
  return new Promise((resolve) => {
    this.vizRecClient.listClassifiers({}, (err,response) => {
      if (err) {
        console.log('Error in attempt to list VisualRecognition classifier. Error: ' + err);
        return resolve(params);
      } else {
        const classifiers = response.classifiers;
        for (let i = 0, size = classifiers.length; i < size; i++) {
          const classifier = classifiers[i];
          if (classifier.name === 'cities_from_space') {
            response.classifier_id = classifier.classifier_id;
            return resolve(response);
          }
        }
        console.log('Failed to find cities_from_space VisualRecognition classifier. Proceed to create one.');
        return resolve(response);
      }
    });
  });
};


/**
 * Create a VisualRecognition custom classifier if we did not find one.
 * If params include a classifier_id, then we already have one.
 * When we create one, we have to create it with our known name
 * ('cities_from_space') so that we can find it later.
 * @param {Object} params - All the params needed to use VisualRecognition.
 * @return {Promise}
 */
WatsonVisRecSetup.prototype.createVisRecClassifier = function(params) {
  if (params.classifiers.length > 0 && params.classifier_id) {
    return Promise.resolve(params);
  }
  return new Promise((resolve, reject) => {
    // No existing classifier_id found, so create it.
    var createClassifierParams = {
        name: 'cities_from_space',
        Houston_positive_examples: fs.createReadStream('./data/Houston_positive_examples.zip'),
        Chicago_positive_examples: fs.createReadStream('./data/Chicago_positive_examples.zip'),
        Perth_positive_examples: fs.createReadStream('./data/Perth_positive_examples.zip'),
        Tokyo_positive_examples: fs.createReadStream('./data/Tokyo_positive_examples.zip'),
        Paris_positive_examples: fs.createReadStream('./data/Paris_positive_examples.zip')
      };
    this.vizRecClient.createClassifier(createClassifierParams, (err, response) => {
      if (err) {
        console.error('Failed to create VisualRecognition classifier.');
        return reject(err);
      } else {
        console.log('Created VisualRecognition classifier: ', response);
        resolve(response);
      }
    });
  });
};


/**
 * Validate and setup the VisualRecognition service.
 */
WatsonVisRecSetup.prototype.setupVisRec = function(setupParams, callback) {
    this.downloadImages()
    .then(setupParams => this.getVisRecList(setupParams))
    .then(params => this.createVisRecClassifier(params))
    .then(params => callback(null, params))
    .catch(callback);
};

module.exports = WatsonVisRecSetup;
