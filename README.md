# ClockIn_Chrome_extension
## Start-Up Instructions for ClockIn Chrome Extension
**Ensure you are using a Chrome browser**
1. Go to chrome://extensions
2. Enable the Developer Mode toggle switch in the top-right corner
3. Click Load unpacked button
4. Select the folder containing the ClockIn_extension files.
5. The extension will now appear in your list of extensions. Pin it to the toolbar for easy access.
<be />**MAKE SURE TO START TIMER**
After this is done, the website will be blocked.

## Check for SSH Key
GO into Git bash then type in " ls -al ~/.ssh"
if you have a file starting with id_....pub you have a key already 

Then use "cat ~/.ssh/id_ed...pub" to get the SSH key and add it to the GitHub SSH key file.
replace ... with file name

## IF you don't have an SSH key
Then type in terminal "ssh-keygen -t ed25519 -C "your_email@example.com"" replace your_email@example with your github email.
The SSH key should be shown and use the steps in "TO get to SSH Keys in Github

## TO get to SSH Keys in Github go to:
1. Setting using the Profile icon
2. SHould be on the left-hand side.
3. Then Add the Key using the Add new SSH key.





