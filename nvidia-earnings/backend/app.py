from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import logging
import traceback
import time  # Essential for cache freshness
from nlp_analyzer import analyze_transcripts, test_api_connection
from transcript_fetcher import get_transcripts

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
def root():
    return {
        "status": "API is working", 
        "endpoints": {
            "/api/analysis": "Get analysis of recent NVIDIA earnings call transcripts",
            "/api/test": "Test DeepSeek API connection",
            "/test-scraper": "Test transcript scraper"
        }
    }

@app.get("/api/analysis")
def get_analysis():
    try:
        logger.info("⚡️ /api/analysis called")
        cache_file = "analysis_cache.json"
        
        # Check cache freshness (update daily)
        use_cache = False
        if os.path.exists(cache_file):
            cache_age = os.path.getmtime(cache_file)
            current_time = time.time()
            if (current_time - cache_age) < 86400:  # 24 hours in seconds
                use_cache = True
                logger.info("Using cached analysis (less than 24 hours old)")

        if use_cache:
            logger.info("Loading analysis from cache")
            with open(cache_file, "r") as f:
                return json.load(f)

        # Fetch and analyze transcripts
        logger.info("Fetching fresh transcripts...")
        transcripts = get_transcripts()
        logger.info(f"Fetched {len(transcripts)} transcripts")
        
        if not transcripts:
            raise HTTPException(
                status_code=404,
                detail="No transcripts found"
            )

        logger.info("Analyzing transcripts...")
        analysis = analyze_transcripts(transcripts)

        # Cache result
        logger.info("Saving analysis to cache")
        with open(cache_file, "w") as f:
            json.dump(analysis, f, indent=2)

        return analysis

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error("Error in get_analysis")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "message": str(e)
            }
        )

@app.get("/api/test")
def test_api():
    return {"result": test_api_connection()}

@app.get("/test-scraper")
def test_scraper():
    return get_transcripts()

# This ensures the app can be run directly with Python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)