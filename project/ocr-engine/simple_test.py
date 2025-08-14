#!/usr/bin/env python3
import sys
import json

print("Simple test script")
print("Arguments:", sys.argv)
print(json.dumps({"success": True, "message": "Simple test successful"})) 