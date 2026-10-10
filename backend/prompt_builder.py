"""
prompt_builder.py
-----------------
Builds the "Antigravity Launch Plan" prompt from onboarding data and
parses Gemma's JSON response back into the LaunchPlan Pydantic model.

Kept in its own file so it can be read, edited, and tested independently —
and so judges can see exactly what we send to Gemma 4.
"""

import json
import re

from models import OnboardingData, LaunchPlan


def build_roadmap_prompt(data: OnboardingData) -> str:
    """
    Populate the Antigravity Launch Plan prompt template with the
    student's onboarding data.

    Gemma is instructed to return a strict JSON object so the response
    can be validated by Pydantic and served directly to the frontend —
    no markdown parsing needed.
    """
    prompt = f"""
You are the core intelligence of "Antigravity," a specialized AI career accelerator.
Your goal is to lift students above the competition by analyzing their profile and
generating a precise, actionable career roadmap.

Here is the user's onboarding data:
- Degree and Specialization: {data.degree_specialization}
- Current Year/Semester: {data.year_semester}
- Subjects Studied: {data.subjects_studied}
- Technical and Non-Technical Skills: {data.skills}
- Programming Languages: {data.programming_languages}
- Career Goals: {data.career_goals}
- Preferred Industry: {data.preferred_industry}

Generate the "Antigravity Launch Plan" as a single, valid JSON object.
Do NOT include any text, greeting, explanation, or markdown outside the JSON.
Return ONLY the JSON object, nothing else.

The JSON must follow this exact schema:

{{
  "profile_strengths": [
    "<strength 1: strongest connection between their skills/languages and preferred industry>",
    "<strength 2>"
  ],
  "missing_links": [
    "<gap 1: specific missing technical skill, portfolio project, or soft skill>",
    "<gap 2>"
  ],
  "next_30_days": [
    "<action 1: highly specific task, e.g. Build a [project] using [language from their list]>",
    "<action 2>",
    "<action 3>"
  ],
  "industry_radar": {{
    "topic": "<1 trending technology or topic in their preferred industry>",
    "reason": "<brief explanation of why they should care, linked to their subjects>"
  }}
}}

Rules:
- profile_strengths: exactly 2 strings.
- missing_links: exactly 2 strings.
- next_30_days: exactly 3 strings, each a concrete step-by-step task.
- industry_radar: an object with "topic" and "reason" strings.
- Do not include any markdown, bullet symbols, or numbering inside the strings.
""".strip()

    return prompt


def parse_roadmap_response(raw: str) -> LaunchPlan:
    """
    Extract and parse the JSON object from Gemma's raw text response.
    Ultra-resilient against markdown fences, preambles, and postscripts.
    """
    cleaned = raw.strip()

    # 1. Try stripping markdown code fences first
    fenced_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
    if fenced_match:
        cleaned = fenced_match.group(1).strip()

    # 2. Extract outermost JSON object using brace counting
    start_idx = cleaned.find("{")
    if start_idx == -1:
        raise ValueError(f"No JSON object found in response:\n{raw}")

    depth = 0
    end_idx = -1
    for i in range(start_idx, len(cleaned)):
        if cleaned[i] == "{":
            depth += 1
        elif cleaned[i] == "}":
            depth -= 1
            if depth == 0:
                end_idx = i + 1
                break

    if end_idx == -1:
        # Fall back to regex greedy match
        bare = re.search(r"\{[\s\S]*\}", cleaned)
        if not bare:
            raise ValueError(f"Incomplete JSON object in response:\n{raw}")
        json_str = bare.group(0)
    else:
        json_str = cleaned[start_idx:end_idx]

    try:
        data = json.loads(json_str)
    except json.JSONDecodeError as err:
        # Try cleaning common trailing comma issues
        sanitized = re.sub(r",\s*([\]}])", r"\1", json_str)
        data = json.loads(sanitized)

    return LaunchPlan.model_validate(data)


def build_tweak_prompt(data: OnboardingData, previous_plan: LaunchPlan, feedback: str) -> str:
    """
    Builds a prompt that supplies the user's profile and previously generated launch plan,
    along with their tweak instructions, asking Gemma to produce an updated Launch Plan in JSON.
    """
    prompt = f"""
You are the core intelligence of "Antigravity," a specialized AI career accelerator.
You previously generated a career roadmap (Antigravity Launch Plan) for a student, and now they want to tweak and refine it.

Here is the student's onboarding profile:
- Degree and Specialization: {data.degree_specialization}
- Current Year/Semester: {data.year_semester}
- Subjects Studied: {data.subjects_studied}
- Technical and Non-Technical Skills: {data.skills}
- Programming Languages: {data.programming_languages}
- Career Goals: {data.career_goals}
- Preferred Industry: {data.preferred_industry}

Here is the previously generated Launch Plan:
{json.dumps(previous_plan.model_dump(), indent=2)}

User's requested tweak / feedback:
"{feedback}"

Generate the revised "Antigravity Launch Plan" incorporating their feedback while maintaining their profile context.
Return ONLY a single valid JSON object adhering to the exact same JSON schema:

{{
  "profile_strengths": [
    "<strength 1>",
    "<strength 2>"
  ],
  "missing_links": [
    "<gap 1>",
    "<gap 2>"
  ],
  "next_30_days": [
    "<action 1>",
    "<action 2>",
    "<action 3>"
  ],
  "industry_radar": {{
    "topic": "<1 trending technology or topic>",
    "reason": "<explanation>"
  }}
}}

Rules:
- profile_strengths: exactly 2 strings.
- missing_links: exactly 2 strings.
- next_30_days: exactly 3 strings, each a concrete step-by-step task.
- industry_radar: an object with "topic" and "reason" strings.
- Return ONLY the JSON object, nothing else.
""".strip()

    return prompt


def build_chat_prompt(message: str, history: list, onboarding_data=None, launch_plan=None) -> str:
    """
    Builds a contextual prompt for the Antigravity Career Mentor chatbot.
    Supplies the student's profile, roadmap context, and previous dialogue turns.
    """
    context_parts = []
    if onboarding_data:
        context_parts.append(f"""Student Profile:
- Degree: {onboarding_data.degree_specialization} ({onboarding_data.year_semester})
- Subjects: {onboarding_data.subjects_studied}
- Skills: {onboarding_data.skills}
- Languages: {onboarding_data.programming_languages}
- Goals: {onboarding_data.career_goals}
- Preferred Industry: {onboarding_data.preferred_industry}""")

    if launch_plan:
        context_parts.append(f"""Current Launch Plan:
- Strengths: {', '.join(launch_plan.profile_strengths)}
- Missing Links: {', '.join(launch_plan.missing_links)}
- Next 30 Days: {', '.join(launch_plan.next_30_days)}
- Radar: {launch_plan.industry_radar.topic}""")

    context_str = "\n\n".join(context_parts) if context_parts else "No profile provided yet."

    history_str = ""
    if history:
        turns = []
        for h in history[-6:]:  # last 6 turns
            role = "Student" if h.role == "user" else "Antigravity Mentor"
            turns.append(f"{role}: {h.content}")
        history_str = "\n".join(turns)

    prompt = f"""You are the Antigravity AI Career Mentor, an expert advisor powered by Gemma 4.
Your mission is to guide Indian university and engineering students to achieve their dream placements, internships, and technical careers.
You provide encouraging, realistic, highly specific, and actionable advice tailored to their profile. Keep responses concise, structured, and easy to read.

=== STUDENT CONTEXT ===
{context_str}

=== CONVERSATION HISTORY ===
{history_str}

Student: {message}
Antigravity Mentor:"""

    return prompt

