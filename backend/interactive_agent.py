"""
interactive_agent.py
--------------------
Interactive career accelerator agent powered by Gemma 4.

Collects onboarding inputs interactively, generates the initial
Antigravity Launch Plan in structured JSON, remembers context across turns,
and lets you refine/tweak the plan dynamically with follow-up feedback.
"""

import json
import sys
from models import OnboardingData
from prompt_builder import build_roadmap_prompt, parse_roadmap_response
import gemma_client


def ask_input(prompt_text: str, default: str = "") -> str:
    """Prompt user with optional default value."""
    if default:
        val = input(f"{prompt_text} [{default}]: ").strip()
        return val if val else default
    val = input(f"{prompt_text}: ").strip()
    while not val:
        print("This field is required.")
        val = input(f"{prompt_text}: ").strip()
    return val


def main():
    print("=" * 60)
    print("🚀 Antigravity Career Accelerator — Interactive Agent")
    print(f"Model: {gemma_client.MODEL_ID}")
    print("=" * 60)
    print("\nPlease enter your onboarding details:\n")

    degree = ask_input("1. Degree and Specialization", "B.Tech Computer Science (AI Specialization)")
    year_sem = ask_input("2. Current Year/Semester", "3rd Year, Semester 5")
    subjects = ask_input("3. Subjects Studied", "DSA, DBMS, OS, Machine Learning")
    skills = ask_input("4. Technical and Non-Technical Skills", "Problem solving, teamwork, REST APIs, Git")
    languages = ask_input("5. Programming Languages", "Python, Java, JavaScript")
    goals = ask_input("6. Career Goals", "Become an ML Engineer at a product company")
    industry = ask_input("7. Preferred Industry", "Artificial Intelligence / Machine Learning")

    profile = OnboardingData(
        degree_specialization=degree,
        year_semester=year_sem,
        subjects_studied=subjects,
        skills=skills,
        programming_languages=languages,
        career_goals=goals,
        preferred_industry=industry,
    )

    print("\n⏳ Generating initial Antigravity Launch Plan with Gemma 4...")

    # Start a stateful chat session with Gemma 4
    chat = gemma_client.make_chat()
    initial_prompt = build_roadmap_prompt(profile)

    response = chat.send_message(initial_prompt)
    raw_text = response.text

    try:
        plan = parse_roadmap_response(raw_text)
        print("\n" + "=" * 60)
        print("🎯 Generated Launch Plan (JSON):")
        print("=" * 60)
        print(json.dumps(plan.model_dump(), indent=2))
    except Exception:
        print("\nRaw Model Output:\n", raw_text)

    print("\n" + "=" * 60)
    print("💬 Refinement Mode: You can now ask to tweak or adjust the plan.")
    print("The agent remembers your profile and previous answers.")
    print("Type 'exit' or 'quit' to finish.")
    print("=" * 60 + "\n")

    while True:
        try:
            user_tweak = input("\nHow would you like to tweak the roadmap? (or 'quit'): ").strip()
            if not user_tweak:
                continue
            if user_tweak.lower() in ["exit", "quit", "q"]:
                print("Exiting Antigravity Accelerator. All the best with your career journey! 🚀")
                break

            print("\n⏳ Updating roadmap with your feedback...")
            tweak_prompt = (
                f"The user wants to refine/tweak their launch plan with the following feedback:\n"
                f"\"{user_tweak}\"\n\n"
                f"Update the launch plan accordingly, remembering their onboarding profile. "
                f"Return ONLY the updated JSON adhering to the exact same JSON schema as before."
            )
            reply = chat.send_message(tweak_prompt)
            try:
                updated_plan = parse_roadmap_response(reply.text)
                print("\n✅ Updated Launch Plan (JSON):\n")
                print(json.dumps(updated_plan.model_dump(), indent=2))
            except Exception:
                print("\nUpdated Output:\n", reply.text)

        except (KeyboardInterrupt, EOFError):
            print("\nSession ended.")
            break


if __name__ == "__main__":
    main()
