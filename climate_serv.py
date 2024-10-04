import requests
import json
import pandas as pd

datatype = 0
begintime = "01/01/2020"
endtime = "01/02/2020"
intervaltype = 0
operationtype = 5

geometry = {
    "type": "Polygon",
    "coordinates": [
        [
            [-10.0, 10.0],
            [-10.0, -10.0],
            [10.0, -10.0],
            [10.0, 10.0],
            [-10.0, 10.0]
        ]
    ]
}

base_url = "https://climateserv.servirglobal.net/api/submitDataRequest/"
geometry_json = json.dumps(geometry)
params = {
    "datatype": datatype,
    "begintime": begintime,
    "endtime": endtime,
    "intervaltype": intervaltype,
    "operationtype": operationtype,
    "geometry": geometry_json,
    "isZip_CurrentDataType": "false"
}

response = requests.get(base_url, params=params)
if response.status_code == 200:
    job_id = response.json()[0]
    print(f"Data request submitted successfully. Job ID: {job_id}")
else:
    print(f"Error submitting data request: {response.status_code} - {response.text}")
    exit()

progress_url = "https://climateserv.servirglobal.net/api/getDataRequestProgress/"
progress = 0
while progress < 100:
    progress_response = requests.get(progress_url, params={"id": job_id})
    progress_data = progress_response.json()

    if isinstance(progress_data, list) and len(progress_data) > 0:
        progress = progress_data[0]
    elif isinstance(progress_data, (float, int)):
        progress = progress_data
    else:
        print("Unexpected response format.")
        break

    if progress == -1:
        print("Error in data processing.")
        break
    elif progress == 100:
        print("Data processing complete.")
        break
    else:
        print(f"Data request in progress: {progress}%")

data_url = "https://climateserv.servirglobal.net/api/getDataFromRequest/"
data_response = requests.get(data_url, params={"id": job_id})

if data_response.status_code == 200:
    data = data_response.json()["data"]
    print(f"First data granule: {data[0]}")

    data_list = []
    for granule in data:
        date = granule["date"]
        print(f"Granule keys: {granule['value'].keys()}")
        if 'max' in granule["value"]:
            value = granule["value"]["max"]
        elif 'avg' in granule["value"]:
            value = granule["value"]["avg"]
        else:
            value = None
        data_list.append({"Date": date, "Rainfall": value})
    df = pd.DataFrame(data_list)
    print(df)
    df.to_csv("chirps_rainfall_data.csv", index=False)
else:
    print(f"Error retrieving data: {data_response.status_code} - {data_response.text}")