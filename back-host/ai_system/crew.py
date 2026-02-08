import os
from typing import List
from crewai import Agent, Task, Crew, Process, LLM
from crewai_tools import ScrapeWebsiteTool, SeleniumScrapingTool
from crewai.tools import tool

# --- ROBUST UNIVERSAL SCRAPER TOOL ---
@tool("scraper")
def scraper(urls: List[str]): 
    """
    Scrapes content from multiple URLs. Handles both Static and Dynamic content.
    """
    results = []
    static_tool = ScrapeWebsiteTool()
    dynamic_tool = SeleniumScrapingTool()

    for url in urls:
        try:
            # Try fast static scrape first
            content = static_tool._run(website_url=url)
            
            # Switch to Selenium if content is too thin or blocked
            if not content or len(content) < 800 or any(x in content.lower() for x in ["maintenance", "access denied", "robot"]):
                content = dynamic_tool._run(website_url=url)
            
            results.append(f"### DATA FROM {url} ###\n{content[:5000]}") # Limit per-site noise
        except Exception as e:
            results.append(f"### ERROR SCRAPING {url} ###\n{str(e)}")
            
    return "\n\n".join(results)

def run_crewai_process(title, description, urls, brain_vm_ip):
    llama3 = LLM(
        model="ollama/llama3", 
        base_url=f"http://{brain_vm_ip}:11434",
        temperature=0.3
    )
    deepseek = LLM(
        model="ollama/deepseek-coder-v2:16b", 
        base_url=f"http://{brain_vm_ip}:11434",
        temperature=0.3
    )

    # --- AGENTS ---
    analyst = Agent(
        role='Data Extractor',
        goal=f'Scrape URLs and extract key content for {title}',
        backstory="Expert web scraper who uses tools to get real data and summarizes it clearly.",
        tools=[scraper],
        llm=llama3,
        verbose=True,
        max_iter=5,
        allow_delegation=False
    )

    coder = Agent(
        role='HTML Generator',
        goal=f'Generate HTML for {title} using provided data',
        backstory="HTML expert who builds components using ONLY the data given, never invents content.",
        llm=deepseek,
        verbose=True,
        allow_delegation=False
    )

    # --- TASKS ---
    scraping_task = Task(
        description=(
            f"1. Call scraper tool: Action Input: {{'urls': {urls}}}\n"
            f"2. After tool returns data, extract key information about: {description}\n"
            f"3. Provide Final Answer with the extracted key points in a clear structured format."
        ),
        expected_output='Clear summary of key information extracted from the URLs',
        agent=analyst
    )

    coding_task = Task(
        description=(
            f"Using ONLY the data from the previous task, create HTML for: {title}\n"
            f"User requirements: {description}\n"
            f"Generate complete HTML with internal CSS. Use real data only, no placeholders."
        ),
        expected_output='Complete standalone HTML code with embedded CSS',
        agent=coder,
        context=[scraping_task]
    )

    # --- 5. EXECUTION ---
    crew = Crew(
        agents=[analyst, coder],
        tasks=[scraping_task, coding_task],
        process=Process.sequential
    )

    return crew.kickoff()