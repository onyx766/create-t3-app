# Sandbox image for the Trelent agent orchestrator.
#
# The orchestrator runs your chosen agent harness (Claude Code, Codex, ...)
# inside a container built from this image. Add any tools, languages, or
# project files your agents need.
#
# Build it:
#   docker build -t my-sandbox:latest .
#
# When auth is enabled, push it to your namespace on the Trelent registry:
#   docker login <registry> -u $TRELENT_CLIENT_ID -p $TRELENT_CLIENT_SECRET
#   docker tag my-sandbox:latest <registry>/$TRELENT_CLIENT_ID/my-sandbox:latest
#   docker push <registry>/$TRELENT_CLIENT_ID/my-sandbox:latest
FROM python:3.12-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl git \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace
