# Cockpit

Cockpit is a unified "Daily Operations" dashboard designed for high-performance
individuals who need to synchronize their professional schedule, personal
fitness goals, and mission-critical communications in a single, visually high-
signal interface.

Built to run entirely within the Google Cloud Platform (GCP) Free Tier, Cockpit
aggregates data from Google Calendar, Gmail, Strava, and weather services, using
Google Gemini to autonomously generate adaptive training plans.

## Use case

You are a software engineer training for a marathon. Your day is a mix of
complex coding tasks, stakeholder meetings, and specific physical training
intervals. Traditionally, you would switch between Google Calendar for
meetings, Gmail for race organizer updates, Strava for performance tracking,
and a spreadsheet for your training plan.

Cockpit eliminates this fragmentation. It provides a "single pane of glass"
where:
- **North Stars** keep your long-term goals front-and-center.
- **Today's Mission** tells you exactly what work needs to be done today,
  dynamically adjusted by AI.
- **Environmental Intel** provides real-time weather and AQI context to inform
  your training execution.
- **Schedule & Comms Intelligence** merges your professional agenda with
  filtered, relevant emails.

## Features

- **AI-Driven Training Plans:** Automatically generates weekly plans using
  Google Gemini based on your Strava performance and calendar load.
- **Strava Integration:** Syncs your actual activities to track adherence and
  provide biometric context to the AI.
- **Environmental Context:** Real-time weather and air quality monitoring to
  suggest indoor vs. outdoor training.
- **Agnostic LLM Interface:** Uses a standard Markdown context file, allowing
  you to swap between Gemini, OpenAI, or local models.
- **Modern Dashboard:** High-contrast Dark/Light modes with a focus on
  accessibility and visual hierarchy.

## Configuration & API keys

Cockpit requires several external integrations to function fully.

### Google Cloud (Calendar, Gmail, Firestore)
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a project and enable the **Google Calendar API**, **Gmail API**, and
    **Firestore API**.
3.  Configure the **OAuth Consent Screen**:
    - Set User Type to **External**.
    - Add your email address to the **Test users** list.
4.  Create **OAuth 2.0 Client IDs**:
    - Go to **Credentials** > **Create Credentials** > **OAuth Client ID**.
    - Select **Desktop App**.
    - Download the JSON and rename it to `credentials.json`. Place it in the
      `backend/` directory.
5.  Create a **Service Account**:
    - Go to **IAM & Admin** > **Service Accounts**.
    - Click **Create Service Account** and grant it the **Cloud Datastore User**
      role.
    - Click the created account, navigate to **Keys**, and select **Add Key** >
      **Create New Key** > **JSON**.
    - Download and rename it to `serviceAccountKey.json`. Place it in the
      `backend/` directory for Firestore access.

### Strava API
Strava requires a permanent refresh token, which involves a one-time manual
handshake.

1.  Visit the [Strava API Settings](https://www.strava.com/settings/api).
2.  Create an application:
    - Set **Authorization Callback Domain** to `localhost`.
    - Copy your **Client ID** and **Client Secret**.
3.  Get your **Authorization Code**:
    - Paste this URL into your browser, replacing `[INSERT_CLIENT_ID]` with your
      actual Client ID:
      `https://www.strava.com/oauth/authorize?client_id=[INSERT_CLIENT_ID]&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=read,activity:read_all`
    - Click **Authorize**.
    - The page will fail to load, but look at the URL in your address bar. Copy
      the `code=` value (for example, `code=abc123...`).
4.  Exchange the code for a **Refresh Token**:
    - Run the following command in your terminal, replacing the placeholders:
      ```bash
      curl -X POST https://www.strava.com/oauth/token \
        -d client_id=[CLIENT_ID] \
        -d client_secret=[CLIENT_SECRET] \
        -d code=[AUTHORIZATION_CODE] \
        -d grant_type=authorization_code
      ```
    - Copy the `refresh_token` from the JSON response. This is your permanent
      token.

### Google Gemini (AI Coach)
1.  Go to [Google AI Studio](https://aistudio.google.com/).
2.  Log in and click **Get API Key** in the sidebar.
3.  Copy the key and add it as `GEMINI_API_KEY` to your environment variables.

## Technical stack

- **Frontend:** React (TypeScript), Tailwind CSS v4, Lucide Icons.
- **Backend:** Python (FastAPI), Google API Client, Strava API.
- **Database:** Google Cloud Firestore.
- **AI:** Google Gemini (Generative AI SDK).

## Installation

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend setup
1.  `cd backend`
2.  `python3 -m venv venv && source venv/bin/activate`
3.  `pip install -r requirements.txt`
4.  Export your environment variables:
    ```bash
    export STRAVA_CLIENT_ID="your_id"
    export STRAVA_CLIENT_SECRET="your_secret"
    export STRAVA_REFRESH_TOKEN="your_token"
    export GEMINI_API_KEY="your_key"
    export SUMMARY_EMAIL="your_email@example.com"
    ```
5.  Start the server: `uvicorn main:app --reload`.

### Frontend setup
1.  `cd frontend`
2.  `npm install`
3.  `npm run dev`

## Workflow

1.  **Ingestion:** Nightly, Cockpit syncs your Strava activities and Google
    Calendar.
2.  **Context Generation:** On Sundays, it compiles all data into
    `training_context.md`.
3.  **AI Planning:** Gemini reads the context and generates the next 7 days of
    training, saved directly to Firestore.
4.  **Daily Ops:** Every morning, you receive a briefing email and view your
    optimized dashboard.
