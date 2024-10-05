import torch
import sounddevice as sd
import numpy as np
from transformers import WhisperProcessor, WhisperForConditionalGeneration
import pyttsx3
from gtts import gTTS
from playsound import playsound
from langdetect import detect, detect_langs
import os
import pygame
from deep_translator import GoogleTranslator
from scipy.io import wavfile
from scipy.signal import resample

device = "cuda" if torch.cuda.is_available() else "cpu"
print("The device used is", device)
model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-large-v2").to(
    "cuda" if torch.cuda.is_available() else "cpu"
)
processor = WhisperProcessor.from_pretrained("openai/whisper-large-v2")


def read_and_resample_audio(file_path, target_sample_rate=16000):
    """Reads audio data from a .wav file and resamples it to the target sample rate."""
    # Read the original sample rate and audio data
    original_sample_rate, audio_data = wavfile.read(file_path)

    audio_data = np.squeeze(audio_data)

    # If audio_data has more than one channel, convert to mono by averaging channels
    if len(audio_data.shape) > 1:
        audio_data = np.mean(audio_data, axis=1)

    # Resample the audio to the target sample rate if it's different from the original
    if original_sample_rate != target_sample_rate:
        number_of_samples = int(len(audio_data) * target_sample_rate / original_sample_rate)
        audio_data = resample(audio_data, number_of_samples)

    print(f"Audio data resampled from {original_sample_rate} Hz to {target_sample_rate} Hz.")
    return audio_data, target_sample_rate


def record_audio(duration=10, sample_rate=16000):
    """Records audio for a given duration and sample rate"""
    print(f"Recording for {duration} seconds... Please speak clearly.")

    audio_data = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1, dtype="float32")
    sd.wait()

    audio_data = np.squeeze(audio_data)
    print("Audio recording complete.")
    return audio_data, sample_rate


def transcribe_audio(audio_data, sample_rate):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print("The device used is", device)
    model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-large-v2").to(
        "cuda" if torch.cuda.is_available() else "cpu"
    )
    processor = WhisperProcessor.from_pretrained("openai/whisper-large-v2")
    """Transcribe audio using Hugging Face Whisper"""
    inputs = processor(audio_data, sampling_rate=sample_rate, return_tensors="pt").to(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    with torch.no_grad():
        predicted_ids = model.generate(inputs.input_features)

    transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
    detected_lang = detect(transcription)
    print("Transcription", transcription)
    return transcription, detected_lang


def list_voices():
    """List all available voices."""
    engine = pyttsx3.init()
    voices = engine.getProperty("voices")
    for idx, voice in enumerate(voices):
        print(f"Voice {idx}:")
        print(f" - ID: {voice.id}")
        print(f" - Name: {voice.name}")
        print(f" - Languages: {voice.languages}")
        print(f" - Gender: {voice.gender}")
        print(f" - Age: {voice.age}")
    engine.stop()


def set_language(engine, language_code):
    """Set the voice based on the language code."""
    voices = engine.getProperty("voices")
    for voice in voices:
        # Check if the language code is part of the voice's attributes
        if language_code in voice.id or language_code in voice.languages:
            print(f"Setting voice to: {voice.name}")
            engine.setProperty("voice", voice.id)
            return True
    print(f"No voice found for language: {language_code}")
    return False


def text_to_speech(text, lang="mul"):
    tts = gTTS(text=text, lang=lang)
    file_path = os.path.join(os.getcwd(), "output.wav")
    tts.save("output.wav")
    pygame.mixer.init()
    pygame.mixer.music.load(file_path)
    pygame.mixer.music.play()

    # Wait for the audio to finish playing
    while pygame.mixer.music.get_busy():
        continue


def translate_text_deep(text, target_lang="en"):
    """Translate text to the specified language using Deep Translator."""
    translator = GoogleTranslator(source="auto", target=target_lang)
    translation = translator.translate(text)
    print(f"Translated Text: {translation}")
    return translation


# # Record audio, transcribe, and translate to English
# audio_data, sample_rate = record_audio(duration=10, sample_rate=16000)
# transcription,detected_lang=transcribe_audio(audio_data, sample_rate)
# print(detected_lang)
# text_to_speech(transcription,detected_lang)

# # Translate transcription to English using OpenAI
# translated_text = translate_text_deep(transcription, target_lang="en")

# # Convert translated text to speech (in English)
# text_to_speech(translated_text, lang='en')
