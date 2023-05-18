from flask import Flask,request
import requests
import pandas as pd
import io
import numpy as np
from flask_cors import CORS
from werkzeug.routing import BaseConverter


app = Flask(__name__)
CORS(app)



def load_main_data():
    acc_resp = requests.get(acc_dataurl)
    acc_color_resp = requests.get(acc_color_dataurl)
    demo_resp = requests.get(demo_dataurl)
    df_acc = pd.read_csv(io.BytesIO(acc_resp.content))
    df_acc_colors = pd.read_csv(io.BytesIO(acc_color_resp.content))
    df_demo = pd.read_csv(io.BytesIO(demo_resp.content))
    return df_acc,df_acc_colors,df_demo


df_acc,df_acc_colors,df_demo = load_main_data()
df_filtered = df_acc.copy(deep=True) 
df_filtered_colors = df_acc_colors.copy(deep=True)
severity = 0
countyidlist = []
timedaylist = []
poilist = []
pcpranges = {}
hourlist = []

# print(df_filtered)
# print(len(df_acc))

@app.route('/')
def home():
    return 'App working!'

@app.route('/filterdata', methods=['GET', 'POST'])
def filter_data():
    filterdatapayload = request.get_json()
    # print("entered filterdata")
    # print(filterdatapayload)


    if len(poilist) !=0:
        cond = None
        for poi in poilist:
            poicond = (df1[poi] == True)
            if cond is None:
                cond = poicond
            else:
                cond = cond | poicond
        df1 = df1[cond]



    if len(hourlist) !=0:
        df1 = df1[df1["Hour"].isin(hourlist)]
    
    if severity !=0:
        df1_colors = df1_colors[df1_colors["Severity"] == severity]

    if len(countyidlist) !=0 :
        df1_colors = df1_colors[df1_colors["CountyId"].isin(countyidlist)]

    if len(timedaylist) !=0 :
        cond = None
        for timeele in timedaylist:
            time_cond = (df1_colors['Weekday'] == timeele["day"]) & (df1_colors['Hour_range'] == timeele["time"])
            if cond is None:
                cond = time_cond
            else:
                cond = cond | time_cond
        df1_colors = df1_colors[cond]

    if len(poilist) !=0:
        cond = None
        for poi in poilist:
            poicond = (df1_colors[poi] == True)
            if cond is None:
                cond = poicond
            else:
                cond = cond | poicond
        df1_colors = df1_colors[cond]


    
    global df_filtered 
    df_filtered= df1
    global df_filtered_colors
    df_filtered_colors= df1_colors
    # print(df_filtered)
    if df_filtered.empty:
        return {"success": "0"}
    # print("filter sucess")
    return {"success": "1"}

    

@app.route('/map/<int:checked>')
def map_data(checked):
    # print("enetred map api")
    grouped = df_filtered.groupby(['CountyId']).size().reset_index(name='tot_sever_accs')
    
    
    merged = pd.merge(grouped, df_demo[["CountyId","TotalPop"]], on=["CountyId"])
    
    
    if checked == 0:
        merged['accident_rate'] = merged['tot_sever_accs'] 
    else:
        merged['accident_rate'] = (merged['tot_sever_accs'] / merged['TotalPop'] ) *100000
    
    
    p25val = merged['accident_rate'].quantile(0.25)
    p50val = merged['accident_rate'].quantile(0.50)
    p75val = merged['accident_rate'].quantile(0.75)
    p90val = merged['accident_rate'].quantile(0.90)
    response = {"statuscode":1,"accident_rate_data" : merged.to_dict(orient='records'), "pvals": [p25val,p50val,p75val,p90val]}
    return response

@app.route('/poi_data',methods=['GET', 'POST'])
def poi_radialbar():
    # print("enetred poi")
    poicols = ["Amenity","Bump","Crossing","Give_Way","Junction","No_Exit","Railway","Roundabout","Station","Stop","Traffic_Calming","Traffic_Signal","Turning_Loop"]
    df_filtered1 = df_filtered

    # print(df_filtered1)

    if df_filtered1.empty:
        return {"statuscode": 0}
    
    
    tot_accs = int(len(df_filtered1))
    counts = df_filtered1[poicols].sum()
    df_filtered1 = pd.DataFrame({'poi': counts.index, 'count': counts.values})
    poi_accs = int(df_filtered1["count"].sum())
    df_filtered1 = df_filtered1.sort_values(by='count', ascending=False)
    
    response = {"statuscode": 1, "poi_data" : df_filtered1.to_dict(orient='records'), "tot_accs": tot_accs, "poi_accs": poi_accs}
    return response

@app.route('/weekdaystbardata',methods=['GET', 'POST'])
def weekdaystbar_data():
    # print("entered weekdaydata")
   
    df_filtered1 = df_filtered
    if df_filtered1.empty:
        return {"statuscode": 0}

    grouped_df = pd.pivot_table(df_filtered1, index=['Weekday'], columns=['Hour_range'], aggfunc='size', fill_value=0)
    grouped_df = grouped_df.reset_index().rename_axis(None, axis=1)
    
    weekdays = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
    time_columns = ['6am - 10am', '11am - 3pm', '4pm - 7pm', '8pm - 10pm', '11pm - 5am']

    grouped_df = grouped_df.set_index('Weekday')
    grouped_df = grouped_df.reindex(index=weekdays, columns=time_columns, fill_value=0)

    grouped_df = grouped_df.reset_index()
    
    grouped_df.columns = ['group', '6am - 10am', '11am - 3pm', '4pm - 7pm', '8pm - 10pm', '11pm - 5am']
    max_acc_val = grouped_df.sum(axis=1).max()
    response = {"statuscode": 1, "weekday_data" : grouped_df.to_dict(orient='records'), "max_acc_val": str(max_acc_val)}
    return response



@app.route('/timeareachartdata',methods=['GET', 'POST'])
def timeareachart_data():
    # print("entered timearea")
   
    df_filtered1 = df_filtered
    if df_filtered1.empty:
        return {"statuscode": 0}
    hour_counts = df_filtered1.groupby('Hour').size().reset_index(name='value')

    response = {"statuscode": 1,"timearea_data" : hour_counts.to_dict(orient='records')}
    return response


@app.route('/treemapchartdata',methods=['GET', 'POST'])
def treemapchart_data():
   
    # print("entered treemap")
   
    df1 = df_filtered
    if df1.empty:
        return {"statuscode": 0}
    df2 = df_demo.copy(deep=True)
    
    countyidtemp = list(df1["CountyId"].unique())
    countyidfinal = list(set(countyidlist + countyidtemp))
    filtered_df2 = df2[df2['CountyId'].isin(countyidfinal)]

    total_professional = filtered_df2['Professional'].sum()
    total_service = filtered_df2['Service'].sum()
    total_office = filtered_df2['Office'].sum()
    total_construction = filtered_df2['Construction'].sum()
    total_production = filtered_df2['Production'].sum()
    total_unemployment= filtered_df2['Unemployment'].sum()

    treedf = pd.DataFrame.from_dict({
        "name": ["TotalPop","TotalPop.Employed","TotalPop.Employed.Professional","TotalPop.Employed.Service","TotalPop.Employed.Office",
                "TotalPop.Employed.Construction","TotalPop.Employed.Production","TotalPop.Unemployed"],
        "size": [0,0,total_professional,total_service,total_office,total_construction,total_production,total_unemployment]})

    response = {"statuscode": 1,"treemap_data" : treedf.to_dict(orient='records')}
    return response


@app.route('/weatherpcpdata',methods=['GET', 'POST'])
def weather_pcp_data():
   
    # print("entered weatherdata")
    
    weathercols = ["Weather_Condition","Visibility(mi)","Temperature(F)","Precipitation(in)","Humidity(%)","Wind_Chill(F)","Pressure(in)","Wind_Speed(mph)","clusterid"]
   
    df1 = df_filtered_colors
    if df1.empty:
        return {"statuscode": 0}
    
    df1 = df1[weathercols]
    response = {"statuscode":1,"weather_data" : df1.to_dict(orient='records')}
    return response


@app.route('/full_data')
def full_data():
    response = requests.get(url)
    df = pd.read_csv(io.BytesIO(response.content))
    df_formds = df
    defpcp_orderl = ['State', 'County','Mode_Weather_Condition','Mode_Severity',"TotalPop","Men","Women","VotingAgeCitizen",
    "Office_Jobs","WorkAtHome","Prv_Transp","NonOffice_Jobs","Unemployment","Poverty","Total_Acc","Day_Accidents","Income","MeanCommute","Pub_Transp"]
    df_formds = df_formds.loc[:, defpcp_orderl]
    response = {"full_data" : df_formds.reset_index(drop=True).to_dict(orient='records')}
    return response


if __name__ == '__main__':
    app.run()


