#!/bin/bash
# Run this from your project root: bash apply-fixes.sh
# It patches all files in-place — no manual copying needed.

set -e
ROOT="$(pwd)/src"

echo "🔧 Applying fixes to $(pwd)..."

# ── Helper ────────────────────────────────────────────────────────────────────
replace() {
  local file="$1" old="$2" new="$3"
  if [ -f "$file" ]; then
    python3 -c "
import sys
path, old, new = sys.argv[1], sys.argv[2], sys.argv[3]
with open(path,'r') as f: c = f.read()
c2 = c.replace(old, new)
with open(path,'w') as f: f.write(c2)
print('  ✓', path.split('src/')[-1], '— changed' if c != c2 else '— (already done)')
" "$file" "$old" "$new"
  else
    echo "  ⚠ skipped (not found): $file"
  fi
}

# ══════════════════════════════════════════════════════════════════
# 1. REMOVE WATER BERTHS FROM SETTINGS
# ══════════════════════════════════════════════════════════════════
echo ""
echo "1️⃣  Settings page — remove water berths section..."
replace "$ROOT/app/(dashboard)/settings/page.tsx" \
  '<h2 className="font-bold text-slate-800 font-display">Parking Berths</h2>' \
  '<h2 className="font-bold text-slate-800 font-display">Parking Spots</h2>'

replace "$ROOT/app/(dashboard)/settings/page.tsx" \
  'berths configured' \
  'spots configured'

replace "$ROOT/app/(dashboard)/settings/page.tsx" \
  '+ Add Berth' \
  '+ Add Spot'

# ══════════════════════════════════════════════════════════════════
# 2. RENAME "BERTH" → "SPOT" ACROSS ALL PAGES
# ══════════════════════════════════════════════════════════════════
echo ""
echo "2️⃣  Renaming Berth → Spot everywhere..."

for file in \
  "$ROOT/app/(dashboard)/dashboard/page.tsx" \
  "$ROOT/app/(dashboard)/sessions/page.tsx" \
  "$ROOT/app/(dashboard)/sessions/new/page.tsx" \
  "$ROOT/app/(dashboard)/sessions/[id]/page.tsx" \
  "$ROOT/app/(dashboard)/boats/page.tsx" \
  "$ROOT/app/(dashboard)/boats/[id]/page.tsx" \
  "$ROOT/app/(dashboard)/owners/[id]/page.tsx" \
  "$ROOT/app/(dashboard)/payments/page.tsx" \
  "$ROOT/app/(dashboard)/payments/new/page.tsx" \
  "$ROOT/app/(dashboard)/reports/page.tsx" \
  "$ROOT/components/layout/GlobalSearch.tsx"
do
  replace "$file" 'Total Berths'        'Total Spots'
  replace "$file" 'Empty Berths'        'Available Spots'
  replace "$file" '>Berth<'             '>Spot<'
  replace "$file" '"Berth"'             '"Spot"'
  replace "$file" 'Vessel & Berth'      'Vessel & Parking Spot'
  replace "$file" 'Berth / Parking Spot' 'Parking Spot'
  replace "$file" 'label="Berth'        'label="Spot'
  replace "$file" '>Berth '             '>Spot '
  replace "$file" 'Berth {'             'Spot {'
  replace "$file" '— Berth '            '— Spot '
  replace "$file" '>Berth<'             '>Spot<'
done

# ══════════════════════════════════════════════════════════════════
# 3. REMOVE pier_section / max_length_meters FROM QUERIES & DISPLAY
# ══════════════════════════════════════════════════════════════════
echo ""
echo "3️⃣  Removing pier_section and max_length_meters..."

for file in \
  "$ROOT/app/(dashboard)/sessions/page.tsx" \
  "$ROOT/app/(dashboard)/sessions/[id]/page.tsx" \
  "$ROOT/app/(dashboard)/sessions/new/page.tsx" \
  "$ROOT/app/(dashboard)/boats/page.tsx" \
  "$ROOT/app/(dashboard)/boats/[id]/page.tsx" \
  "$ROOT/app/(dashboard)/owners/[id]/page.tsx" \
  "$ROOT/app/(dashboard)/payments/new/page.tsx" \
  "$ROOT/app/api/boats/[id]/route.ts" \
  "$ROOT/app/api/payments/[id]/route.ts" \
  "$ROOT/app/api/spots/route.ts" \
  "$ROOT/app/api/spots/[id]/route.ts"
do
  replace "$file" \
    'parking_spot:parking_spots(spot_number, pier_section),' \
    'parking_spot:parking_spots(spot_number),'
  replace "$file" \
    'parking_spot:parking_spots(spot_number, pier_section)' \
    'parking_spot:parking_spots(spot_number)'
  replace "$file" \
    '{s.spot_number} — {s.pier_section} (max {s.max_length_meters}m)' \
    'Spot {s.spot_number}'
  replace "$file" \
    '<p className="text-xs text-slate-400">{s.pier_section}</p>' \
    ''
  replace "$file" \
    '<p className="text-xs text-slate-500">{session.parking_spot?.pier_section}</p>' \
    ''
  replace "$file" \
    '<p className="text-xs text-slate-500">Max {session.parking_spot?.max_length_meters}m</p>' \
    ''
  replace "$file" \
    '  pier_section: z.string().optional(),' \
    ''
  replace "$file" \
    '  max_length_meters: z.number().positive().optional(),' \
    ''
  replace "$file" \
    'if (pier) query = query.eq("pier_section", pier);' \
    ''
done

# Fix export and reports
replace "$ROOT/app/api/export/route.ts" \
  '"Pier": s.pier_section || "",' ''
replace "$ROOT/components/reports/ReportExportClient.tsx" \
  '"Pier Section": s.pier_section || "",' ''

# Fix types
replace "$ROOT/types/index.ts" \
  '  max_length_meters: number | null;' ''
replace "$ROOT/types/index.ts" \
  '  pier_section: string | null;' ''

# ══════════════════════════════════════════════════════════════════
# 4. FIX SESSIONS FILTER (remove pier filter that no longer exists)
# ══════════════════════════════════════════════════════════════════
echo ""
echo "4️⃣  Cleaning up sessions filter..."
replace "$ROOT/app/(dashboard)/sessions/page.tsx" \
  'query = query.eq("pier_section", params.pier);' ''

# ══════════════════════════════════════════════════════════════════
# 5. NARROW SPOT QUERY IN NEW SESSION FORM
# ══════════════════════════════════════════════════════════════════
echo ""
echo "5️⃣  Cleaning up new session spot query..."
replace "$ROOT/app/(dashboard)/sessions/new/page.tsx" \
  'supabase.from("parking_spots").select("*").eq("status", "empty").order("spot_number")' \
  'supabase.from("parking_spots").select("id, spot_number, status").eq("status", "empty").order("spot_number")'

echo ""
echo "✅ All fixes applied! Refresh your browser."
