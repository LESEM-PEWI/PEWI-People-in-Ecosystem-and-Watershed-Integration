import os

from pathlib import Path

cwd = Path.cwd()

images   = cwd.rglob("*.png")

for i in images:
    if str(i).endswith("back.png"):
        print(i)
        os.startfile(str(i))