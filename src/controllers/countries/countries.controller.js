'use strict';

const co = require('co');
const errors = require('restify-errors');

const fetch = require('node-fetch');
const moment = require('moment');

const baseUrl = "https://d6wn6bmjj722w.population.io/1.0";

exports.getCountries = co.wrap(function* getCountries(req, res, next) {
  try {
    // const countries = countryHelper.getCountries();
    const countries = yield requestCall('countries') //pass the endpoint to fetch countries
    if(countries && countries.countries && countries.countries.length){
      res.json(countries.countries);
    }else{
      res.json([])
    }
    return next();
  } catch (err) {
    return next(new errors.InternalServerError(err, 'Server error retrieving countries.'));
  }
});

exports.getPopulation = co.wrap(function* getPopulation(req, res, next) {
  try {
    if(req.body.countries && req.body.countries.length != 0){
      let populationArray = [];
      let sortBy;
      const today = moment().format('YYYY-MM-DD');
      const countriesList = req.body.countries //get array of countries to fetch the population

      const sortMap = {ASC:(a, b) => (a.population > b.population) ? 1 : -1, 
        DESC: (a, b) => (a.population > b.population) ? -1 : 1}
      
      for (const country of countriesList) {
        let countryPopulation = yield requestCall(`population/${country}/${today}/`) //pass the endpoint to fetch population based on country
        let populationObject = {
          country: country,
          population: countryPopulation.total_population.population
        }
        populationArray.push(populationObject)
      }

      req.body.sort ? sortBy = req.body.sort : "ASC";

      //sort the array of population
      populationArray.sort(sortMap[req.body.sort])
      res.json(populationArray);
      return next();
    }else{
      throw "Please enter countries to fetch population"
    }
  } catch (err) {
    return next(new errors.InternalServerError(err, 'Server error retrieving population.'));
  }
});

//Make an external API call to the mentioned endpoint
async function requestCall(url) {
  try {
    const response = await fetch(`${baseUrl}/${url}`)
    const json = await response.json()

    //return json format of the response
    return json
  } catch (error) {
    throw error.message
  }
}