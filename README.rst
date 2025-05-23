====================================================
People in Ecosystem and Watershed Integration (PEWI)
====================================================

.. image:: https://img.shields.io/badge/License-AGPL--3.0-blue.svg
   :target: https://www.gnu.org/licenses/agpl-3.0.html
   :alt: License: AGPL-3.0

.. image:: https://img.shields.io/badge/Play%20Now-blue.svg
   :target: https://www.nrem.iastate.edu/pewi/
   :alt: Play Now
.. image:: https://img.shields.io/github/stars/LESEM-PEWI/PEWI-People-in-Ecosystem-and-Watershed-Integration?style=social
   :target: https://github.com/LESEM-PEWI/PEWI-People-in-Ecosystem-and-Watershed-Integration/stargazers
   :alt: GitHub Stars

.. image:: https://img.shields.io/github/forks/LESEM-PEWI/PEWI-People-in-Ecosystem-and-Watershed-Integration?style=social
   :target: https://github.com/LESEM-PEWI/PEWI-People-in-Ecosystem-and-Watershed-Integration/members
   :alt: GitHub Forks


Welcome to the development code base for the People in Ecosystem and Watershed Integration (PEWI) project!
--------------------------------------------------------------------------------------------------------------

PEWI is an innovative digital game-based learning (``DGBL``) tool designed and developed at Iowa State University. This platform offers a unique and engaging way to learn about complex ecosystems and watershed management challenges.

For detailed information and publications related to PEWI, please visit the project website: https://www.nrem.iastate.edu/pewi/publications

Additionally, you can access the PEWI home page and game interface here: https://www.nrem.iastate.edu/pewi/

Issue adjusting costs and revenue

V4.1 Improvements:
=====================================================================

  Cost adjustment based on the current inflationary rate

  Changes to corn and soybean

  More object oriented implementation
  
  User-determined commodity prices for economic calculation
  
  broadcasting land use using ctr + B
  
  quickly access the results table while in play mode using Ctr + R 

  V4.1 now features a dedicated Greenhouse mitigation module, that interacts with all other modules
  
  Two maps have been added to the results maps, one of net revenue and greenhouse gas emissions

  when the use hoovers through each cell, he be shown the GHG emission status of that cell, i.e., if it is editing or reducing greenhouse gas emissions
  
  the net revenue map also show the carbon and nitrate credit

  users can turn off carbon or nitrate credit value by going to economic input tab, and turning the corresponding market price to zero

  uses can also change the prices of corn and soybean according to the prevailing market prices

Code structure:
=================================================
     
     ./index.html
     draws the pewi workspace div but renders the loadingContainer and 
     startUpFrame over the workspace for navigation
     
     ./htmlFrames/startup.html
     onLoad this page plays a loading animation video and simultaneously calls on
     loader.js and mainFE.js to begin loading resources. navigation buttons to
     sandbox mode, play mode page, or utilities page will load further resources
     and the workspace when selected
     
     ./front-end/loader.js
     contains links to all necessary images/textures to load using a THREE.js 
     TextureLoader
     
     ./front-end/mainFE.js
     includes all generic functions to render the THREE.js scene in the workspace
  
     ./front-end/helpersFE.js
     contains all necessary functions to create/interact with a PEWI workspace 
     for the sandbox, levels, and multiplayer design modes

     ./front-end/economicUtils.js
     contains utility function for the new economic module updates
     
     ./back-end/helperObjects.js
     object-oriented backend script written for PEWI 2.0 which instantiates the 
     data structures for the Tile/Board/Total objects, and performs calculations
     
     ./back-end/mainBE.js and ./back-end/helperMethods.js
     two backend scripts which assist in loading/parsing data from watershed map
     .csv files
     
     ./htmlFrames/results.html and ./front-end/resultsDisplay.js
     generate an iFrame in the workspace to display tabular and graphical 
     results calculated via the backend scripts for the Totals object
     
     ./codex/*
     contains all necessary resources and scripts to create an iframe in the 
     workspace which provides a directory of information for the user to explore.
     new directory entries and links to resources are added via the main.dat file
     which are parsed and inserted with codexHelper.js
     
     ./front-end/gameLogic.js and ./front-end/Bird.js
     level objectives are monitored via frameRate in mainFE.js and gameLogic.js.
     Bird.js can add an animated flock of birds to the scene. Other animation 
     scripts are contained in helpersFE.js
       
     ./htmlFrames/uploadDownload.html
     rendered as an iframe in the workspace with options for upload and download 
     of PEWI maps with current land-use
  
     ./htmlFrames/credits.html
     rendered as an iframe in the workspace to display credits for the project

     ./htmlFrames/play.html
     rendered in an iframe over the static background image, contains
     cloud images that link to PEWI levels
     
     ./levels/*
     contains resources to support levels in PEWI. the level.dat file specifies
     the hierarchy of levels for the play.html page and points to level design
     files in the specs folder which are used with the main map (data.csv) or 
     accessory maps in the maps folder
     
     ./front-end/levelLoader.js
     scripts for parsing/loading data in the levels directory. links to the
     levels are generated when the play.html page loads and the level details are
     loaded when a level is selected
     
     ./htmlFrames/utilities.html
     rendered in an iframe over the static background image, contains
     three buttons which link to the level designer and mutliplayer design mode
          
     ./htmlFrames/levelDesigner.html
     opens a new window allowing a user to create a new level for pewi by 
     specifying objectives via score monitoring, animations for user feedback, 
     and guiding scripts.
     
     ./htmlFrames/multiDownload.html
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