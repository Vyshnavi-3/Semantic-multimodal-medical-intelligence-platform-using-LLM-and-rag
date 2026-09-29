from backend.app.services.vector_service import collection


print("\n========== FIND HbA1c ==========\n")

results = collection.get(
    where={"patient_id": 2}
)

documents = results.get("documents", [])
metadatas = results.get("metadatas", [])

found = False

for index, document in enumerate(documents):
    if "HbA1C" in document or "HbA1c" in document:
        found = True

        print("FOUND HbA1c")
        print("-----------------------------")

        print("Metadata:")
        print(metadatas[index])

        print("\nDocument text:")
        print(document)

        print("\n-----------------------------\n")


if not found:
    print("HbA1c was NOT found in Patient 2 chunks.")

print("\n========== TEST COMPLETE ==========\n")