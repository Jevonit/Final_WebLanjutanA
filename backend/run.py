import os
from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv()

# Get port from environment or default to 8000
port = int(os.getenv("APP_PORT", 8000))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
