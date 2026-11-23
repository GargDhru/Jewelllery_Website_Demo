import os
import json
import base64
import logging
from pathlib import Path
from typing import Optional, Dict, Any

import firebase_admin
from firebase_admin import credentials, firestore
from app.core.config import settings

logger = logging.getLogger("aura.firebase")

_firebase_app: Optional[firebase_admin.App] = None
_firestore_db = None
_initialization_attempted = False

def initialize_firebase() -> bool:
    """
    Initializes the Firebase Admin SDK using one of:
    1. FIREBASE_SERVICE_ACCOUNT_KEY env var (JSON string or base64 encoded JSON)
    2. FIREBASE_CREDENTIALS_PATH file path or common filenames (serviceAccountKey.json, firebase-credentials.json)
    3. Application Default Credentials (ADC) / project id
    Returns True if initialized successfully, False otherwise.
    """
    global _firebase_app, _firestore_db, _initialization_attempted
    if _firebase_app is not None and _firestore_db is not None:
        return True

    _initialization_attempted = True

    # Check if already initialized by another module
    if firebase_admin._apps:
        try:
            _firebase_app = firebase_admin.get_app()
            _firestore_db = firestore.client()
            logger.info("✓ Connected to existing Firebase app and Firestore client.")
            return True
        except Exception as e:
            logger.warning(f"Could not reuse existing Firebase app: {e}")

    cred = None

    # 1. Try FIREBASE_SERVICE_ACCOUNT_KEY (env var string - best for Render / cloud)
    raw_key = (settings.FIREBASE_SERVICE_ACCOUNT_KEY or "").strip()
    if raw_key:
        try:
            # Handle potential base64 encoding
            if not raw_key.startswith("{"):
                try:
                    raw_key = base64.b64decode(raw_key).decode("utf-8")
                except Exception:
                    pass
            key_dict = json.loads(raw_key)
            cred = credentials.Certificate(key_dict)
            logger.info("Found Firebase service account key in environment variable.")
        except Exception as e:
            logger.error(f"Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON: {e}")

    # 2. Try file path from settings or well-known locations
    if cred is None:
        candidates = [
            settings.FIREBASE_CREDENTIALS_PATH,
            "serviceAccountKey.json",
            "firebase-credentials.json",
            "firebase_credentials.json",
            "firebase-adminsdk.json",
            os.path.join(os.path.dirname(__file__), "..", "..", "serviceAccountKey.json"),
            os.path.join(os.path.dirname(__file__), "..", "..", "firebase-credentials.json"),
            os.path.join(Path.cwd(), "serviceAccountKey.json"),
            os.path.join(Path.cwd(), "firebase-credentials.json")
        ]

        for path in candidates:
            if path and os.path.isfile(path):
                try:
                    cred = credentials.Certificate(path)
                    logger.info(f"✓ Found Firebase credentials file at: {path}")
                    break
                except Exception as e:
                    logger.warning(f"Could not load credentials from {path}: {e}")

    # 3. Try Project ID / ADC fallback
    if cred is None and settings.FIREBASE_PROJECT_ID:
        try:
            _firebase_app = firebase_admin.initialize_app(options={"projectId": settings.FIREBASE_PROJECT_ID})
            _firestore_db = firestore.client()
            logger.info(f"✓ Initialized Firebase with Project ID: {settings.FIREBASE_PROJECT_ID}")
            return True
        except Exception as e:
            logger.warning(f"Could not initialize with Project ID: {e}")

    if cred is not None:
        try:
            _firebase_app = firebase_admin.initialize_app(cred)
            _firestore_db = firestore.client()
            logger.info("✓ Firebase Admin SDK initialized successfully with Cloud Firestore.")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
            return False

    logger.info("ℹ Firebase credentials not provided. (SQLite fallback is active).")
    return False

def is_firebase_available() -> bool:
    """Check if Firebase Firestore is ready and initialized."""
    if _firestore_db is not None:
        return True
    return initialize_firebase()

def get_firestore_client():
    """Returns the Firestore client instance, or None if not initialized."""
    if _firestore_db is None:
        initialize_firebase()
    return _firestore_db
