#!/bin/bash
docker compose down --volumes --rmi all --remove-orphans
docker rmi $(docker images 'luma-*' -q) --force 2>/dev/null || true
