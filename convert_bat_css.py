import re

# Read the bat.css file
with open(r'c:\Users\rishabh kothiyal\.gemini\antigravity\scratch\digital-portfolio\bat.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all SCSS variables with CSS custom properties
content = content.replace('$a', 'var(--bat-color-a)')
content = content.replace('$b', 'var(--bat-color-b)')
content = content.replace('$c', 'var(--bat-color-c)')

# Write back to the file
with open(r'c:\Users\rishabh kothiyal\.gemini\antigravity\scratch\digital-portfolio\bat.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Successfully converted SCSS variables to CSS custom properties")
print("✓ Replaced $a with var(--bat-color-a)")
print("✓ Replaced $b with var(--bat-color-b)")
print("✓ Replaced $c with var(--bat-color-c)")
