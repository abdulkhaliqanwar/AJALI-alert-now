#!/bin/bash

# JWT token generated from generate_jwt_token.py
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0NTQ5NjUxMCwianRpIjoiMGZlY2ZhODItNjU2Yi00Yzk2LTgwOTYtZGQ4OWZlNzc5NGYzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6MSwibmJmIjoxNzQ1NDk2NTEwLCJleHAiOjE3NDU1MDAxMTB9.eP8nDrMtCPfKW38azFzmvk1rVzWf6emV08zpeqVA8WI"

curl -v -X POST http://localhost:5000/api/incidents/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Test Incident" \
  -F "description=This is a test incident" \
  -F "latitude=1.23456" \
  -F "longitude=2.34567" \
  -F "media=@test.jpg"
