#!/bin/bash

# Generate the local PostgreSQL client
echo "Generating local PostgreSQL client..."
npx prisma generate

# Generate the Supabase client
echo "Generating Supabase client..."
npx prisma generate --schema=./prisma/supabase.prisma

echo "Done!"
