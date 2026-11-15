import subprocess
import os
import sys

chrome = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
out_dir = r'C:\Users\rajsi\OneDrive\Desktop\Documents\raj\transport  hackathon\transport-stack-hackathon\docs\design\after'
os.makedirs(out_dir, exist_ok=True)

targets = [
    ('planner', 'http://localhost:3000/'),
    ('results', 'http://localhost:3000/results?origin_id=8256&dest_id=365&departure_time=18:00&preference=least_crowded'),
    ('analytics', 'http://localhost:3000/analytics'),
    ('about', 'http://localhost:3000/about'),
]

viewports = [
    ('1440', 1440, 900),
    ('768', 768, 1024),
    ('360', 360, 800),
]

for name, url in targets:
    for vp, w, h in viewports:
        out_png = os.path.join(out_dir, f'{name}_{vp}.png')
        cmd = [
            chrome,
            '--headless=new',
            f'--window-size={w},{h}',
            f'--screenshot={out_png}',
            url
        ]
        res = subprocess.run(cmd, capture_output=True)
        if os.path.exists(out_png):
            print(f'Captured: {name}_{vp}.png ({os.path.getsize(out_png)} bytes)')
        else:
            print(f'Failed: {name}_{vp}.png')

print("All screenshots finished.")
