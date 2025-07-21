from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from nlp_analyzer import analyze_transcripts
from transcript_fetcher import get_transcripts
import json
import os

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/analysis")
async def get_analysis():
    try:
        # Check if we have cached analysis
        cache_file = "analysis_cache.json"
        if os.path.exists(cache_file):
            with open(cache_file, "r") as f:
                return json.load(f)
        
        # Fetch and analyze transcripts
        transcripts = get_transcripts()
        analysis = analyze_transcripts(transcripts)
        
        # Cache the analysis
        with open(cache_file, "w") as f:
            json.dump(analysis, f)
        
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)