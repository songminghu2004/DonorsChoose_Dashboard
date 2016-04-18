
queue()
    .defer(d3.json, "/api/data")
	.defer(d3.json, "../us-states.json")
    .await(makeGraphs);


	var theMap=L.map('mymap').setView([37.8, -96], 4);
	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
	attribution: 'Map data &copy <a href="http://openstreetmap.org>OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">, Imagery <a href="http://mapbox.com">Mapbox</a>',
	id: 'mapbox.light',
	maxZoom: 18,
	accessToken: 'pk.eyJ1IjoibW5ldWhhcmQiLCJhIjoiY2ltczBpNGlyMDFkZHdrbHVlOWtoMXduNiJ9.rWeQjjn_Fbq4K3tSYF7fvA',
	
	}).addTo(theMap);		
	
function makeGraphs(error, apiData, statesJson) {
	
//Start Transformations
	var dataSet = apiData;
	var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
	dataSet.forEach(function(d) {
		d.date_posted = dateFormat.parse(d.date_posted);
				d.date_posted.setDate(1);
		d.total_donations = +d.total_donations;
	});
	console.log(dataSet);

	//Create a Crossfilter instance
	var ndx = crossfilter(dataSet);
	//Define Dimensions
	var datePosted = ndx.dimension(function(d) { return d.date_posted; });
	var gradeLevel = ndx.dimension(function(d) { return d.grade_level; });
	var resourceType = ndx.dimension(function(d) { return d.resource_type; });
	var fundingStatus = ndx.dimension(function(d) { return d.funding_status; });
	var povertyLevel = ndx.dimension(function(d) { return d.poverty_level; });
	var state = ndx.dimension(function(d) { return d.school_state; });
	var totalDonations  = ndx.dimension(function(d) { return d.total_donations; });
	var schoolLatitude = ndx.dimension(function(d) { return d.school_latitude; });
	var schoolLongitude = ndx.dimension(function(d) { return d.school_longitude; });
	var ruralUrban = ndx.dimension(function(d) { return d.school_metro; });
	
	//Calculate metrics
	var projectsByDate = datePosted.group(); 
	var projectsByGrade = gradeLevel.group(); 
	var projectsByResourceType = resourceType.group();
	var projectsByFundingStatus = fundingStatus.group();
	var projectsByPovertyLevel = povertyLevel.group();
	var stateGroup = state.group();
	var ruralUrbanGroup = ruralUrban.group();
	
	//var schoolLatGroup = schoolLatitude.group();
	//var schoolLongGroup = schoolLongitude.group();

	var all = ndx.groupAll();

	
	//Calculate Groups
	var totalDonationsState = state.group().reduceSum(function(d) {
		return d.total_donations;
	});
	/*
	var totalDonationsGrade = gradeLevel.group().reduceSum(function(d) {
		return d.grade_level;
	});
	*/
	var totalDonationsGrade = gradeLevel.group().reduceSum(function(d) {
		return d.total_donations;
	});

	var totalDonationsResource = resourceType.group().reduceSum(function(d) {
		return d.total_donations;
	});
	
	var totalDonationsFundingStatus = fundingStatus.group().reduceSum(function(d) {
		return d.funding_status;
	});

	var ruralUrbanStatus = fundingStatus.group().reduceSum(function(d) {
		return d.school_metro;
	});	
	
	var netTotalDonations = ndx.groupAll().reduceSum(function(d) {return d.total_donations;});
	var netTotVal = netTotalDonations.value();
	//alert(netTotVal);
	//var latitude = schoolLatitude.top(Infinity);
	
	/*
	for(var i in schoolLatitudeGroup.top(Infinity)){
		alert(i); // alerts key
		alert(schoolLatitudeGroup[i]); //alerts key's value
	}
	*/
	
	//var latitude = schoolLatitude.dimension(function(d) { return d.school_latitidue; });
	//alert(latitude)
	dataSet.forEach(function(d) {
		circle = L.circle([d.school_latitude, d.school_longitude], 30, {
		color: '#fecc5c',
		fillColor: '#fecc5c',
		fillOpacity: 0.5
	}).addTo(theMap);	
	circle.bindPopup("School City: " + d.school_city + "<br>Resource Type: " + d.resource_type + "<br>Funding Status: " + d.funding_status);
	});
	
	
	//Define threshold values for data
	var minDate = datePosted.bottom(1)[0].date_posted;
	var maxDate = datePosted.top(1)[0].date_posted;

console.log(minDate);
console.log(maxDate);


    //Charts
//	var dateChart = dc.lineChart("#date-chart");
	var gradeLevelChart = dc.rowChart("#grade-chart");
	var resourceTypeChart = dc.rowChart("#resource-chart");
	var fundingStatusChart = dc.pieChart("#funding-chart");
	var ruralUrbanChart = dc.barChart("#rurUrb-chart");
	var povertyLevelChart = dc.rowChart("#poverty-chart");
	var totalProjects = dc.numberDisplay("#total-projects");
	var netDonations = dc.numberDisplay("#net-donations");
	var stateDonations = dc.barChart("#state-donations");
//	var percentNetDonations = dc.numberDisplay("#percent-net-donations");
//	var usChart = dc.geoChoroplethChart("#us-chart");

	var max_state = totalDonationsState.top(1)[0].value;
	
  selectField = dc.selectMenu('#menuselect')
        .dimension(gradeLevel)
        .group(projectsByGrade); 

       dc.dataCount("#row-selection")
        .dimension(ndx)
        .group(all);

  selectField = dc.selectMenu('#menuselect-state')
        .dimension(state)
        .group(stateGroup); 

  selectFieldResource = dc.selectMenu('#menuselect_poverty')
        .dimension(povertyLevel)
        .group(projectsByPovertyLevel); 

       dc.dataCount("#row-selection")
        .dimension(ndx)
        .group(all);
		
	totalProjects
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);

	netDonations
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(netTotalDonations)
		.formatNumber(d3.format(".3s"));
	
	dc.numberDisplay("#percent-net-donations")
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d/netTotVal; })
		.group(netTotalDonations)
		.formatNumber(d3.format(".0%"));
	
	/*	
	dateChart
		//.width(600)
		.height(220)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(datePosted)
		.group(projectsByDate)
		.renderArea(true)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.renderHorizontalGridLines(true)
    	.renderVerticalGridLines(true)
		.xAxisLabel("Year")
		.yAxis().ticks(6);
	*/
	resourceTypeChart
        //.width(300)
        .height(225)
        .dimension(resourceType)
        .group(totalDonationsResource)
        .elasticX(true)
        .xAxis().ticks(5);

	povertyLevelChart
		//.width(300)
		.height(220)
        .dimension(povertyLevel)
        .group(projectsByPovertyLevel)
        .xAxis().ticks(4);

	gradeLevelChart
		//.width(300)
		.height(220)
        .dimension(gradeLevel)
        .group(projectsByGrade)
        .xAxis().ticks(4);

  
	fundingStatusChart
		.height(220)
		//.width(350)
		.radius(90)
		.innerRadius(40)
		.transitionDuration(1000)
		.dimension(fundingStatus)
		.group(projectsByFundingStatus);

/*
	ruralUrbanChart
		.height(220)
		//.width(350)
		.radius(90)
		.innerRadius(40)
		.transitionDuration(1000)
		.dimension(ruralUrban)
		.group(ruralUrbanGroup);
	*/

    ruralUrbanChart
    	//.width(800)
        .height(220)
        .transitionDuration(1000)
        .dimension(ruralUrban)
        .group(ruralUrbanGroup)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .centerBar(false)
        .gap(5)
        .elasticY(true)
        .x(d3.scale.ordinal().domain(state))
        .xUnits(dc.units.ordinal)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .ordering(function(d){return d.value;})
        .yAxis().tickFormat(d3.format("s"));
	
		
    stateDonations
    	//.width(800)
        .height(220)
        .transitionDuration(1000)
        .dimension(state)
        .group(totalDonationsState)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .centerBar(false)
        .gap(5)
        .elasticY(true)
        .x(d3.scale.ordinal().domain(state))
        .xUnits(dc.units.ordinal)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .ordering(function(d){return d.value;})
        .yAxis().tickFormat(d3.format("s"));

/*
	usChart.width(700)
		.height(330)
		.dimension(state)
		.group(totalDonationsState)
		.colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
		.colorDomain([0, max_state])
		.overlayGeoJson(statesJson["features"], "state", function (d) {
			return d.properties.name;
		})
		.projection(d3.geo.albersUsa()
    				.scale(600)
    				.translate([340, 150]))
		.title(function (p) {
			var CheckVal = 'undefined';
			checkVal = p["value"];
			if (checkVal != 'undefined')
			return "State: " + p["key"]
					+ "\n"
					+ "Total Donations: " + p["value"] + " $";
		})
*/


    dc.renderAll();

};
