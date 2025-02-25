const apiURL = "https://restcountries.com/v3.1/all";
let countries = [];
let groupedCountries = {};
let expandedSubregions = new Set();
let currentPage = 1;
const rowsPerPage = 7;

fetch(apiURL)
    .then(response => response.json())
    .then(data => {
        countries = data.map(country => ({
            name: country.name.common,
            capital: country.capital ? country.capital[0] : "N/A",
            population: country.population,
            area: country.area || 0,
            subregion: country.subregion || "No Subregion"
        }));

        groupBySubregion();
        renderTable();
        setupPagination();
    });


function groupBySubregion() {
    groupedCountries = countries.reduce((groups, country) => {
        const subregion = country.subregion;
        if (!groups[subregion]) {
            groups[subregion] = { countries: [], totalPopulation: 0, totalArea: 0 };
        }
        groups[subregion].countries.push(country);
        groups[subregion].totalPopulation += country.population;
        groups[subregion].totalArea += country.area;
        return groups;
    }, {});
}



function setupToggleButtons() {
    document.querySelectorAll(".toggle-btn").forEach(button => {
        button.addEventListener("click", (event) => {
            const subregion = event.target.dataset.subregion;
            if (expandedSubregions.has(subregion)) {
                expandedSubregions.delete(subregion);
            } else {
                expandedSubregions.add(subregion);
            }
            renderTable();
        });
    });
}

function setupPagination() {
    const pagination = document.getElementById("pagination");
    const prevPageButton = document.getElementById("prev-page");
    const nextPageButton = document.getElementById("next-page");

    pagination.innerHTML = "";

    const totalSubregions = Object.keys(groupedCountries).length;
    const totalPages = Math.ceil(totalSubregions / rowsPerPage);

    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;

    prevPageButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    };

    nextPageButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    };

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.classList.add("page-btn");
        if (i === currentPage) {
            pageButton.classList.add("active");
        }
        pageButton.addEventListener("click", () => {
            currentPage = i;
            renderTable();
        });
        pagination.appendChild(pageButton);
    }

    pagination.insertBefore(prevPageButton, pagination.firstChild);
    pagination.appendChild(nextPageButton);
}

let filterCriteria = {
    name: "",
    capital: "",
    minPopulation: null
};


function updateFilterCriteria() {
    filterCriteria.name = document.getElementById("filter-name").value.toLowerCase();
    filterCriteria.capital = document.getElementById("filter-capital").value.toLowerCase();
    filterCriteria.minPopulation = parseInt(document.getElementById("filter-min-population").value) || null;
    renderTable();
}


function applyFilters(countries) {
    return countries.filter(country => {
        const matchesName = filterCriteria.name
            ? country.name.toLowerCase().startsWith(filterCriteria.name)
            : true;
        const matchesCapital = filterCriteria.capital
            ? country.capital.toLowerCase().startsWith(filterCriteria.capital)
            : true;
        const matchesMinPopulation = filterCriteria.minPopulation === null || country.population >= filterCriteria.minPopulation;

        return matchesName && matchesCapital && matchesMinPopulation;
    });
}


function renderTable() {
    const tableBody = document.getElementById("table-body");
    tableBody.innerHTML = "";

    const filteredCountries = applyFilters(countries);

    groupedCountries = filteredCountries.reduce((groups, country) => {
        const subregion = country.subregion;
        if (!groups[subregion]) {
            groups[subregion] = { countries: [], totalPopulation: 0, totalArea: 0 };
        }
        groups[subregion].countries.push(country);
        groups[subregion].totalPopulation += country.population;
        groups[subregion].totalArea += country.area;
        return groups;
    }, {});

    const subregionKeys = Object.keys(groupedCountries);
    const totalSubregions = subregionKeys.length;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalSubregions);

    const visibleSubregions = subregionKeys.slice(startIndex, endIndex);

    visibleSubregions.forEach(subregion => {
        const data = groupedCountries[subregion];
        const subregionRow = document.createElement("tr");
        subregionRow.classList.add("subregion-row");
        subregionRow.dataset.subregion = subregion;
        subregionRow.innerHTML = `
            <td colspan="5">
                <strong>${subregion}</strong> - Population: ${data.totalPopulation.toLocaleString()}, Area: ${data.totalArea.toLocaleString()} km²
            </td>
        `;
        tableBody.appendChild(subregionRow);

        subregionRow.addEventListener("click", () => {
            if (expandedSubregions.has(subregion)) {
                expandedSubregions.delete(subregion);
            } else {
                expandedSubregions.add(subregion);
            }
            renderTable();
        });

        if (expandedSubregions.has(subregion)) {
            data.countries.forEach(country => {
                const countryRow = document.createElement("tr");
                countryRow.innerHTML = `
                    <td>${country.name}</td>
                    <td>${country.capital}</td>
                    <td>${country.population.toLocaleString()}</td>
                    <td>${country.area.toLocaleString()}</td>
                    <td>${country.subregion}</td>
                `;
                tableBody.appendChild(countryRow);
            });
        }
    });

    setupPagination();
}


