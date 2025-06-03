// Define the function


var Economics = function () {
  this.rawData;
  this.rawBMPData;
  this.mapData = [];
  this.data = [];
  this.data4 = [];
  this.loadedGHGData = [];
  this.GHGsScore =[]
  this.GHGs = [];
  this.dataSubcrop = {};
  this.data3 = [];
  this.data3ByLU = [];
  this.data5=[];
  this.rawRev=[];
  this.scaledRev=[];
  this.cornAfters=[];
  this.getCropYields=[];
  this.getForrestYields=[];
  this.getBMPAreas=[];
  this.getSoilArea=[];
  this.getRent = [];
  this.totalWatershedCost=[];
  this.totalWatershedRevenue=[];
  this.ghgBenchmark = [];
 // this.rawCostPerUnit = []
 // this.NetRevenueForMapData = []; // for mapping only
  this.totalWatershedCostArray =[];
  this.econCostByLandUse = [];
  this.econRevenueByLandUse = [];
  this.econValuesByCells = [];
  //this.getPrice;
  this.nitrateTotalsByLandUse = []

  this.getPrice = (landUseID) => {
    switch (landUseID) {
      case 1:
      case 2:
        // per bushel
      return parseFloat(document.getElementById('cornPrices').value); //per bushel

        //return cornPriceInput;
      case 3:
      case 4:
        return parseFloat(document.getElementById('soybeanPrices').value); // per bushel
      case 5:
      case '5':
        return 253 // per tonne
      case 6:
      case'6':
        return 3729.00 // per head of cattle
      case 7:
      case '7':
        return 3729.00 // per head of cattle

      case 8:
        return 180 // per tonne;
      case 9:
        return 0; // no yield
      case 10:
      case 11:
        return 0.79// per board foot;

      case 12:
        return 60; // per tonne
      case 13:
        return 60; // per tonne
      case 14:
        return 0; // no yield
      case 15:
        return 49900.0 // per acre
      case 'NA':
      case 0:
      case '0':
        return 0;
      default:
        return 0; // or throw an error if unexpected value
    }
  };


//the number of years in the cycle so that we can divide to get the yearly cost; The -1 accounts for the 'none' land use.
  yearCosts = [-1,1,1,1,1,4,1,1,4,50,1,1,11,7,50,{'Grapes (Conventional)': 4 * 25,'Green Beans': 1 * 4,'Winter Squash': 1 * 4,'Strawberries': 4 * 3}];
  d3.csv('./revenueUpdatesInprogress_feb2025.csv', (data) => {

    this.rawRev = data;

  })
  d3.csv('./revenuePerUnit.csv', (data) => {
    // TODO not implemented yet
    this.rawRevUnit = data;

  })
  d3.csv('./ghgData.csv', (data) => {
    // This avoids asynchronous data loading problems by the time it is accessed
    this.loadedGHGData = data;
  })
  this.divideByCategory = function (listofCats){
    for(var i =1; i <= boardData[currentBoard].calculatedToYear; i++){
      this.data[i] = [];
      listofCats.forEach(cat => {
        this.mapData[i].forEach(dataPoint => {
          if (!this.data[i][dataPoint['LU_ID']]) {
            this.data[i][dataPoint['LU_ID']] = {'landUse': dataPoint['Land-Use']};
          } // We need to create a path to the data that we want to pull out
          if (!this.data[i][dataPoint['LU_ID']][cat]){ //if this is the first time that we see a particular category for a particular land use
            this.data[i][dataPoint['LU_ID']][cat] = {total: 0}; //Further path making
          }
          if(!this.data[i][dataPoint['LU_ID']][cat][dataPoint[cat]]){ //if this is the first value we need to read
            this.data[i][dataPoint['LU_ID']][cat][dataPoint[cat]] = Math.round(1000*Number.parseFloat(dataPoint['EAA']))/1000;
            if(!this.data[i][cat]){
              this.data[i][cat] = [];
            }
            if(!this.data[i][cat].includes(dataPoint[cat])) {
              this.data[i][cat].push(dataPoint[cat]);
            }
          }
          else {//The value already exists so just add to it.
            this.data[i][dataPoint['LU_ID']][cat][dataPoint[cat]] = //trying to prevent floating point calculation errors so rounding to tenth of a cent
            //ideally this.data[i][dataPoint['LU_ID']][cat][dataPoint[cat]] + Number.parseFloat(dataPoint['Value'])
            Math.round(1000*(this.data[i][dataPoint['LU_ID']][cat][dataPoint[cat]] + Number.parseFloat(dataPoint['EAA'])))/1000
            this.data[i][dataPoint['LU_ID']][cat][dataPoint[cat]]
          }
          this.data[i][dataPoint['LU_ID']][cat].total = //either way add it to the total
          Math.round(1000*this.data[i][dataPoint['LU_ID']][cat].total + 1000*Number.parseFloat(dataPoint['EAA']))/1000
        });
      });
    }
  }
  /**
   * grahpic 5 parse data
   */
    this.graphic5information = function(){
      for(let i = 1; i <= boardData[currentBoard].calculatedToYear; i++){
        this.data5[i]=[];
        this.mapData[i].forEach(dataPoint=>{
          var landuseNum=dataPoint['LU_ID'];
          if (!this.data5[i][landuseNum]) {
            this.data5[i][landuseNum] = {'landUse': dataPoint['Land-Use'],'array':[],'subcrop':[]};
          } // We need to create a path to the data that we want to pull out
          var subcrop=dataPoint['Sub Crop'];
          if(dataPoint['Time of Year']!=""){
          if(subcrop!=""){
            if(!this.data5[i][landuseNum]['subcrop'].some(e=>e['subcrop']===subcrop)){
               this.data5[i][landuseNum]['subcrop'].push({'array':[],'subcrop':subcrop});
            }
            var indexOfStevie = this.data5[i][landuseNum]['subcrop'].findIndex(i => i['subcrop'] === subcrop);
            this.data5[i][landuseNum]['subcrop'][indexOfStevie]['array'].push(dataPoint);
          }
            this.data5[i][landuseNum]['array'].push(dataPoint);
          }
        })
    }
    }
    d3.csv('./Budget2020.csv', (data) => {
      // keep the default to 1

      this.rawData=costAdjuster(data, "EAA", 1);
      this.rawData.forEach(dataPoint => {
        let id = Number.parseInt(dataPoint['LU_ID'])
        divisionForLU = (typeof yearCosts[id] === 'number') ? yearCosts[id]:  yearCosts[id][dataPoint['Sub Crop']];
        dataPoint['EAA'] = dataPoint['EAA'];
        if(dataPoint['LU_ID'] === "15"){
          dataPoint["EAA"] /= 4; //Only for MFV
        }
        dataPoint["# Labor Hours"] /= divisionForLU;
      })
    });

  //READ IN BMP FILE
  d3.csv('./BMPBudgets2020.csv', (data) => {

    this.rawBMPData=costAdjuster(data, 'EAA',  1);

  });
    // The cost_per_unit will eventually replace BMP budgets
    // We thought that there is no point to display the whole budgets with cost types and categories because the land use budgets differ from each other
   d3.csv('./cost_per_unit.csv', (data) => {
     // TODO replace 1 with inflation adjustment factor
    this.rawCostPerUnit = data


  });
  //graph
  //graphic 4 extract data from raw data
  this.chart4Information = function(lists) {
    for(var i=1;i<=boardData[currentBoard].calculatedToYear;i++){
      this.data4[i]=[];
      this.mapData[i].forEach(dataPoint => {
        if(dataPoint['EAA']!=0){
          var landuseNum=dataPoint['LU_ID'];
          if (!this.data4[i][landuseNum]) {
            this.data4[i][landuseNum] = {'landUse': dataPoint['Land-Use'],'array':[]}
          } // We need to create a path to the data that we want to pull out
          this.data4[i][landuseNum]['array'].push(dataPoint);
          lists.forEach(cat => {
            if(!this.data4[i][landuseNum][cat]){
              this.data4[i][landuseNum][cat]=[];
            }
            if(!this.data4[i][landuseNum][cat].includes(dataPoint[cat])){
              this.data4[i][landuseNum][cat].push(dataPoint[cat]);
            }
          });
        }
      });
    }

  }

  this.chart3Data = () => {
    for(let i = 1; i <= boardData[currentBoard].calculatedToYear; i++){
      this.data3[i] = {time: {}, action: {}};
      this.mapData[i].forEach( dataPoint => {
        if(this.data3[i].time[dataPoint['Time - Cost Type']]){
          this.data3[i].time[dataPoint['Time - Cost Type']] += Number.parseFloat(dataPoint['EAA']);
        }
        else {
          this.data3[i].time[dataPoint['Time - Cost Type']] = Number.parseFloat(dataPoint['EAA']);
        }
        if(this.data3[i].action[dataPoint['Action - Cost Type']]){
          this.data3[i].action[dataPoint['Action - Cost Type']] += Number.parseFloat(dataPoint['EAA']);
        }
        else {
          this.data3[i].action[dataPoint['Action - Cost Type']] = Number.parseFloat(dataPoint['EAA']);
        }
      })
    }
  }

  this.chart3DataByLU = () => {
    for(let i = 1; i <= boardData[currentBoard].calculatedToYear; i++){
      this.data3ByLU[i] = {};
      this.mapData[i].forEach( dataPoint => {
        if(!this.data3ByLU[i][dataPoint['Land-Use']]){
          this.data3ByLU[i][dataPoint['Land-Use']] = {time: {}, action: {}}
        }

        if(!this.data3ByLU[i][dataPoint['Land-Use']].time[dataPoint['Time - Cost Type']]){
          this.data3ByLU[i][dataPoint['Land-Use']].time[dataPoint['Time - Cost Type']] = 0;
        }

        if(!this.data3ByLU[i][dataPoint['Land-Use']].action[dataPoint['Action - Cost Type']]){
          this.data3ByLU[i][dataPoint['Land-Use']].action[dataPoint['Action - Cost Type']] = 0;
        }

        this.data3ByLU[i][dataPoint['Land-Use']].time[dataPoint['Time - Cost Type']] += dataPoint.EAA;
        this.data3ByLU[i][dataPoint['Land-Use']].action[dataPoint['Action - Cost Type']] += dataPoint.EAA;

        this.data3ByLU[i][dataPoint['Land-Use']].toggleVal = -1;
      })
    }
  }

  this.mapChange = function (){ //called when the map changes in order to edit the intermediate step.

    calculateCornAfters();
    calculatePerYieldCrops();
    calculateForrestYields();
    calulateBMPBudgets();
    calculateForestAreaBySoil();
    collectTotalWatershedGHGData();
    calculateRent();
    // added methods in 2025
    calculateCostRevenue();
    GHGScores();
    nitrateEconomics()
    this.baseLineLoad = [];
    for(let year = 1; year <= boardData[currentBoard].calculatedToYear; year++) {
      const _streamDischarge = calculateStreamDischarge(boardData[currentBoard], year)
      this.baseLineLoad[year] = calculateNitrateLoadReduced(21.5, _streamDischarge);
      console.log(this.baseLineLoad);
    }
    // get the land use area
    this.areaByLandUse = [
      {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:0},
      {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:0},
      {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:0},
      {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:0}
    ];
    for(let i = 1; i <= boardData[currentBoard].calculatedToYear; i++) {

      for (let j = 0; j < boardData[currentBoard].map.length; j++) {
        let landUseNum = boardData[currentBoard].map[j].landType[i]
        let xp = 0
        let tiledArea = boardData[currentBoard].map[j].area
        this.areaByLandUse[i][landUseNum] += tiledArea
      }
    }
    let landUses = [];
    this.mapData = [];
    /* this revenueData object was created to allow the user to make changes to the prices of corn and soybean
      Only four big land use categories are adjusted, i.e., cons conv corn and soybeans

    */
    const revenueData = {
      '1': parseFloat(document.getElementById('cornPrices').value),
      '2': parseFloat(document.getElementById('cornPrices').value),
     '3': parseFloat(document.getElementById('soybeanPrices').value),
      '4': parseFloat(document.getElementById('soybeanPrices').value),
    };
    //Less than ideal coding, but given how Totals is structured the easiest way
    //I found to map Land Use IDS to total LandUse without recalculation
    this.econRevenueByLandUse =   Array(4).fill().map(() =>(

            {
              none: 0,
              'Conventional Corn': 0,
              'Conservation Corn': 0,
              'Conventional Soybean': 0,
              'Conservation Soybean': 0,
              'Alfalfa': 0,
              'Permanent Pasture': 0,
              'Rotational Grazing': 0,
              'Grass Hay': 0,
              'Prairie': 0,
              'Conservation Forest': 0,
              'Conventional Forest': 0,
              'Switch grass': 0,
              'ShortRotation Woody Bioenergy': 0,
              'Wetland': 0,
              'Mixed Fruits Vegetables': 0
            }

    ));
    // I am cleaning up the code below
    for(let i = 1; i <= boardData[currentBoard].calculatedToYear; i++){
      landUses[i] = [];
      this.mapData[i] = [];
      this.scaledRev[i] =[]
      ;
      //this.totalWatershedCost[i] = [{cost: 0}];  //TESTING

      let keys = Object.keys(Totals.landUseResults[0]);

      for(let j = 0; j < keys.length; j++){

        let key = keys[j];
        //this substring is to link different keys from different objects together... again less than ideal
        landUses[i][LandUseType[key.substring(0, key.length - 7)]] = Totals.landUseResults[i][key]
      }

      const selectedLandUse15Area = this.areaByLandUse[i][15]


      this.rawRev.forEach(dataPoint => {
        // this is not an ideal way to do this but I just built on the previous one
        let LU_ID = Number(dataPoint['LU_ID']);
        const baselineC = this.baseLineLoad[i] || 0
        let commodityPrice = this.getPrice(LU_ID);
        let socRev = this.landUseSOC[i][LU_ID]
        let nitrateLoad = this.nitrateTotalsByLandUse[i][LU_ID]
        //socRev = Math.max(0, socRev) * carbonPrice;


        let YieldValue;

         if (dataPoint['LU_ID'] === "2") {
          if (dataPoint['Sub Crop'] === 'Corn after Soybean') {
            YieldValue=  this.getBMPAreas[i][2].landUseYield || 0;  //2 = Cons Corn after Soybean
          } else {
            YieldValue =  this.getBMPAreas[i][3].landUseYield || 0; //3 = Cons Corn after Corn
          }
        } else if (dataPoint['LU_ID'] === "4") {

          YieldValue=  this.getBMPAreas[i][1].landUseYield;
         }
        //woodlands can't be treated the same since they are the only land use where the soil type changes the value of the wood not just the amount of wood.
        //Where the rest of the revenue above can multiply the output by a certain price: we need to actually find the soil that all the woodlands are on.
         else if (dataPoint['LU_ID'] === "1") {
          YieldValue =  Totals.yieldByLandUse[i][dataPoint['LU_ID']];
        } else if (dataPoint['LU_ID'] === "13") {
          YieldValue =  Totals.yieldByLandUse[i][dataPoint['LU_ID']];
        } else if (dataPoint['LU_ID'] === "3") {
          YieldValue =  Totals.yieldByLandUse[i][dataPoint['LU_ID']];
        }else if (dataPoint["LU_ID"]==='10' && this.areaByLandUse[i][10] > 0){
           YieldValue  = (Totals.yieldResults[i].woodYield * 10)/10
         }else if (dataPoint["LU_ID"]==='11' && this.areaByLandUse[i][11] > 0) {
           YieldValue = (Totals.yieldResults[i].woodYield * 10)/10
         }

         else if (dataPoint['LU_ID']==='7' && this.areaByLandUse[i][7] > 0) {
           YieldValue = Totals.yieldByLandUse[i][dataPoint['LU_ID']]

         }

         else if (dataPoint['LU_ID']==='6' && this.areaByLandUse[i][6] > 0) {
          YieldValue = Totals.yieldByLandUse[i][dataPoint['LU_ID']]

        } else if(dataPoint['LU_ID'] ===8){
          YieldValue  = Totals.yieldByLandUse[i][dataPoint['LU_ID']];
        }

        else {
          YieldValue = Totals.yieldByLandUse[i][dataPoint['LU_ID']];
        }

        const carbonPrice = parseFloat(document.getElementById("carbonPrices").value)
        const nitrateCreditPrice =  parseFloat(document.getElementById("nitrogenPrices").value)
        let  nitrateRev =  nitrateLoad * nitrateCreditPrice;
        socRev = Math.max(0, socRev) * carbonPrice;
        // end of yield value allocations
        let revenueMultiplier = [15].includes(LU_ID) ? selectedLandUse15Area :  YieldValue;

        const grossRev = revenueMultiplier * commodityPrice || 0;


        this.scaledRev[i][dataPoint['LU_ID']] = this.scaledRev[i][dataPoint['LU_ID']] || 0;
         this.scaledRev[i][dataPoint['LU_ID']] =  grossRev //+ socRev + nitrateRev // all results are already totaled up plus soil carbon value  grossRev + socRev +


      });

      this.econRevenueByLandUse = convertLandUseIDsToTexts(this.scaledRev)
      console.log(this.econCostByLandUse, 'byland use revenue')
      console.log(this.scaledRev, 'scaled', this.scaledRev.length)

      /**
       * 2020 Budget File separates out each land yield.
       * Conventional and Conservation Corn are broken up by yield and also based on if it is Corn after Soybean or Corn after Corn. Look at @calculateCornAfters function.
       * Conventional and Conservation Forests are broken down based on 25/60/70 year budgets. Look at @calculateForrestYield function.
       * There is also a 'per yield' check on each land use. If the PerAcreOrPerYield variable is 'per yield' then it is calulated based on the yield for each line item.
       * Look at the @calculatePerYieldCrops.
       */
      this.rawData.forEach(dataPoint => {
        let copy = JSON.parse(JSON.stringify(dataPoint));

        //Calculate Rents First
        if(copy['Cost Name'] === 'Rent' && copy['LU_ID'] !== "5" && copy['LU_ID'] !== "6" && copy['LU_ID'] !== "7" && copy['LU_ID'] !== "8"){
          if(copy['LU_ID'] === "1"){
            if(copy['Sub Crop'] === 'Corn after Soybean') {
              copy['EAA'] *= -1 * this.getRent[i][0].convCornSoybeanRent;
            }
            else {
              copy['EAA'] *= -1 * this.getRent[i][0].convCornCornRent;
            }
          }
          if(copy['LU_ID'] === "2"){
            if(copy['Sub Crop'] === 'Corn after Soybean') {
              copy['EAA'] *= -1 * this.getRent[i][0].consCornSoybeanRent;
            }
            else {
              copy['EAA'] *= -1 * this.getRent[i][0].consCornCornRent;
            }
          }
          if(copy['LU_ID'] === "3") {
            copy['EAA'] *= -1 * this.getRent[i][0].convSoybeanRent;
          }
          if(copy['LU_ID'] === "4") {
            copy['EAA'] *= -1 * this.getRent[i][0].consSoybeanRent;
          }
          if(copy['LU_ID'] === "9") {
            copy['EAA'] *= -1 * this.getRent[i][0].prairieRent;
          }
          if(copy['LU_ID'] === "10") {
            copy['EAA'] *= -1 * this.getRent[i][0].consForestRent;
          }
          if(copy['LU_ID'] === "11") {
            copy['EAA'] *= -1 * this.getRent[i][0].convForestRent;
          }
          if(copy['LU_ID'] === "12") {
            copy['EAA'] *= -1 * this.getRent[i][0].swithgrassRent;
          }
          if(copy['LU_ID'] === "13") {
            copy['EAA'] *= -1 * this.getRent[i][0].swrbRent;
          }
          if(copy['LU_ID'] === "14") {
            copy['EAA'] *= -1 * this.getRent[i][0].wetlandRent;
          }
          if(copy['LU_ID'] === "15") {
            copy['EAA'] *= -1 * this.getRent[i][0].mfvRent;
          }
        }

       else {
          /*
            START CORN CHECKS. Corn is separated out into Conv and Cons Corn. Then we check for Per Acre or Per Yield Conditions.
           */

          //TODO Leaving a todo.
          if (copy['LU_ID'] === "1") {//corn needs to be treated specially
            if (copy['PerAcreORPerYield'] === "") {
              if (copy['Sub Crop'] === 'Corn after Soybean') {
                copy["EAA"] *= this.cornAfters[i][1].ConvCornAfterSoybean;
                copy["# Labor Hours"] *= this.cornAfters[i][1].ConvCornAfterSoybean;
              } else {
                copy["EAA"] *= this.cornAfters[i][1].ConvCornAfterCorn;
                copy["# Labor Hours"] *= this.cornAfters[i][1].ConvCornAfterCorn;
              }
            }
            if (copy['PerAcreORPerYield'] === 'per yield') {
              if (copy['Sub Crop'] === 'Corn after Corn') {
                  copy['EAA'] *= this.cornAfters[i][1].ConvCornAfterCornYield
              } else {
                copy['EAA'] *= this.cornAfters[i][1].ConvCornAfterSoybeanYield
              }
            }
          }

          //Conservation Corn values are calculated separately due to BMP budgets.
          //Specially made verbose to reduce confusion.
          //Check calculateBMPBugets function.
          //Conservation Corn after Soybean is numLandUse 2 and Conservation Corn after Corn is numLandUse 3. DO NOT CONFUSE THIS WITH LU_ID.
          //numLandUse values are only used for calculateBMPBudgets function.
          else if (copy['LU_ID'] === "2") {
            if (copy['PerAcreORPerYield'] === "") {
              if (copy['Sub Crop'] === 'Corn after Soybean' && copy['BMP'] !== 'GrassedWaterways' && copy['BMP'] !== 'Terraces' && copy['BMP'] !== 'Buffers') {
                copy["EAA"] *= this.getBMPAreas[i][2].bmpArea;
                copy["# Labor Hours"] *= this.getBMPAreas[i][2].bmpArea;
              }
              if (copy['Sub Crop'] === 'Corn after Corn' && copy['BMP'] !== 'GrassedWaterways' && copy['BMP'] !== 'Terraces' && copy['BMP'] !== 'Buffers') {
                copy["EAA"] *= this.getBMPAreas[i][3].bmpArea;
                copy["# Labor Hours"] *= this.getBMPAreas[i][3].bmpArea;
              }
            }
            if (copy['PerAcreORPerYield'] === 'per yield') {
              if (copy['Sub Crop'] === 'Corn after Soybean' && copy['BMP'] !== 'GrassedWaterways' && copy['BMP'] !== 'Terraces' && copy['BMP'] !== 'Buffers') {
                copy['EAA'] *= this.getBMPAreas[i][2].landUseYield;
                copy['# Labor Hours'] *= this.getBMPAreas[i][2].landUseYield;
              }
              if (copy['Sub Crop'] === 'Corn after Corn' && copy['BMP'] !== 'GrassedWaterways' && copy['BMP'] !== 'Terraces' && copy['BMP'] !== 'Buffers') {
                copy['EAA'] *= this.getBMPAreas[i][3].landUseYield;
                copy['# Labor Hours'] *= this.getBMPAreas[i][3].landUseYield;
              }
            }
            if (copy['Sub Crop'] === 'Corn after Soybean' && copy['BMP'] === 'GrassedWaterways') {
              copy['EAA'] *= Math.round(1000 * this.getBMPAreas[i][2].grassedWaterwaysAreaTotal) / 1000;
              copy['# Labor Hours'] *= (Math.round(1000 * this.getBMPAreas[i][2].grassedWaterwaysAreaTotal) / 1000) /30
            } else if (copy['Sub Crop'] === 'Corn after Soybean' && copy['BMP'] === 'Terraces') {
              copy['EAA'] *= Math.round(1000 * this.getBMPAreas[i][2].terraceAreaTotal) / 1000;
              copy['# Labor Hours'] *= (Math.round(1000 * this.getBMPAreas[i][2].terraceAreaTotal) / 1000) / 30
            } else if (copy['Sub Crop'] === 'Corn after Soybean' && copy['BMP'] === 'Buffers') {
              copy['EAA'] *= Math.round(1000 * this.getBMPAreas[i][2].bufferAreaTotal) / 1000;
              copy['# Labor Hours'] *= (Math.round(1000 * this.getBMPAreas[i][2].bufferAreaTotal) / 1000) /50
            }

            if (copy['Sub Crop'] === 'Corn after Corn' && copy['BMP'] === 'GrassedWaterways') {
              copy['EAA'] *= Math.round(1000 * this.getBMPAreas[i][3].grassedWaterwaysAreaTotal) / 1000;
              copy['# Labor Hours'] *= (Math.round(1000 * this.getBMPAreas[i][3].grassedWaterwaysAreaTotal) / 1000) / 30
            } else if (copy['Sub Crop'] === 'Corn after Corn' && copy['BMP'] === 'Terraces') {
              copy['EAA'] *= Math.round(1000 * this.getBMPAreas[i][3].terraceAreaTotal) / 1000;
              copy['# Labor Hours'] *= (Math.round(1000 * this.getBMPAreas[i][3].terraceAreaTotal) / 1000)/30;
            } else if (copy['Sub Crop'] === 'Corn after Corn' && copy['BMP'] === 'Buffers') {
              copy['EAA'] *= Math.round(1000 * this.getBMPAreas[i][3].bufferAreaTotal) / 1000;
              copy['# Labor Hours'] *= (Math.round(1000 * this.getBMPAreas[i][3].bufferAreaTotal) / 1000)/50;
            }

          }

          //Conservation Soybean values are calculated separately due to BMP budgets.
          //Specially made verbose to reduce confusion.
          //Check calculateBMPBugets function.
          //Conservation Soybean is numLandUse 1. DO NOT CONFUSE THIS WITH LU_ID. // insistence is unforgiving in coding
          //numLandUse values are only used for calculateBMPBudgets function.
          else if (copy['LU_ID'] === "4") {
            if (copy['PerAcreORPerYield'] === "" && copy['BMP'] !== 'GrassedWaterways' && copy['BMP'] !== 'Terraces' && copy['BMP'] !== 'Buffers') {
              copy["EAA"] *= this.getBMPAreas[i][1].bmpArea;
              copy["# Labor Hours"] *= this.getBMPAreas[i][1].bmpArea;
            }
            if (copy['PerAcreORPerYield'] === 'per yield') {
              copy['EAA'] *= this.getBMPAreas[i][1].landUseYield
              copy['# Labor Hours'] *= this.getBMPAreas[i][1].landUseYield
            }
            if (copy['BMP'] === 'GrassedWaterways') {
              copy['EAA'] *= Math.round(1000 * this.getBMPAreas[i][1].grassedWaterwaysAreaTotal) / 1000
              copy['# Labor Hours'] *= (Math.round(1000 * this.getBMPAreas[i][1].grassedWaterwaysAreaTotal) / 1000) / 30
            } else if (copy['BMP'] === 'Terraces') {
              copy['EAA'] *= Math.round(1000 * this.getBMPAreas[i][1].terraceAreaTotal) / 1000
              copy['# Labor Hours'] *= (Math.round(1000 * this.getBMPAreas[i][1].terraceAreaTotal) / 1000)/ 30
            } else if (copy['BMP'] === 'Buffers') {
              copy['EAA'] *= Math.round(1000 * this.getBMPAreas[i][1].bufferAreaTotal) / 1000
              copy['# Labor Hours'] *= (Math.round(1000 * this.getBMPAreas[i][1].bufferAreaTotal) / 1000) / 50
            }
          }


          /*
            START FORREST CHECKS. Broken down by 25/60/70 Year Budgets.
           */
          else if (copy['LU_ID'] === "10") {
            if (copy['Sub Crop'] === "Twentyfive") {
              copy['EAA'] *= this.getForrestYields[i][1].twentyFiveAreaCons;
              copy['# Labor Hours'] *= this.getForrestYields[i][1].twentyFiveAreaCons / 25
            }
            if (copy['Sub Crop'] === "Sixty") {
              copy['EAA'] *= this.getForrestYields[i][1].sixtyAreaCons;
              copy['# Labor Hours'] *= this.getForrestYields[i][1].sixtyAreaCons / 60
            }
            if (copy['Sub Crop'] === "Seventy") {
              copy['EAA'] *= this.getForrestYields[i][1].seventyAreaCons;
              copy['# Labor Hours'] *= this.getForrestYields[i][1].seventyAreaCons / 70
            }
          } else if (copy['LU_ID'] === "11") {
            if (copy['Sub Crop'] === "Twentyfive") {
              copy['EAA'] *= this.getForrestYields[i][1].twentyFiveAreaConv;
              copy['# Labor Hours'] *= this.getForrestYields[i][1].twentyFiveAreaConv / 25
            }
            if (copy['Sub Crop'] === "Sixty") {
              copy['EAA'] *= this.getForrestYields[i][1].sixtyAreaConv;
              copy['# Labor Hours'] *= this.getForrestYields[i][1].sixtyAreaConv / 60
            }
            if (copy['Sub Crop'] === "Seventy") {
              copy['EAA'] *= this.getForrestYields[i][1].seventyAreaConv;
              copy['# Labor Hours'] *= this.getForrestYields[i][1].seventyAreaConv / 70
            }
          }

          /*
           START PER YIELD Check on - Cons and Conv Soybean, Alfalfa, Grasshay, Switchgrass, Mixed Fruits and Vegetables (MF&V broken up into subcrops).
           */

          else if (copy['PerAcreORPerYield'] === 'per yield') {
            if (copy['LU_ID'] === "3") {
              copy['EAA'] *= this.getCropYields[i][1].convSoybeanYield
              copy['# Labor Hours'] *= this.getCropYields[i][1].convSoybeanYield

            } else if (copy['LU_ID'] === "5") {
              copy['EAA'] *= this.getCropYields[i][1].alfalfaYield
              copy['# Labor Hours'] *= this.getCropYields[i][1].alfalfaYield
            } else if (copy['LU_ID'] === "8") {
              copy['EAA'] *= this.getCropYields[i][1].grasshayYield
              copy['# Labor Hours'] *= this.getCropYields[i][1].grasshayYield
            } else if (copy['LU_ID'] === "12") {
              copy['EAA'] *= this.getCropYields[i][1].switchgrassYield
              copy['# Labor Hours'] *= this.getCropYields[i][1].switchgrassYield
            } else if (copy['LU_ID'] === "15") {
              //multiplied by 4 to negate previous division; was needed per acre, not per yield
              if (copy['Sub Crop'] === 'Green Beans') {
                copy['EAA'] *= 4 * this.getCropYields[i][1].mixedFVYield * (4.2 / 30.326)
                copy['# Labor Hours'] *= 4 * this.getCropYields[i][1].mixedFVYield * (4.2 / 30.326)
              } else if (copy['Sub Crop'] === 'Winter Squash') {
                copy['EAA'] *= 4 * this.getCropYields[i][1].mixedFVYield * (11.25 / 30.326)
                copy['# Labor Hours'] *= 4 * this.getCropYields[i][1].mixedFVYield * (11.25 / 30.326)
              } else if (copy['Sub Crop'] === 'Grapes (Conventional)') {
                copy['EAA'] *= 4 * this.getCropYields[i][1].mixedFVYield * (13.376 / 30.326)
                copy['# Labor Hours'] *= 4 * this.getCropYields[i][1].mixedFVYield * (13.376 / 30.326)
              }
            }
          }

          /*
          If land use is not per yield then add here.
           */
          else {

              copy["EAA"] *= landUses[i][copy['LU_ID']];
              copy["# Labor Hours"] *= landUses[i][copy['LU_ID']];

          }

        }

        this.mapData[i].push(copy)

        //this.totalWatershedCost[i][0].cost +=  !isNaN(copy['EAA']) ? copy['EAA'] : 0 // being replaced in cost revenue
      })

    }


    this.watershedTotals();
    //All those commented out are deprecated in version 4.1
   this.chart3Data(); // Deprecated in version 4.1
  this.chart3DataByLU();  // Deprecated in version 4.1
    this.graphic5information();  // Deprecated in version 4.1
   this.divideByCategory(['Action - Cost Type', 'Time - Cost Type', 'Fixed/Variable']);  // Deprecated in version 4.1
  this.chart4Information(['Action - Cost Type', 'Time - Cost Type']);  // Deprecated in version 4.1
    this.calcSubcrops();


    //TESTING ONLY
    for(let k = 1; k <= boardData[currentBoard].calculatedToYear; k++) {
      //console.log("TOTAL WATERSHED COST FOR YEAR: ",k, "=",this.totalWatershedCost[k][0].cost);
    }



  };

  // TESTING readmWATERSHED TOTALS
  this.watershedTotals = () => {

    for(let i = 1; i <= boardData[currentBoard].calculatedToYear; i++){
      this.totalWatershedRevenue[i]= [{revenue: 0}];
      for(let j = 0; j < 16; j ++){
        this.totalWatershedRevenue[i][0].revenue += !isNaN(this.scaledRev[i][j]) ? this.scaledRev[i][j]: 0

      }
      //console.log("TOTAL WATERSHED REVENUE FOR YEAR: ", i , "=",this.totalWatershedRevenue[i][0].revenue);
    }

  };


  //this is unoptimized for finding the amount of corn after corn and corn after soybeans
  //If any sort of progress bar requires the economics module it is recommended to alter the method in which data is updated
  /**
   * This function breaks down Conv and Cons Corn into Corn after Corn and Corn after Soybean and calculates the yield for each.
   * NOTE: CONSERVATION CORN values are retrieved from BMP budgets function below.
   */
  calculateCornAfters = () =>{
    // TODO this code is not intuitive to me, there is no indication that yield will be different for each rotation
    for(let i = 1; i <= boardData[currentBoard].calculatedToYear; i++){
      this.cornAfters[i] = [,
        { ConvCornAfterSoybean:0, ConvCornAfterCorn:0,
          ConvCornAfterSoybeanYield: 0, ConvCornAfterCornYield: 0,
        }
        ];
      for (var j = 0; j < boardData[currentBoard].map.length; j++) {
        if(boardData[currentBoard].map[j].landType[i] === 1){ //if there it is corn
          if(boardData[currentBoard].map[j].landType[i-1] === 3 || boardData[currentBoard].map[j].landType[i-1] === 4){ //if the corn is after soybean
            this.cornAfters[i][1].ConvCornAfterSoybean += boardData[currentBoard].map[j].area;
            this.cornAfters[i][1].ConvCornAfterSoybeanYield += boardData[currentBoard].map[j].results[i]['calculatedYieldTile'] * boardData[currentBoard].map[j].area

          }
          else {
            this.cornAfters[i][1].ConvCornAfterCorn += boardData[currentBoard].map[j].area
            this.cornAfters[i][1].ConvCornAfterCornYield += boardData[currentBoard].map[j].results[i]['calculatedYieldTile'] * boardData[currentBoard].map[j].area
            //console.log(results[i], 'ii')
          }
        }

      }
    }
  }

  /**
   * This functions calculates the yield for: Cons and Conv Soybean, Alfalfa, Grasshay, Switchgrass and Mixed Fruits and Vegetables.
   * The function  iterates over the whole map and check for each land use by LU_ID (for example: 3 for Conv Soybean).
   * It then gets the yield for each cell (828 cells on map) and check adds to the total yield variable for that land use.
   */
  calculatePerYieldCrops = () =>{
    for(let i = 1; i <= boardData[currentBoard].calculatedToYear; i++){

      this.getCropYields[i] = [,
        {convSoybeanYield : 0, consSoybeanYield: 0, alfalfaYield: 0, switchgrassYield: 0,  grasshayYield: 0, mixedFVYield: 0},
      ];

      for (let j = 0; j < boardData[currentBoard].map.length; j++){
          if(boardData[currentBoard].map[j].landType[i] === 3){
            this.getCropYields[i][1].convSoybeanYield += boardData[currentBoard].map[j].results[i]['calculatedYieldTile'] * boardData[currentBoard].map[j].area
          }
          if(boardData[currentBoard].map[j].landType[i] === 5){
            this.getCropYields[i][1].alfalfaYield += boardData[currentBoard].map[j].results[i]['calculatedYieldTile'] * boardData[currentBoard].map[j].area
          }
          if(boardData[currentBoard].map[j].landType[i] === 8){
            this.getCropYields[i][1].grasshayYield += boardData[currentBoard].map[j].results[i]['calculatedYieldTile'] * boardData[currentBoard].map[j].area
          }
          if(boardData[currentBoard].map[j].landType[i] === 12){
            this.getCropYields[i][1].switchgrassYield += boardData[currentBoard].map[j].results[i]['calculatedYieldTile'] * boardData[currentBoard].map[j].area
          }
          if(boardData[currentBoard].map[j].landType[i] === 15){
            this.getCropYields[i][1].mixedFVYield += boardData[currentBoard].map[j].results[i]['calculatedYieldTile'] * boardData[currentBoard].map[j].area
          }
      }
    }
  };


  /**
   * This function is used to separate out the area for each soil type to use for Cons and Conv Forests which are now separated by 25/60/75 year budgets.
   * We iterate through the map and check each cell for soilType. Each soilType goes into either 25 or 60 or 70 year area variable.
   * twentyFiveArea, sixtyAre, seventyArea variable store the sum of area based on soil types.
   * For example: If Soil Type for cell is C/L/O it would be added to twentyFiveArea for conv or cons forest.
   * TODO
   */
  calculateForrestYields = () => {
    for(let i = 1; i <= boardData[currentBoard].calculatedToYear; i++){
      this.getForrestYields[i] = [,
        {twentyFiveAreaConv: 0, sixtyAreaConv:0, seventyAreaConv:0, twentyFiveAreaCons:0, sixtyAreaCons: 0, seventyAreaCons:0}
      ];
      for (let j = 0; j < boardData[currentBoard].map.length; j++) {
        if (boardData[currentBoard].map[j].landType[i] === 10){
          if(["C", "L", "O"].indexOf(boardData[currentBoard].map[j]['soilType']) !==- 1){
            this.getForrestYields[i][1].twentyFiveAreaCons += boardData[currentBoard].map[j].area;
          }
          if(["N", "K", "T", "B"].indexOf(boardData[currentBoard].map[j]['soilType']) !==- 1){
            this.getForrestYields[i][1].sixtyAreaCons += boardData[currentBoard].map[j].area;
          }
          if(["A", "D", "G", "M", "Q", "Y"].indexOf(boardData[currentBoard].map[j]['soilType']) !==- 1){
            this.getForrestYields[i][1].seventyAreaCons += boardData[currentBoard].map[j].area;
          }
        }
        if(boardData[currentBoard].map[j].landType[i] === 11){
          if(["C", "L", "O"].indexOf(boardData[currentBoard].map[j]['soilType']) !==- 1){
            this.getForrestYields[i][1].twentyFiveAreaConv += boardData[currentBoard].map[j].area;
          }
          if(["N", "K", "T", "B"].indexOf(boardData[currentBoard].map[j]['soilType']) !==- 1){
            this.getForrestYields[i][1].sixtyAreaConv += boardData[currentBoard].map[j].area;
          }
          if(["A", "D", "G", "M", "Q", "Y"].indexOf(boardData[currentBoard].map[j]['soilType']) !==- 1){
            this.getForrestYields[i][1].seventyAreaConv += boardData[currentBoard].map[j].area;
          }
        }
      }
    }
  };

  nitrateEconomics = () =>{

    this.nitrateTotalsByLandUse = [
      {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:0},
      {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:0},
      {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:0},
      {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:0}
    ];


    for(let year = 1; year <= boardData[currentBoard].calculatedToYear; year++) {
      const totalArea = 5888.75 //Object.values(this.areaByLandUse[i]).reduce((sum, val) => sum + val, 0);
      let totalNitrateConc  = (Totals.nitrateConcentration[currentYear]* 10)/10 // ppm
      console.log(totalNitrateConc, 'total nitrate concentration')

      let streamDischarge  = calculateStreamDischarge( boardData[currentBoard], year)


      // start tracking nitrate load per land use
      for (let cellID = 0; cellID < boardData[currentBoard].map.length; cellID++) {

        let landUseNum = boardData[currentBoard].map[cellID].landType[year]
        let tileNitrate= boardData[currentBoard].map[cellID].results[year].calculatedTileNitrate/100
        const calculatedNitrateLoadReduced = calculateNitrateLoadReduced(tileNitrate, streamDischarge)

        let tiledArea =boardData[currentBoard].map[cellID].area
        if (landUseNum ===0) continue
        let landUseNitrogen  = landUseNitrateCreditContribution(landUseNum, tiledArea, calculatedNitrateLoadReduced, totalArea)
        this.nitrateTotalsByLandUse[year][landUseNum] += landUseNitrogen
         // if (landUseNum > 0) {
         //   const subWatershedID = boardData[currentBoard].map[j].subwatershed;
         //   let subWatershedNoMin =  boardData[currentBoard].subWatershedNitrateNoMin[subWatershedID]
         //   let nitrateTilePPM =  boardData[currentBoard].map[j].results[currentYear].calculatedTileNitrate * tiledArea/6000
         //
         //
         //  // console.log(nitrateTilePPM, 'pppm', nc)
         //   // TODO the challenge is to track nitrate load reduced due to each land use and compare it with the baseline
         //   this.nitrateTotalsByLandUse[i][landUseNum] += nitrateTilePPM
         //   //console.log(nitrateTilePPM, 'ppm', landUseNum)
         //   boardData[currentBoard].map[j].results[i].newCalculatedTileNitrate = nitrateTilePPM
         //   let calculatedNitrateDiff =subWatershedNoMin - nitrateTilePPM
         //   // console.log( boardData[currentBoard].map[j].results[i].newCalculatedTileNitrate, 'mapped')
         //   // console.log( boardData[currentBoard].subWatershedNitrateNoMin[subWatershedID], 'no min')
         //   this.totalN += nitrateTilePPM/subWatershedNoMin
         //
         // }

      }
    }

  console.log(this.nitrateTotalsByLandUse, 'nitrate totoalss!')


  }

  //Conservation Corn After Soybean set to Land Use 1
  //Conservation Corn After Corn set to Land Use 2
  //Conservation Soybean set to Land Use 3
  /**
   * This function is used to calculate BMP Budget values for Conservation CORN and Conservation SOYBEAN ONLY.
   * Implemented based on Issue 727. Function laid out in the exact order.
   * First we check for Buffers based on StreamNetwork value. Next check topography value to implement Terraces and lastly implement Grassed Waterways.
   * this.getBMPAreas object array has 4 objects. The first one is a dummy object to avoid undefined errors. (Not the best approach but we needed to store
   * values for cells that are not conservation corn or soybean)
   * numLandUse values are hard coded to 1 = Cons Soybean; 2 = Cons Corn after Soybean; 3 = Cons Corn after Corn. DO NOT CONFUSE THIS WITH LU_ID.
   */
  calulateBMPBudgets = () => {
    // TODO pass an inflation factor here
    let fixedBufferArea = 0.52486;
    let numLandUse = 0;

    for(let i = 1; i <= boardData[currentBoard].calculatedToYear; i++) {
      this.getBMPAreas[i] = [
        {bmpArea: 0, bufferAreaTotal: 0, grassedWaterwaysAreaTotal: 0, terraceAreaTotal: 0, landUseYield: 0},
        {bmpArea: 0, bufferAreaTotal: 0, grassedWaterwaysAreaTotal: 0, terraceAreaTotal: 0, landUseYield: 0},
        {bmpArea: 0, bufferAreaTotal: 0, grassedWaterwaysAreaTotal: 0, terraceAreaTotal: 0, landUseYield: 0},
        {bmpArea: 0, bufferAreaTotal: 0, grassedWaterwaysAreaTotal: 0, terraceAreaTotal: 0, landUseYield: 0},
      ];


      for (let j = 0; j < boardData[currentBoard].map.length; j++) {
        let cellArea = boardData[currentBoard].map[j].area;

        if(boardData[currentBoard].map[j].landType[i] === 4) {
            numLandUse = 1; //SOYBEAN
        }
        else if(boardData[currentBoard].map[j].landType[i] === 2){
          if(boardData[currentBoard].map[j].landType[i-1] === 3 || boardData[currentBoard].map[j].landType[i-1] === 4) { //if the corn is after soybean
            numLandUse = 2; //CORN AFTER SOYBEAN
          }
          else {
            numLandUse = 3; //CORN AFTER CORN
          }
        }
        else {
          numLandUse = 0;
        }

        if (boardData[currentBoard].map[j].streamNetwork === "1") {
          cellArea = (cellArea - fixedBufferArea) * 0.90;
          this.getBMPAreas[i][numLandUse].bufferAreaTotal += fixedBufferArea;
        }
        else {
          cellArea = 0.90 * cellArea;
        }

        //Implement Terraces
        if(boardData[currentBoard].map[j].topography >= 2){

          if(boardData[currentBoard].map[j].topography === 2){
            this.getBMPAreas[i][numLandUse].terraceAreaTotal += boardData[currentBoard].map[j].area * 0.0546;
          }
          else if(boardData[currentBoard].map[j].topography === 3){
            this.getBMPAreas[i][numLandUse].terraceAreaTotal +=  boardData[currentBoard].map[j].area * 0.0658;
          }
          else if(boardData[currentBoard].map[j].topography === 4){
            this.getBMPAreas[i][numLandUse].terraceAreaTotal +=  boardData[currentBoard].map[j].area * 0.0820;
          }
          else if(boardData[currentBoard].map[j].topography === 5){
            this.getBMPAreas[i][numLandUse].terraceAreaTotal +=  boardData[currentBoard].map[j].area * 0.0938;
          }

        }

        //Implement Grasses Waterways
        if(boardData[currentBoard].map[j].streamNetwork !== "1" && boardData[currentBoard].map[j].topography < 2){
          this.getBMPAreas[i][numLandUse].grassedWaterwaysAreaTotal += 0.10 * boardData[currentBoard].map[j].area;
        }

        else if (boardData[currentBoard].map[j].streamNetwork === "1" && boardData[currentBoard].map[j].topography < 2){
          this.getBMPAreas[i][numLandUse].grassedWaterwaysAreaTotal += 0.10 * (boardData[currentBoard].map[j].area - fixedBufferArea);
        }

        else {
          if(boardData[currentBoard].map[j].topography === 2){
            this.getBMPAreas[i][numLandUse].grassedWaterwaysAreaTotal += boardData[currentBoard].map[j].area * 0.0454;
          }
          else if(boardData[currentBoard].map[j].topography === 3){
            this.getBMPAreas[i][numLandUse].grassedWaterwaysAreaTotal += boardData[currentBoard].map[j].area * 0.0342;
          }
          else if(boardData[currentBoard].map[j].topography === 4){
            this.getBMPAreas[i][numLandUse].grassedWaterwaysAreaTotal += boardData[currentBoard].map[j].area * 0.0180;
          }
          else if(boardData[currentBoard].map[j].topography === 5){
            this.getBMPAreas[i][numLandUse].grassedWaterwaysAreaTotal += boardData[currentBoard].map[j].area * 0.0062;
          }
        }
        this.getBMPAreas[i][numLandUse].bmpArea += cellArea;

        this.getBMPAreas[i][numLandUse].landUseYield += boardData[currentBoard].map[j].results[i]['calculatedYieldTile'] * cellArea;
        }
      }

  };
  // start calculateCostRevenue
  /**
   * Calculate net revenue and economic costs by land use and year.
   * The function pulls user input for corn price adjustment, loops through the simulation board data,
   * and computes costs for various land use types including:
   *  - Land uses with per-acre cost
   *  - Combined head/tonne cost types
   *  - Annuals with per-bushel cost (rotation-sensitive)
   * Results are stored in the component's instance for downstream use.
   */
  let calculateCostRevenue = () => {
    const inputValue = parseFloat(document.getElementById("inflationFactor").value);
    const costInflationFactorAdjustment = isNaN(inputValue) ? INFLATION_FACTOR : inputValue;

    const inputValueNitratePrice = parseFloat(document.getElementById("nitrogenPrices").value);
    const nitratePrice = isNaN(inputValueNitratePrice) ? NITRATE_CREDIT : inputValueNitratePrice;

    const current_Board = boardData[currentBoard];
    const years = current_Board.calculatedToYear;

    let landUseTrack = [];
    this.econCostByLandUse = Array(4).fill().map(() =>
        Object.fromEntries(Array.from({ length: 16 }, (_, i) => [i.toString(), 0]))
    );

    for (let year = 1; year <= years; year++) {
      let currentLandUseMap = {};
      this.totalWatershedCost[year] = [{ cost: 0 }];
      let totalYearCost = { totalCosts: 0 };

      for (let cellIndex = 0; cellIndex < current_Board.map.length; cellIndex++) {
        const cell = current_Board.map[cellIndex];
        const landUseID = cell.landType[year];
        const tileArea = cell.area;
        const landUseKey = landUseID.toString();

        currentLandUseMap[cellIndex] = landUseID;
        landUseTrack[year] = currentLandUseMap;

        if (landUseID <= 0) continue;

        let yieldTile = 0;
        let unitPrice = this.getPrice(landUseID);
        let grossRevenue = 0;
        let cost = 0;
        let costMultiplier =0

        if ([1, 2].includes(landUseID)) {
          yieldTile = cell.getCornGrainYield() / 15.92857142857 * 14.8697 * tileArea;
        } else if ([3, 4, 5, 8, 12, 13, 15].includes(landUseID)) {
          yieldTile = cell.results[year].calculatedYieldTile * tileArea;
        } else if ([6, 7].includes(landUseID)) {
          yieldTile = cell.getCattleSupported(year) * tileArea;
        } else if ([10, 11].includes(landUseID)) {
          yieldTile = cell.getWoodYield() / 171.875 * 423.766 * tileArea;
        }
        // if cost is per acre, cost multiplier is the tile area, otherwise if cost per output of biomass then is the corresponding yield per tile
        costMultiplier = [13, 10, 11, 12, 15, 14, 8, 9, 5].includes(landUseID) ? tileArea : yieldTile;

        grossRevenue = yieldTile * unitPrice;


        let rotationKey = landUseKey;
       // cost = getCostPerLandUse(landUseID) * costMultiplier;
        if (year <= 1) {
          cost = getCostPerLandUse(landUseID);
        } else {
          if ([1, 2, 3, 4].includes(landUseID)) {
            const prevLandUse = landUseTrack[year - 1][cellIndex];
            const rotationCombo = `${prevLandUse}-${landUseKey}`;
            rotationKey = rotationCombo;
            cost = getCostPerLandUse(rotationCombo)
            if (cost == null || isNaN(cost || cost===0)) {
              cost = getCostPerLandUse(landUseID);
            } // some transition other than from corn or soybean are not supported so we circle back to no transition

          } else {
            cost = getCostPerLandUse(landUseID)
          }
        }
        // MULTIPLY BY THE COST MULTIPLIER HERE
        cost  *= costMultiplier
        cost *= costInflationFactorAdjustment;
        let netRevenue = grossRevenue - cost;

        this.totalWatershedCost[year][0].cost += cost;
        cell.results[year].calculatedTileNetRevenue = (cell.results[year].calculatedTileNetRevenue || 0) + netRevenue;
        this.econCostByLandUse[year][landUseKey] += cost;
        totalYearCost.totalCosts += cost;
      }

      this.totalWatershedCostArray.push(totalYearCost);
    }

    this.econCostByLandUse = convertLandUseIDsToTexts(this.econCostByLandUse);
  };

  /**
   * This function is used to calculate acreage of each soil type if the land use of Cons Forest (LU_ID = 10) or Conv Forest (LU_ID =11)
   * this.getSoilArea object array has 4 objects. The first one is a dummy object to avoid undefined errors. (Not the best approach but we needed to store
   * values for cells that are not conservation forest or conventional forest)
   */
  calculateForestAreaBySoil = () => {
    // Yes, I rewrite this code the switch is unnecessary, and complicates readability
    for (let i = 1; i <= boardData[currentBoard].calculatedToYear; i++) {
      // Initialize getSoilArea for year 'i'
      this.getSoilArea[i] = [
        {"A": 0, "B": 0, "C": 0, "D": 0, "G": 0, "K": 0, "L": 0, "M": 0, "N": 0, "O": 0, "Q": 0, "T": 0, "Y": 0},
        {"A": 0, "B": 0, "C": 0, "D": 0, "G": 0, "K": 0, "L": 0, "M": 0, "N": 0, "O": 0, "Q": 0, "T": 0, "Y": 0},
        {"A": 0, "B": 0, "C": 0, "D": 0, "G": 0, "K": 0, "L": 0, "M": 0, "N": 0, "O": 0, "Q": 0, "T": 0, "Y": 0},
        {"A": 0, "B": 0, "C": 0, "D": 0, "G": 0, "K": 0, "L": 0, "M": 0, "N": 0, "O": 0, "Q": 0, "T": 0, "Y": 0}
      ];

      for (let j = 0; j < boardData[currentBoard].map.length; j++) {
        let numLandUse = 0;
        if (boardData[currentBoard].map[j].landType[i] === 10) {
          numLandUse = 1;
        }
        if (boardData[currentBoard].map[j].landType[i] === 11) {
          numLandUse = 2;
        }

        // Get the soil type and area directly
        let soilType = boardData[currentBoard].map[j]['soilType'];
        let area = boardData[currentBoard].map[j].area;

        // Increment the area for the appropriate soil type and land use without using a switch
        // perfect we have just reduced this code by about 15 lines
        if (this.getSoilArea[i][numLandUse].hasOwnProperty(soilType)) {
          this.getSoilArea[i][numLandUse][soilType] += area;

        }
      }
    }
  };
  const dropDuplicates = function (array, isEqual) {
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
  const filteredArray = function(arrayData, landUseType, soilType, precipLevel, drop_dup_s =true) {
    let filterRows = arrayData.filter(row =>
        row.soil_type === soilType &&
        row.land_use_code === landUseType &&
        row.precipitation_level === precipLevel

    );
    if (drop_dup_s){
      return dropDuplicates(filterRows)
    } else{
      return filterRows
    }

  };
   calculateGHGScores = (current, base, maximum_score = 307, element = 'CO2-e') =>{
     // maximum_score is the expected maximum score for each element based on the best performing land use
     // using switch in case something specific needs to be tailored to each GHG element. the maximum values were selected after running the simulations and testing the maximum
     function getElementCal(element) {
       switch (element) {
         case 'CO2-e':
           const diff = ((current-base)/base * 100)/maximum_score * 100
           return Math.abs(diff);
         case 'N20':
           const n2O_diff = ((current-base)/base * 100)/maximum_score * 100
           return Math.abs(n2O_diff);
         case 'CO2_em':
           let cur_CO2_em  = Math.abs(current)
           let base_co_em = Math.abs(2342)
           const emissionsReductions  =  ((base_co_em -  cur_CO2_em)/base_co_em)/maximum_score * 100
           return Math.abs(emissionsReductions)

         default:
           return 0;
       }
     }

     return getElementCal(element);
  };

  // Start collectTotalWatershedGHGData method
  //=======================================================
  collectTotalWatershedGHGData = () => {
    // get the current working board
    const CurrentBoard = boardData[currentBoard]

    // create arrays to hold annual data
    //this.ghgMapData = Array(4).fill().map(() => fillCells())

    let co2_emission = 0; // Zero for non emitting land uses with a positive carbon balance
    let bSOC_emissions;

    // start of the loop for calculating annual/yearly values
    // =========================================================================
    let numLandUseCode;
    this.landUseSOC = [{1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:0},
      {1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:0},
      {1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:0},
      {1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0, 10:0, 11:0, 12:0, 13:0, 14:0, 15:0}]
    for (let i = 1; i <= CurrentBoard.calculatedToYear; i++) { // i represent each year and here we start indexing from 1, meaning year one

      // Initialize getSoilArea for year 'i'
      let _PrecipitationData = CurrentBoard.precipitation[i];

      _PrecipitationData = _PrecipitationData.toString();
      // This is to display greenhouse gases by land use types

      this.GHGsScore[i] = [{'CH4': 0, 'C02_e': 0, 'N2O': 0, 'SOC': 0, 'CO2_emissions': 0}];

      this.GHGs[i] = [{'CH4': 0, 'C02_e': 0, 'N2O': 0, 'SOC': 0, 'CO2_emissions': 0}]
      this.ghgBenchmark[i] = [{'CH4': 0, 'C02_e': 0, 'N2O': 0, 'SOC': 0, 'CO2_emissions': 0}]

      // Start of the loop for collecting cell based values
      //====================================================================================
      for (let j = 0; j < CurrentBoard.map.length; j++) { // j is the tile ID
        // Get the soil type and area directly
        let getSoilType = CurrentBoard.map[j]['soilType'];
        let landUseTileID = 0;
        landUseTileID = CurrentBoard.map[j]['landType'][i];
        // console.log(boardData[currentBoard].map[j]['landType'],  'Board land use data, *** ', i)
        let cellLandArea = CurrentBoard.map[j].area;

        if (landUseTileID > 0) {
          let ludID = landUseTileID.toString();
          /**
           * Apparently, the column for  soilType, methane, nitrous oxide kpi, precipitations and land use landUseType, soilType,
           * in the ghgData.csv data are named as follows:
           * [soil_type, land_use_code precipitation_level, 'soil_type', 'ch4_kg_ha_yr', 'TopN2O', 'kpi',
           *  'precipitation_level', 'land_use']  if these columns are changed in that file, this method won't work
           *  if not updated from the source file ./pewi3.0/ghgData.csv
           for more info see data_cleaner.py in the base/root dir
           */
              // let gasesData = filterByLandUseAndSoilType(this.loadedGHGData, ludID, getSoilType, _PrecipitationData);
          let gasesData = filteredArray(this.loadedGHGData, ludID, getSoilType, _PrecipitationData);
          const currentData = gasesData[0];
          // we need to always benchmark it to conventional corn forestry based on the selected soil types
          let baseDData = filteredArray(this.loadedGHGData, '1', getSoilType, _PrecipitationData);
          const referenceData = baseDData[0]


          // Convert to hectares

          let soilArea = cellLandArea / 2.471;

          // This will need to be converted to carbon dioxide equivalents
          let soc = currentData?.to_carb * soilArea;
          //console.log('soil organic carbon', soc)
          let n20 = currentData?.TopN2O * soilArea;
          let kpi = currentData?.kpi * soilArea


          let ch4 = parseFloat(currentData?.ch4_kg_ha_yr) * soilArea;
          let Respiration = parseFloat(currentData?.Whole_repsiration) * soilArea
          // BASE DATA FOR CALCULATION SCORES IS BASED ON CONSERVATION F0RETRY CODE 11
          let bGHG = parseFloat(referenceData?.kpi) * soilArea;
          let bN2O = parseFloat(referenceData?.TopN2O) * soilArea;
          let bCH4 = parseFloat(referenceData?.ch4_kg_ha_yr) * soilArea;
          let bSOC = parseFloat(referenceData?.to_carb) * soilArea;
          let bRespiration = parseFloat(referenceData?.Whole_repsiration) * soilArea

          soc = parseFloat(soc.toFixed(0));
          n20 = parseFloat(n20.toFixed(4));
          kpi = parseFloat(kpi.toFixed(0));
          Respiration = parseFloat(Respiration.toFixed(0));
          bRespiration = parseFloat(bRespiration.toFixed(0));
          let carbonDioxide = 0
          numLandUseCode = Number(ludID);
          if (soc < 0) {
            carbonDioxide = soc
            co2_emission = Math.abs(soc); // we dont want negative values
            // soc = 0; TODO need another way to handle this perhaps discuss in the meeting
          }
          let bCarbonDioxide = 0
          if (bSOC < 0) {
            bCarbonDioxide = bSOC;
            bSOC_emissions = Math.abs(bSOC);// we don't want to display negative values
            bSOC = 0;
          }
          this.GHGs[i][0]['SOC'] += soc;
          this.GHGs[i][0]['N2O'] += n20;
          this.GHGs[i][0]['C02_e'] += kpi;

          this.GHGs[i][0]['CH4'] += ch4;
          // 'calculatedTileGHGs' could be used in mapping GHGs
          // these will be useful in calculating the scores by getting the maximum and the minimum values for each along the soil types or cells
          boardData[currentBoard].map[j].results[i].calculatedTileGHGs = kpi
          // calculatedTileSOC could be used for mapping soil organic carbon
          boardData[currentBoard].map[j].results[i].calculatedTileSOC = soc * cellLandArea //already multiplied by area
          boardData[currentBoard].map[j].results[i].calculatedTileN20 = n20
          boardData[currentBoard].map[j].results[i].calculatedTileNH4 = ch4
          this.landUseSOC[i][numLandUseCode] += soc


          this.GHGs[i][0]['CO2_emissions'] += carbonDioxide;
          this.ghgBenchmark[i][0]['C02_e'] += bGHG;
          this.ghgBenchmark[i][0]['N2O'] += bN2O;
          this.ghgBenchmark[i][0]['CH4'] += bCH4;
          this.ghgBenchmark[i][0]['CO2_emissions'] += bCarbonDioxide;
          this.ghgBenchmark[i][0]['SOC'] += bSOC;


        }


      }
      // End of the loop for collecting tile values
      //============================================================

    }
    // end of the loop for calculating annual/yearly values

  }; //End of collectTotalWatershedGHGData



  let GHGScores = () => {
  this.GHGs.forEach((element, index) => {
    // Ensure `this.GHGsScore[index][0]` exists before assigning values
    if (!this.GHGsScore[index]) {
      this.GHGsScore[index] = [{}];
    }

    // Iterate over each key in the `element` object
    for (let key in element[0]) {
      if (element[0].hasOwnProperty(key)) {
        // Dynamically check if the benchmark value exists, provide a default if not
        const benchmarkValue = this.ghgBenchmark[index]?.[0]?.[key] || 0;

        // Switch based on key to calculate and assign score
        switch (key) {
          case 'N2O':
            let calN20Score = calculateGHGScores(element[0][key], benchmarkValue, 100);
            this.GHGsScore[index][0][key] = parseFloat(calN20Score.toFixed(1));
            break;

          case 'SOC':
            let socValue = calculateGHGScores(element[0][key], benchmarkValue, 4512);
            this.GHGsScore[index][0][key] = parseFloat(socValue.toFixed(1));
            break;

          case 'CO2_emissions':
            let co2Value = calculateGHGScores(element[0][key], benchmarkValue, 200);
            this.GHGsScore[index][0][key] = parseFloat(co2Value.toFixed(1));
            break;

          case 'C02_e':
            let calCO2eScore = calculateGHGScores(element[0][key], benchmarkValue, 307);
            this.GHGsScore[index][0][key] = parseFloat(calCO2eScore.toFixed(1));
            break;

          default:
            let others = calculateGHGScores(element[0][key], benchmarkValue, 39495.4);
            let other_score = Math.abs(100-parseFloat(others.toFixed(1)))
            this.GHGsScore[index][0][key] = other_score.toFixed(1);
            break;
        }
      }
    }
  });
};

      calculateCornYieldRate = (soilType) => {
      var yieldBaseRates = [223, 0, 214, 206, 0, 200, 210, 221, 228, 179, 235, 240, 209, 0];

      switch (soilType) {
          case 'A':
              return yieldBaseRates[0];

          case 'B':
              return yieldBaseRates[1];

          case 'C':
              return yieldBaseRates[2];

          case 'D':
              return yieldBaseRates[3];

          case 'G':
              return yieldBaseRates[4];

          case 'K':
              return yieldBaseRates[5];

          case 'L':
              return yieldBaseRates[6];

          case 'M':
              return yieldBaseRates[7];

          case 'N':
              return yieldBaseRates[8];

          case 'O':

              return yieldBaseRates[9];

          case 'Q':
              return yieldBaseRates[10];

          case 'T':
              return yieldBaseRates[11];

          case 'Y':
              return yieldBaseRates[12];

          case 'NA':
              return yieldBaseRates[13];

          case '0':
              return yieldBaseRates[13];
      } //end switch

  };


  calculateRent = () => {
    for(let i = 1; i <= boardData[currentBoard].calculatedToYear; i++){
      this.getRent[i] = [{
        consCornSoybeanRent: 0, consCornCornRent: 0, convCornSoybeanRent: 0, convCornCornRent: 0,
        consSoybeanRent: 0, convSoybeanRent: 0,
        prairieRent: 0,
        consForestRent: 0, convForestRent: 0,
        swithgrassRent: 0,
        swrbRent: 0,
        wetlandRent: 0,
        mfvRent: 0
      }];
      for (let j = 0; j < boardData[currentBoard].map.length; j++) {
          let cornYield = calculateCornYieldRate(boardData[currentBoard].map[j].soilType) * 1.16; //$1.16 base/bu corn yield
        boardData[currentBoard].map[j].results[i].calculatedCornYield += cornYield
        let acreRate = 77; //$77 acre
          let landUse = boardData[currentBoard].map[j].landType[i];
          let tileArea = boardData[currentBoard].map[j].area;
          let rent = 0;
          if(cornYield > acreRate){
            rent = cornYield;
          }
          else {
            rent = acreRate;
          }

          switch(landUse){

            case 1:
              if(boardData[currentBoard].map[j].landType[i-1] === 3 || boardData[currentBoard].map[j].landType[i-1] === 4){
                this.getRent[i][0].convCornSoybeanRent += rent * tileArea;

              }
              else{
                this.getRent[i][0].convCornCornRent += rent  * tileArea;
              }
              break;
            case 2:
              if(boardData[currentBoard].map[j].landType[i-1] === 3 || boardData[currentBoard].map[j].landType[i-1] === 4){
                this.getRent[i][0].consCornSoybeanRent += rent  * tileArea;
              }
              else{
                this.getRent[i][0].consCornCornRent += rent  * tileArea;
              }
              break;
            case 3:
              this.getRent[i][0].convSoybeanRent += rent  * tileArea;
              break;
            case 4:
              this.getRent[i][0].consSoybeanRent += rent  * tileArea;
              break;
            case 9:
              this.getRent[i][0].prairieRent += rent  * tileArea;
              break;
            case 10:
              this.getRent[i][0].consForestRent += rent  * tileArea;
              break;
            case 11:
              this.getRent[i][0].convForestRent += rent  * tileArea;
              break;
            case 12:
              this.getRent[i][0].swithgrassRent += rent  * tileArea;
              break;
            case 13:
              this.getRent[i][0].swrbRent += rent  * tileArea;
              break;
            case 14:
              this.getRent[i][0].wetlandRent += rent  * tileArea;
              break;
            case 15:
              this.getRent[i][0].mfvRent += rent  * tileArea;
              break;
            default:
              break;
          }
      }
    }
  };


  this.calcSubcrops = function(){
    for(let i = 1; i <= boardData[currentBoard].calculatedToYear; i++){
      this.dataSubcrop[i] = {};
      this.mapData[i].forEach(dataPoint => {
        if(dataPoint['Sub Crop']){
          if(!this.dataSubcrop[i][dataPoint['Land-Use']]){
            this.dataSubcrop[i][dataPoint['Land-Use']] = {};
          }
          if(!this.dataSubcrop[i][dataPoint['Land-Use']][dataPoint['Sub Crop']]){
            this.dataSubcrop[i][dataPoint['Land-Use']][dataPoint['Sub Crop']] = 0;
          }
          this.dataSubcrop[i][dataPoint['Land-Use']][dataPoint['Sub Crop']] =
          Math.round(1000*this.dataSubcrop[i][dataPoint['Land-Use']][dataPoint['Sub Crop']] + 1000*Number.parseFloat(dataPoint['EAA']))/1000
        }
      })
    }
  }


}

var economics = new Economics();



