import requests

url = "http://127.0.0.1:5000/api/login"

data = {
    "email": "newuser@gmail.com",
    "password": "1234"
}

response = requests.post(url, json=data)

print("Status:", response.status_code)
print("Response:", response.json())