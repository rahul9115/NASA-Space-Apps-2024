from flask import Flask, Response, jsonify, redirect, url_for, request, send_file
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
import librosa
import soundfile as sf


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
        audio = audio.set_frame_rate(16000)
        audio.export(wav_path, format="wav")
        print(f"File converted to wav: {wav_path}")
        # audio_data, sample_rate = read_and_resample_audio(wav_path)
        audio_data, sample_rate = librosa.load(wav_path, sr=None)
        transcription, detected_lang = transcribe_audio(audio_data, sample_rate)
        answer = ai_agent(transcription)
        translated_answer = translate_text_deep(answer, detected_lang)
        text_to_speech(translated_answer, detected_lang)
        return send_file(os.getcwd() + "/ai_agent_output.wav", as_attachment=True)
        # translated_text = translate_text_deep(transcription, target_lang="en")
        # print(translated_text)
    else:
        return "Completed"


if __name__ == "__main__":
    app.run(debug=True)
