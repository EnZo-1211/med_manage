import sqlite3
import json

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        # Convert bytes to string for UUIDs if they are stored as BLOB
        val = row[idx]
        if isinstance(val, bytes):
            val = val.hex() # Convert to hex string so JSON can serialize it, we'll parse it back later
        d[col[0]] = val
    return d

conn = sqlite3.connect('medmanage.db')
conn.row_factory = dict_factory
cursor = conn.cursor()

tables = cursor.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
dump = {}

for table in tables:
    table_name = table['name']
    if table_name != 'sqlite_sequence':
        rows = cursor.execute(f"SELECT * FROM {table_name}").fetchall()
        dump[table_name] = rows

with open('db_dump.json', 'w') as f:
    json.dump(dump, f, indent=2)

print("Database dumped successfully to db_dump.json")
