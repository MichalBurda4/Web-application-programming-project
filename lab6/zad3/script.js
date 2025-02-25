async function fetchData() {
    try {
        const response = await fetch('city.json');
        const cities = await response.json();

        // a) Miasta z województwa małopolskiego
        const malopolskieCities = cities.filter(city => city.province === 'małopolskie');
        document.getElementById('a').innerText += ` ${malopolskieCities.map(city => city.name).join(', ')}`;

        // b) Miasta z dwoma 'a' w nazwie
        const twoAsCities = cities.filter(city => (city.name.match(/a/g) || []).length === 2);
        document.getElementById('b').innerText += ` ${twoAsCities.map(city => city.name).join(', ')}`;

        // c) Piąte miasto pod kątem gęstości zaludnienia
        const fifthDensityCity = cities
            .slice() // Kopia tablicy, by nie modyfikować oryginalnej
            .sort((a, b) => (b.density || 0) - (a.density || 0))[4]; // Piąte miasto po gęstości
        document.getElementById('c').innerText += ` ${fifthDensityCity ? fifthDensityCity.name : 'Brak danych'}`;

        // d) Miasta powyżej 100000 mieszkańców z dodanym 'city'
        const citySuffixCities = cities
            .filter(city => city.people > 100000)
            .map(city => `${city.name} City`);
        document.getElementById('d').innerText += ` ${citySuffixCities.join(', ')}`;

        // e) Porównanie liczby miast powyżej i poniżej 80000 mieszkańców
        const above80000 = cities.filter(city => city.people > 80000).length;
        const below80000 = cities.filter(city => city.people <= 80000).length;
        document.getElementById('e').innerText += ` Powyżej 80000: ${above80000}, Poniżej 80000: ${below80000}`;

        // f) Średnia powierzchnia miast z powiatów zaczynających się na literę 'P'
        const pTownshipCities = cities
            .filter(city => city.township && city.township.startsWith('P'));
        const avgArea = pTownshipCities.reduce((sum, city) => sum + (city.area || 0), 0) / pTownshipCities.length;
        document.getElementById('f').innerText += pTownshipCities.length > 0
            ? ` Średnia powierzchnia: ${avgArea.toFixed(2)} km²`
            : ' Brak miast z powiatów zaczynających się na "P".';

        // g) Czy wszystkie miasta z pomorskiego są większe od 5000 osób i ile jest takich miast
        const pomorskieCities = cities.filter(city => city.province === 'pomorskie');
        const allAbove5000 = pomorskieCities.every(city => city.people > 5000);
        const citiesAbove5000 = pomorskieCities.filter(city => city.people > 5000).length;
        document.getElementById('g').innerText += ` Wszystkie miasta z Pomorskiego mają więcej niż 5000 mieszkańców: ${allAbove5000 ? 'Tak' : 'Nie'}, Liczba takich miast: ${citiesAbove5000}, Liczba miast: ${pomorskieCities.length}`;
    } catch (error) {
        console.error('Błąd podczas ładowania danych:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchData);
