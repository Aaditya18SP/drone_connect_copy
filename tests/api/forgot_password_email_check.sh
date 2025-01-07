#!/bin/bash
curl -i --json @- http://127.0.0.1:4000/api/v1/user/fpcheckemail < forgot_password_email_check.json
