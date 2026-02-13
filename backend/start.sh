#!/bin/bash

echo "🚀 Iniciando FlashyBank..."
echo ""

# Verificar si PostgreSQL está corriendo
if ! pg_isready -q; then
    echo "❌ PostgreSQL no está corriendo. Inícialo con:"
    echo "   brew services start postgresql"
    echo "   o"
    echo "   pg_ctl -D /usr/local/var/postgres start"
    exit 1
fi

# Verificar si la base de datos existe
if ! psql -U postgres -lqt | cut -d \| -f 1 | grep -qw flashybank; then
    echo "📦 Creando base de datos flashybank..."
    createdb -U postgres flashybank
    echo "✅ Base de datos creada"
fi

echo "✅ Base de datos lista"
echo ""
echo "🎯 Iniciando aplicación Spring Boot..."
./gradlew bootRun
