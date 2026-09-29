import re


# ============================================================
# Medical test definitions
# ============================================================

MEDICAL_TESTS = {

    "Hemoglobin": [
        "Hemoglobin"
    ],

    "Platelet Count": [
        "Platelet Count"
    ],

    "Total Leucocyte Count (WBC)": [
        "Total Leucocyte Count (WBC)",
        "Total Leucocyte Count"
    ],

    "Blood Sugar Fasting": [
        "Blood Sugar Fasting"
    ],

    "Total Cholesterol": [
        "Total Cholesterol"
    ],

    "Triglyceride": [
        "Triglyceride"
    ],

    "HDL Cholesterol": [
        "HDL Cholesterol"
    ],

    "LDL Cholesterol": [
        "LDL Cholesterol"
    ],

    "Creatinine": [
        "Creatinine"
    ],

    "Uric Acid": [
        "Uric Acid"
    ],

    "Vitamin B-12": [
        "Vitamin B-12",
        "Vitamin B12"
    ],

    "25-OH Vitamin D (Total)": [
        "25-OH Vitamin D (Total)",
        "25-OH Vitamin D"
    ],

    "HbA1C": [
        "HbA1C",
        "HbA1c"
    ],

    "Free Triiodothyronine [FT3]": [
        "Free Triiodothyronine [FT3]",
        "Free Triiodothyronine",
        "FT3"
    ],

    "Free Thyroxine [FT4]": [
        "Free Thyroxine [FT4]",
        "Free Thyroxine",
        "FT4"
    ],

    "Thyroid Stimulating Hormone (TSH)": [
        "Thyroid Stimulating Hormone (TSH)",
        "Thyroid Stimulating Hormone",
        "TSH"
    ],

    "ESR": [
        "ESR"
    ]
}


# ============================================================
# Helper functions
# ============================================================

def clean_line(line: str) -> str:

    """
    Clean one extracted PDF text line.

    Removes:
    - extra spaces
    - Markdown-style **
    - unnecessary whitespace
    """

    line = line.replace("**", "")
    line = line.replace("\t", " ")

    line = re.sub(
        r"\s+",
        " ",
        line
    )

    return line.strip()


def clean_lines(extracted_text: str) -> list[str]:

    """
    Convert extracted PDF text into clean individual lines.
    """

    raw_lines = extracted_text.splitlines()

    lines = []

    for line in raw_lines:

        cleaned = clean_line(line)

        if cleaned:
            lines.append(cleaned)

    return lines


def is_number(value: str) -> bool:

    """
    Check whether a text value is a numeric laboratory value.
    """

    value = value.strip()

    return bool(
        re.fullmatch(
            r"[-+]?\d+(?:\.\d+)?",
            value
        )
    )


def looks_like_reference_range(value: str) -> bool:

    """
    Detect common reference-range formats.

    Examples:
        12-16
        4.5 - 11
        <5
        >40
        0.5-1.2
    """

    value = value.strip()

    return bool(
        re.search(
            r"(\d+(?:\.\d+)?\s*[-–]\s*\d+(?:\.\d+)?)|"
            r"^[<>≤≥]\s*\d+(?:\.\d+)?",
            value
        )
    )


def looks_like_unit(value: str) -> bool:

    """
    Detect whether a line looks like a laboratory unit.
    """

    value = value.strip()

    if not value:
        return False

    # A unit normally contains letters or common symbols.
    if not re.search(r"[A-Za-zµμ%/]", value):
        return False

    # Avoid treating a test name as a unit.
    if len(value.split()) > 5:
        return False

    return True


def find_test_index(
    lines: list[str],
    aliases: list[str]
) -> int | None:

    """
    Find the position of a laboratory test name.
    """

    for index, line in enumerate(lines):

        normalized_line = re.sub(
            r"\s+",
            " ",
            line.lower()
        )

        for alias in aliases:

            normalized_alias = re.sub(
                r"\s+",
                " ",
                alias.lower()
            )

            if normalized_line == normalized_alias:
                return index

            # Allow names followed by extra table symbols.
            if normalized_line.startswith(
                normalized_alias + " "
            ):
                return index

    return None


# ============================================================
# Extract one laboratory result
# ============================================================

def extract_result_after_test(
    lines: list[str],
    test_index: int
) -> tuple[str, str, str] | None:

    """
    Extract:

        value
        unit
        reference range

    from the lines following a test name.
    """

    value = None
    unit = None
    reference_range = None

    # Look at the next several lines because PDF extraction
    # can sometimes insert blank/table-related lines.
    candidate_lines = lines[
        test_index + 1:
        test_index + 8
    ]

    for line in candidate_lines:

        cleaned = clean_line(line)

        if not cleaned:
            continue

        # Stop if another known medical test starts.
        known_test_found = False

        for aliases in MEDICAL_TESTS.values():

            for alias in aliases:

                if cleaned.lower() == alias.lower():

                    known_test_found = True
                    break

            if known_test_found:
                break

        if known_test_found:
            break

        # First numeric value is treated as laboratory value.
        if value is None and is_number(cleaned):

            value = cleaned
            continue

        # Reference range.
        if (
            value is not None
            and reference_range is None
            and looks_like_reference_range(cleaned)
        ):

            reference_range = cleaned
            continue

        # Unit.
        if (
            value is not None
            and unit is None
            and looks_like_unit(cleaned)
        ):

            unit = cleaned
            continue

        # If all three fields have been found,
        # extraction is complete.
        if (
            value is not None
            and unit is not None
            and reference_range is not None
        ):
            break

    if value is None:
        return None

    if unit is None:
        unit = ""

    if reference_range is None:
        reference_range = ""

    return (
        value,
        unit,
        reference_range
    )


# ============================================================
# Main laboratory extraction function
# ============================================================

def extract_laboratory_results(
    extracted_text: str
) -> list[dict]:

    """
    Extract structured laboratory results from
    text extracted from a medical PDF.
    """

    if not extracted_text:
        return []

    lines = clean_lines(
        extracted_text
    )

    results = []

    for test_name, aliases in MEDICAL_TESTS.items():

        test_index = find_test_index(
            lines,
            aliases
        )

        if test_index is None:
            continue

        result = extract_result_after_test(
            lines,
            test_index
        )

        if result is None:
            continue

        value, unit, reference_range = result

        results.append(
            {
                "name": test_name,
                "value": value.strip(),
                "unit": unit.strip(),
                "reference_range": reference_range.strip()
            }
        )

    return results