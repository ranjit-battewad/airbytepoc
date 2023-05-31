const { Client } = require("pg")
const dotenv = require("dotenv")
const moment = require('moment');
const format = require('pg-format'); 
dotenv.config()
 
// Database connection details, loaded from env file
const credentials = {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
};

const INTERVAL_VALUE = process.env.GENERATE_DATA_INTERVAL;

// const fromTime = "00:00";
// const toTime = "00:00";
// const interval = ; // seconds

async function getAssets(){

    const client = new Client(credentials);
    await client.connect();
    const assets = await client.query('SELECT * FROM public."WTT_Asset"');
    await client.end();

    return assets.rows;
}

async function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    // The maximum is exclusive and the minimum is inclusive
    return Math.floor(Math.random() * (max - min) + min); 
  }

function addMinutes(date, minutes) {
    const dateCopy = new Date(date);
    dateCopy.setMinutes(date.getMinutes() + minutes);
  
    return dateCopy;
}
async function testDate(dateValue = new Date()){
    let todaysDate = new Date('2023/05/29');
    todaysDate.setHours(0,0,0,0);
    const newDate = addMinutes(todaysDate,5);

    return newDate;
}

async function generateData(dateValue = new Date()){ // sample date input formate '2023/05/29'
   
    let maxValue = 143;
    let timeSeriesData = [];

    const listOfAssets = await getAssets();

    let todaysDate = dateValue;
    todaysDate.setHours(0,0,0,0);
  
    // let todaysDate = new Date();
    // todaysDate.setHours(0,0,0,0);
    // startDate_formated = moment(todaysDate, "DD-MM-YYYY HH:MM");

    for(let i=1; i<=maxValue; i++){

        const nextDateTime = addMinutes(todaysDate,INTERVAL_VALUE*i);
       
        for(let j=0; j<listOfAssets.length; j++){
            let assetId = listOfAssets[j].id;
            // Day or year X index of time array X 
            let calculatedValue = moment().dayOfYear() * i * assetId;

            // For db insert stmt formating the data to array or arrays
            let data = [];
                data.push(nextDateTime);
                data.push(assetId);
                data.push(calculatedValue);
            timeSeriesData.push(data);
        }
    }
   
    return timeSeriesData;
}

// Store all asset simulation data to database 

// @data - Array of objects
async function persistData(data){

    const client = new Client(credentials);
    await client.connect();
    let formatedData = format('INSERT INTO public."WTT_CustomerAssetsReading" ("ReadingDateTime", "AssetId","Value") VALUES %L', data);
    const assets = await client.query(formatedData);
    await client.end();
}

(async()=>{

    // let data = [['31 May 2023',1,1],['31 May 2023',1,1]];

    //const result3 = await persistData(data); 
    //const result1 = await generateData(new Date('2023/05/29')); // For specific date
    const result2 = await generateData(); // For default to today
    console.log(result2);
     const result3 = await persistData(result2); 
     console.log('%%%%%%%%')
     console.log(result3);

    // const result1 = await testDate();
    // console.log(result1);
    

})();
