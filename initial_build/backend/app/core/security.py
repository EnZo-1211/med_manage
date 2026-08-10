import bcrypt

def hash_access_code(access_code: str) -> str:
    # Hash a password for the first time
    # (Using bcrypt, the salt is saved into the hash itself)
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(access_code.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_access_code(plain_code: str, hashed_code: str) -> bool:
    # Check hashed password
    return bcrypt.checkpw(plain_code.encode('utf-8'), hashed_code.encode('utf-8'))
