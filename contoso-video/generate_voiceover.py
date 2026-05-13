"""Generate expressive narration and clean cinematic effects for the Contoso HyperFrames promo."""
from __future__ import annotations

import asyncio
import os
import subprocess
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
ASSETS.mkdir(exist_ok=True)

VOICE = "en-US-JennyNeural"
SEGMENTS = [
    ("flash_scene1.mp3", 0.45, "Listen... Contoso Bank Command Center. The control room wakes up before customers feel the problem.", "+6%", "+0Hz"),
    ("flash_scene2.mp3", 8.55, "Watch the metrics breathe. Resolution, sentiment, queue pressure... live. Wait time drops. The floor gets calmer.", "+8%", "+1Hz"),
    ("flash_scene3.mp3", 18.70, "Here is the human moment. James has a tense wire-transfer call. Anxiety spikes... and the supervisor sees it early.", "+5%", "-1Hz"),
    ("flash_scene4.mp3", 28.65, "Now the AI reacts. Not just transcription. Compliance cue. Empathy cue. Next best action. A scared customer feels heard.", "+6%", "+0Hz"),
    ("flash_scene5.mp3", 40.70, "Pull back. New York, London, Singapore, Manila, Bangalore... one operating rhythm, one place to move capacity.", "+7%", "+1Hz"),
    ("flash_scene6.mp3", 50.75, "Contoso Bank Command Center. Faster decisions... calmer agents... more human care. The future of financial services operations.", "+4%", "+0Hz"),
]

async def speak(file_name: str, text: str, rate: str, pitch: str) -> None:
    out = ASSETS / file_name
    communicate = edge_tts.Communicate(text=text, voice=VOICE, rate=rate, pitch=pitch, volume="+0%")
    await communicate.save(str(out))

async def generate_segments() -> None:
    for file_name, _start, text, rate, pitch in SEGMENTS:
        print(f"voice {file_name}")
        await speak(file_name, text, rate, pitch)

def run(cmd: list[str]) -> None:
    result = subprocess.run(cmd, cwd=ROOT, text=True, capture_output=True)
    if result.returncode != 0:
        raise RuntimeError(result.stderr[-2000:] or result.stdout[-2000:])

def ffprobe_seconds(path: Path) -> float:
    result = subprocess.run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(path)
    ], text=True, capture_output=True, check=True)
    return float(result.stdout.strip())

def make_effects() -> None:
    # Warm, low cinematic bed. Kept intentionally soft: no harsh glitch/screech.
    run([
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", "sine=frequency=82:duration=64:sample_rate=48000",
        "-f", "lavfi", "-i", "sine=frequency=123:duration=64:sample_rate=48000",
        "-f", "lavfi", "-i", "sine=frequency=246:duration=64:sample_rate=48000",
        "-filter_complex",
        "[0]volume=0.035[a];[1]volume=0.025[b];[2]volume=0.012[c];[a][b][c]amix=inputs=3:duration=longest,lowpass=f=620,highpass=f=42,afade=t=in:d=2.2,afade=t=out:st=59:d=5[m]",
        "-map", "[m]", "-c:a", "libmp3lame", "-b:a", "160k", str(ASSETS / "music_flash.mp3")
    ])
    run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anoisesrc=d=0.85:c=pink:r=48000", "-af", "volume=0.09,highpass=f=280,lowpass=f=2600,afade=t=in:d=0.05,afade=t=out:st=0.45:d=0.40", str(ASSETS / "fx_whoosh.wav")])
    run(["ffmpeg", "-y", "-f", "lavfi", "-i", "sine=frequency=68:duration=0.38:sample_rate=48000", "-af", "volume=0.22,afade=t=out:st=0.02:d=0.36", str(ASSETS / "fx_hit.wav")])
    run(["ffmpeg", "-y", "-f", "lavfi", "-i", "sine=frequency=920:duration=0.16:sample_rate=48000", "-af", "volume=0.06,afade=t=out:st=0.02:d=0.14", str(ASSETS / "fx_ping.wav")])

def mix() -> None:
    inputs: list[str] = ["-i", str(ASSETS / "music_flash.mp3")]
    filters: list[str] = ["[0:a]volume=0.60[bed]"]
    mix_labels = ["[bed]"]

    for i, (file_name, start, *_rest) in enumerate(SEGMENTS, start=1):
        inputs += ["-i", str(ASSETS / file_name)]
        delay = int(start * 1000)
        filters.append(f"[{i}:a]adelay={delay}|{delay},volume=1.42[v{i}]")
        mix_labels.append(f"[v{i}]")

    fx_start_index = len(SEGMENTS) + 1
    transition_times = [0.12, 7.55, 17.55, 27.55, 39.55, 49.55]
    fx_files = ["fx_hit.wav", "fx_whoosh.wav", "fx_ping.wav"]
    for j, fx in enumerate(fx_files):
        inputs += ["-i", str(ASSETS / fx)]
        input_idx = fx_start_index + j
        for k, t in enumerate(transition_times):
            label = f"fx{j}_{k}"
            delay = int((t + (0.1 if fx == "fx_ping.wav" else 0)) * 1000)
            vol = 0.70 if fx == "fx_whoosh.wav" else 0.55
            filters.append(f"[{input_idx}:a]adelay={delay}|{delay},volume={vol}[{label}]")
            mix_labels.append(f"[{label}]")

    filters.append("".join(mix_labels) + f"amix=inputs={len(mix_labels)}:duration=first:normalize=0,alimiter=limit=0.95,loudnorm=I=-16:LRA=10:TP=-1.5[out]")
    run(["ffmpeg", "-y", *inputs, "-filter_complex", ";".join(filters), "-map", "[out]", "-ar", "48000", "-c:a", "libmp3lame", "-b:a", "192k", str(ASSETS / "voiceover.mp3")])

async def main() -> None:
    await generate_segments()
    print("segment durations:")
    for file_name, start, *_ in SEGMENTS:
        print(f"  {file_name} @ {start:05.2f}s = {ffprobe_seconds(ASSETS / file_name):.2f}s")
    make_effects()
    mix()
    print(f"final voiceover: {ASSETS / 'voiceover.mp3'} ({ffprobe_seconds(ASSETS / 'voiceover.mp3'):.2f}s)")

if __name__ == "__main__":
    asyncio.run(main())

