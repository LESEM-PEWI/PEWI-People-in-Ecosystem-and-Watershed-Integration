====================================================
People in Ecosystem and Watershed Integration (PEWI)
====================================================
.. image:: https://img.shields.io/badge/License-AGPL--3.0-pantone.svg
   :target: https://www.gnu.org/licenses/agpl-3.0.html
   :alt: License: AGPL-3.0

.. image:: https://img.shields.io/badge/Play%20Now-red.svg
   :target: https://www.nrem.iastate.edu/pewi/
   :alt: Play Now

.. image:: https://img.shields.io/badge/Read%20Publications-blue.svg
   :target: https://www.nrem.iastate.edu/pewi/publications
   :alt: Read Publications

.. image:: https://img.shields.io/badge/Watch%20Tutorials-pantone.svg
   :target: https://www.youtube.com/watch?v=m3DQwosNRUc
   :alt: Watch Tutorials

.. image:: https://img.shields.io/github/stars/LESEM-PEWI/PEWI-People-in-Ecosystem-and-Watershed-Integration?style=social
   :target: https://github.com/LESEM-PEWI/PEWI-People-in-Ecosystem-and-Watershed-Integration/stargazers
   :alt: GitHub Stars

.. image:: https://img.shields.io/github/forks/LESEM-PEWI/PEWI-People-in-Ecosystem-and-Watershed-Integration?style=social
   :target: https://github.com/LESEM-PEWI/PEWI-People-in-Ecosystem-and-Watershed-Integration/members
   :alt: GitHub Forks

About PEWI
======================
People in Ecosystems/Watershed Integration (PEWI) is a simple web-based educational game designed to provide a scientific platform for teaching,
discussing, and evaluating the tradeoffs associated with agricultural land use and management. Players iteratively manipulate land use annually
for three years in a virtual 6000 acre watershed to meet a variety of goals. The tool computes a variety of results, including agricultural yields,
soil erosion, stream pollution, and wildlife habitat

The goal of this repository is to support open-source and collaborative development of PEWI.

V4.1 Improvements
=====================================================================

1. Cost adjustment based on the current inflationary rate.

2. Cost and revenue data updates for all the land uses.

3. More object-oriented implementation for improved modularity.

4. User-defined commodity prices for economic calculations.

5. Broadcast land use using Ctrl + B.

6. Quickly access the results table while in play mode using Ctrl + R.

7. V4.1 features a dedicated Greenhouse Mitigation module that interacts with all other modules.

8. Two new maps have been added to the results section: one for net revenue and one for greenhouse gas emissions.

9. When the user hovers over each cell, they are shown the GHG emission status of that cell—i.e., whether it is emitting or reducing greenhouse gases.
   The net revenue map also displays carbon and nitrate credits.

10. Users can turn off carbon or nitrate credit values by navigating to the Economic Input tab and setting the corresponding market price to zero.

11. Users can also update corn and soybean prices to reflect current market conditions.

12. Carbon sequestration is also updated for all the land uses

Code structure:
=================================================
     
     >>> ./index.html

     draws the pewi workspace div but renders the loadingContainer and 
     startUpFrame over the workspace for navigation
     
     >>> ./htmlFrames/startup.html

     onLoad this page plays a loading animation video and simultaneously calls on
     loader.js and mainFE.js to begin loading resources. navigation buttons to
     sandbox mode, play mode page, or utilities page will load further resources
     and the workspace when selected
     
     >>> ./front-end/loader.js

     contains links to all necessary images/textures to load using a THREE.js 
     TextureLoader
     
     >>> ./front-end/mainFE.js

     includes all generic functions to render the THREE.js scene in the workspace
  
     >>> ./front-end/helpersFE.js

     contains all necessary functions to create/interact with a PEWI workspace 
     for the sandbox, levels, and multiplayer design modes

     >>> ./front-end/economicUtils.js

     contains utility function for the new economic module updates
     
     >>> ./back-end/helperObjects.js

     object-oriented backend script written for PEWI 2.0 which instantiates the 
     data structures for the Tile/Board/Total objects, and performs calculations
     
     >>> ./back-end/mainBE.js and ./back-end/helperMethods.js
     two backend scripts which assist in loading/parsing data from watershed map
     .csv files
     
     >>> ./htmlFrames/results.html and ./front-end/resultsDisplay.js

     generate an iFrame in the workspace to display tabular and graphical 
     results calculated via the backend scripts for the Totals object
     
     >>> ./codex/*

     contains all necessary resources and scripts to create an iframe in the 
     workspace which provides a directory of information for the user to explore.
     new directory entries and links to resources are added via the main.dat file
     which are parsed and inserted with codexHelper.js
     
     >>> ./front-end/gameLogic.js and ./front-end/Bird.js

     level objectives are monitored via frameRate in mainFE.js and gameLogic.js.
     Bird.js can add an animated flock of birds to the scene. Other animation 
     scripts are contained in helpersFE.js
       
     >>> ./htmlFrames/uploadDownload.html

     rendered as an iframe in the workspace with options for upload and download 
     of PEWI maps with current land-use
  
     >>> ./htmlFrames/credits.html

     rendered as an iframe in the workspace to display credits for the project

     >>> ./htmlFrames/play.html

     rendered in an iframe over the static background image, contains
     cloud images that link to PEWI levels
     
     >>> ./levels/*

     contains resources to support levels in PEWI. the level.dat file specifies
     the hierarchy of levels for the play.html page and points to level design
     files in the specs folder which are used with the main map (data.csv) or 
     accessory maps in the maps folder
     
     >>> ./front-end/levelLoader.js

     scripts for parsing/loading data in the levels directory. links to the
     levels are generated when the play.html page loads and the level details are
     loaded when a level is selected
     
     >>> ./htmlFrames/utilities.html

     rendered in an iframe over the static background image, contains
     three buttons which link to the level designer and mutliplayer design mode
          
     >>> ./htmlFrames/levelDesigner.html

     opens a new window allowing a user to create a new level for pewi by 
     specifying objectives via score monitoring, animations for user feedback, 
     and guiding scripts.
     
     >>> ./htmlFrames/multiDownload.html

     completes the creation of mutliplayer maps when the user presses the v key
     in the workspace after assigning areas to players in the mutliplayer mode


# **Notes:**

    tileID starts at 1 but boardData[currentBoard].map is an array, so tileID 1
    is stored at index 0 in boardData[currentBoard].map
    
add a stage/level to PEWI:
-------------------------------------

    Use the level designer in the utilities page to create a new level
    specifications file. Submit the form to download the file. Follow these steps
    to add the level to PEWI:
    
    1) Add the downloaded file to the pewi3/levels/specs directory
    
    2) Open the level.dat file in pewi3/levels/levelResources/level.dat
    
    3) If the level belongs in a new stage, create a line with "# " and the stage
       name. Example: "# The N-Factor"
       
    4) Choose a stage to place the new level in and put a new line after the
       line with the stage's name such as: "# The N-Factor"
       
    5) On the new line, add "@ " and the number/letter that should appear in the 
       cloud, add a comma "," and write the name of the file that was placed in
       the pewi3/levels/specs directory. Example: "@ 3,B3.txt"
       
    6) Save the edited level.dat file in the pewi3/levels/levelResources folder
    
    7) Open pewi and test out your new level.
