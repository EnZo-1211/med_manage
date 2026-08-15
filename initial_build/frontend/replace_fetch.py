import os
import glob
import re

def main():
    search_path = "d:/med_manage/initial_build/frontend/src/**/*.tsx"
    for filepath in glob.glob(search_path, recursive=True):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        if "fetch(" in content:
            # Replace fetch( with apiFetch(
            content = content.replace("fetch(", "apiFetch(")
            
            # Make sure apiFetch is imported
            if "apiFetch" not in content[:content.find("export default")]:
                # find where API_BASE_URL is imported and add apiFetch
                if "import { API_BASE_URL }" in content:
                    content = content.replace("import { API_BASE_URL }", "import { API_BASE_URL, apiFetch }")
                else:
                    # just append the import if needed
                    pass
            
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {filepath}")

if __name__ == "__main__":
    main()
