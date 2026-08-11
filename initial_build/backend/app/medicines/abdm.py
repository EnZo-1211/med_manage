import os
import requests
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class ABDMDrugRegistryClient:
    """
    Client for interacting with the ABDM Drug Registry API.
    Handles authentication and queries. For development, falls back to simulated data
    if credentials are not provided or the API is unreachable.
    """
    def __init__(self):
        # In a real environment, these would be loaded from env vars or a secure vault
        self.client_id = os.environ.get("ABDM_CLIENT_ID")
        self.client_secret = os.environ.get("ABDM_CLIENT_SECRET")
        self.base_url = os.environ.get("ABDM_BASE_URL", "https://drugregistrysbx.abdm.gov.in/dr/v3")
        self.access_token = None

    def _authenticate(self):
        """Authenticate with the ABDM Sandbox to get an access token."""
        if not self.client_id or not self.client_secret:
            logger.warning("ABDM credentials not found. Using simulated mode.")
            return False
            
        try:
            # Example OAuth flow (specifics depend on ABDM docs)
            auth_url = f"{self.base_url}/sessions"
            response = requests.post(
                auth_url, 
                json={"clientId": self.client_id, "clientSecret": self.client_secret},
                timeout=5
            )
            response.raise_for_status()
            data = response.json()
            self.access_token = data.get("accessToken")
            return bool(self.access_token)
        except Exception as e:
            logger.error(f"Failed to authenticate with ABDM Sandbox: {e}")
            return False

    def search_drugs(self, query: str) -> List[Dict[str, Any]]:
        """
        Search the Drug Registry by name.
        Returns a list of raw drug dictionaries from the API (or simulated data).
        """
        if not query:
            return []
            
        # Try real API if we have credentials
        if self.client_id and self.client_secret:
            if not self.access_token and not self._authenticate():
                pass # Fall through to simulated data on auth failure
            else:
                try:
                    headers = {"Authorization": f"Bearer {self.access_token}"}
                    # Example search endpoint (specifics depend on ABDM docs)
                    search_url = f"{self.base_url}/search"
                    response = requests.get(search_url, params={"name": query}, headers=headers, timeout=5)
                    response.raise_for_status()
                    return response.json().get("drugs", [])
                except Exception as e:
                    logger.error(f"Failed to search ABDM Drug Registry: {e}")
                    # Fall through to simulated data on failure

        # Simulated Mode for Development
        return self._simulated_search(query)

    def _simulated_search(self, query: str) -> List[Dict[str, Any]]:
        """Provides simulated Indian drug data for development testing."""
        query_lower = query.lower()
        simulated_db = [
            {"brandName": "Dolo 650", "genericName": "Paracetamol", "manufacturer": "Micro Labs Ltd", "id": "abdm-101"},
            {"brandName": "Crocin Advance", "genericName": "Paracetamol", "manufacturer": "GSK", "id": "abdm-102"},
            {"brandName": "Pantocid 40", "genericName": "Pantoprazole", "manufacturer": "Sun Pharma", "id": "abdm-103"},
            {"brandName": "Calpol 500", "genericName": "Paracetamol", "manufacturer": "GSK", "id": "abdm-104"},
            {"brandName": "Allegra 120", "genericName": "Fexofenadine", "manufacturer": "Sanofi India", "id": "abdm-105"},
            {"brandName": "Azithral 500", "genericName": "Azithromycin", "manufacturer": "Alembic", "id": "abdm-106"},
            {"brandName": "Augmentin 625 Duo", "genericName": "Amoxicillin and Clavulanic Acid", "manufacturer": "GSK", "id": "abdm-107"},
            {"brandName": "Aspirin 81mg", "genericName": "Aspirin", "manufacturer": "Generic", "id": "abdm-108"},
            {"brandName": "Paracetamol 500mg", "genericName": "Paracetamol", "manufacturer": "Generic", "id": "abdm-109"},
        ]
        
        results = []
        for drug in simulated_db:
            if query_lower in drug["brandName"].lower() or query_lower in drug["genericName"].lower():
                results.append(drug)
                
        return results
