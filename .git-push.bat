@echo off
cd /d "c:\Users\zachn\OneDrive\Desktop\project7"

echo Initializing git repository...
git init

echo Adding all files...
git add .

echo Committing files...
git commit -m "Initial commit: KellyOS ERP System with modern UI and payment integrations"

echo Adding remote repository...
git remote add origin https://github.com/kellyworkos00-droid/vineject.git

echo Pushing to GitHub...
git branch -M main
git push -u origin main --force

echo Done!
pause
