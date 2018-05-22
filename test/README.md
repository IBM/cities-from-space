## Testing

Run unit and funtional tests with:
`npm test`

## Manual Tests

Test your server and Visual Recognition classification by executing
the following in a shell:

### get your API key from the Visual Recognition service credentials
```
export API_KEY=<your_api_key>
```

### List your classifiers
```
curl -X GET "https://gateway-a.watsonplatform.net/visual-recognition/api/v3/classifiers?api_key=$API_KEY&version=2016-05-20"
```

### set ENV variable for your classifier
```
export CLASSIFIER=<your_classifer>
```

### Classify image with your custom classifier
#### export IMAGE_FILE for each image file in test/data/ dir
```
export IMAGE_FILE=Houston_test.jpg

curl -X POST -F "images_file=@data/$IMAGE_FILE" "https://gateway-a.watsonplatform.net/visual-recognition/api/v3/classify?api_key=$API_KEY&classifier_ids=$CLASSIFIER&version=2016-05-20"
```

## Travis CI

Note that running the functional tests in TravisCI require a Visual
Recognition API key.

[Travis Environment Variables](https://docs.travis-ci.com/user/environment-variables/#Defining-encrypted-variables-in-.travis.yml)

With travis installed via

 `gem install travis`

 encrypt with:

`travis encrypt VISUAL_RECOGNITION_API_KEY=<your_API_key>`

The output will look like:
```
Please add the following to your .travis.yml file:

  secure: "r7R+dsmsMYOwPSwq32EG2+qtw49/2nIiEvU1pj1GtATfGnDkt4YjdS6LWKZ2KpE4F3hjx9QqQsJVnZS2O/1EZmZWeS6Gjv3g/uTxvuz8djfrBGkT65tL9pILT1mviQxt3Uf4W/mZxAveVHq6aYST7NI716+1eTBEUXCHR2TEA0zbsaPvbMprRz2Kz8ixLc0eT9umXjlvK+EUP6H+wtlKUltN2k1PYd<snip_for_brevity>"
```

Put this in your .travis.yml file like this:
```
env:
  global:
    - secure: <some_string_of_encrypted_data>
```

> Note: You can add directly to the .travis.yml file with the following, but beware that it can add artifacts to the file that will render it non-working: `travis encrypt VISUAL_RECOGNITION_API_KEY=<your_API_key> --add .travis.yml`
