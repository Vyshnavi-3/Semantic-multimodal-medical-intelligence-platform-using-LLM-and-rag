from pathlib import Path

from backend.app.services.file_security_service import (
    scan_file_for_malware
)


TEST_FILE = Path("security_test.txt")

TEST_FILE.write_text(
    "This is a harmless test file for ClamAV.",
    encoding="utf-8"
)

print("Testing ClamAV...")
print(f"Test file: {TEST_FILE}")

try:
    scan_file_for_malware(str(TEST_FILE))

    print()
    print("SUCCESS")
    print("ClamAV scanned the file successfully.")
    print("No malware was detected.")

except Exception as error:
    print()
    print("SCAN FAILED")
    print(error)

finally:
    if TEST_FILE.exists():
        TEST_FILE.unlink()

        print()
        print("Temporary test file deleted.")