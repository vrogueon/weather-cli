const fs = require('fs');
const axios = require('axios');

class Search {

    history = [];

    dbPath = './db/database.json';

    constructor () {
        this.readFromFile();
    }

    get mapboxParams() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get openWeatherParams() {
        return {
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es',
        }
    }

    get capitalizedHistory() {
        return this.history.map(places => {
            let words = places.split(' ');   
            words = words.map(l => l[0].toUpperCase() + l.substring(1));
            return words.join(' ');
        });
    }

    async city(place = '') {
        try {
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json`,
                params: this.mapboxParams
            });   
            const resp = await instance.get();
            return resp.data.features.map(place => ({
                id: place.id,
                name: place.place_name,
                lng: place.center[0],
                lat: place.center[1]
            }));
        } catch (error) {
            return [];
        }
    }

    async cityWeather(lat = 0, lon = 0) {
        try {
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.openWeatherParams, lat, lon}
            });
            const resp = await instance.get();
            const {weather, main} = resp.data;

            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }
        } catch (err) {
            
            throw err;
        }
    }

    async addHistory(place = '') {
        if(this.history.includes(place.toLocaleLowerCase())) return;
        this.history = this.history.splice(0,4);
        this.history.unshift(place.toLocaleLowerCase());
        this.saveToFile();
    }

    saveToFile() {
        const payload = {
            history: this.history
        };
        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    readFromFile() {
        if(!fs.existsSync(this.dbPath)) return;
        const info = fs.readFileSync(this.dbPath, {encoding: 'utf-8'});
        if (!info) return;
        const data = JSON.parse(info);
        this.history = data.history;
    }
}

module.exports = Search