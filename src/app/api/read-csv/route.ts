import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';

// List of real countries (you can extend this list)
const realCountries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia",
    "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus",
    "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil",
    "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
    "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
    "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
    "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini",
    "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece",
    "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland",
    "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan",
    "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo", "Kuwait", "Kyrgyzstan",
    "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
    "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania",
    "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
    "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua",
    "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea",
    "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
    "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone",
    "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan",
    "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan",
    "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
    "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
    "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

// Manual mapping of countries to their continents
const countryToContinent: Record<string, string> = {
    "Afghanistan": "Asia", "Albania": "Europe", "Algeria": "Africa", "Andorra": "Europe", "Angola": "Africa",
    "Antigua and Barbuda": "America", "Argentina": "America", "Armenia": "Asia", "Australia": "Australia",
    "Austria": "Europe", "Azerbaijan": "Asia", "Bahamas": "America", "Bahrain": "Asia", "Bangladesh": "Asia",
    "Barbados": "America", "Belarus": "Europe", "Belgium": "Europe", "Belize": "America", "Benin": "Africa",
    "Bhutan": "Asia", "Bolivia": "America", "Bosnia and Herzegovina": "Europe", "Botswana": "Africa",
    "Brazil": "America", "Brunei": "Asia", "Bulgaria": "Europe", "Burkina Faso": "Africa", "Burundi": "Africa",
    "Cabo Verde": "Africa", "Cambodia": "Asia", "Cameroon": "Africa", "Canada": "America",
    "Central African Republic": "Africa", "Chad": "Africa", "Chile": "America", "China": "Asia", "Colombia": "America",
    "Comoros": "Africa", "Congo": "Africa", "Costa Rica": "America", "Croatia": "Europe", "Cuba": "America",
    "Cyprus": "Asia", "Czech Republic": "Europe", "Denmark": "Europe", "Djibouti": "Africa", "Dominica": "America",
    "Dominican Republic": "America", "East Timor": "Asia", "Ecuador": "America", "Egypt": "Africa",
    "El Salvador": "America", "Equatorial Guinea": "Africa", "Eritrea": "Africa", "Estonia": "Europe",
    "Eswatini": "Africa", "Ethiopia": "Africa", "Fiji": "Australia", "Finland": "Europe", "France": "Europe",
    "Gabon": "Africa", "Gambia": "Africa", "Georgia": "Asia", "Germany": "Europe", "Ghana": "Africa",
    "Greece": "Europe", "Grenada": "America", "Guatemala": "America", "Guinea": "Africa", "Guinea-Bissau": "Africa",
    "Guyana": "America", "Haiti": "America", "Honduras": "America", "Hungary": "Europe", "Iceland": "Europe",
    "India": "Asia", "Indonesia": "Asia", "Iran": "Asia", "Iraq": "Asia", "Ireland": "Europe", "Israel": "Asia",
    "Italy": "Europe", "Jamaica": "America", "Japan": "Asia", "Jordan": "Asia", "Kazakhstan": "Asia",
    "Kenya": "Africa", "Kiribati": "Australia", "Korea, North": "Asia", "Korea, South": "Asia", "Kosovo": "Europe",
    "Kuwait": "Asia", "Kyrgyzstan": "Asia", "Laos": "Asia", "Latvia": "Europe", "Lebanon": "Asia",
    "Lesotho": "Africa", "Liberia": "Africa", "Libya": "Africa", "Liechtenstein": "Europe", "Lithuania": "Europe",
    "Luxembourg": "Europe", "Madagascar": "Africa", "Malawi": "Africa", "Malaysia": "Asia", "Maldives": "Asia",
    "Mali": "Africa", "Malta": "Europe", "Marshall Islands": "Australia", "Mauritania": "Africa",
    "Mauritius": "Africa", "Mexico": "America", "Micronesia": "Australia", "Moldova": "Europe", "Monaco": "Europe",
    "Mongolia": "Asia", "Montenegro": "Europe", "Morocco": "Africa", "Mozambique": "Africa", "Myanmar": "Asia",
    "Namibia": "Africa", "Nauru": "Australia", "Nepal": "Asia", "Netherlands": "Europe", "New Zealand": "Australia",
    "Nicaragua": "America", "Niger": "Africa", "Nigeria": "Africa", "North Macedonia": "Europe", "Norway": "Europe",
    "Oman": "Asia", "Pakistan": "Asia", "Palau": "Australia", "Panama": "America", "Papua New Guinea": "Australia",
    "Paraguay": "America", "Peru": "America", "Philippines": "Asia", "Poland": "Europe", "Portugal": "Europe",
    "Qatar": "Asia", "Romania": "Europe", "Russia": "Europe", "Rwanda": "Africa", "Saint Kitts and Nevis": "America",
    "Saint Lucia": "America", "Saint Vincent and the Grenadines": "America", "Samoa": "Australia",
    "San Marino": "Europe", "Sao Tome and Principe": "Africa", "Saudi Arabia": "Asia", "Senegal": "Africa",
    "Serbia": "Europe", "Seychelles": "Africa", "Sierra Leone": "Africa", "Singapore": "Asia",
    "Slovakia": "Europe", "Slovenia": "Europe", "Solomon Islands": "Australia", "Somalia": "Africa",
    "South Africa": "Africa", "South Sudan": "Africa", "Spain": "Europe", "Sri Lanka": "Asia", "Sudan": "Africa",
    "Suriname": "America", "Sweden": "Europe", "Switzerland": "Europe", "Syria": "Asia", "Taiwan": "Asia",
    "Tajikistan": "Asia", "Tanzania": "Africa", "Thailand": "Asia", "Timor-Leste": "Asia", "Togo": "Africa",
    "Tonga": "Australia", "Trinidad and Tobago": "America", "Tunisia": "Africa", "Turkey": "Asia",
    "Turkmenistan": "Asia", "Tuvalu": "Australia", "Uganda": "Africa", "Ukraine": "Europe",
    "United Arab Emirates": "Asia", "United Kingdom": "Europe", "United States": "America", "Uruguay": "America",
    "Uzbekistan": "Asia", "Vanuatu": "Australia", "Vatican City": "Europe", "Venezuela": "America",
    "Vietnam": "Asia", "Yemen": "Asia", "Zambia": "Africa", "Zimbabwe": "Africa"
};

export async function GET() {
    const csvFilePath = path.join(process.cwd(), 'src/data', 'population.csv'); // Adjust path
    const results: Record<string, unknown[]> = {}; // Object to hold the final structured data

    try {
        const fileStream = fs.createReadStream(csvFilePath).pipe(csv());

        for await (const data of fileStream) {
            
            const year = data["Year"];
            const countryName = data["Country name"];
            
            // Only process real countries
            if (!realCountries.includes(countryName)) {
                continue; // Skip fake country names
            }

            // Map continent based on the country
            const continent = countryToContinent[countryName] || "Unknown"; // Fallback to "Unknown" if not mapped

            // If the year doesn't exist in the results object, initialize it as an empty array
            if (!results[year]) {
                results[year] = [];
            }

            // Push the structured data for each row into the respective year array
            results[year].push({
                Country_name: countryName,
                Population: Number(data["Population"]),
                Continent: continent
            });
        }
        // Return the structured JSON
        return NextResponse.json(results, { status: 200 });
    } catch (error) {
        console.error("Error:", error); // Log the error
        return NextResponse.json({ message: 'Error reading CSV file', error }, { status: 500 });
    }
}
