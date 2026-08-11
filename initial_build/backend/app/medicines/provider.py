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

from app.medicines.abdm import ABDMDrugRegistryClient

class ABDMDrugRegistryProvider(MedicineProvider):
    def __init__(self):
        self.client = ABDMDrugRegistryClient()

    def search(self, query: str) -> List[MedicineCandidate]:
        if not query or len(query) < 2:
            return []
            
        try:
            results = self.client.search_drugs(query)
            candidates = []
            seen_names = set()
            
            for item in results:
                brand_name = item.get("brandName", "")
                generic_name = item.get("genericName", "")
                
                name = brand_name.title() if brand_name else generic_name.title()
                if not name or name in seen_names:
                    continue
                    
                seen_names.add(name)
                candidates.append(MedicineCandidate(
                    name=name,
                    brand_name=brand_name.title() if brand_name else None,
                    generic_name=generic_name.title() if generic_name else None,
                    primary_image_url=None,
                    external_source="ABDM",
                    external_id=item.get("id", "")
                ))
            return candidates
        except Exception as e:
            print(f"Error querying ABDM provider: {e}")
            return []

def get_medicine_provider() -> MedicineProvider:
    return ABDMDrugRegistryProvider()
