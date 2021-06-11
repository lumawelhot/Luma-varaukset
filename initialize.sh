#!/bin/bash
# Create .env file
echo "Welcome to the Luma-varaukset initialization script."
echo "Warning! This will reset the environment and database!"
read -p "Press Ctrl+C to cancel or ENTER to continue"
echo "Step 1 - Provide parameters for the environment"
echo "Secret for JSON web token - can be any string"
read -p "SECRET [aca5367811cff9dbe764978d58240a70]: " SECRET
SECRET=${SECRET:-aca5367811cff9dbe764978d58240a70}
echo "SECRET=$SECRET" > .env
echo "PORT=3001" >> .env
echo "Hostname for SMTP service"
read -p "EMAILHOST [smtp.helsinki.fi]: " EMAILHOST
EMAILHOST=${EMAILHOST:-smtp.helsinki.fi}
echo "EMAILHOST=$EMAILHOST" >> .env
echo "Username for SMTP service, if needed"
read -p "EMAILUSER []: " EMAILUSER
echo "EMAILUSER=$EMAILUSER" >> .env
echo "Password for SMTP service, if needed"
read -p "EMAILPASSWORD []: " EMAILPASSWORD
echo "EMAILPASSWORD=$EMAILPASSWORD" >> .env
echo "Port for SMTP service (default:587)"
read -p "EMAILPORT [587]: " EMAILPORT
EMAILPORT=${EMAILPORT:-587}
echo "EMAILPORT=$EMAILPORT" >> .env
echo "Done writing file: .env"
# Start the application, mongodb and nginx
echo "Starting up using the following parameters:"
cat .env
docker-compose up -d
echo "Step 2 - Set up Admin user"
read -p "Username for administrator [Admin]: " ADMIN_USERNAME
ADMIN_USERNAME=${ADMIN_USERNAME:-Admin}
read -p "Password for administrator [salainen]: " ADMIN_PASSWORD
ADMIN_PASSWORD=${ADMIN_PASSWORD:-salainen}
docker exec luma-varaukset-app /bin/sh -c "cd /app/backend && node utils/mongoinit.js $ADMIN_USERNAME $ADMIN_PASSWORD"
echo "If docker-compose started up without errors, you can now browse to http://localhost/luma-varaukset"
