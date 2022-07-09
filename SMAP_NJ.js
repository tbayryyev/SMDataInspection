Map.setControlVisibility(false); // hide layer panel 


var NJ = ee.FeatureCollection('users/tahyrb/State_Boundary_of_NJ'); // gets the boundary of NJ

var counties = ee.FeatureCollection('users/tahyrb/County_Boundaries_of_NJ') // gets the counties of NJ

Map.addLayer(counties,{color:'black'},'counties'); // add the counties layer to the map for visulization

Map.setOptions('HYBRID'); // set map to Satellite

var dataset = ee.ImageCollection('NASA_USDA/HSL/SMAP10KM_soil_moisture')
                  .filter(ee.Filter.date('2015-04-02', ee.Date(new Date().getTime()))); //filters the date from first observation to latest observation
                  
var SM = dataset.select('ssm'); //selects the band you want to use



var dataset2 = ee.ImageCollection('NASA_USDA/HSL/SMAP10KM_soil_moisture').select('ssm'); //filters the date from first observation to latest observation
                  
// change the units from mm^3/mm^3 to m^3/m^3 
// map over the image collection and divide each image by 100

var ssm1 = dataset.map(function(image) {
  return image.addBands(
    image.expression(
  'P / 100', {
    P: image.select('ssm')
    }
  ).float().rename('adjusted'));
});


var ssm = ssm1.select('adjusted')



var soilMoistureVis = {
  min: 0.0,
  max: 26.0,
  palette: ['ff0303','efff07','efff07','418504','0300ff'], //choose range of colors in pallete (hexadecimal values) to represent the amount of soil moisture in a given area on the map.
  opacity: 0.3
    
};

var soilMoistureNJ2 = dataset2.map(function(image) { return image.clip(NJ); }); // goes through the image collection and clips each image around NJ boundary



var soilMoistureNJ = ssm.map(function(image) { return image.clip(NJ); }); // goes through the image collection and clips each image around NJ boundary

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var Start_period = ee.Date('2015-04-02')
var End_period = ee.Date(new Date().getTime())
//Date Slider
ee.Dictionary({start: Start_period, end: End_period})
  .evaluate(renderSlider) 

function renderSlider(dates) {
  var slider = ui.DateSlider({
    start: dates.start.value, 
    end: dates.end.value, 
    period:3 , // Every 3 days
    onChange: renderDateRange
  })
  Map.add(slider)
}

function renderDateRange(dateRange) {
 var image = soilMoistureNJ2
  .filterDate(dateRange.start(), dateRange.end()) // filtering date based on the date slider 
 
 
  var layer = ui.Map.Layer(image,soilMoistureVis , 'Soil Moisture NJ');
  Map.layers().set(1, layer); // overwrites the layer so that there is only 1 layer showing the current dates

}


//Map.addLayer(soilMoistureNJ, soilMoistureVis, 'Soil Moisture NJ'); // adds SMAP layer to map


Map.setCenter(-74.724167,40.072778, 8)  //adds center to NJ




// function to rename the band of SMAP data
function renameBandsETM1(image) {
   
    return image.rename('SMAP observation');
}



var SMAP = soilMoistureNJ.map(renameBandsETM1);     // creates a new image collection with renamed band 





// set position of panel
var legend = ui.Panel({
  style: {
    position: 'top-right',
    padding: '3px 5px'
  }
});

// Create legend title
var legendTitle = ui.Label({
  value: 'Surface Soil Moisture',
  style: {
    fontWeight: 'bold',
    fontSize: '12px',
    margin: '0px 0px 0px 0px',
    padding: '0'
    }
});

// Add the title to the panel
legend.add(legendTitle);


// The max label code
var max_label = ui.Label({
  value: '0.26 m^3/m^3',
  style: {
    fontWeight: 'normal',
    fontSize: '11px',
    margin: '0px 0px 0px 36px',   // margin positions the title or text based on the parameters you give
    padding: '5px'                // padding spaces the label a certain amount from other labels around it
    }
});

legend.add(max_label);

    
    
    
// Creating the color bar
function makeColorBarParams(palette) {
  return {
    bbox: [0, 1, 2, 0,],  
    dimensions: '20x150',
    format: 'png',
    palette: palette,
  };
}


//  Palette with the colors
var palette =['ff0303','efff07','efff07','418504','0300ff'];

// the colorbar to show the different soil moisture
var colorBar = ui.Thumbnail({
  image: ee.Image.pixelLonLat().select(1),
  params: makeColorBarParams(palette),
  style: {stretch: 'vertical', margin: '0px 50px', maxHeight: '200px'},
});

legend.add(colorBar)


// The min label code
var min_label = ui.Label({
  value: '0.0 m^3/m^3',
  style: {
    fontWeight: 'normal',
    fontSize: '11px',
    margin: '10px 0px 0px 42px',   // margin positions the title or text based on the parameters you give
    padding: '0px'  
    }
}); 

legend.add(min_label);

// add legend to map (alternatively you can also print the legend to the console)  
Map.add(legend);  







// Instruction panel for the user to read in order to render a chart
var instructions_panel = ui.Panel();
instructions_panel.style().set({
  width: '440px',
  height: '250px',
  padding: '0px',
  position: 'bottom-left',

  
  
});

// Create Title for the instructions panel
var title = ui.Label({
  value: 'Near-Real-Time Soil Moisture Inspection In NJ',
  style: {
    fontWeight: 'bold',
    fontSize: '20px',
    margin: '0px 0px 0px 0px',
    padding: '5px'
    }
});


instructions_panel.add(title);

// Create Title for the instructions panel
var instructions_title = ui.Label({
  value: ' How to display SMAP Surface Soil Moisture Time Series in NJ counties',
  style: {
    textDecoration: 'underline',
    fontSize: '15px',
    margin: '0px 0px 0px -10px',
    padding: '20px'
    }
});

// adding the instruction title to the panel
instructions_panel.add(instructions_title);

//first instruction label
var instruction1 = ui.Label({
  value: '1.',
  style: {
    fontWeight: 'normal',
    fontSize: '15px',
    margin: '5px 0px 0px 10px',
    padding: '0'
    }
});
// adding instruction step 1 to the panel
instructions_panel.add(instruction1);


//button for drawing point
var button = ui.Button({
  label: 'Click here to enter polygon drawing mode',
  style: {
    margin: '-25px 0px 0px 25px'
  },

  
});
instructions_panel.add(button);


// second instruction
var instruction2 = ui.Label({
  value: '2. Draw a polygon area over your desired area in NJ.',
  style: {
    fontWeight: 'normal',
    fontSize: '15px',
    margin: '5px 0px 0px 10px',
    padding: '0'
    }
});

// adding instruction step 2 to the panel
instructions_panel.add(instruction2);

// Third instruction
var instruction3 = ui.Label({
  value: '3. Wait for time series chart to be rendered.',
  style: {
    fontWeight: 'normal',
    fontSize: '15px',
    margin: '5px 0px 0px 10px',
    padding: '0'
    }
});


// adding instruction step 3 to the panel
instructions_panel.add(instruction3);

// Foruth instruction
var instruction4 = ui.Label({
  value: '4. Repeat steps 1-3 for a new time series chart.',
  style: {
    fontWeight: 'normal',
    fontSize: '15px',
    margin: '4px 0px 0px 10px',
    padding: '0'
    }
});


// adding instruction step 4 to the panel
instructions_panel.add(instruction4);

var instruction5 = ui.Label({
  value: '5.',
  style: {
    fontWeight: 'normal',
    fontSize: '15px',
    margin: '4px 0px 0px 10px',
    padding: '0'
    }
});

instructions_panel.add(instruction5);


//button for removing chart from map
var button2 = ui.Button({
  label: 'Click here to remove the chart from the map',
  style: {
    margin: '-20px 0px 0px 26px'
  }

  
});

instructions_panel.add(button2);






//adds the instructions panel to the map
Map.add(instructions_panel);



// function that gets called when the button is clicked on
button.onClick(function(){
  Map.drawingTools().draw()   // goes into geomtry drawing mode
  Map.drawingTools().setDrawModes(['polygon']);   // sets the draw mode to polygon only
  // Set the geometry type to be polygon.
  Map.drawingTools().setShape('polygon');
  Map.drawingTools().addLayer([]);  // adds a new layer for the point to be saved in

    
});

// function that gets called when the button is clicked on (removes chart from map)
button2.onClick(function(){
  Map.remove(chartPanel); //removes the chart from map
  Map.layers().set(2, 0); // sets the layer to 0 so the point layer is overwritten and this hidden

    
});

// Puts chart on map instead of printing it (creates panel for chart)
// allows to set width and height of chart aswell as position on the map
var chartPanel = ui.Panel();
chartPanel.style().set({
  width: '800px',
  height: '220px',
  position: 'bottom-right'

  
});

// Don't make imports that correspond to the drawn points.
Map.drawingTools().setLinked(false);

// hide the drawing tools
Map.drawingTools().setShown(false);




// function to create time series chart
var create_chart = (function(coords) {
  
  Map.remove(chartPanel); // removes the previous chart from the map
  chartPanel.clear();     // Clears the chart panel for a new chart to be added
  var point = Map.drawingTools().layers().get(0).toGeometry(); // sets point by user clicking on map
  




     // Add a polygon on map for the polygon drawn by user.
  var polygon = ui.Map.Layer(point, {color: '000000'}, 'polygon drawn');
  // Add the polygon draw as the second layer
  Map.layers().set(2, polygon);
  


  


  // Creates the chart
var chart = ui.Chart.image.series({
  imageCollection: SMAP,
  region: point, // the region, point, area you want the chart to display data in
  reducer: ee.Reducer.mean(),


  
});

// Options for the style of chart: titles, font size, colors
var chartStyle = {
  title: 'Near-Real-Time Soil Moisture Data Inspection',
  hAxis: {
    title: 'Date',
    titleTextStyle: {italic: false, bold: true},
    gridlines: {color: 'white', count: 20},
    format: 'MM-YY',
    

    
  },
  vAxis: {
    title: 'Surface Soil Moisture (m^3/m^3)',
    titleTextStyle: {italic: false, bold: true},
    gridlines: {color: 'FFFFFF'},
    format: 'short',
    baselineColor: 'black',
    viewWindow: {min: 0.0, max: 0.4}
  },
  series: {
    0: {color: '0300ff', pointSize: 1.5}, // point size and color of the first band
  },
  chartArea: {backgroundColor: 'EBEBEB'},
  trendlines: {0:{color: 'red',labelInLegend: 'Trendline',visibleInLegend: true}}  // add trendline
  
};

//applies the charsStyle settings to our chart variable
chart.setOptions(chartStyle);

//sets chart to a scatter plot
chart.setChartType('ScatterChart');

// Adds the chart to the panel
chartPanel.add(chart);

// Adds the chartpanel to the map
Map.add(chartPanel);


// removes the drawn layer in order for a new layer to be added
Map.drawingTools().layers().reset();
});


// calls create_chart function when a point is drawn.
Map.drawingTools().onDraw(create_chart);


