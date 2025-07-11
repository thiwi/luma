from fastapi import APIRouter, HTTPException
import os

router = APIRouter(prefix="/artwork", tags=["artwork"])

ARTWORK_DIR = os.getenv("ARTWORK_DIR", os.path.join(os.path.dirname(__file__), "..", "..", "public", "artwork"))

@router.get("/")
def list_artwork():
    if not os.path.isdir(ARTWORK_DIR):
        raise HTTPException(status_code=404, detail="artwork directory missing")
    files = []
    for root, _, filenames in os.walk(ARTWORK_DIR):
        for name in filenames:
            rel = os.path.relpath(os.path.join(root, name), ARTWORK_DIR)
            files.append("/artwork/" + rel.replace(os.sep, "/"))
    return files
