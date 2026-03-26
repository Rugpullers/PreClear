import os
import subprocess
import shutil

videos = [
    r"D:\Desktop\PreClear\Landingpage Vids\1.mp4",
    r"D:\Desktop\PreClear\Landingpage Vids\2.mp4",
    r"D:\Desktop\PreClear\Landingpage Vids\3.mp4",
    r"D:\Desktop\PreClear\Landingpage Vids\4.mp4"
]

output_dir = r"D:\Desktop\PreClear\frontend\assets\frames"
# Clean up previous failed attempts
if os.path.exists(output_dir):
    shutil.rmtree(output_dir)
os.makedirs(output_dir, exist_ok=True)

fps = 12
global_frame_count = 1

for i, video in enumerate(videos):
    print(f"Processing {video}...")
    temp_dir = os.path.join(output_dir, f"temp_{i}")
    os.makedirs(temp_dir, exist_ok=True)
    
    # Use JPG instead of WEBP to avoid single-file animation muxing
    cmd = [
        "static_ffmpeg",
        "-i", video,
        "-vf", f"fps={fps}",
        "-q:v", "5", # 1-31 scale, 2-5 is good quality
        os.path.join(temp_dir, "f_%05d.jpg")
    ]
    
    try:
        subprocess.run(cmd, check=True)
    except Exception as e:
        print(f"Error processing {video}: {e}")
        continue
    
    # Rename and move to final output_dir
    frames = sorted(os.listdir(temp_dir))
    for frame in frames:
        src = os.path.join(temp_dir, frame)
        dst = os.path.join(output_dir, f"frame_{global_frame_count:05d}.jpg")
        os.rename(src, dst)
        global_frame_count += 1
    
    shutil.rmtree(temp_dir)

print(f"Extraction complete. Total frames: {global_frame_count - 1}")
