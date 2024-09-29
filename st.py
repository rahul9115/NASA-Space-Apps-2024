import torch
import sounddevice as sd
import numpy as np
from transformers import WhisperProcessor, WhisperForConditionalGeneration
import pyttsx3
device="cuda" if torch.cuda.is_available() else "cpu"
print("The device used is",device)
model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-large-v2").to("cuda" if torch.cuda.is_available() else "cpu")
processor = WhisperProcessor.from_pretrained("openai/whisper-large-v2")

def record_audio(duration=10, sample_rate=16000):
    """Records audio for a given duration and sample rate"""
    print(f"Recording for {duration} seconds... Please speak clearly.")
    
    audio_data = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1, dtype='float32')
    sd.wait()
    
    audio_data = np.squeeze(audio_data)
    print("Audio recording complete.")
    return audio_data, sample_rate

def transcribe_audio(audio_data, sample_rate):
    """Transcribe audio using Hugging Face Whisper"""
    inputs = processor(audio_data, sampling_rate=sample_rate, return_tensors="pt").to("cuda" if torch.cuda.is_available() else "cpu")
    
    with torch.no_grad():
        predicted_ids = model.generate(inputs.input_features)
    
    transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
    return transcription
def text_to_speech(text):
    """Convert text to speech using pyttsx3 (offline TTS engine)"""
    engine = pyttsx3.init()
    engine.say(text)
    engine.runAndWait()
audio_data, sample_rate = record_audio(duration=10, sample_rate=16000)
transcription=transcribe_audio(audio_data, sample_rate)
text_to_speech(transcription)
