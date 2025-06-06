
//levelLoader keeps track of all the various parameters involved in a level
// it is also called for sandbox, with no parameters assigned

var achievementScripts = [];
var achievementValues = [];
var achievementDisplayed = -1;
var achievementAccomplished = [];
var achievementAnimations = [];
var hideOptions = "";
var multiplayerAssigningModeOn = false;
var yearToCheck = 0;

var levelSpecs = {
  begin: "",
  end: "",
  numRequired: 0,
  started: 0,
  finished: 0,
  precipitation: [0, 0, 0, 0],
  landTypeMonoculture: [0, 0, 0, 0]
}
var objectives = [];


var lastLevel = 0;
var levelContainer = [];
var levelGlobal = 0;
var originalDiv;

//init parses the level.dat file which stores level data in the levelContainer array
function init() {

  $.ajax({
    async: false,
    type: "GET",
    url: '../levels/levelResources/level.dat',
    dataType: "text",
    contentType: "application/x-www-form-urlencoded;charset=UTF-8",
    success: function(data) {
      parseLevelMenuData(data);
    }
  });

} //end init


// get ecosystem scores and load them to the corresponding progress bars based on which year user want to load.
function refreshProgressBar(yearToLoad) {
  economics.mapChange(); // Load Map change to update values for BMP Budgets - is this good to do here? May need performance optimization.
  //TODO
  //Calculated Separately to Update Values based on BMP Budgets
  let cornYield = Math.round(economics.cornAfters[yearToLoad][1].ConvCornAfterSoybeanYield +
      economics.cornAfters[yearToLoad][1].ConvCornAfterCornYield +
      economics.getBMPAreas[yearToLoad][2].landUseYield +
      economics.getBMPAreas[yearToLoad][3].landUseYield).toFixed(1);

  let soybeanYield = Math.round(economics.getCropYields[yearToLoad][1].convSoybeanYield +
      economics.getBMPAreas[yearToLoad][1].landUseYield).toFixed(1)

  let cornYieldMax = boardData[currentBoard].maximums.cornMax;
  let soyYieldMax = boardData[currentBoard].maximums.soybeanMax;

  let cornYieldAdjScore = (cornYield / cornYieldMax) * 100;
  let soyYieldAdjScore = (soybeanYield / soyYieldMax) * 100;
  // Green House gases progress Bar
  $('.progress .progress-bar-greenHouseGases').attr('data-transitiongoal', Math.round(economics.GHGsScore[yearToLoad][0]?.C02_e* 10) / 10);
  $('.progress .progress-bar-gameWildlife').attr('data-transitiongoal', Math.round(Totals.gameWildlifePointsScore[yearToLoad] * 10) / 10);
  $('.progress .progress-bar-biodiversity').attr('data-transitiongoal', Math.round(Totals.biodiversityPointsScore[yearToLoad] * 10) / 10);
  $('.progress .progress-bar-stream-biodiversity').attr('data-transitiongoal', Math.round(Totals.streamBiodiversityScore[yearToLoad] * 10) / 10);
  $('.progress .progress-bar-carbon').attr('data-transitiongoal', Math.round(Totals.carbonSequestrationScore[yearToLoad] * 10) / 10);
  $('.progress .progress-bar-erosion').attr('data-transitiongoal', Math.round(Totals.grossErosionScore[yearToLoad] * 10) / 10);
  $('.progress .progress-bar-nitrate').attr('data-transitiongoal', Math.round(Totals.nitrateConcentrationScore[yearToLoad] * 10) / 10);
  $('.progress .progress-bar-phoshorus').attr('data-transitiongoal', Math.round(Totals.phosphorusLoadScore[yearToLoad] * 10) / 10);
  $('.progress .progress-bar-sediment').attr('data-transitiongoal', Math.round(Totals.sedimentDeliveryScore[yearToLoad] * 10) / 10);
  $('.progress .progress-bar-aquatic').attr('data-transitiongoal', Math.round(Totals.aquaticHealthIndexScore[yearToLoad] * 10) / 10);
  //var tempTotal = Totals.cornGrainYieldScore[yearToLoad] + Totals.soybeanYieldScore[yearToLoad] + Totals.mixedFruitsAndVegetablesYieldScore[yearToLoad] + Totals.alfalfaHayYieldScore[yearToLoad] + Totals.grassHayYieldScore[yearToLoad] +
  //  Totals.switchgrassYieldScore[yearToLoad] + Totals.cattleYieldScore[yearToLoad] + Totals.woodYieldScore[yearToLoad] + Totals.shortRotationWoodyBiomassYieldScore[yearToLoad];

  var tempTotal = cornYieldAdjScore + soyYieldAdjScore + Totals.mixedFruitsAndVegetablesYieldScore[yearToLoad] + Totals.alfalfaHayYieldScore[yearToLoad] + Totals.grassHayYieldScore[yearToLoad] +
      Totals.switchgrassYieldScore[yearToLoad] + Totals.cattleYieldScore[yearToLoad] + Totals.woodYieldScore[yearToLoad] + Totals.shortRotationWoodyBiomassYieldScore[yearToLoad];

  $('.progress .progress-bar-totalYields').attr('data-transitiongoal', Math.min(Math.round(tempTotal * 10) / 10, 100));

  $('.progress .progress-bar-cornGrain').attr('data-transitiongoal', Math.round(cornYieldAdjScore * 10)/10);
  $('.progress .progress-bar-soybeans').attr('data-transitiongoal', Math.round(soyYieldAdjScore * 10)/10);
  $('.progress .progress-bar-fruitsAndVegetables').attr('data-transitiongoal', Math.round(Totals.mixedFruitsAndVegetablesYieldScore[yearToLoad] * 10) / 10);
  $('.progress .progress-bar-cattle').attr('data-transitiongoal', Math.round(Totals.cattleYieldScore[yearToLoad] * 10) / 10);
  $('.progress .progress-bar-alfalfaHay').attr('data-transitiongoal', Math.round(Totals.alfalfaHayYieldScore[yearToLoad] * 10) / 10);
  $('.progress .progress-bar-grassHay').attr('data-transitiongoal', Math.round(Totals.grassHayYieldScore[yearToLoad] * 10) / 10);
  $('.progress .progress-bar-switchgrassBiomass').attr('data-transitiongoal', Math.round(Totals.switchgrassYieldScore[yearToLoad] * 10) / 10);
  $('.progress .progress-bar-wood').attr('data-transitiongoal', Math.round(Totals.woodYieldScore[yearToLoad] * 10) / 10);
  $('.progress .progress-bar-woodyBiomass').attr('data-transitiongoal', Math.round(Totals.shortRotationWoodyBiomassYieldScore[yearToLoad] * 10) / 10);

  $('.progress .progress-bar').progressbar(
      // {display_text: 'center', percent_format: function(p) {return p;}}
  );
}

//getFileForExercise can retrieve file name from exercise/level number for the level loader
function getFileForExercise(exercise) {

  for (var i = 0; i < levelContainer.length; i++) {

    for (var k = 0; k < levelContainer[i].data.length; k++) {

      if (exercise == levelContainer[i].data[k].exercise) {

        return levelContainer[i].data[k].file;

      }
    }
  }

} //end getFileForExercise

//Format Numbers
function addCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// I think we need to call this everytime we refresh
//var economics = new Economics();
function refreshEconTotals(yearToLoad){


  //var economics = Economics()
  //calling map change here so the total is updated with every change; if we don't call it here then it will only be
  //updated when results are explicitly called.
  // economics.rawBMPData=costAdjuster(economics.rawBMPData, 'EAA',  parseFloat(document.getElementById('inflationFactor').value))
  economics.mapChange();

  const collectInflationAdjustment = parseFloat(document.getElementById('inflationFactor').value);
  const collectCarbonPrice =  parseFloat(document.getElementById("carbonPrices").value);
  //economics.rawBMPData=costAdjuster(econRawBMP, 'EAA',  collectInflationAdjustment);
  // economics.rawData=costAdjuster(econRawData, "EAA",  collectInflationAdjustment);
  /// this works on the econ total at the play but also we are apply a similar factor while downloading the cost data

  let totalCost = economics.totalWatershedCost[yearToLoad][0].cost * collectInflationAdjustment;
  // we need to update the costs
  economics.totalWatershedCost[yearToLoad][0].cost = totalCost;
  // totalRevenue is generated by adding carbonCredit and the current revenue. carbonCredit value is obtained by multiplying carbon price with SOC
  // I have commented out this one because it already accounted for economics.js
 // let carbonCredit= Math.round( economics.GHGs[yearToLoad][0]?.SOC) * collectCarbonPrice;
  let totalRevenue =  economics.totalWatershedRevenue[yearToLoad][0].revenue; //+carbonCredit
  let totalProfit = totalRevenue - totalCost;
  document.getElementById('totalCost').innerHTML = '$' + addCommas(Math.round(totalCost));
  document.getElementById('totalRevenue').innerHTML = '$' + addCommas(Math.round(totalRevenue));
  document.getElementById('totalProfit').innerHTML = totalProfit > 0 ? '$' + addCommas(Math.round(totalProfit)) : '(-) $' + addCommas(Math.abs(Math.round(totalProfit)));
}

//loadLevel is triggered by clicking a level button on the html page
function loadLevel(level) {

  //remove any previously set up level settings
  resetLevel();

  //if all levels have been completed
  var achievedAllLevels = false;
  if (level > lastLevel) {
    level = 0;
    achievedAllLevels = true;
  }

  //switch control for levels
  switch (level) {
      //sandbox
    case 0:
      levelGlobal = 0;
      multiplayerExit();
      initWorkspace('./data.csv');
      // document.getElementById('parameters').innerHTML = "";
      document.getElementById('parameters').innerHTML = "cornGrainProgressBar" + "\n" + "soybeansProgressBar"+"\n"+"fruitsAndVegetablesProgressBar"+"\n"+"cattleProgressBar"+"\n"+"alfalfaHayProgressBar"+"\n"+
          "grassHayProgressBar"+"\n"+"switchgrassBiomassProgressBar"+"\n"+"woodProgressBar"+"\n"+"woodyBiomassProgressBar";
      parent.saveAndRandomize();
      parent.toggleVisibility();
      if (achievedAllLevels) {
        updatePopup("Congratulations! You made it through all the levels. Try out your newfound knowledge in Sandbox mode!");
        setTimeout(function() {
          togglePopupDisplay();
        }, 5000);
      } else {
        updatePopup("Welcome to Sandbox Mode! <br><br> In the sandbox you can play freely, without the limits imposed by specific exercises and levels.");
        setTimeout(function() {
          togglePopupDisplay();
        }, 5000);
      }
      calculateResults();
      // Show the progress bars
      document.getElementById('progressBarContainer').style.display = 'block';

      $(document).ready(function() {
        refreshEconTotals(1);
      });

      $(document).ready(function() {
        refreshProgressBar(1);
      });
      break;
      //multiplayer assigning mode
    case -1:
      multiplayerAssigningModeOn = true;

      multiplayerMode();
      levelGlobal = 1;
      loadLevelDetails("./levels/specs/multiplayerAssign.txt");
      initWorkspace('./data.csv');
      break;
      //generic loading for levels
    default:
      multiplayerExit();
      levelGlobal = level;
      loadLevelDetails("./levels/specs/" + getFileForExercise(level));
      initWorkspace('./data.csv');
      document.getElementById('parameters').innerHTML = "cornGrainProgressBar" + "\n" + "soybeansProgressBar"+"\n"+"fruitsAndVegetablesProgressBar"+"\n"+"cattleProgressBar"+"\n"+"alfalfaHayProgressBar"+"\n"+
          "grassHayProgressBar"+"\n"+"switchgrassBiomassProgressBar"+"\n"+"woodProgressBar"+"\n"+"woodyBiomassProgressBar";

      var yieldProgressbarIds = ["cornGrainProgressBar","soybeansProgressBar","fruitsAndVegetablesProgressBar","cattleProgressBar","alfalfaHayProgressBar",
        "grassHayProgressBar","switchgrassBiomassProgressBar","woodProgressBar","woodyBiomassProgressBar"];

      for (var i = 0; i < yieldProgressbarIds.length; i++) {
        window.frames[6].document.getElementById(yieldProgressbarIds[i]).checked = true;
      }
      document.getElementById('popup').className = 'popup';
      calculateResults();
      // Show the progress bars
      document.getElementById('progressBarContainer').style.display = 'block';

      $(document).ready(function() {
        refreshEconTotals(1);
      });

      $(document).ready(function() {
        refreshProgressBar(1);
      });

      break;
  }

  //if a level with specifications is loaded, control precipitation and monocultures
  if (levelGlobal > 0) {

    //if precipitation was not set, then randomly generate values
    for (var i = 0; i < 4; i++) {
      if (levelSpecs.precipitation[i] == 0) {
        levelSpecs.precipitation[i] = setPrecipitation();
      } else {
        levelSpecs.precipitation[i] = Number(levelSpecs.precipitation[i]);
      }

      //set board precipitation values to levelSpecs precipitation values
      boardData[currentBoard].precipitation[i] = Number(levelSpecs.precipitation[i]);
      boardData[currentBoard].precipitationIndex[i] = Number(convertPrecipToIndex(levelSpecs.precipitation[i]));

    } //end for each year

    //set up monocultures on each year of the board if it indeed needs a monoculture
    for (var i = 0; i < 4; i++) {

      if (levelSpecs.landTypeMonoculture[i] != 0) {

        for (var j = 0; j < boardData[currentBoard].map.length; j++) {

          if (boardData[currentBoard].map[j].landType[i] != 0) {

            boardData[currentBoard].map[j].landType[i] = Number(levelSpecs.landTypeMonoculture[i]);
            if (i == currentYear) {
              if (!multiplayerAssigningModeOn) {
                meshMaterials[j].map = textureArray[Number(levelSpecs.landTypeMonoculture[i])];
                meshOverlay[j].map = textureArray[Number(levelSpecs.landTypeMonoculture[i])];
              } else {
                meshMaterials[j].map = multiplayerTextureArray[Number(levelSpecs.landTypeMonoculture[i])];
                meshOverlay[j].map = multiplayerTextureArray[Number(levelSpecs.landTypeMonoculture[i])];
              }
              boardData[currentBoard].map[j].update(currentYear);
            } //end if

          } //end if

        } //end for

      } //end if

    } //end for
    //call toggleVisibility to update new precipitation values
    toggleVisibility();
  } //end if level global is > 0

} //end loadLevel

//load the data from given fileString into the given board object
function loadLevelDetails(fileString) {

  $.ajax({
    async: false,
    type: "GET",
    url: fileString,
    dataType: "text",
    contentType: "application/x-www-form-urlencoded;charset=UTF-8",
    success: function(data) {
      parseLevelDetails(data);
    }
  });

} //end loadLevelDetails

//parseLevelDetails parses a level specifications file and stores the data in the level specs object and objectives array
function parseLevelDetails(data) {

  //get data from invisible div on page
  var strRawContents = data;
  //split based on escape chars
  while (strRawContents.indexOf("\r") >= 0)
    strRawContents = strRawContents.replace("\r", "");
  var arrLines = strRawContents.split("\n");

  var curLine = arrLines[0];
  //parse id's of items to hide using the parameters div in index.html
  hideOptions = curLine.split("*").join("\n");
  document.getElementById("parameters").innerHTML = hideOptions;

  //add the specified precipitation levels to the levelSpecs
  var tempParsed = arrLines[1].split("*");
  for (var i = 0; i < 4; i++) {
    levelSpecs.precipitation[i] = tempParsed[i];
  }

  //add the specified monocultures to the levelSpecs
  tempParsed = arrLines[2].split("*");
  levelSpecs.landTypeMonoculture[0] = 1;
  for (var i = 0; i < 3; i++) {
    levelSpecs.landTypeMonoculture[i + 1] = tempParsed[i];
  } //end for

  //add the beginning script to the levelScripts object
  levelSpecs.begin = arrLines[3];

  //add the number of final objectives that are required to pass the level
  levelSpecs.numRequired = arrLines[4];

  for (var i = 5; i < arrLines.length - 1; i++) {

    tempParsed = arrLines[i].split("*");

    var newObjective = {
      score: tempParsed[0],
      year: Number(tempParsed[1]),
      final: Number(tempParsed[2]),
      accomplished: 0,
      previouslyDisplayed: 0,
      low: Number(tempParsed[3]),
      high: Number(tempParsed[4]),
      script: tempParsed[5],
      animation: tempParsed[6]
    }

    objectives.push(newObjective);

  } //end for each line

  //add the ending script to the levelScripts object
  levelSpecs.end = arrLines[arrLines.length - 1];
} //end parseLevelDetails

//parseLevelMenuData reads the string from the level.dat file into a level hierarchy
function parseLevelMenuData(data) {

  var strRawContents = data;
  //split based on escape chars
  while (strRawContents.indexOf("\r") >= 0)
    strRawContents = strRawContents.replace("\r", "");
  var arrLines = strRawContents.split("\n");

  var levelIndex = -1;
  var stageIndex = -1;
  lastLevel = 0;

  for (var i = 0; i < arrLines.length; i++) {
    var lineType = arrLines[i].substring(0, 1);
    var lineContent = arrLines[i].substring(2, arrLines[i].length);

    switch (lineType) {
        //if the line is a new stage
      case "#":
        stageIndex = -1;
        levelIndex++;
        var levelData = {
          data: [],
          name: lineContent
        };
        levelContainer.push(levelData);
        break;
        //if the line is a new level
      case "@":
        lastLevel++;
        var levelNumber = lastLevel;
        var lineArray = lineContent.split(",");
        var exerciseData = {
          exercise: levelNumber,
          text: lineArray[0],
          file: lineArray[1]
        };
        levelContainer[levelIndex].data.push(exerciseData);
        break;
    }
  }

  //Ensure that the main webpage and the play.html screen share the same levelContainer information
  top.window.levelContainer = levelContainer;
  top.window.lastLevel = lastLevel;

} //end parseLevelMenuData

//populateLevels uses the levelContainer hierarchy of stages, levels, and exercises to organize the level container as clouds on the play screen
function populateLevels() {

  var tempString = " ";

  for (var i = 0; i < levelContainer.length; i++) {

    var placementPercent = [25, 50, 30];

    //create a new stage element
    // tempString += "<div class='playGroupContainer' style='left:" + placementPercent[i % 3] + "%; margin: 0 auto; top: " + ((i+1) * 250 - 200) + "px;'>";
    tempString += "<div class='playGroupContainer' style='left:" + placementPercent[i % 3] + "%; margin: 0 auto; top: " + ((i + 1) * 35 - 28) + "%;'>";
    tempString += "<div class='mainButton mainButtonNoHover playMode-factor'>" + levelContainer[i].name + "</div>";

    //for each level stored as an element in a stage stored in the levelContainer
    for (var k = 0; k < levelContainer[i].data.length; k++) {

      var clickStringBuilder = "window.top.loadLevel(" + levelContainer[i].data[k].exercise + ")";

      //Create a new level element and cloud to display
      tempString += "<div id='cloud_" + i + "_" + k + "' class='cloud' onclick='" + clickStringBuilder + "'><img src='../imgs/Cloud.png'/><p>" + levelContainer[i].data[k].text + "</p></div>";

      if (k < levelContainer[i].data.length - 1) {
        tempString += "<div class='cloudSpacer'></div>"
      };

    }

    tempString += "</div>";

  }

  //include a spacer below the clouds so the last row in not on the bottom of the page
  tempString += "<div class='groupContainer' style='left:" + placementPercent[i % 3] + "%; margin: 0 auto; top: " + ((i + 1) * 250 - 200) + "px;'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>";

  return tempString;

} //end populateLevels

//resetLevel removes all objects, resets the levelSpecs and clears the popup dialogue
function resetLevel() {

  objectives = [];
  levelSpecs = {
    begin: "",
    end: "",
    numRequired: 0,
    started: 0,
    finished: 0,
    precipitation: [0, 0, 0, 0],
    landTypeMonoculture: [0, 0, 0, 0]
  }

  clearPopup();

  // document.getElementById("mainMenuButton").className = "moveButtonHidden";
  // document.getElementById("nextLevelButton").className = "moveButtonHidden";
} //end resetLevel

//returnCurrentLevel
function returnCurrentLevel() {
  return levelGlobal;
} //end returnCurrentLevel
