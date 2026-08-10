from abc import ABC, abstractmethod
from typing import List, Optional
from pydantic import BaseModel

class MedicineCandidate(BaseModel):
    name: str
    generic_name: Optional[str] = None
    brand_name: Optional[str] = None
    primary_image_url: Optional[str] = None
    external_source: str
    external_id: str

class MedicineProvider(ABC):
    @abstractmethod
    def search(self, query: str) -> List[MedicineCandidate]:
        pass

class DummyMedicineProvider(MedicineProvider):
    def search(self, query: str) -> List[MedicineCandidate]:
        if "aspirin" in query.lower():
            return [
                MedicineCandidate(
                    name="Aspirin 81mg",
                    generic_name="Aspirin",
                    primary_image_url="https://example.com/aspirin.jpg",
                    external_source="DummyDB",
                    external_id="123"
                )
            ]
        return []

class ExternalAPIProvider(MedicineProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        
    def search(self, query: str) -> List[MedicineCandidate]:
        # TODO: Implement the real external API call using requests or httpx
        # e.g., response = requests.get(f"https://api.example.com/drugs?q={query}&key={self.api_key}")
        # Return parsed candidates
        return []

def get_medicine_provider() -> MedicineProvider:
    # For now, return Dummy. When we have the specific API details, switch to External.
    return DummyMedicineProvider()
