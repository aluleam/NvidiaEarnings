import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime

def get_transcripts():
    base_url = "https://seekingalpha.com/symbol/NVDA/earnings/transcripts"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    response = requests.get(base_url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")
    
    transcripts = []
    for item in soup.select('div[data-test-id="post-list-item"]')[:4]:
        title = item.select_one('a[data-test-id="post-list-title"]').text
        date_str = item.select_one('span[data-test-id="post-list-date"]').text
        quarter = re.search(r'Q\d \d{4}', title).group(0)
        link = "https://seekingalpha.com" + item.find('a')['href']
        
        # Fetch transcript content
        transcript_res = requests.get(link, headers=headers)
        transcript_soup = BeautifulSoup(transcript_res.text, "html.parser")
        content_div = transcript_soup.select_one('div[data-test-id="content"]')
        content = content_div.get_text() if content_div else ""
        
        # Split into management and Q&A sections
        management, qa = split_transcript(content)
        
        transcripts.append({
            "quarter": quarter,
            "date": parse_date(date_str),
            "content": content,
            "management": management,
            "qa": qa
        })
    
    return transcripts

def split_transcript(content):
    patterns = [
        r"question and answer",
        r"q\s*&\s*a",
        r"questions and answers"
    ]
    
    for pattern in patterns:
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            split_index = match.start()
            return content[:split_index], content[split_index:]
    
    return content, ""

def parse_date(date_str):
    try:
        return datetime.strptime(date_str, '%b. %d, %Y').strftime('%Y-%m-%d')
    except:
        return date_str