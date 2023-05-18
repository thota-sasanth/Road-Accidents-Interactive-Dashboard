# Road-Accidents-Interactive-Dashboard
This is a **custom-designed interactive visual analytics dashboard** for analyzing and visualizing the key factors involved in road accidents across **3000** U.S. Counties. The dashboard is built from scratch using HTML, CSS, JavaScript, D3JS, ReactJS, Python, and Flask. 

## Problem Statement & Background

To create a dynamic dashboard that can help people understand the factors influencing road accidents <br>
<br>
According to a Forbes article, in 2020, a total of 35,766 fatal car accidents occurred on roadways
across the United States. Another 1,593,390 crashes resulted in injuries and 3,621,681 caused property damage. That means a total of **5.2M+** collisions happened over the course of a single year. These numbers highlight the significant impact of road accidents on public safety and the urgent need for effective measures to prevent and reduce their occurrence. Through this dashboard, we try to answer the following questions :

* Are road accidents influenced by temporal variables such as day and/or time?
* Do POI (points-of-interest) locations contribute to road accidents in any way?
* Do weather conditions or other weather-related factors influence road accidents?
* Do road accidents occur significantly more in locations with specific demographics such as particular employment, high population, etc?

## Dashboard in Action

You can find the demo of dashboard at this [YouTube Link](https://www.youtube.com/watch?v=ouDgxJT0jHE) <br>

<br>
<br>
<p align="center">
  <img src="https://github.com/thota-sasanth/Road-Accidents-Interactive-Dashboard/blob/main/dashboard.png" width="1000" height="500">
</p>
<br>
<br>


## Data Preparation / Processing
I used two datasets taken from Kaggle. 

* US Census Demographic Data
* US Accidents Data (2016 - 2021)

The US census demographic data is generated/downloaded from **American Community Survey**, a
demographics survey program conducted by the U.S. Census Bureau. 
This other dataset is a country wide accident dataset, which covers 49 states and 3000 counties of the USA. The
accident data are collected from February 2016 to Dec 2021, using multiple APIs that
provide streaming traffic incident (or event) data. 

The above data has **2.8M+** accidents records. I applied different data processing techniques such as - data reduction, filtering only specific year data, null rows imputation, duplicates handling, columns standardization/encoding, plots for outlier detection and removal, feature extraction, merging two datasets, clustering data using Kmeans algorithm, etc.



## Dashboard Implementation & Components
I implemented the dashboard as in a client-server architecture. The dashboard consist of advanced charts - 

* Zoomable Choropleth Map
* Accident Severity Slider
* Parallel Coordinates Plot
* TreeMap
* Stacked Bar Chart
* Time Series Area Chart
* Radial Bar Plot

Every chart is linked with every other chart with wide range of **interactions**, **overlays**, **pop-ups**, and **brushings**. This way the user cna easily get a deeper level of details and gain better insights.
<br>

## Findings
As the dataset taken is very large, there are a lot of insights that can be gathered after playing around with the dashboard. Some of the major findings I came across using the intearctions and dashboard are - population has a high impact on accident rate; weekdays have most number of accidents compared against weekends; 8AM and 5PM are the peak times for accidents within a day; Juntion, Traffic Signal, and Crossings are the top 3 accidents prone POI (point of interest areas); high humidity in the early mornings leads to more number of accidents; counties with most accidents have higher office job population compared to service job population.

You can gather a lot more insights leveraging this custom-designed visual analytics dashboard.
<br>
<br>
