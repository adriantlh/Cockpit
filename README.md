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

Cockpit requires several external integrations to function fully. Follow these
detailed steps to set up your "Command Center."

### 1. Google Cloud setup (Calendar, Gmail, Firestore)

This step allows Cockpit to read your calendar, fetch emails, and store your
training data in a database.

#### Enable the APIs
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Click **Select a project** at the top and then **New Project**. Name it
    "Cockpit."
3.  In the search bar at the top, search for and enable each of these:
    - **Google Calendar API**
    - **Gmail API**
    - **Cloud Firestore API**

#### Set up the database (Firestore)
1.  In the Google Cloud sidebar, find **Firestore**.
2.  Click **Create Database**.
3.  Select **Native Mode**.
4.  Choose a location (for example, `asia-southeast1`) and click **Create**.
5.  Wait for it to initialize. You don't need to create any "Collections"
    manually; the app will do this for you.

#### Get your user credentials (`credentials.json`)
1.  Go to **APIs & Services** > **OAuth consent screen**.
2.  Select **External** and click **Create**.
3.  Fill in the "App name" (Cockpit) and your email address. Leave the rest
    blank.
4.  Add your own email address to the **Test users** list.
5.  Go to **Credentials** > **Create Credentials** > **OAuth client ID**.
6.  Select **Desktop App** as the "Application type."
7.  Download the JSON file provided.
8.  **Rename it to `credentials.json`** and place it in the `backend/`
    directory.

#### Get your database key (`serviceAccountKey.json`)
1.  Go to **IAM & Admin** > **Service Accounts**.
2.  Click **Create Service Account**. Name it "cockpit-admin."
3.  Grant it the **Cloud Datastore User** role (this allows it to use
    Firestore).
4.  Click the created account, go to the **Keys** tab, and click **Add Key** >
    **Create new key**.
5.  Select **JSON** and click **Create**.
6.  **Rename the downloaded file to `serviceAccountKey.json`** and place it in
    the `backend/` directory.

### 2. Strava API setup (The "Telemetry" Feed)

Strava uses a strict security flow. You need to perform a one-time "handshake"
to get your key.

1.  Visit [Strava API Settings](https://www.strava.com/settings/api).
2.  Create an application. Set the **Authorization Callback Domain** to
    `localhost`.
3.  Copy your **Client ID** and **Client Secret**.
4.  **Get the code:** Paste this URL into your browser, replacing
    `[INSERT_CLIENT_ID]` with your ID:
    `https://www.strava.com/oauth/authorize?client_id=[INSERT_CLIENT_ID]&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=read,activity:read_all`
5.  Click **Authorize**. The page will "fail" to load, but look at the URL in
    your address bar. Copy the `code=` value (for example, `code=abc123...`).
6.  **Get the Refresh Token:** Open your terminal and run this command (replace
    the brackets with your data):
    ```bash
    curl -X POST https://www.strava.com/oauth/token \
      -d client_id=[CLIENT_ID] \
      -d client_secret=[CLIENT_SECRET] \
      -d code=[AUTHORIZATION_CODE] \
      -d grant_type=authorization_code
    ```
7.  Copy the `refresh_token` from the text response. This is your permanent key.

### 3. Google Gemini setup (The "AI Coach")

1.  Go to [Google AI Studio](https://aistudio.google.com/).
2.  Click **Get API Key** in the sidebar.
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
4.  Fill in your `backend/.env` file with your keys (see `example.env`).
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
