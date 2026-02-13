#!/bin/bash

# Script para configurar y ejecutar FlashyBank

echo "🎯 Configurando FlashyBank..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar si PostgreSQL está corriendo
check_postgres() {
    if pg_isready -q 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Función para verificar si la base de datos existe
check_database() {
    psql -U postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw flashybank
    return $?
}

# Verificar PostgreSQL
echo -n "📊 Verificando PostgreSQL... "
if check_postgres; then
    echo -e "${GREEN}✅ Corriendo${NC}"
else
    echo -e "${RED}❌ No está corriendo${NC}"
    echo ""
    echo -e "${YELLOW}Instrucciones para iniciar PostgreSQL:${NC}"
    echo ""
    echo "  Opción 1 - Homebrew:"
    echo "    brew services start postgresql"
    echo ""
    echo "  Opción 2 - Manual:"
    echo "    pg_ctl -D /usr/local/var/postgres start"
    echo ""
    exit 1
fi

# Verificar base de datos
echo -n "📦 Verificando base de datos flashybank... "
if check_database; then
    echo -e "${GREEN}✅ Existe${NC}"
else
    echo -e "${YELLOW}❌ No existe${NC}"
    echo ""
    echo -n "🔨 Creando base de datos... "
    if createdb -U postgres flashybank 2>/dev/null; then
        echo -e "${GREEN}✅ Creada${NC}"
    else
        echo -e "${RED}❌ Error${NC}"
        echo ""
        echo "Intenta manualmente:"
        echo "  psql -U postgres"
        echo "  CREATE DATABASE flashybank;"
        echo "  \\q"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}✅ Todo está listo${NC}"
echo ""
echo "🚀 Iniciando aplicación Spring Boot..."
echo ""

# Ejecutar la aplicación
./gradlew bootRun
