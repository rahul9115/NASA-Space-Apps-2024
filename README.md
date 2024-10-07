# AI-Powered Multilingual Chatbot with Speech-to-Text and Climate Forecasting

## Overview

This project is an AI-powered chatbot system designed to provide multilingual responses and agricultural forecasting insights. It integrates speech-to-text conversion, natural language processing, and climate forecasting capabilities using a combination of OpenAI's Whisper AI, Google Translator, NASA's API, and custom forecasting models.

### Key Components:

1. **Speech-to-Text (OpenAI Whisper AI)**: 
   - Converts audio files (.wav format) in any language to text.
   - The converted text is then translated into English using Google Translator.
   - Script: `Speech_to_text.py`.

2. **Information Retrieval (OpenAI Agent)**:
   - Uses OpenAI's AI agent to retrieve information based on user queries.
   - If the input is a text question, OpenAI Agent retrieves relevant responses.
   - Script: `AI_agent.py`.

3. **Backend Framework (Flask)**:
   - The chatbot is powered by a Flask backend, handling requests and responses.
   - For text queries, the OpenAI Agent provides the response.
   - For audio queries, Whisper AI processes the audio file first, then the OpenAI Agent retrieves the necessary information.
   - Script: `app.py`.

4. **Frontend (React App)**:
   - The front-end of the chatbot is built using React to provide a user-friendly interface where farmers can ask questions or submit audio files.

5. **Climate Data API (NASA)**:
   - Collects climate data (rainfall, soil moisture) using NASA's API for agricultural forecasting.
   - Script: `climate_serv.py` for API calls to NASA data.

6. **Climate Forecasting**:
   - Processes the collected climate data (rainfall and soil) and forecasts future trends for different regions.
   - Script: `forecast.py` for running forecasts on the data.
   - Visualization: `Forecast_Agriculture.pbix` (Power BI dashboard for visualization of agricultural forecasts across countries like Africa, India, and the USA).

7. **Future Work (Retrieval-Augmented Generation)**:
   - Future improvements will incorporate Retrieval-Augmented Generation (RAG) to enhance the chatbot’s information retrieval capabilities.
   - Script: `RAG.py`.

## How to Run the Project

### 1. Install the required libraries:
   Install all the necessary dependencies listed in the `requirements.txt` file:

   ```bash
   pip install -r requirements.txt
   ```

### 2. Run the Flask Backend:
   Start the Flask server, which will handle the chatbot's requests and responses.

   ```bash
   python app.py
   ```

### 3. Run the Speech-to-Text Script:
   For processing audio input files, run the following command:

   ```bash
   python Speech_to_text.py
   ```

   This script converts any `.wav` file into text and passes it to the AI agent for further processing.

### 4. Run the AI Agent:
   For retrieving information from the OpenAI agent:

   ```bash
   python AI_agent.py
   ```

### 5. Climate Data Collection:
   Use `climate_serv.py` to collect rainfall and soil moisture data from NASA's API:

   ```bash
   python climate_serv.py
   ```

### 6. Forecast Climate Data:
   Once the climate data is collected, use `forecast.py` to run forecasts on the data:

   ```bash
   python forecast.py
   ```

### 7. View Agricultural Forecasts:
   You can visualize the forecasts by opening the Power BI file `Forecast_Agriculture.pbix`, which contains agricultural forecast data for regions like Africa, India, and the USA.

## Conclusion

This system provides a robust platform for farmers to ask questions or submit audio queries in their native language and receive localized, AI-driven responses. Additionally, the integration of NASA’s climate data allows for accurate forecasting to assist in agricultural planning and sustainability efforts. Future development will include incorporating Retrieval-Augmented Generation (RAG) to further enhance information retrieval and overall system capabilities.
