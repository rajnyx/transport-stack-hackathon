"""WSGI entrypoint for CrowdWise Flask backend."""
import os
import sys
import time
import traceback
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
sys.path.insert(0, str(BACKEND_DIR))
sys.path.insert(0, str(ROOT_DIR))

from app import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "0").lower() in ("true", "1")
    use_reloader = os.getenv("FLASK_RELOAD", "0").lower() in ("true", "1")
    
    while True:
        try:
            app.run(host="0.0.0.0", port=port, debug=debug, use_reloader=use_reloader, threaded=True)
            print("Flask server stopped. Restarting in 1 second...", flush=True)
            time.sleep(1)
        except KeyboardInterrupt:
            print("Flask server received KeyboardInterrupt. Exiting.", flush=True)
            break
        except Exception as e:
            print(f"Flask server encountered error: {e}", flush=True)
            traceback.print_exc()
            time.sleep(2)
