import os

file_path = r"d:\med_manage\initial_build\frontend\src\app\dashboard\patients\[id]\page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("http://127.0.0.1:8000", "${API_BASE_URL}")
if "API_BASE_URL" not in content[:500]:
    content = content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport { API_BASE_URL } from "../../../../config";', 1)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
