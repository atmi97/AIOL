#!/usr/bin/env bash
# One-shot deploy to Azure Container Apps (Canada Central).
#
# Usage:
#   ./deploy/azure-deploy.sh
#
# Prerequisites:
#   - az cli logged in to the 3sHealth tenant
#   - Docker running locally (for `az acr build`)
#   - An Entra app registration created; IDs exported as env vars (see below)
#
# Idempotent: resources are created-or-updated.

set -euo pipefail

# ---- Config (override via env) ----
LOCATION="${LOCATION:-canadacentral}"
RG="${RG:-rg-aiol-mvp}"
ACR="${ACR:-aiolmvpacr}"                       # globally unique, lowercase, no dashes
APP_ENV="${APP_ENV:-aiol-env}"
APP="${APP:-aiol-web}"
IMAGE_TAG="${IMAGE_TAG:-v$(date +%Y%m%d-%H%M%S)}"
IMAGE="${ACR}.azurecr.io/aiol:${IMAGE_TAG}"

# Required secrets (set in your shell or a local .env before running):
#   NEXTAUTH_SECRET            — random 32+ char string
#   AUTH_MICROSOFT_ENTRA_ID_ID           — Entra app (client) ID
#   AUTH_MICROSOFT_ENTRA_ID_SECRET       — Entra app client secret
#   AUTH_MICROSOFT_ENTRA_ID_ISSUER       — https://login.microsoftonline.com/<tenant>/v2.0
#   INITIAL_ADMIN_EMAIL        — email auto-promoted to ADMIN on first sign-in
: "${NEXTAUTH_SECRET:?NEXTAUTH_SECRET must be set}"
: "${AUTH_MICROSOFT_ENTRA_ID_ID:?AUTH_MICROSOFT_ENTRA_ID_ID must be set}"
: "${AUTH_MICROSOFT_ENTRA_ID_SECRET:?AUTH_MICROSOFT_ENTRA_ID_SECRET must be set}"
: "${AUTH_MICROSOFT_ENTRA_ID_ISSUER:?AUTH_MICROSOFT_ENTRA_ID_ISSUER must be set}"
: "${INITIAL_ADMIN_EMAIL:?INITIAL_ADMIN_EMAIL must be set}"

echo "==> Resource group"
az group create -n "$RG" -l "$LOCATION" >/dev/null

echo "==> Container registry"
az acr show -n "$ACR" -g "$RG" >/dev/null 2>&1 || \
  az acr create -n "$ACR" -g "$RG" --sku Basic --admin-enabled true >/dev/null

echo "==> Build + push image ($IMAGE)"
az acr build --registry "$ACR" --image "aiol:${IMAGE_TAG}" --file Dockerfile . >/dev/null

ACR_USER="$(az acr credential show -n "$ACR" --query username -o tsv)"
ACR_PASS="$(az acr credential show -n "$ACR" --query 'passwords[0].value' -o tsv)"

echo "==> Container Apps environment"
az extension add --name containerapp --upgrade --only-show-errors >/dev/null || true
az provider register --namespace Microsoft.App --wait >/dev/null
az containerapp env show -n "$APP_ENV" -g "$RG" >/dev/null 2>&1 || \
  az containerapp env create -n "$APP_ENV" -g "$RG" -l "$LOCATION" >/dev/null

# NOTE: For MVP we keep the SQLite file inside the container's writable FS.
# This is lost on revision restart. For the pilot, attach an Azure Files
# share as a volume (uncomment the block below) OR migrate to Postgres
# Flexible Server by setting DATABASE_URL=postgresql://… and switching the
# provider in prisma/schema.prisma.
#
#   az storage account create -n aiolsqlite -g "$RG" -l "$LOCATION" --sku Standard_LRS
#   az storage share-rm create --resource-group "$RG" --storage-account aiolsqlite --name aiol-data --quota 5
#   az containerapp env storage set -n "$APP_ENV" -g "$RG" --storage-name aiol-data \
#       --access-mode ReadWrite --azure-file-account-name aiolsqlite \
#       --azure-file-account-key "$(az storage account keys list -n aiolsqlite --query '[0].value' -o tsv)" \
#       --azure-file-share-name aiol-data

echo "==> Container app"
if az containerapp show -n "$APP" -g "$RG" >/dev/null 2>&1; then
  az containerapp update -n "$APP" -g "$RG" \
    --image "$IMAGE" \
    --set-env-vars \
      NEXTAUTH_URL="https://${APP}.${LOCATION}.azurecontainerapps.io" \
      NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
      AUTH_MICROSOFT_ENTRA_ID_ID="$AUTH_MICROSOFT_ENTRA_ID_ID" \
      AUTH_MICROSOFT_ENTRA_ID_SECRET="$AUTH_MICROSOFT_ENTRA_ID_SECRET" \
      AUTH_MICROSOFT_ENTRA_ID_ISSUER="$AUTH_MICROSOFT_ENTRA_ID_ISSUER" \
      INITIAL_ADMIN_EMAIL="$INITIAL_ADMIN_EMAIL" \
      ENABLE_DEV_LOGIN=false \
      DATABASE_URL="file:/app/data/app.db" \
    >/dev/null
else
  az containerapp create -n "$APP" -g "$RG" \
    --environment "$APP_ENV" \
    --image "$IMAGE" \
    --registry-server "${ACR}.azurecr.io" \
    --registry-username "$ACR_USER" \
    --registry-password "$ACR_PASS" \
    --target-port 3000 --ingress external \
    --min-replicas 1 --max-replicas 2 \
    --cpu 0.5 --memory 1Gi \
    --env-vars \
      NEXTAUTH_URL="https://${APP}.${LOCATION}.azurecontainerapps.io" \
      NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
      AUTH_MICROSOFT_ENTRA_ID_ID="$AUTH_MICROSOFT_ENTRA_ID_ID" \
      AUTH_MICROSOFT_ENTRA_ID_SECRET="$AUTH_MICROSOFT_ENTRA_ID_SECRET" \
      AUTH_MICROSOFT_ENTRA_ID_ISSUER="$AUTH_MICROSOFT_ENTRA_ID_ISSUER" \
      INITIAL_ADMIN_EMAIL="$INITIAL_ADMIN_EMAIL" \
      ENABLE_DEV_LOGIN=false \
      DATABASE_URL="file:/app/data/app.db" \
    >/dev/null
fi

FQDN="$(az containerapp show -n "$APP" -g "$RG" --query properties.configuration.ingress.fqdn -o tsv)"
echo "==> Deployed: https://$FQDN"
echo "   Set Entra redirect URI to: https://$FQDN/api/auth/callback/microsoft-entra-id"
