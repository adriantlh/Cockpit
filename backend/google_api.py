import os.path
import datetime
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# If modifying these scopes, delete the file token.json.
SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send'
]

def get_credentials():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists('credentials.json'):
                print("CRITICAL: credentials.json not found in backend/ directory.")
                return None
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return creds

def get_calendar_events(max_results=10):
    """Lists the next 10 events on the user's primary calendar."""
    try:
        creds = get_credentials()
        if not creds: return []
        service = build('calendar', 'v3', credentials=creds)

        # Call the Calendar API
        now = datetime.datetime.now(datetime.UTC).isoformat()
        events_result = service.events().list(calendarId='primary', timeMin=now,
                                              maxResults=max_results, singleEvents=True,
                                              orderBy='startTime').execute()
        return events_result.get('items', [])
    except Exception as e:
        print(f"An error occurred: {e}")
        return []

def get_gmail_highlights(query="is:unread", max_results=5):
    """Lists unread messages from Gmail."""
    try:
        creds = get_credentials()
        service = build('gmail', 'v1', credentials=creds)

        results = service.users().messages().list(userId='me', q=query, maxResults=max_results).execute()
        messages = results.get('messages', [])

        highlights = []
        for msg in messages:
            txt = service.users().messages().get(userId='me', id=msg['id']).execute()
            highlights.append({
                'id': msg['id'],
                'snippet': txt.get('snippet', '')
            })
        return highlights
    except Exception as e:
        print(f"An error occurred: {e}")
        return []

import base64
from email.message import EmailMessage

def send_gmail_message(to, subject, body):
    """Sends an email message using the Gmail API."""
    try:
        creds = get_credentials()
        service = build('gmail', 'v1', credentials=creds)

        message = EmailMessage()
        message.set_content(body)
        message['To'] = to
        message['From'] = 'me'
        message['Subject'] = subject

        # encoded message
        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

        create_message = {
            'raw': encoded_message
        }
        
        send_message = (service.users().messages().send(userId="me", body=create_message).execute())
        return send_message
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
