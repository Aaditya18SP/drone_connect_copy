#!/bin/bash
# curl -i --json @- http://127.0.0.1:4000/api/v1/user/login < login.json
curl -i --json @- https://drone-connect-copy.vercel.app/api/v1/user/login < login.json
