from flask import Flask, Response, jsonify, redirect, url_for, request
from flask_cors import CORS
from Speech_to_text import *
import pandas as pd
import time as time_new
import json
import random

app = Flask(__name__)
CORS(app)
from AI_agent import *
from deep_translator import GoogleTranslator
import torch
import sounddevice as sd
import numpy as np
from transformers import WhisperProcessor, WhisperForConditionalGeneration
import pyttsx3
from gtts import gTTS
from playsound import playsound
from langdetect import detect, detect_langs
from pydub import AudioSegment
import os
import pygame


@app.route("/ai_agent", methods=["GET", "POST"])
def ai_agent_call():
    if request.method == "POST":
        data = request.json
        question = data["question"]
        print("The question", question)
        answer = ai_agent(question)
        print(answer)
        return jsonify({"answer": answer})
    else:
        return "Completed"


@app.route("/audio_call", methods=["GET", "POST"])
def audio_call():
    if request.method == "POST":
        print("I am here")
        file = request.files["file"]
        print(file)
        print(request.files)
        file.save("output.webm")
        print(f"File saved at {'output.webm'}")

        # Convert webm to wav using pydub
        wav_path = "output.webm".replace(".webm", ".wav")
        audio = AudioSegment.from_file("output.webm", format="webm")
        audio.export(wav_path, format="wav")
        print(f"File converted to wav: {wav_path}")
        audio_data, sample_rate = read_and_resample_audio(wav_path)
        transcription, detected_lang = transcribe_audio(audio_data, sample_rate)
        print(transcription)
        print(detected_lang)
        # text_to_speech(transcription, detected_lang)
        # translated_text = translate_text_deep(transcription, target_lang="en")
        # print(translated_text)
    else:
        return "Completed"


# @app.route("/audio_call", methods=["GET", "POST"])
# def audio_call():
#     if request.method == "POST":
#         print("I am here")
#         audio_data, sample_rate = record_audio(duration=10, sample_rate=16000)
#         transcription, detected_lang = transcribe_audio(audio_data, sample_rate)
#         print(detected_lang)
#         text_to_speech(transcription, detected_lang)
#         translated_text = translate_text_deep(transcription, target_lang="en")
#         text_to_speech(translated_text, lang="en")
#     else:
#         return "Completed"


if __name__ == "__main__":
    app.run(debug=True)
