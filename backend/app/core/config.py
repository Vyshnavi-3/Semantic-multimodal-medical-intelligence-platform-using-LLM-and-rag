import os
from dotenv import load_dotenv

load_dotenv()


APP_NAME = os.getenv(
    "APP_NAME",
    "Semantic Multimodal Medical AI"
)

APP_VERSION = os.getenv(
    "APP_VERSION",
    "1.0.0"
)