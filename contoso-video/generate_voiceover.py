"""
Generate voiceover v2: shorter scripts, expressive delivery, proper timing, background music.
"""
import os
import subprocess
from elevenlabs.client import ElevenLabs
from elevenlabs import VoiceSettings

API_KEY = "sk_5497911eca48d4f6cb1a1d6131743859e0b80bf9c737986d"
VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"  # George
OUTPUT_DIR = "assets"
os.makedirs(OUTPUT_DIR, exist_ok=True)

client = ElevenLabs(api_key=API_KEY)

# Shorter scripts with natural pauses (... and commas for breath)
# Scene windows: 0-8, 8-18, 18-28, 28-40, 40-50, 50-62
# Target: each segment 1-2s SHORTER than its window
segments = [
    {
        "file": "v2_scene1.mp3",
        "text": "Contoso Bank... Command Center. Where AI meets the future of financial services.",
        "max_seconds": 6,
        "delay_ms": 800,
    },
    {
        "file": "v2_scene2.mp3",
        "text": "Every metric that matters... live. First call resolution, customer satisfaction, service levels... all updating in real time, across your entire operation.",
        "max_seconds": 8,
        "delay_ms": 8800,
    },
    {
        "file": "v2_scene3.mp3",
        "text": "Your entire agent floor... at a glance. Live sentiment tracking, instant escalation alerts... supervisors can act, before problems grow.",
        "max_seconds": 8,
        "delay_ms": 18800,
    },
    {
        "file": "v2_scene4.mp3",
        "text": "AI transforms every interaction. Live transcription... compliance alerts... empathy coaching... quality scores updating as conversations unfold.",
        "max_seconds": 9,
        "delay_ms": 29000,
    },
    {
        "file": "v2_scene5.mp3",
        "text": "One view. Every site. New York, London, Singapore, Manila... compare performance instantly, focus attention where it matters.",
        "max_seconds": 8,
        "delay_ms": 40800,
    },
    {
        "file": "v2_scene6.mp3",
        "text": "Contoso Bank Command Center. The future of financial services operations... is here.",
        "max_seconds": 7,
        "delay_ms": 51500,
    },
]

# More expressive voice: lower stability = more variation, higher style = emotional
voice_settings = VoiceSettings(
    stability=0.35,
    similarity_boost=0.75,
    style=0.55,
    use_speaker_boost=True,
)

for seg in segments:
    print(f"Generating {seg['file']}...")
    audio = client.text_to_speech.convert(
        voice_id=VOICE_ID,
        text=seg["text"],
        model_id="eleven_multilingual_v2",
        voice_settings=voice_settings,
    )
    filepath = os.path.join(OUTPUT_DIR, seg["file"])
    with open(filepath, "wb") as f:
        for chunk in audio:
            f.write(chunk)

# Check durations
print("\nSegment durations:")
for seg in segments:
    filepath = os.path.join(OUTPUT_DIR, seg["file"])
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", filepath],
        capture_output=True, text=True
    )
    dur = float(result.stdout.strip())
    status = "OK" if dur <= seg["max_seconds"] else f"LONG ({dur:.1f}s > {seg['max_seconds']}s)"
    print(f"  {seg['file']}: {dur:.1f}s — {status}")

# Generate ambient background music using ffmpeg (subtle pad drone)
print("\nGenerating background music...")
bg_path = os.path.join(OUTPUT_DIR, "bg_music.mp3")
# Layer multiple sine waves for a warm ambient pad, with fade in/out
subprocess.run([
    "ffmpeg", "-y",
    "-f", "lavfi", "-i", "sine=frequency=110:duration=64:sample_rate=44100",
    "-f", "lavfi", "-i", "sine=frequency=165:duration=64:sample_rate=44100",
    "-f", "lavfi", "-i", "sine=frequency=220:duration=64:sample_rate=44100",
    "-f", "lavfi", "-i", "sine=frequency=330:duration=64:sample_rate=44100",
    "-filter_complex",
    "[0]volume=0.03[a];[1]volume=0.02[b];[2]volume=0.015[c];[3]volume=0.01[d];"
    "[a][b][c][d]amix=inputs=4:duration=longest[mix];"
    "[mix]lowpass=f=400,highpass=f=60,afade=t=in:d=3,afade=t=out:st=59:d=5[out]",
    "-map", "[out]", "-ar", "44100", "-b:a", "128k", bg_path
], capture_output=True)
print(f"  Background music: {bg_path}")

# Combine: place each voiceover at its delay, mix with background music
print("\nMixing final audio...")
inputs = ["-i", bg_path]
filter_parts = ["[0]volume=1[bg]"]

for i, seg in enumerate(segments):
    filepath = os.path.join(OUTPUT_DIR, seg["file"])
    inputs.extend(["-i", filepath])
    idx = i + 1
    delay = seg["delay_ms"]
    filter_parts.append(f"[{idx}]adelay={delay}|{delay},volume=1.8[v{i}]")

# Mix background + all voice segments
voice_mix = "".join(f"[v{i}]" for i in range(len(segments)))
n_total = len(segments) + 1
filter_parts.append(f"[bg]{voice_mix}amix=inputs={n_total}:duration=first:normalize=0[out]")
filter_str = ";".join(filter_parts)

output_path = os.path.join(OUTPUT_DIR, "voiceover.mp3")
cmd = ["ffmpeg", "-y"] + inputs + [
    "-filter_complex", filter_str,
    "-map", "[out]",
    "-ar", "44100", "-b:a", "192k",
    output_path
]
result = subprocess.run(cmd, capture_output=True, text=True)
if result.returncode == 0:
    print(f"\nFinal mix saved: {output_path}")
    # Get duration
    dur_result = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", output_path],
        capture_output=True, text=True
    )
    print(f"Duration: {float(dur_result.stdout.strip()):.1f}s")
else:
    print(f"Error: {result.stderr[-800:]}")
