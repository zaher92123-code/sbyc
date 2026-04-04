#!/usr/bin/env bash
# =============================================================================
# Al Seeb Bay Marina — Quick Start Script
# Run: chmod +x setup.sh && ./setup.sh
# =============================================================================

set -e

BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
CYAN="\033[36m"
RESET="\033[0m"

echo ""
echo -e "${BOLD}${CYAN}⚓  Al Seeb Bay Marina — Setup${RESET}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Node.js version
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js 18+ first."
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ required. Current: $(node -v)"
  exit 1
fi

echo -e "${GREEN}✓${RESET} Node.js $(node -v) detected"

# Install dependencies
echo ""
echo -e "${BOLD}Installing dependencies...${RESET}"
npm install

# Copy env file
if [ ! -f ".env.local" ]; then
  cp .env.example .env.local
  echo -e "${GREEN}✓${RESET} Created .env.local — please fill in your credentials"
  echo ""
  echo -e "${YELLOW}⚠  Required environment variables:${RESET}"
  echo "  NEXT_PUBLIC_SUPABASE_URL"
  echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY"
  echo "  SUPABASE_SERVICE_ROLE_KEY"
  echo "  RESEND_API_KEY"
  echo "  CRON_SECRET (generate a random string)"
else
  echo -e "${GREEN}✓${RESET} .env.local already exists"
fi

echo ""
echo -e "${BOLD}${CYAN}Next steps:${RESET}"
echo ""
echo "  1. Edit .env.local with your Supabase and Resend credentials"
echo ""
echo "  2. Run Supabase migrations (in Supabase SQL Editor):"
echo "     supabase/migrations/001_schema.sql"
echo "     supabase/migrations/002_rls.sql"
echo "     supabase/migrations/003_seed.sql"
echo "     supabase/migrations/004_indexes_triggers.sql"
echo ""
echo "  3. Create your first admin user in Supabase Auth dashboard,"
echo "     then run this SQL to grant admin role:"
echo ""
echo "     UPDATE users"
echo "       SET role_id = (SELECT id FROM roles WHERE name = 'admin')"
echo "       WHERE email = 'your@email.com';"
echo ""
echo "  4. Start the development server:"
echo "     npm run dev"
echo ""
echo "  5. Open: http://localhost:3000"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}${GREEN}Setup complete!${RESET}"
echo ""
