# 🚀 Antigravity — AI Career Accelerator

> Lift students above the competition with a personalised career roadmap, powered by **Gemma 4** through the Gemini API.

---

## What it does

A student fills in a short onboarding form (degree, subjects, skills, career goals). Antigravity sends their profile to **Gemma 4** and returns a structured **"Antigravity Launch Plan"** covering:

1. **Profile Strengths** — what they already have going for them
2. **The Missing Links** — specific gaps to close
3. **Next 30 Days** — 3 concrete action items they can start today
4. **Industry Radar** — one trending tech they should pay attention to

---

## Model

```
gemma-4-26b-a4b-it
```

Called through the **Gemini API** via the `google-genai` Python package.  
The key call is in [`backend/gemma_client.py`](backend/gemma_client.py):

```python
from google import genai

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
response = client.models.generate_content(
    model="gemma-4-26b-a4b-it",
    contents=prompt,
)
```

---

## Project structure

```
gemma_4/
├── FRONTEND_API_GUIDE.md ← Complete JSON schemas & integration contract for frontend
├── .env.example          ← Copy to .env, add your key
├── .gitignore
├── requirements.txt
├── backend/
│   ├── main.py           ← FastAPI app (GET /, POST /roadmap, POST /roadmap/tweak)
│   ├── index.html        ← Single-screen web app UI
│   ├── interactive_agent.py ← Stateful CLI agent with memory
│   ├── gemma_client.py   ← Gemma 4 helper (ask, ask_with_image, make_chat)
│   ├── models.py         ← Pydantic request/response models
│   ├── prompt_builder.py ← The Antigravity Launch Plan prompt template & JSON parser
│   └── test_roadmap.py   ← Smoke-test (direct or via HTTP)
└── backend/guidelines/   ← Hackathon rules and notes
```

> **For Frontend Developers:** See [FRONTEND_API_GUIDE.md](FRONTEND_API_GUIDE.md) for TypeScript types, sample payloads, and `fetch`/`axios` examples.


---

## How to run

### 1. Clone and install

```bash
git clone <your-repo-url>
cd gemma_4
pip install -r requirements.txt
```

### 2. Set up your API key

```bash
cp .env.example .env
# Open .env and paste your key from https://aistudio.google.com/app/apikey
```

### 3. Start the Backend API server

```bash
cd backend
uvicorn main:app --reload
```

The backend server runs at `http://127.0.0.1:8000`.  
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`

### 4. Start the React Frontend

```bash
cd frontend
npm install
npm run dev
```

The React dashboard runs at **`http://127.0.0.1:5173/`**.

> **Note on response time:** Gemma 4 generates a comprehensive, tailored roadmap, which takes approximately **15–25 seconds** per request.

### 5. Generate a roadmap (via curl)

```bash
curl -X POST http://127.0.0.1:8000/roadmap \
  -H "Content-Type: application/json" \
  -d '{
    "degree_specialization": "B.Tech Computer Science with AI specialization",
    "year_semester": "3rd Year, Semester 5",
    "subjects_studied": "DSA, DBMS, OS, Machine Learning",
    "skills": "Problem solving, teamwork, REST APIs",
    "programming_languages": "Python, Java, JavaScript",
    "career_goals": "Become an ML Engineer at a product company",
    "preferred_industry": "Artificial Intelligence / Machine Learning"
  }'
```

### 5. Quick smoke-test (no server needed)

```bash
cd backend
python test_roadmap.py --direct
```

---

## License

MIT — see [`LICENSE`](LICENSE).
