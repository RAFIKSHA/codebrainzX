import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection

print("Killing other database connections to release locks...")
with connection.cursor() as cursor:
    # Query to terminate other backends
    cursor.execute("""
        SELECT pg_terminate_backend(pid) 
        FROM pg_stat_activity 
        WHERE pid <> pg_backend_pid() 
          AND datname = current_database();
    """)
    rows = cursor.fetchall()
    print(f"Terminated {len(rows)} other database connections.")

print("Finished connection cleanup!")
