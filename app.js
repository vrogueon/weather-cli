require('dotenv').config();

const { 
    pause, 
    inquirerMenu, 
    readInput,
    listPlaces
} = require("./helpers/inquirer");
const Search = require("./models/search");


const main = async() => {
    const search = new Search();
    let opt = '';
    
    do {
        opt = await inquirerMenu();
        switch (opt) {
            case 1:
                const search_term = await readInput('Ciudad:');
                const places = await search.city(search_term);
                const id = await listPlaces(places);
                if(id === 0) continue;
                const selectedPlace = places.find(p => p.id === id);
                search.addHistory(selectedPlace.name);
                const cityWeather = await search.cityWeather(selectedPlace.lat, selectedPlace.lng);
                
                console.clear();
                console.log('\nInformación de la ciudad\n'.green);
                console.log('Ciudad:', `${selectedPlace.name}`.green);
                console.log('Lat:', selectedPlace.lat);
                console.log('Lng:', selectedPlace.lng);
                console.log('Temperatura:', cityWeather.temp, '°C'.blue);
                console.log('Min:', cityWeather.min, '°C'.blue);
                console.log('Max:', cityWeather.max, '°C'.blue);
                console.log('Como está el clima:', cityWeather.desc.green);
            break;
            case 2:
                search.capitalizedHistory.forEach((place, i) => {
                    const index = `${i + 1}.`.green;
                    console.log(`${index} ${place}`);
                });
            break;
        }
        await pause();
    } while (opt !== 0);
}

main();