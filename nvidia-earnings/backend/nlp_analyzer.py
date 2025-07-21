from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage
import json
import os

def analyze_transcripts(transcripts):
    results = []
    
    for transcript in transcripts:
        # Analyze management section
        mgmt_analysis = analyze_section(transcript["management"])
        
        # Analyze Q&A section
        qa_analysis = analyze_section(transcript["qa"]) if transcript["qa"] else {
            "sentiment": "neutral",
            "confidence": 0.5,
            "themes": []
        }
        
        results.append({
            "quarter": transcript["quarter"],
            "date": transcript["date"],
            "management": mgmt_analysis,
            "qa": qa_analysis
        })
    
    # Calculate quarter-over-quarter changes
    calculate_tone_changes(results)
    
    return results

def analyze_section(text):
    if not text or len(text) < 100:
        return {
            "sentiment": "neutral",
            "confidence": 0.5,
            "themes": []
        }
    
    # Truncate to save tokens
    truncated = text[:6000]
    
    # Initialize LLM
    llm = ChatOpenAI(
        model="gpt-4-turbo",
        api_key=os.getenv("OPENAI_API_KEY"),
        temperature=0.1
    )
    
    # Sentiment analysis
    sentiment_prompt = f"""
    Analyze the sentiment in the following earnings call transcript section:
    {truncated}
    
    Return JSON only: {{
        "sentiment": "positive|neutral|negative",
        "confidence": 0-1
    }}
    """
    sentiment_response = llm([HumanMessage(content=sentiment_prompt)])
    sentiment_data = parse_json(sentiment_response.content)
    
    # Theme extraction
    themes_prompt = f"""
    Identify 3-5 key strategic focuses in this management discussion:
    {truncated}
    
    Return JSON only: {{
        "themes": ["theme1", "theme2", ...]
    }}
    """
    themes_response = llm([HumanMessage(content=themes_prompt)])
    themes_data = parse_json(themes_response.content)
    
    return {
        "sentiment": sentiment_data.get("sentiment", "neutral"),
        "confidence": sentiment_data.get("confidence", 0.5),
        "themes": themes_data.get("themes", [])
    }

def calculate_tone_changes(results):
    for i in range(1, len(results)):
        current = results[i]["management"]["confidence"]
        previous = results[i-1]["management"]["confidence"]
        
        # Apply sentiment direction
        if results[i]["management"]["sentiment"] == "negative":
            current *= -1
        if results[i-1]["management"]["sentiment"] == "negative":
            previous *= -1
        
        change = current - previous
        results[i]["tone_change"] = round(change, 2)

def parse_json(text):
    try:
        json_str = text[text.find("{"):text.rfind("}")+1]
        return json.loads(json_str)
    except:
        return {}