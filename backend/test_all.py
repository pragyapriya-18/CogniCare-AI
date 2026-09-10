import requests

BASE_URL = "http://127.0.0.1:5000"
results = []


def check(name, response, expected_status):
    passed = response.status_code == expected_status
    results.append((name, passed, response.status_code))
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name} -> {response.status_code}")
    try:
        print("        ", response.json())
    except Exception:
        print("        (no JSON body)")
    print()


# ---------- 1. Home route ----------
r = requests.get(f"{BASE_URL}/")
check("Home route", r, 200)


# ---------- 2. Register ----------
register_data = {
    "name": "Test Patient",
    "email": f"testpatient_{requests.utils.default_headers()}@gmail.com",  # unique-ish
    "password": "1234",
    "role": "elderly",
    "language": "Assamese"
}
# use a truly unique email each run
import time
unique_email = f"patient_{int(time.time())}@gmail.com"
register_data["email"] = unique_email

r = requests.post(f"{BASE_URL}/api/register", json=register_data)
check("Register user", r, 201)

# NOTE: since we don't have login yet, we assume user_id = 1 exists.
# Update this if your test user has a different ID in your database.
TEST_USER_ID = 1


# ---------- 3. Games ----------
game_data = {
    "user_id": TEST_USER_ID,
    "game_name": "Memory Match",
    "score": 80,
    "accuracy": 90.0,
    "time_taken": 30.5
}
r = requests.post(f"{BASE_URL}/api/games/submit", json=game_data)
check("Submit game score", r, 201)

r = requests.get(f"{BASE_URL}/api/games/scores/{TEST_USER_ID}")
check("Get user game scores", r, 200)


# ---------- 4. Reminders ----------
reminder_data = {
    "user_id": TEST_USER_ID,
    "reminder_type": "medicine",
    "title": "Take BP medicine",
    "reminder_time": "2026-09-07 09:00:00"
}
r = requests.post(f"{BASE_URL}/api/reminders", json=reminder_data)
check("Create reminder", r, 201)

r = requests.get(f"{BASE_URL}/api/reminders/{TEST_USER_ID}")
check("Get reminders", r, 200)

# fetch reminder id from the list to test update/delete
reminder_id = None
try:
    reminder_list = r.json().get("reminders", [])
    if reminder_list:
        reminder_id = reminder_list[0]["id"]
except Exception:
    pass

if reminder_id:
    update_data = {"title": "Take BP medicine (updated)"}
    r = requests.put(f"{BASE_URL}/api/reminders/{reminder_id}", json=update_data)
    check("Update reminder", r, 200)

    r = requests.delete(f"{BASE_URL}/api/reminders/{reminder_id}")
    check("Delete reminder", r, 200)
else:
    print("[SKIP] Update/Delete reminder -> no reminder_id found\n")


# ---------- 5. Caregiver ----------
r = requests.get(f"{BASE_URL}/api/caregiver/patient/{TEST_USER_ID}")
check("Get patient info", r, 200)

r = requests.get(f"{BASE_URL}/api/caregiver/progress/{TEST_USER_ID}")
check("Get patient progress", r, 200)


# ---------- 6. Difficulty ----------
performance_data = {
    "user_id": TEST_USER_ID,
    "game_name": "Memory Match",
    "score": 80,
    "accuracy": 90.0,
    "time_taken": 30.5
}
r = requests.post(f"{BASE_URL}/api/difficulty/performance", json=performance_data)
check("Submit performance data", r, 201)

r = requests.get(f"{BASE_URL}/api/difficulty/performance/{TEST_USER_ID}")
check("Get performance history", r, 200)

difficulty_data = {
    "user_id": TEST_USER_ID,
    "game_name": "Memory Match",
    "difficulty_level": "Medium"
}
r = requests.post(f"{BASE_URL}/api/difficulty/set", json=difficulty_data)
check("Set difficulty", r, 200)

r = requests.get(f"{BASE_URL}/api/difficulty/{TEST_USER_ID}/Memory Match")
check("Get difficulty", r, 200)


# ---------- Summary ----------
print("=" * 40)
print("SUMMARY")
print("=" * 40)
total = len(results)
passed = sum(1 for _, ok, _ in results if ok)
for name, ok, code in results:
    print(f"{'✅' if ok else '❌'} {name} ({code})")
print(f"\n{passed}/{total} passed")