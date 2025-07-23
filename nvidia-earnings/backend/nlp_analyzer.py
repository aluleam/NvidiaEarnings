import os
import json
import re
import logging
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

def analyze_transcripts(transcripts):
    results = []
    logger.info(f"Starting analysis of {len(transcripts)} transcripts")
    
    for transcript in transcripts:
        quarter = transcript.get("quarter", "Unknown Quarter")
        date = transcript.get("date", "Unknown Date")
        logger.info(f"Analyzing {quarter} transcript from {date}")
        
        management_text = transcript.get("management", "")
        qa_text = transcript.get("qa", "")
        
        # Log text length for debugging
        logger.info(f"Management text length: {len(management_text)}")
        logger.info(f"QA text length: {len(qa_text)}")

        # Analyze sections
        mgmt_analysis = analyze_section(management_text, "management discussion")
        qa_analysis = analyze_section(qa_text, "Q&A session") if qa_text else {
            "sentiment": "neutral",
            "confidence": 0.5,
            "themes": []
        }

        results.append({
            "quarter": quarter,
            "date": date,
            "management": mgmt_analysis,
            "qa": qa_analysis,
            "content": transcript.get("content", "")
        })

    calculate_tone_changes(results)
    logger.info("Analysis completed successfully")
    return results

def analyze_section(text, section_type):
    # Check for sufficient text
    if not text or len(text.strip()) < 100:
        logger.warning(f"Skipping {section_type} analysis: insufficient text")
        return {
            "sentiment": "neutral",
            "confidence": 0.5,
            "themes": []
        }

    # Calculate token count
    token_count = len(text.split())
    logger.info(f"Analyzing {section_type} ({token_count} tokens)")
    
    # Truncate to avoid exceeding model limits
    truncated = text[:6000]

    # Initialize LLM
    llm = ChatOpenAI(
        model="deepseek-chat",
        api_key=os.getenv("DEEPSEEK_API_KEY"),
        base_url="https://api.deepseek.com/v1",
        temperature=0.1,
        max_retries=3,
        request_timeout=60
    )

    # Sentiment analysis prompt
    sentiment_prompt = f"""
    Analyze the sentiment in the following NVIDIA earnings call {section_type} section. 
    Focus on the overall tone expressed by NVIDIA management regarding their business performance and outlook.
    
    Return ONLY valid JSON in this format:
    {{
        "sentiment": "positive|neutral|negative",
        "confidence": float_value_between_0_and_1
    }}
    
    Transcript section:
    {truncated}
    """
    
    # Themes analysis prompt
    themes_prompt = f"""
    Identify 3-5 key strategic business focuses in this NVIDIA earnings call {section_type}.
    Focus specifically on NVIDIA's business strategies, technologies, and market opportunities.
    
    Return ONLY valid JSON in this format:
    {{
        "themes": ["theme1", "theme2", ...]
    }}
    
    Transcript section:
    {truncated}
    """

    try:
        # Get sentiment analysis
        logger.info("Sending sentiment analysis request...")
        sentiment_response = llm.invoke([HumanMessage(content=sentiment_prompt)])
        logger.info(f"Raw sentiment response: {sentiment_response.content}")
        sentiment_data = parse_json(sentiment_response.content)
        logger.info(f"Sentiment: {sentiment_data.get('sentiment', 'neutral')} (Confidence: {sentiment_data.get('confidence', 0.5)})")
        
        # Get themes analysis
        logger.info("Sending themes analysis request...")
        themes_response = llm.invoke([HumanMessage(content=themes_prompt)])
        logger.info(f"Raw themes response: {themes_response.content}")
        themes_data = parse_json(themes_response.content)
        logger.info(f"Themes: {themes_data.get('themes', [])}")
        
        return {
            "sentiment": sentiment_data.get("sentiment", "neutral").lower(),
            "confidence": float(sentiment_data.get("confidence", 0.5)),
            "themes": themes_data.get("themes", [])[:5]  # Limit to 5 themes
        }
        
    except Exception as e:
        logger.error(f"Error analyzing {section_type}: {str(e)}")
        return {
            "sentiment": "neutral",
            "confidence": 0.5,
            "themes": []
        }

def calculate_tone_changes(results):
    if len(results) < 2:
        return
    
    logger.info("Calculating tone changes between quarters")
    
    for i in range(1, len(results)):
        current = results[i]["management"]
        previous = results[i - 1]["management"]
        
        # Convert to numerical scores
        current_score = current["confidence"] 
        previous_score = previous["confidence"]
        
        if current["sentiment"] == "negative":
            current_score *= -1
        if previous["sentiment"] == "negative":
            previous_score *= -1
            
        change = current_score - previous_score
        results[i]["tone_change"] = round(change, 2)
        logger.info(f"Tone change from {results[i-1]['quarter']} to {results[i]['quarter']}: {change:.2f}")

def parse_json(text):
    """Robust JSON parsing with multiple fallback strategies"""
    if not text:
        return {}
    
    # Strategy 1: Try to parse as complete JSON
    try:
        return json.loads(text.strip())
    except:
        pass
    
    # Strategy 2: Extract first JSON object
    try:
        json_match = re.search(r'\{[\s\S]*\}', text)
        if json_match:
            return json.loads(json_match.group(0))
    except:
        pass
    
    # Strategy 3: Manual field extraction
    result = {}
    
    # Sentiment extraction
    if "sentiment" in text.lower():
        sentiment_match = re.search(r'"sentiment":\s*"(positive|neutral|negative)"', text, re.IGNORECASE)
        if sentiment_match:
            result["sentiment"] = sentiment_match.group(1).lower()
    
    # Confidence extraction
    confidence_match = re.search(r'"confidence":\s*([0-9.]+)', text)
    if confidence_match:
        try:
            result["confidence"] = float(confidence_match.group(1))
        except:
            pass
    
    # Themes extraction
    if "themes" in text.lower():
        themes_match = re.findall(r'"themes":\s*\[([^\]]+)\]', text)
        if themes_match:
            themes_str = themes_match[0]
            themes = re.findall(r'"(.*?)"', themes_str)
            result["themes"] = themes
    
    return result

def test_api_connection():
    logger.info("Testing DeepSeek API connection...")
    try:
        llm = ChatOpenAI(
            model="deepseek-chat",
            api_key=os.getenv("DEEPSEEK_API_KEY"),
            base_url="https://api.deepseek.com/v1",
            temperature=0.1,
            max_retries=1,
            request_timeout=30
        )
        response = llm.invoke([HumanMessage(content="Return JSON: {'test': 'success'}")])
        logger.info(f"API test response: {response.content}")
        return "API connection successful"
    except Exception as e:
        logger.error(f"API connection failed: {str(e)}")
        return f"API connection failed: {str(e)}"