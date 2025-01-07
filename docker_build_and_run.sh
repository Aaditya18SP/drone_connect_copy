#!/bin/bash

declare password="fedora@1808"
echo $password | sudo -S docker build  -t drone-connect-api:drone-connect-api .
echo $password |sudo -S docker run -p 4000:4000 --rm --name drone-connect-api drone-connect-api 
