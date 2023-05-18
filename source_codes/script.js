d3.select("#reset-button").on("click", resetAll);

    function resetAll() {
        // console.log("reset selected");
        location.reload();
    }

    var base_url = "http://127.0.0.1:5000"
    var dataexists = true;
    var severity = 0
    var selected_brushrange = NaN
    var mapcheckbox = document.getElementById('toggle-checkbox');
    var mapboxchecked = 0;

    
    temppcp_orderl = ["Weather_Condition","Visibility(mi)","Temperature(F)","Precipitation(in)",
        "Humidity(%)","Wind_Chill(F)","Pressure(in)","Wind_Speed(mph)","clusterid"]


    var maploadingOverlay = document.getElementById("loading-map-overlay");
    var spinnermap = document.querySelector(".spinnermap");
    var pcploadingOverlay = document.getElementById("loading-pcp-overlay");
    var spinnerpcp = document.querySelector(".spinnerpcp");
            
    var filterdatareqpayload = {
        "severity": severity,
        "countyidlist": [],
        "timedaylist": [
            // {"day": "monday", "time": "0-6"},
            // {"day": "saturday", "time": "0-23"}
        ],
        "poilist" : [],
        "pcpranges" : {},
        "hourlist": []
     }


    dataexistsfunc()

    function nodatafunc() {
        document.getElementById("nodatadivbox").style.display = "block";
        }
    
    function dataexistsfunc() {
        document.getElementById("nodatadivbox").style.display = "none";
        }
    
    
    function call_allfuncs(notcall_list) { 
        // console.log("call_all enetered")
        // console.log((filterdatareqpayload))

        
        d3.json(base_url+"/filterdata", {
            method: "POST",
            body: JSON.stringify(filterdatareqpayload),
            headers: {"Content-type": "application/json; charset=UTF-8"}}).then(function(data1) { 
            //     console.log("data filter completed")
            
            // console.log("data changed and filtered")
            if (data1["success"] === "1") { 
                dataexistsfunc()


        if ((!notcall_list.includes("poi")) && (filterdatareqpayload["poilist"].length === 0)) { // and  req[] = empty
            // console.log("poi entered")
            poiradialbarc() }
        

        if ((!notcall_list.includes("week")) && (filterdatareqpayload["timedaylist"].length === 0)) {
            // console.log("weekdaystackbar entered")
            weekdaystackbar() }

        if ((!notcall_list.includes("time")) && (filterdatareqpayload["hourlist"].length === 0)) {
            timeareachart() }

        if ((!notcall_list.includes("treemap"))) {
            treemapchart() }

        if ((!notcall_list.includes("choro")) && (filterdatareqpayload["countyidlist"].length === 0)) {
            drawchoromap(mapboxchecked) }

        if ((!notcall_list.includes("weather")) && (Object.keys(filterdatareqpayload["pcpranges"]).length === 0)) {
            weatherpcpplot() }
        
    } 
    else {
        nodatafunc() 
    }

});  

}

function backgroundsetup() {
                

    d3.select('body').style('background-color', '#CCE6FF');

    var svg = d3.select("#dashboard-header")
                .attr("width", "100%")
                .attr("height", "100%");
    var text = svg.append("text")
                .text("US Road Accidents Dashboard")
                .attr("x", "49.5%")
                .attr("y", 32)
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .attr("font-size", "30px")
                .attr("font-family", "sanserif",)
                .attr("font-weight", "bold");


}

backgroundsetup()

function severeslider() {

    var slidercont = d3.select("#mapslider");

    var slider = d3.sliderBottom()
                    .min(0)
                    .max(3)
                    .step(1)
                    .tickValues([0, 1, 2, 3])
                    .tickFormat(d => ["low", "medium", "high", "all"][d])
                    .width(400)
                    .default(3)
                    .fill("red")
                    .on("onchange", val => {
                        severity = (val+1) % 4
                        filterdatareqpayload['severity'] = severity
                        call_allfuncs([])
                    });

    var svg = slidercont
                .append("svg")
                .attr("viewBox", [-70, -10, 440, 60])
                .attr("width", 500)
                .attr("height", 55)
                .call(slider);

            }

// for poi side bar
var svg = d3.select("#poi_sidebar")
            .attr("width", 25)
            .attr("height", 200);
var blueb = svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 25)
            .attr("height", 100)
            .style("fill", "#428bca")
           
var redb = svg.append("rect") //nopoi bar
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 25)
            .attr("height",50)
            .style("fill", "red");

var poisidebartext = svg.append("text")
                        .attr("x", 13)
                        .attr("y", 11)
                        .style("fill", "white")
                        .style("text-anchor", "middle")
                        .text("No");

var poisidebartext1 = svg.append("text")
                        .attr("x", 13)
                        .attr("y",22)
                        .style("fill", "white")
                        .style("text-anchor", "middle")
                        .text( 50 + "%")
                        .style("font-size","8px");

var poisidebartext = svg.append("text")
                        .attr("x", 13)
                        .attr("y", 97)
                        .style("fill", "white")
                        .style("text-anchor", "middle")
                        .text("Yes");


function changeredb(h) {
    redb.transition()
        .duration(500)
        .attr("height", h);

    poisidebartext1
        .text(Math.ceil(h) + "%")
    }

severeslider()
call_allfuncs([])

function poiradialbarc() {
                
    d3.json(base_url+"/poi_data").then(function(data1) {

        if (data1["statuscode"] !== 1) {
            console.log("no data");
        }
    else {

        var data2 = data1["poi_data"] 
        var tot_acclen = data1["tot_accs"]
        var poi_acclen = data1["poi_accs"]
        var nopoipercent = 100 - ((poi_acclen / tot_acclen) * 100)
        
        d3.select("#radialbarchart").selectAll("*").remove(); 
    
        var margin = {top: 80, right: 0, bottom: 0, left: 0},
        width = 360 - margin.left - margin.right,
        height = 265 - margin.top - margin.bottom,
        innerRadius = 35,
        outerRadius = Math.min(width, height) / 2;   

        changeredb(nopoipercent)

        var svg = d3.select("#radialbarchart")
                    .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                        .attr("transform", `translate(${width/2+margin.left}, ${height/2+margin.top})`);


        var maxCount = d3.max(data2, function(d) { return d.count; });
        var x = d3.scaleBand()
                    .range([0, 2 * Math.PI])   
                    .align(0)                 
                    .domain(data2.map(d => d.poi)); 
        var y = d3.scaleRadial()
                    .range([innerRadius, outerRadius])   
                    .domain([0, maxCount]); 
        
        var poitooltip = d3.select("#poitooltipdiv")
                    // .append("div")
                    .style("opacity", 0)
                    // .attr("class", "stackbartooltip")
                    .style("background-color", "#74BAEE")
                    // .style("border", "solid")
                    // .style("border-width", "1px")
                    .style("border-radius", "5px")
                    .style("padding", "1px")
                    .style("width", "90.5px")
                    .style("height", "20px")

        
        svg.append("g")
            .selectAll("path")
            .data(data2)
            .join("path")
            .attr("fill", "#428bca")
            .attr("d", d3.arc()    
                .innerRadius(innerRadius)
                .outerRadius(d => y(d['count']))
                .startAngle(d => x(d.poi))
                .endAngle(d => x(d.poi) + x.bandwidth())
                .padAngle(0.01)
                .padRadius(innerRadius))
            .on("mousemove", function(event, d) {


        poitooltip.html(d.count + " accidents")
                    .style("opacity", 1)
                    .style("font-size", "12px")
                    .style("left", (event.pageX + 20) + "px")
                    .style("top", (event.pageY - 20) + "px") 

        poitooltip.style("left", (event.pageX + 20) + "px")
                .style("top", (event.pageY - 20) + "px")

        svg.selectAll("path")
                .attr("fill-opacity", 0.5);


        d3.select(this).classed("hover", true); 
        var curradbar= d3.select(this);
        svg.selectAll(".hover")
            .attr('fill-opacity',1)
            .attr("stroke", "#333")
            .attr("stroke-width", "3px")
        svg.selectAll(".click")
            .attr('fill-opacity',1)
            .attr("stroke", "#333")
            .attr("stroke-width", "3px")

        curradbar.on("click", function(event, d) {

            var isClicked = curradbar.classed("click");

            if (!isClicked) {
                curradbar.classed("click", true);
                // console.log("added rad bar to clicked")
                // console.log(d)
                filterdatareqpayload['poilist'].push(d.poi)

            } else {
                curradbar.classed("click", false);
                // console.log("added rad bar to unclicked")
                let indexToRemove = filterdatareqpayload['poilist'].indexOf(d.poi);
            if (indexToRemove !== -1) {
                filterdatareqpayload['poilist'].splice(indexToRemove, 1);
            }
            
            }

            call_allfuncs(['poi'])
        })

    })
    .on("mouseleave", function(d) {

        poitooltip.style("opacity", 0)
                svg.selectAll("path").classed("hover", false);
                svg.selectAll("path").attr("fill-opacity", 0.5)
                .attr("stroke", "none") 

                svg.selectAll(".click").attr("fill-opacity", 1);


                if (svg.selectAll(".click").empty()) {
            svg.selectAll("path")
                .attr('fill-opacity',1);
        } else {
            svg.selectAll("path")
                .attr('fill-opacity',0.5);
            svg.selectAll(".click")
                .attr("fill-opacity", 1)
                .attr("stroke", "#333")
                .attr("stroke-width", "3px");
        }
    });

        svg.append("g")
            .selectAll("g")
            .data(data2)
            .join("g")
                .attr("text-anchor", function(d) { return (x(d.poi) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
                .attr("transform", function(d) { return "rotate(" + ((x(d.poi) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" + (y(d['count'])+10) + ",0)"; })
            .append("text")
                .text(function(d){return(d.poi)})
                .attr("transform", function(d) { return (x(d.poi) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
                .style("font-size", "11px")
                .attr("alignment-baseline", "middle")
        
        svg.append("text")
                .text(poi_acclen) 
                .style("font-size", "14px")
                .style("font-weight", "bold")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(0,5)"); 

        svg.append("text")

}                 
    });

}


function timeareachart() {
    // console.log("enetred timearea")

   
    var margin = {top: 15, right: 30, bottom: 30, left: 60},
        width = 860 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;


    d3.json(base_url+"/timeareachartdata").then(function(data1) { 

        if (data1["statuscode"] !== 1) {
            console.log("no data");
        }
    else {

            // console.log(data1)
            data2 = data1["timearea_data"]

    var timeareatickFormat = function(d) {
            if (d === 0) return "12am";
            else if (d < 12) return d + "am";
            else if (d === 12) return "12pm";
            else return (d - 12) + "pm";
        };

    var x = d3.scaleBand()
        .domain(data2.map(function(d) { return d.Hour; }))
        .range([ 0, width ]);


    var max = d3.max(data2, function(d) { return +d.value; })

    var y = d3.scaleLinear()
            .domain([0, max+10])
            .range([ height, 0 ]);

    var timeareatooltipdiv = d3.select("#timeareatooltipdiv")
                                // .append("div")
                                .style("opacity", 0)
                                // .attr("class", "stackbartooltip")
                                .style("background-color", "#FFC0CB")
                                // .style("border", "solid")
                                // .style("border-width", "1px")
                                .style("border-radius", "3px")
                                .style("padding", "1px")
                                .style("width", "125px")
                                .style("height", "20px")

    var timeareamouseover = function(event, d) {
            d3.select(this)
                .attr("r", 7) 
            timeareatooltipdiv.html(d.value+" accidents" + " (" +timeareatickFormat(d.Hour)+")" )
                    .style("opacity", 1)
                    .style("font-size", "11px")
                    .style("left", (event.pageX +10 ) + "px")
                    .style("top", (event.pageY + 10) + "px")     

            if (event.pageX + timeareatooltipdiv.node().getBoundingClientRect().width > window.innerWidth) {
                timeareatooltipdiv.style("left", (event.pageX - timeareatooltipdiv.node().getBoundingClientRect().width - 10) + "px");
            } else {
                timeareatooltipdiv.style("left", (event.pageX + 10) + "px");
            }
        }

    var timeareamousemove = function(event, d) {
        d3.select(this)
            .attr("r", 7)
        timeareatooltipdiv.style("left", (event.pageX +10 ) + "px")
            .style("top", (event.pageY + 10) + "px")  
            if (event.pageX + timeareatooltipdiv.node().getBoundingClientRect().width > window.innerWidth) {
                timeareatooltipdiv.style("left", (event.pageX - timeareatooltipdiv.node().getBoundingClientRect().width - 10) + "px");
            } else {
                timeareatooltipdiv.style("left", (event.pageX + 10) + "px");
            }
        }

    var timeareamouseleave = function(event, d) {
        var r = d3.select(this).classed("clicked") ? 7 : 3.5;
        d3.select(this)
            .attr("r", r);
        timeareatooltipdiv.style("opacity", 0)
        if (event.pageX + timeareatooltipdiv.node().getBoundingClientRect().width > window.innerWidth) {
            timeareatooltipdiv.style("left", (event.pageX - timeareatooltipdiv.node().getBoundingClientRect().width - 10) + "px");
        } else {
            timeareatooltipdiv.style("left", (event.pageX + 10) + "px");
        }
        }


    d3.select("#timeareachart").selectAll("*").remove(); 

    var svg = d3.select("#timeareachart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(timeareatickFormat))
        .selectAll("text")
        .attr("transform", "rotate(20)")
        .style("text-anchor", "start");
    
    svg.append("g")
        .call(d3.axisLeft(y))
        .enter().append("stop")
            .attr("offset", function(d) { return d.offset; })
            .attr("stop-color", function(d) { return d.color; });

        
    svg.append("path")
        .datum(data2)
        .attr("fill", "url(#line-gradient)")
        .attr("fill-opacity", .3)
        .attr("stroke", "none")
        .attr("d", d3.area()
        .x(function(d) { return x(d.Hour) + + x.bandwidth()/2 })
        .y0( height )
        .y1(function(d) { return y(+d.value) })
        )


    svg.append("path")
    .datum(data2)
    .attr("fill", "none")
    .attr("stroke", "url(#line-gradient)" )
    .attr("stroke-width", 2)
    .attr("d", d3.line()
        .x(function(d) { return x(d.Hour) + x.bandwidth()/2})
        .y(function(d) { return y(+d.value) })
        )
    
  
    svg.selectAll("myCircles")
    .data(data2)
    .enter()
    .append("circle")
        .attr("fill", "url(#line-gradient)")
        .attr("stroke", "none")
        .attr("cx", function(d) { return x(d.Hour) + x.bandwidth()/2 })
        .attr("cy", function(d) { return y(+d.value) })
        .attr("r", 3.5)
    .on("mouseover", timeareamouseover)
    .on("mousemove", timeareamousemove)
    .on("mouseleave", timeareamouseleave)
    .on("click", function(event, d) {
        var currcircle  = d3.select(this)

        var isClicked = currcircle.classed("clicked");
        

            if (!isClicked) {
                currcircle.classed("clicked", true);
                filterdatareqpayload['hourlist'].push(d.Hour)
            } else {
                currcircle.classed("clicked", false);
                let indexToRemove = filterdatareqpayload['hourlist'].indexOf(d.Hour);
            if (indexToRemove !== -1) {
                filterdatareqpayload['hourlist'].splice(indexToRemove, 1);
            }
            }
            call_allfuncs(['time'])

})

}

    }); 

    
}
