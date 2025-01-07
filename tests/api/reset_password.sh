#!/bin/bash
curl -i -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiaWNvbmljcm9uYWxkbzArZHJvbmVjb25uZWN0QGdtYWlsLmNvbTE3MzU5NzgxMjQuMDAxIiwiaWF0IjoxNzM1OTc4MTI0LCJleHAiOjE3MzU5Nzg3MjR9.KZSzElnVJrWvx1LAZgcE5fmA7Rda4jTzy4jUqXqZAZ8" --json  @- http://127.0.0.1:4000/api/v1/user/resetpassword < reset_password.json
