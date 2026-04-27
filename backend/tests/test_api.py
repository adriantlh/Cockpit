import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from main import app

client = TestClient(app)

@pytest.fixture
def mock_db():
    with patch('main.db') as mock:
        yield mock

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Cockpit API is running"}

def test_delete_event(mock_db):
    # Setup mock
    mock_doc = MagicMock()
    mock_db.collection.return_value.document.return_value = mock_doc
    
    event_id = "test_event_123"
    response = client.delete(f"/api/events/{event_id}")
    
    assert response.status_code == 200
    assert response.json() == {"status": "success"}
    mock_db.collection.assert_called_with('custom_events')
    mock_db.collection().document.assert_called_with(event_id)
    mock_doc.delete.assert_called_once()

def test_update_event(mock_db):
    # Setup mock
    mock_doc = MagicMock()
    mock_db.collection.return_value.document.return_value = mock_doc
    
    event_id = "test_event_123"
    update_data = {"name": "Updated Event", "date": "2023-12-31"}
    response = client.put(f"/api/events/{event_id}", json=update_data)
    
    assert response.status_code == 200
    assert response.json() == {"status": "success"}
    mock_db.collection.assert_called_with('custom_events')
    mock_db.collection().document.assert_called_with(event_id)
    mock_doc.set.assert_called_once_with(update_data, merge=True)

def test_get_dashboard_with_id(mock_db):
    # Mock events stream
    mock_event = MagicMock()
    mock_event.to_dict.return_value = {"name": "Marathon", "date": "2024-05-01"}
    mock_event.id = "doc_id_999"
    
    mock_db.collection.return_value.stream.return_value = [mock_event]
    
    # Mock training plan
    mock_plan = MagicMock()
    mock_plan.exists = True
    mock_plan.to_dict.return_value = {"Monday": "Run"}
    mock_db.collection.return_value.document.return_value.get.return_value = mock_plan
    
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    
    # Check if ID is present in countdown (via processor)
    assert any(item['id'] == "doc_id_999" for item in data['countdown'])
    assert any(item['name'] == "Marathon" for item in data['countdown'])
