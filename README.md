# ClockIn_Chrome_extension
Chrome Extension stuff


# Check for SSH Key
GO into Git bash then type in " ls -al ~/.ssh"
if you have file starting with id_....pub you have a key already 

THen use "cat ~/.ssh/id_ed...pub" to get the SSH key and add it to the GitHub SSH key file.
replace ... with file name

# IF you don't have an SSH key
Then type in terminal "ssh-keygen -t ed25519 -C "your_email@example.com"" replace your_email@example with your github email.
The SSH key should be show and use the steps in "TO get to SSH Keys in Github

# TO get to SSH Keys in Github go to:
1. Setting using the Profile icon
2. SHould be on the left-hand side.
3. Then Add the Key using the Add new SSH key.


