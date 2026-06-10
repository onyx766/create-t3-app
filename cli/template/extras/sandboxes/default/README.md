# my-sandbox

A sandbox image for the [Trelent agent orchestrator](https://www.npmjs.com/package/@trelent/agents).
Agents launched from your app run inside containers built from this image —
this one ships with Python 3.12, git, and curl.

## Build

```bash
docker build -t my-sandbox:latest .
```

## Publish (when your orchestrator has auth enabled)

```bash
docker login <registry> -u "$TRELENT_CLIENT_ID" -p "$TRELENT_CLIENT_SECRET"
docker tag my-sandbox:latest <registry>/"$TRELENT_CLIENT_ID"/my-sandbox:latest
docker push <registry>/"$TRELENT_CLIENT_ID"/my-sandbox:latest
```

The web app references this sandbox through the `TRELENT_SANDBOX` environment
variable (see `web/.env`), so runs created from the UI execute here.
