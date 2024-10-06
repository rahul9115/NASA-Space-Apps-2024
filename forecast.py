import pandas as pd
import os
import numpy as np
from darts import TimeSeries, concatenate
from darts.dataprocessing.transformers import Scaler
from darts.models import NBEATSModel
from darts.metrics import mape, rmse 
from darts.utils.timeseries_generation import datetime_attribute_timeseries
from darts.utils.likelihood_models import QuantileRegression
from tspiral.forecasting import ForecastingCascade
from tspiral.model_selection import TemporalSplit
import matplotlib.pyplot  as plt
import pandas as pd
import matplotlib.dates as mdates
from matplotlib.ticker import MaxNLocator
from sklearn.preprocessing import MinMaxScaler
from nixtla import NixtlaClient
from dotenv import load_dotenv
load_dotenv()
datatypes = {
    0: "UCSB CHIRPS Rainfall",
    37: "Soil moisture profile - USDA SMAP",
    38: "Surface soil moisture - USDA SMAP",
    39: "Surface soil moisture anomaly - USDA SMAP",
    40: "Sub surface soil moisture - USDA SMAP",
    41: "Sub surface soil moisture anomaly - USDA SMAP",
    90: "UCSB CHIRP Rainfall",
    664: "LIS-Modeled Soil Moisture 0-10cm",
    665: "LIS-Modeled Soil Moisture 10-40cm",
    666: "LIS-Modeled Soil Moisture 40-100cm",
    667: "LIS-Modeled Soil Moisture 100-200cm"
}
def time_gpt_model(data):
    nixtla_client=NixtlaClient(api_key=os.environ.get("NIXTLA_API_KEY"))
    input_data=data.rename(columns={"Date":'ds',"Value":"y"})
    input_data = input_data.resample('MS', on='ds').mean()
    input_data.reset_index(inplace=True)
    forecast_data = nixtla_client.forecast(input_data, h=100, level=[80, 90])
    return forecast_data

def forecasts():
    df=pd.read_csv("final_merged.csv")
    df["Date"]=pd.to_datetime(df['Date'])
    for type in df["Name"].values:
        type_df=df[df["Name"]==type]
        for country in df["Country"].values:
            data=type_df[type_df["Country"]==country]
            data.drop(["Name","Country"],axis=1,inplace=True)
            input_data=data[data["Date"]<pd.to_datetime("2024-01-01")]
            forecast_data=time_gpt_model(input_data)
            input_data["TimeGPT"]=[None for _ in range(len(input_data))]
            input_data["TimeGPT-hi-80"]=[None for _ in range(len(input_data))]
            input_data["TimeGPT-hi-90"]=[None for _ in range(len(input_data))]
            input_data["TimeGPT-lo-80"]=[None for _ in range(len(input_data))]
            input_data["TimeGPT-lo-90"]=[None for _ in range(len(input_data))]
            forecast_data["Value"]=[None for _ in range(len(forecast_data))]
            forecast_data.rename(columns={"ds":"Date"})
            output_data=pd.concat([input_data,forecast_data])
            output_data["Name"]=[type for _ in range(len(output_data))]
            output_data["Name"]=[country for _ in range(len(output_data))]
            output_data.to_csv("output.csv")
            break
        break
            
   
forecasts()