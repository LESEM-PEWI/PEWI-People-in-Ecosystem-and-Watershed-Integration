/* This module provide support tools to the economic module, adjusting the cost to the inflation rate



 */

//import * as d3 from 'd3';


const printText = function(printdata){
    console.log(printdata);
}
//const fs = require('fs');
//const fastcsv = require('fast-csv');
function removeDuplicates(array, isEqual) {
    /**
     * Removes duplicates from a multidimensional array.
     * @param {Array} array - The multidimensional array to process.
     * @param {Function} [isEqual] - Optional function to define how to compare rows.
     *                               If not provided, compares the first two elements.
     * @returns {Array} - A new array with duplicates removed.
     */
    return array.reduce((accumulator, currentRow) => {
        const isDuplicate = accumulator.some(row => {
            return isEqual ? isEqual(row, currentRow) : row[0] === currentRow[0] && row[1] === currentRow[1];
        });

        if (!isDuplicate) {
            accumulator.push(currentRow);
        }
        return accumulator;
    }, []);
}

const loadCSVData = function(localDataPath) {
    /**
     * reads a /csv file as an array.
     * @param {localDataPath} string - string path reference to the pre-simulated ghg
     * this function is for backend only
     */
    try {
        const fileContent = fs.readFileSync(localDataPath, 'utf8'); // Read the file content
        const results = []; // Initialize an array to hold the parsed data

        // Split the CSV content by new lines
        const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== ''); // Filter out empty lines

        // Extract headers from the first line
        const headers = lines[0].split(',').map(header => header.trim());

        // Parse each subsequent line into an object
        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',').map(value => value.trim());
            const rowObject = {};

            // Map each header to its corresponding value
            headers.forEach((header, index) => {
                rowObject[header] = row[index] || null; // Use null for missing values
            });

            results.push(rowObject); // Add the row object to results
        }

        this.loadedData = results; // Store loaded data in the instance
        //console.log('Data loaded:', this.loadedData); // Log loaded data
        return results; // Return the parsed data
    } catch (error) {
        console.error('Error loading data:', error);
        return []; // Return an empty array on error
    }
}
const costAdjuster = function(data, column, factor = 1) {
    // Ensure data is an array
    if (!Array.isArray(data)) {
        throw new Error("Data must be an array.");
    }

    // Validate column name
    if (typeof column !== "string") {
        throw new Error("Column name must be a string.");
    }

    // Validate factor
    if (typeof factor !== "number") {
        throw new Error("Factor must be a number.");
    }

    for (let i = 0; i < data.length; i++) {
        const row = data[i];

        // Check if 'Value' exists and is numeric
        if (row.hasOwnProperty(column) && !isNaN(parseFloat(row[column]))) {
            // Convert the value to a number, multiply by the factor, and then assign it back
            row[column] = parseFloat(row[column]) * factor;
        }
    }
    return data;
}

function flattenNestedObject(arr){
    for(var key in arr){
        if(arr[key] instanceof Object){
            recursive_for(arr[key]);
        }else{
            console.log(arr[key]);
            console.log(key)
        }
    }
}

filterByValue = (data, soilType, columnName = 'soilType') => {
    // Check if data is loaded
    if (!data || data.length === 0) {
        return [];
    }

    // Use the filter method to return rows with the specified soil type
    let filterData = data.filter(row => row[columnName] === soilType);

    // Check if filterData is empty
    if (filterData.length === 0) {
        console.warn(`No data found for soil type: ${soilType}`);
        return [];
    }

    return filterData;
};



const filterByLandUseAndSoilType = (data, landUseTypes, soilTypes, precipitationLevel) => {
    // Check if data is loaded
    if (!data || data.length === 0) {
        console.error("Data not loaded yet or is empty.");
        return [];
    }

    // Ensure landUseTypes, soilTypes, and precipitationLevel are arrays
    landUseTypes = Array.isArray(landUseTypes) ? landUseTypes : [landUseTypes];
    soilTypes = Array.isArray(soilTypes) ? soilTypes : [soilTypes];
    precipitationLevel = Array.isArray(precipitationLevel) ? precipitationLevel : [precipitationLevel];

    // Convert arrays to sets for faster lookups
    const landUseSet = new Set(landUseTypes);
    const soilSet = new Set(soilTypes);
    const precipitationSet = new Set(precipitationLevel);

    // Filter data based on land use types, soil types, and precipitation levels
    const filteredData = data.filter(row =>
        landUseSet.has(row['code']) &&
        soilSet.has(row['SoilType']) &&
        precipitationSet.has(row['precipitation_level'])
    );
    // Check if filteredData is empty
    if (filteredData.length === 0) {
        console.warn(`No data found for the specified land use types: ${landUseTypes.join(', ')}, 
        precipitation levels: ${precipitationLevel.join(', ')}, 
        and soil types: ${soilTypes.join(', ')}`);
        return [];
    }
    // we don't want any duplicates as this is for each soil tileID
    return removeDuplicates(filteredData);
};


// This will fill the three objects for the three years
const soilTypeHolderArray = Array(3).fill().map(() => ({
    "A": 0, "B": 0, "C": 0, "D": 0, "G": 0, "K": 0, "L": 0, "M": 0, "N": 0, "O": 0, "Q": 0, "T": 0, "Y": 0
}));
// This will fill three objects for the three years
const landUseHolderArray = Array(3).fill().map(() =>(
    {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:0}
));
let econCostByLandUse = Array(4).fill().map(() =>(
    {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:0}
));



const filterArray  = function(arrayData, landUseType, soilType, precipLevel) {
    return arrayData.filter(v => v.SoilType === soilType && v.code ===landUseType && v.precipitation_level === precipLevel)
}


const getNetMixedFruitRevenue = (yieldPerAcre) => {
    if (yieldPerAcre > 6.88) {
        return 1017.44; // High yields
    } else if (yieldPerAcre > 4.4 && yieldPerAcre <= 6.88) {
        return 404.13; // Medium yields
    } else if (yieldPerAcre <= 4.4) {
        return 97.07; // Low yield
    } else {
        return 0; // You may want to handle edge cases here.
    }
};
let dataBushels = [];
let annualsPerBushel = {};
let landIDWithCostPerAcre = {};
let landIDWithCostPerBushel =[];
let landIDWithCostPerTon = null;
let landIDWithCostPerHead = {};
let combinedCostsHT = {};
let combinedHTKeys = [];


const grazingRatio = {6:550, 7: 55/35 * 550} // more explanation needed, got from pewi 4.0
dataBushels = [
  { crop: 'Conventional Corn', rotation: 'corn after soy', LU_ID: 1, cost_per_bushel: 3.53, unit: 'bushels' },
  { crop: 'Conventional Corn', rotation: 'Corn after Corn', LU_ID: 1, cost_per_bushel: 3.87, unit: 'bushels' },
  { crop: 'Conservation Corn', rotation: 'Corn after Corn', LU_ID: 2, cost_per_bushel: 3.56, unit: 'bushels' },
  { crop: 'Conservation Soybean', rotation: 'soy after corn', LU_ID: 3, cost_per_bushel: 8.76, unit: 'bushels' },
  { crop: 'Conservation Soybean', rotation: 'soy after soy', LU_ID: 4, cost_per_bushel: 8.57, unit: 'bushels' }
];
// conventional landUses
// due to lack of data, we repeat some data, eventually they will be replaced
annualsPerBushel= {
    // conventional corn
    '1-1': 3.87,
    '4-1': 3.53,
    '2-1': 3.53,
    '3-1': 3.53,
    1: 3.87,// no transition
    // conventional soybean
    '1-3': 8.76, '3-3': 8.76,
    '4-3': 8.76, '2-3': 8.76,
    3: 8.76, // no transition
    // conservation corn
    '1-2': 3.56,
    '4-2': 3.56,
    '2-2': 3.56,
    '3-2': 3.56,
    2: 3.56, // no transition
    // conservation soybean
    '1-4': 8.76, '3-4': 8.57,
    '4-4': 8.57, '2-4': 8.76,
    4: 8.57 // no transition
}


landIDWithCostPerAcre = {12:137, 13: 406, 14: 312, 9:205.0,
    15: 42622.47461,
    10:43.63904617, 11:43.63904617
} // see helper objects for description of each land use ID
landIDWithCostPerBushel  = [1,2,3,4];
landIDWithCostPerTon = { 5:84.8, 8:63.45}  // see helper objects for description of each land use ID
landIDWithCostPerHead = {6:3496.81, 7:3556}  // see helper objects for description of each land use ID
combinedCostsHT = { ...landIDWithCostPerHead, ...landIDWithCostPerTon };
combinedHTKeys = Object.keys(landIDWithCostPerTon).concat(Object.keys(landIDWithCostPerHead))
const sellingPricesHead = {6:5.6, 7:5.6}
let sellingPricesTon = {13: 60}
function getRandomSampleWithReplacement(arr, size) {
    return Array.from({ length: size }, () => arr[Math.floor(Math.random() * arr.length)]);
}

let sampleWithReplacement = getRandomSampleWithReplacement([1, 2, 3, 4, 5], 1);
landUseHolderArray[0]['1'] = 500
console.log(econCostByLandUse[0]['1'])

let landUseHumanIDs = {
    '0': 'none',
    '1': 'Conventional Corn',
    '2': 'Conservation Corn',
    '3': 'Conventional Soybean',
    '4': 'Conservation Soybean',
    '5': "Alfalfa",
    '6': 'Permanent Pasture',
    '7': 'Rotational Grazing',
    '8': 'Grass Hay',
    '9': 'Prairie',
    '10': 'Conservation Forest',
    '11': 'Conventional Forest',
    '12': 'Switch grass',
    '13': 'ShortRotation Woody Bioenergy',
    '14': 'Wetland',
    '15': 'Mixed Fruits Vegetables'
}

let reversedLandUseHumanIDs = {};
for (let key in landUseHumanIDs) {
    reversedLandUseHumanIDs[landUseHumanIDs[key]] = 0;
}


const convertLandUseIDsToTexts = (listOfObjectKeys) => {
    return listOfObjectKeys.map((obj, index) => {
        let converted = {};

        for (const key in obj) {
            const textKey = landUseHumanIDs[key];
            if (textKey) {
                converted[textKey] = obj[key];
            } else {
                console.error(`Key ${key} not found in landUseHumanIDs`);
            }
        }

        return converted; // index is preserved automatically by `map`
    });
};

//
let converted = convertLandUseIDsToTexts(econCostByLandUse);



// start of fillCells
const fillCells = () => {
    /// to be used for creating mapping data
    /// fills each cell with zero
    let holderObject = {};
    for (let j = 0; j < boardData[currentBoard].map.length; j++) {
        holderObject[j] = 0;

    }
    return holderObject
};
// end of fillCells

// Start of calculateStreamVolume
let calculateStreamVolume = function(board, y) { //calculates stream volume based on stream flow / ft3/3

    var streamFlowRate = 0; // ft3/s
    switch (board.precipitation[y]) {

        case 24.58:
            streamFlowRate = 3.65;
            break;
        case 28.18:
            streamFlowRate = 4.12;
            break;
        case 30.39:
            streamFlowRate= 4.42;
            break;
        case 32.16:
            streamFlowRate = 6.44;
            break;
        case 34.34:
            streamFlowRate = 6.85;
            break;
        case 36.47:
            streamFlowRate = 7.25;
            break;
        case 45.10:
            streamFlowRate = 11.53;
            break;
    }
    const secondsPerYear = 3600 * 24 * 365;
   return  streamFlowRate * secondsPerYear;

}; //End of calculateStreamVolume

// start of calculateNitrateMass
function calculateNitrateMass(volumeFt3PerYear, nitratePpm) {
    const LITERS_PER_FT3 = 28.3168;// source: https://www.metric-conversions.org/volume/cubic-feet-to-liters.htm
    const MG_TO_KG = 1e-6;

    // Convert volume to liters per year
    const volumeLiters = volumeFt3PerYear * LITERS_PER_FT3;

    // Calculate mass in mg/year then convert to kg/year, then to pounds
    return volumeLiters * nitratePpm * MG_TO_KG * 2.20462;
}
// end of calculateNitrateMass

// switch function for corn prices


console.log(calculateNitrateMass(139389120,10))

getCostPerLandUse = (landUseID) => {
    // source '../PEWI Budgets 2024$ - 2025$ (021425).xlsx'
    switch (landUseID) {
        // transitions involving corn
        // no transition
        case 1:
        case '1':
        case '1-1':

            return 3.87
        case '4-1':
        case '2-1':
        case '3-1':
            return 3.53
        // Conventional soybean
        case '1-3':
        case '3-3':
        case '4-3':
        case '2-3':
        case 3:
        case '3':
            return 8.76;

        // Conservation corn
        case '1-2':
        case '4-2':
        case '2-2':
        case '3-2':
        case 2: // no transitions
        case '2':
            return 3.56;

        // Conservation soybean
        case '1-4':
        case '2-4':
            return 8.76;

        case '3-4':
        case '4-4':
        case 4:
        case '4':
            return 8.57;

        case 5:
        case '5':
            return  554.75//84.8 // per tonne
        case 6:
        case '6':
            return 3496.81 // per head
        case 7:
        case '7':
            return 3556 // per head

        case 8:
        case '8':
            return 602.73 //acre // or 63.45 per tonne;
        case 9:
        case '9':
            return 205.0; // per acre
        case 10:
        case '10':
        case 11:
        case '11':
            return 43.63904617; // per acre

        case 12:
        case '12':
            return 137; // per acre
        case 13:
        case '13':
            return 406; // per acre
        case 14:
        case '14':
            return 312; // per acre
        case 15:
        case '15':
            return 42622.47461; // per acre
        case 'NA':
        case 0:
        case '0':
            return 0;
        default:
            return null; // or throw an error if unexpected value
    }
};
// if 90 pounds are applied per acre how many are lost
const calculatedVolumeFt3perYear =139389120
const pewiACRE = 6000
let totalNitrogen  = pewiACRE * 90
let calculatedLostNitrogenMass = calculateNitrateMass(calculatedVolumeFt3perYear,18)
console.log('Total nitrogen mass', totalNitrogen)
console.log('calculated nitrogen mass', calculatedLostNitrogenMass)
let percentageLost = calculatedLostNitrogenMass/totalNitrogen * 100
console.log("percentage lost: ", percentageLost)
console.log("======================================")
console.log(calculatedLostNitrogenMass * 3)
console.log(getCostPerLandUse('3-1'))


function nc(N) {
    const NITRATE_MAX_CONCENTRATION = 29.54
    N = Math.min(Math.max(N, 2), 29.54); // Clamp N between 2 and 29.54
    let fixedMaximum = calculateNitrateMass(calculatedVolumeFt3perYear, NITRATE_MAX_CONCENTRATION)

    return  (1 - ((N - 2) / (29.54 - 2))) * fixedMaximum;
}

const calculateNitrateLoad = function(nConC, streamDischarge) {
    const NITRATE_MAX_CONCENTRATION = 29.54
    let N = Math.min(Math.max(nConC, 2), NITRATE_MAX_CONCENTRATION); // Clamp N between 2 and 29.54
    console.log(N, 'N')
    // calculate the fixed maximum load
    const fixedMaximumLoad = calculateNitrateMass(streamDischarge, NITRATE_MAX_CONCENTRATION)
    //calculate nitrate load reduced
    return  (1 - ((N - 2) / (NITRATE_MAX_CONCENTRATION - 2))) * fixedMaximumLoad;
};

const dir = function(obj) {
    // Examines object properties or attributes
    const ownProps = Object.getOwnPropertyNames(obj);
    const protoProps = Object.getOwnPropertyNames(Object.getPrototypeOf(obj));
    return [...new Set([...ownProps, ...protoProps])];
}
console.log(calculateNitrateLoad(0, calculatedVolumeFt3perYear), 'reduced load')

