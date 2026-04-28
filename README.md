# Cockpit

Cockpit is a unified "Daily Operations" dashboard designed for high-performance
individuals who need to synchronize their professional schedule, personal
fitness goals, and mission-critical communications in a single, visually high-
signal interface.

Built to run primarily within the Google Cloud Platform (GCP) Free Tier, Cockpit
aggregates data from Google Calendar, Gmail, Strava, and weather services. It
leverages **Z.ai (Zhipu AI)** to autonomously generate adaptive training plans.

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
  **Z.ai (GLM 4.7)** based on your Strava performance and calendar load.
- **Strava Integration:** Syncs your actual activities to track adherence and
  provide biometric context to the AI.
- **Environmental Context:** Real-time weather and air quality monitoring to
  suggest indoor vs. outdoor training.
- **Agnostic LLM Interface:** Uses a standard Markdown context file, allowing
  you to swap between Z.ai, OpenAI, or local models.
- **Modern Dashboard:** High-contrast Dark/Light modes with a focus on
  accessibility and visual hierarchy.

## Configuration & API keys

Cockpit requires several external integrations to function fully. Follow these
detailed steps for the **New Google Cloud UI**.

### 1. Google Cloud setup (Calendar, Gmail, Firestore)

This allows Cockpit to read your calendar, fetch emails, and store data.

#### Enable the APIs
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Click **Select a project** > **New Project**. Name it "Cockpit."
3.  Search for and enable: **Google Calendar API**, **Gmail API**, and
    **Cloud Firestore API**.

#### Set up the database (Firestore)
1.  In the sidebar, find **Firestore** > **Create Database**.
2.  Select **Native Mode**. Choose a location (e.g., `asia-southeast1`).
3.  Wait for initialization. No manual collections are needed.

#### Configure the Google Auth Platform (New UI)
1.  Sidebar: **APIs & Services** > **Google Auth platform** (formerly OAuth
    consent screen).
2.  **User Type:** Select **Internal** (if using a Workspace account) or
    **External** (if using a personal account). If "External" is missing and
    you are on a work account, "Internal" is perfectly fine for personal use.
3.  **App Info:** Set App Name to "Cockpit" and enter your email.
4.  **Audience:** Click the **Audience** tab and add your email to **Test
    users**.

#### Get your user credentials (`credentials.json`)
1.  In the **Google Auth platform** section, click the **Clients** tab (or go to
    **APIs & Services** > **Credentials**).
2.  Click **[+ CREATE CLIENT]** (or Create Credentials > OAuth client ID).
3.  Select **Desktop Application**. Name it "Cockpit CLI."
4.  Click the **Download icon** (down arrow) in the list to get your JSON.
5.  **Rename to `credentials.json`** and place in `backend/`.

#### Get your database key (`serviceAccountKey.json`)
1.  Sidebar: **IAM & Admin** > **Service Accounts** > **[+ CREATE SERVICE
    ACCOUNT]**.
2.  Name it "cockpit-admin." Click **Create and Continue**.
3.  **Role:** Search for **Datastore User** (under "Cloud Datastore") or
    **Firebase Firestore Admin**. Select it and click **Done**.
4.  Click the account email > **Keys** tab > **Add Key** > **Create new key** >
    **JSON**.
5.  **Rename to `serviceAccountKey.json`** and place in `backend/`.

### 2. Strava API setup (The "Telemetry" Feed)

1.  Visit [Strava API Settings](https://www.strava.com/settings/api).
2.  Create an app. Set **Authorization Callback Domain** to `localhost`.
3.  Copy your **Client ID** and **Client Secret**.
4.  **Authorize:** Paste this URL into your browser (replace
    `[INSERT_CLIENT_ID]`):
    `https://www.strava.com/oauth/authorize?client_id=[INSERT_CLIENT_ID]&response_type=code&redirect_uri=http://localhost&approval_prompt=force&scope=read,activity:read_all`
5.  Click **Authorize**. Copy the `code=` value from the URL in the address
    bar.
6.  **Exchange for Refresh Token:** Run this in your terminal:
    ```bash
    curl -X POST https://www.strava.com/oauth/token \
      -d client_id=[CLIENT_ID] \
      -d client_secret=[CLIENT_SECRET] \
      -d code=[AUTHORIZATION_CODE] \
      -d grant_type=authorization_code
    ```
7.  Copy the `refresh_token` from the response. This is your permanent key.

### 3. Z.ai setup (The "AI Coach")

Cockpit uses Z.ai's GLM 4.7 model for intelligent training plan generation.

1.  Go to the [Z.ai (Zhipu AI) platform](https://open.bigmodel.cn/).
2.  Create an account and navigate to the **API Keys** section.
3.  Copy your API key and add it to your `.env` as `ZAI_API_KEY`.

## Installation

1.  **Backend:** `cd backend`, create venv, `pip install -r requirements.txt`.
2.  **Environment:** Copy keys into `backend/.env` (see `credentials.json.template`).
3.  **Run:** `uvicorn main:app --reload` (Backend) and `npm run dev` (Frontend).

## Workflow

Cockpit syncs Strava/Calendar nightly. On Sundays, it compiles data into
`training_context.md`. Z.ai reads this and generates your 7-day plan, which
refreshes your "Daily Mission" automatically.
