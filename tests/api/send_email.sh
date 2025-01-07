#!/bin/bash
curl --json @- http://127.0.0.1:4000/api/v1/user/sendotp < send_email.json
